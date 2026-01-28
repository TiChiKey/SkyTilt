import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  PHYSICS,
  Button,
  IconButton,
  GameCanvas,
  VirtualJoystick,
  CompletionStars,
  Level,
  MarbleState,
  JoystickInput,
  GameState,
  StarRating,
  getLevelById,
  PhysicsEngine,
  createInitialMarbleState,
  useSettings,
  useCalibrationData,
  useProgress,
  useTiltSensor,
  useHaptics,
  useSound,
} from '../../game';

export default function GameScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Game store hooks
  const { settings } = useSettings();
  const { calibration } = useCalibrationData();
  const { completeLevel } = useProgress();

  // Feedback hooks
  const haptics = useHaptics({ enabled: settings.hapticsEnabled });
  const sounds = useSound({
    enabled: settings.soundEnabled,
    volume: settings.sfxVolume,
  });

  // Game state
  const [level, setLevel] = useState<Level | null>(null);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [marble, setMarble] = useState<MarbleState | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    stars: StarRating;
    isNewBest: boolean;
  } | null>(null);
  const [activatedCheckpoints, setActivatedCheckpoints] = useState<Set<string>>(
    new Set()
  );
  const [joystickInput, setJoystickInput] = useState<JoystickInput>({
    x: 0,
    y: 0,
    active: false,
  });

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const hudOpacity = useRef(new Animated.Value(1)).current;

  // Physics engine ref
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Tilt sensor
  const { tilt } = useTiltSensor({
    calibration,
    enabled: gameState === 'playing',
  });

  // Initialize level
  useEffect(() => {
    if (!levelId) return;

    const loadedLevel = getLevelById(levelId);
    if (!loadedLevel) {
      router.back();
      return;
    }

    setLevel(loadedLevel);
    const initialMarble = createInitialMarbleState(loadedLevel);
    setMarble(initialMarble);

    const engine = new PhysicsEngine(loadedLevel, settings.tiltSensitivity);
    physicsEngineRef.current = engine;

    // Reset game state
    setGameState('playing');
    setElapsedTime(0);
    setShowCelebration(false);
    setCompletionResult(null);
    setActivatedCheckpoints(new Set());
    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [levelId]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !marble || !physicsEngineRef.current) {
      return;
    }

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastUpdateRef.current) / 1000, 0.05);
      lastUpdateRef.current = now;

      // Update elapsed time
      setElapsedTime(now - startTimeRef.current);

      // Update physics
      const result = physicsEngineRef.current!.update(
        marble,
        tilt,
        settings.virtualJoystickEnabled ? joystickInput : null,
        deltaTime
      );

      // Handle collision feedback
      if (result.hitWall) {
        haptics.wallHit();
        sounds.playWallHit();
      }

      // Handle death pit
      if (result.hitPit) {
        haptics.pitFall();
        sounds.playPitFall();

        // Respawn after delay
        setTimeout(() => {
          if (physicsEngineRef.current) {
            const respawnedMarble = physicsEngineRef.current.respawnMarble(result.marble);
            setMarble(respawnedMarble);
          }
        }, PHYSICS.pitRespawnDelay);
      }

      // Handle checkpoint
      if (result.reachedCheckpoint) {
        haptics.checkpoint();
        sounds.playCheckpoint();
        setActivatedCheckpoints((prev) => {
          const next = new Set(prev);
          next.add(result.reachedCheckpoint!.id);
          return next;
        });
      }

      // Handle goal
      if (result.reachedGoal && gameState === 'playing') {
        handleLevelComplete();
        return;
      }

      setMarble(result.marble);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, marble, tilt, joystickInput, settings.virtualJoystickEnabled]);

  // Handle level completion
  const handleLevelComplete = useCallback(async () => {
    if (!level) return;

    setGameState('completed');
    haptics.goal();
    sounds.playGoal();
    setShowCelebration(true);

    const finalTime = Date.now() - startTimeRef.current;
    const result = await completeLevel(level.id, finalTime, level.baseTime);
    setCompletionResult(result);

    // Show completion overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [level, completeLevel, haptics, sounds]);

  // Handle pause
  const handlePause = () => {
    haptics.button();
    setGameState('paused');
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Handle resume
  const handleResume = () => {
    haptics.button();
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setGameState('playing');
      lastUpdateRef.current = Date.now();
    });
  };

  // Handle restart
  const handleRestart = () => {
    haptics.button();
    if (!level) return;

    const initialMarble = createInitialMarbleState(level);
    setMarble(initialMarble);

    if (physicsEngineRef.current) {
      physicsEngineRef.current.resetCheckpoints();
    }

    setActivatedCheckpoints(new Set());
    setElapsedTime(0);
    setShowCelebration(false);
    setCompletionResult(null);
    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();

    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setGameState('playing');
    });
  };

  // Handle exit
  const handleExit = () => {
    haptics.button();
    router.back();
  };

  // Handle next level
  const handleNextLevel = () => {
    haptics.button();
    // Navigate to level select to pick next level
    router.replace('/levels');
  };

  // Format time
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${millis.toString().padStart(2, '0')}`;
  };

  if (!level || !marble) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game Canvas */}
      <GameCanvas
        level={level}
        marble={marble}
        showCelebration={showCelebration}
        onCelebrationComplete={() => setShowCelebration(false)}
        activatedCheckpoints={activatedCheckpoints}
      />

      {/* HUD */}
      <Animated.View
        style={[
          styles.hud,
          { paddingTop: insets.top + 8, opacity: hudOpacity },
        ]}
      >
        <View style={styles.hudLeft}>
          <IconButton
            onPress={handlePause}
            icon={<Ionicons name="pause" size={24} color={COLORS.white} />}
          />
        </View>

        <View style={styles.hudCenter}>
          <Text style={styles.levelName}>{level.name}</Text>
          <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
        </View>

        <View style={styles.hudRight}>
          {/* Checkpoint indicator */}
          <View style={styles.checkpointIndicator}>
            <Ionicons
              name="flag"
              size={16}
              color={
                activatedCheckpoints.size > 0
                  ? COLORS.checkpoint
                  : COLORS.textMuted
              }
            />
            <Text style={styles.checkpointCount}>
              {activatedCheckpoints.size}/{level.checkpoints.length}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Virtual Joystick */}
      {settings.virtualJoystickEnabled && gameState === 'playing' && (
        <View
          style={[
            styles.joystickContainer,
            { bottom: insets.bottom + 40 },
          ]}
        >
          <VirtualJoystick
            size={120}
            onMove={setJoystickInput}
            disabled={gameState !== 'playing'}
          />
        </View>
      )}

      {/* Pause/Complete Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity },
          gameState === 'playing' && styles.overlayHidden,
        ]}
        pointerEvents={gameState === 'playing' ? 'none' : 'auto'}
      >
        <LinearGradient
          colors={['rgba(10,22,34,0.95)', 'rgba(20,40,58,0.95)']}
          style={styles.overlayGradient}
        >
          {/* Pause Menu */}
          {gameState === 'paused' && (
            <View style={styles.overlayContent}>
              <Text style={styles.overlayTitle}>Paused</Text>

              <View style={styles.pauseStats}>
                <View style={styles.pauseStat}>
                  <Ionicons name="time" size={20} color={COLORS.skyBlue} />
                  <Text style={styles.pauseStatValue}>
                    {formatTime(elapsedTime)}
                  </Text>
                </View>
                <View style={styles.pauseStat}>
                  <Ionicons name="flag" size={20} color={COLORS.checkpoint} />
                  <Text style={styles.pauseStatValue}>
                    {activatedCheckpoints.size}/{level.checkpoints.length}
                  </Text>
                </View>
              </View>

              <View style={styles.overlayButtons}>
                <Button
                  title="Resume"
                  onPress={handleResume}
                  size="large"
                  icon={
                    <Ionicons name="play" size={22} color={COLORS.white} />
                  }
                />
                <Button
                  title="Restart"
                  onPress={handleRestart}
                  variant="secondary"
                  size="medium"
                  icon={
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={COLORS.skyBlue}
                    />
                  }
                />
                <Button
                  title="Exit"
                  onPress={handleExit}
                  variant="ghost"
                  size="small"
                />
              </View>
            </View>
          )}

          {/* Level Complete */}
          {gameState === 'completed' && completionResult && (
            <View style={styles.overlayContent}>
              <Text style={styles.completeTitle}>Level Complete!</Text>

              <CompletionStars rating={completionResult.stars} size={48} />

              <View style={styles.completeStats}>
                <View style={styles.completeStat}>
                  <Text style={styles.completeStatLabel}>Time</Text>
                  <Text style={styles.completeStatValue}>
                    {formatTime(elapsedTime)}
                  </Text>
                </View>
                {completionResult.isNewBest && (
                  <View style={styles.newBestBadge}>
                    <Ionicons name="trophy" size={16} color={COLORS.gold} />
                    <Text style={styles.newBestText}>New Best!</Text>
                  </View>
                )}
              </View>

              <View style={styles.starThresholds}>
                <Text style={styles.thresholdLabel}>
                  Gold: {level.baseTime}s • Silver: {(level.baseTime * 1.5).toFixed(1)}s • Bronze: {(level.baseTime * 2).toFixed(1)}s
                </Text>
              </View>

              <View style={styles.overlayButtons}>
                <Button
                  title="Next Level"
                  onPress={handleNextLevel}
                  size="large"
                  icon={
                    <Ionicons
                      name="arrow-forward"
                      size={22}
                      color={COLORS.white}
                    />
                  }
                />
                <Button
                  title="Retry"
                  onPress={handleRestart}
                  variant="secondary"
                  size="medium"
                  icon={
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={COLORS.skyBlue}
                    />
                  }
                />
                <Button
                  title="Level Select"
                  onPress={handleExit}
                  variant="ghost"
                  size="small"
                />
              </View>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  hudLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  hudCenter: {
    flex: 2,
    alignItems: 'center',
  },
  hudRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  levelName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timer: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  checkpointIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.overlayDark,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  checkpointCount: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  joystickContainer: {
    position: 'absolute',
    right: 30,
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayHidden: {
    display: 'none',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  overlayTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 24,
  },
  pauseStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 40,
  },
  pauseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.overlayDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pauseStatValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  overlayButtons: {
    gap: 12,
    width: 240,
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  completeStats: {
    alignItems: 'center',
    marginBottom: 16,
  },
  completeStat: {
    alignItems: 'center',
    marginBottom: 8,
  },
  completeStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  completeStatValue: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  newBestText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  starThresholds: {
    marginBottom: 32,
  },
  thresholdLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
