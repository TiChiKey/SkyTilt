// Cloud9 Triple-Marble Game Screen
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  PHYSICS,
  Button,
  IconButton,
  MultiMarbleGameCanvas,
  VirtualJoystick,
  CompletionStars,
  MultiMarbleLevel,
  MultiMarbleState,
  JoystickInput,
  StarRating,
  getMultiMarbleLevelById,
  MultiMarblePhysicsEngine,
  createInitialMultiMarbleStates,
  useSettings,
  useCalibrationData,
  useProgress,
  useTiltSensor,
  useHaptics,
  useSound,
} from '../../game';
import { CLOUD9_COLORS, MARBLE_COLORS } from '../../game/constants/cloud9';

type Cloud9GameState = 'playing' | 'paused' | 'completed';

// Marble Status Indicator - Instant completion feedback
interface MarbleStatusProps {
  colorId: 'red' | 'blue' | 'green';
  isInGoal: boolean;
  isAlive: boolean;
}

function MarbleStatus({ colorId, isInGoal, isAlive }: MarbleStatusProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isInGoal) {
      // Instant glow when marble enters goal
      pulseAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimationRef.current.start();

      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      // Stop the loop animation properly and reset with animation
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
        pulseAnimationRef.current = null;
      }
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
        pulseAnimationRef.current = null;
      }
    };
  }, [isInGoal]);

  const color = MARBLE_COLORS[colorId];

  return (
    <View style={styles.marbleStatusItem}>
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.statusGlow,
          {
            borderColor: color.main,
            opacity: glowOpacity,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main marble indicator with instant checkmark when in goal */}
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: isAlive ? color.main : CLOUD9_COLORS.gray,
          },
        ]}
      >
        {isInGoal && (
          <Ionicons name="checkmark" size={12} color={CLOUD9_COLORS.white} />
        )}
      </View>
    </View>
  );
}

export default function Cloud9GameScreen() {
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
  const [level, setLevel] = useState<MultiMarbleLevel | null>(null);
  const [gameState, setGameState] = useState<Cloud9GameState>('playing');
  const [marbles, setMarbles] = useState<MultiMarbleState[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    stars: StarRating;
    isNewBest: boolean;
  } | null>(null);
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());
  const [joystickInput, setJoystickInput] = useState<JoystickInput>({
    x: 0,
    y: 0,
    active: false,
  });

  // Track the exact time when level is completed for precise timing
  const finalTimeRef = useRef<number | null>(null);

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const hudOpacity = useRef(new Animated.Value(1)).current;

  // Physics engine ref
  const physicsEngineRef = useRef<MultiMarblePhysicsEngine | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Refs to store current state for the game loop (prevents infinite re-renders)
  const marblesRef = useRef<MultiMarbleState[]>([]);
  const tiltRef = useRef({ x: 0, y: 0 });
  const joystickInputRef = useRef<JoystickInput>({ x: 0, y: 0, active: false });
  const gameStateRef = useRef<Cloud9GameState>('playing');
  const levelRef = useRef<MultiMarbleLevel | null>(null);

  // Tilt sensor
  const { tilt } = useTiltSensor({
    calibration,
    enabled: gameState === 'playing',
  });

  // Keep refs in sync with state (for game loop to read latest values)
  useEffect(() => {
    marblesRef.current = marbles;
  }, [marbles]);

  useEffect(() => {
    tiltRef.current = tilt;
  }, [tilt]);

  useEffect(() => {
    joystickInputRef.current = joystickInput;
  }, [joystickInput]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Ref for level complete handler (to avoid stale closure in game loop)
  const handleLevelCompleteRef = useRef<() => void>(() => {});

  // Initialize level
  useEffect(() => {
    if (!levelId) return;

    const loadedLevel = getMultiMarbleLevelById(levelId);
    if (!loadedLevel) {
      router.back();
      return;
    }

    setLevel(loadedLevel);
    const initialMarbles = createInitialMultiMarbleStates(loadedLevel);
    setMarbles(initialMarbles);

    const engine = new MultiMarblePhysicsEngine(loadedLevel, settings.tiltSensitivity);
    physicsEngineRef.current = engine;

    // Reset game state
    setGameState('playing');
    setElapsedTime(0);
    setShowCelebration(false);
    setCompletionResult(null);
    setCompletedGoals(new Set());
    finalTimeRef.current = null;
    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [levelId]);

  // Handle level completion - INSTANT when all marbles reach goals
  // Defined before game loop to avoid hoisting issues
  const handleLevelComplete = useCallback(async () => {
    const currentLevel = levelRef.current;
    if (!currentLevel) return;

    // Immediately stop the game loop by setting state
    setGameState('completed');

    // Instant haptic and audio feedback
    haptics.goal();
    sounds.playGoal();
    setShowCelebration(true);

    // Use the precise captured time (already set in finalTimeRef)
    const finalTime = finalTimeRef.current ?? (Date.now() - startTimeRef.current);
    const result = await completeLevel(currentLevel.id, finalTime, currentLevel.baseTime);
    setCompletionResult(result);

    // Snappy transition to completion overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [completeLevel, haptics, sounds, overlayOpacity]);

  // Keep ref updated with latest handler
  useEffect(() => {
    handleLevelCompleteRef.current = handleLevelComplete;
  }, [handleLevelComplete]);

  // Game loop - uses refs to avoid infinite re-render loop
  useEffect(() => {
    // Only start game loop when playing and initialized
    if (gameState !== 'playing') {
      return;
    }

    // Wait for level and marbles to be initialized
    if (!levelRef.current || marblesRef.current.length === 0 || !physicsEngineRef.current) {
      return;
    }

    const gameLoop = () => {
      // Check if we should still be running (using ref for latest state)
      if (gameStateRef.current !== 'playing' || !physicsEngineRef.current) {
        return;
      }

      const now = Date.now();
      const deltaTime = Math.min((now - lastUpdateRef.current) / 1000, 0.05);
      lastUpdateRef.current = now;

      // Update elapsed time
      setElapsedTime(now - startTimeRef.current);

      // Read current state from refs (not from closure)
      const currentMarbles = marblesRef.current;
      const currentTilt = tiltRef.current;
      const currentJoystick = joystickInputRef.current;

      // Update physics for all marbles
      const result = physicsEngineRef.current.update(
        currentMarbles,
        currentTilt,
        settings.virtualJoystickEnabled ? currentJoystick : null,
        deltaTime
      );

      // Handle wall collision feedback - heavier thud
      if (result.wallCollisions.length > 0) {
        haptics.wallHit();
        sounds.playWallHit();
      }

      // Handle marble-to-marble collision feedback - sharp clink
      if (result.marbleCollisions.length > 0) {
        haptics.checkpoint(); // Using checkpoint for distinct clink
      }

      // Handle pit falls
      if (result.pitFalls.length > 0) {
        haptics.pitFall();
        sounds.playPitFall();

        // Schedule respawn for dead marbles
        setTimeout(() => {
          if (physicsEngineRef.current) {
            setMarbles((prev) =>
              physicsEngineRef.current!.respawnAllDeadMarbles(prev)
            );
          }
        }, PHYSICS.pitRespawnDelay);
      }

      // Play feedback when a marble enters its goal
      for (const marble of result.marbles) {
        const prevMarble = currentMarbles.find(m => m.id === marble.id);
        if (marble.isInGoal && prevMarble && !prevMarble.isInGoal) {
          // Marble just entered goal - instant feedback
          haptics.checkpoint();
          sounds.playCheckpoint();
        }
      }

      // INSTANT COMPLETION: Check if all marbles are in their goals
      if (result.allGoalsComplete && gameStateRef.current === 'playing' && !finalTimeRef.current) {
        // Capture the EXACT millisecond of completion
        finalTimeRef.current = now - startTimeRef.current;
        setElapsedTime(finalTimeRef.current);
        handleLevelCompleteRef.current();
        return; // Stop the game loop
      }

      // Update marbles state (this triggers re-render but NOT the game loop useEffect)
      setMarbles(result.marbles);

      // Continue the loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, settings.virtualJoystickEnabled, haptics, sounds]);

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

    const initialMarbles = createInitialMultiMarbleStates(level);
    setMarbles(initialMarbles);

    if (physicsEngineRef.current) {
      physicsEngineRef.current.resetCheckpoints();
    }

    setCompletedGoals(new Set());
    finalTimeRef.current = null;
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

  // Get status of each marble
  const getMarbleStatus = (colorId: 'red' | 'blue' | 'green') => {
    const marble = marbles.find((m) => m.colorId === colorId);
    if (!marble) return { inGoal: false, alive: false };
    return {
      inGoal: marble.isInGoal,
      alive: marble.isAlive,
    };
  };

  // Memoized callback and Set to prevent unnecessary re-renders
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

  // Empty set that doesn't change reference
  const emptyCheckpointsSet = useMemo(() => new Set<string>(), []);

  if (!level || marbles.length === 0) {
    return (
      <View style={[styles.container, styles.loading]}>
        <View style={styles.loadingDots}>
          <View style={[styles.loadingDot, { backgroundColor: MARBLE_COLORS.red.main }]} />
          <View style={[styles.loadingDot, { backgroundColor: MARBLE_COLORS.blue.main }]} />
          <View style={[styles.loadingDot, { backgroundColor: MARBLE_COLORS.green.main }]} />
        </View>
        <Text style={styles.loadingText}>Loading Level...</Text>
      </View>
    );
  }

  const redStatus = getMarbleStatus('red');
  const blueStatus = getMarbleStatus('blue');
  const greenStatus = getMarbleStatus('green');

  return (
    <View style={styles.container}>
      {/* Game Canvas */}
      <MultiMarbleGameCanvas
        level={level}
        marbles={marbles}
        showCelebration={showCelebration}
        onCelebrationComplete={handleCelebrationComplete}
        activatedCheckpoints={emptyCheckpointsSet}
        completedGoals={completedGoals}
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
            icon={<Ionicons name="pause" size={24} color={CLOUD9_COLORS.textPrimary} />}
            style={styles.pauseButton}
          />
        </View>

        <View style={styles.hudCenter}>
          <Text style={styles.levelName}>{level.name}</Text>
          <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
        </View>

        <View style={styles.hudRight}>
          {/* Marble status indicators - instant completion feedback */}
          <View style={styles.marbleStatusContainer}>
            <MarbleStatus
              colorId="red"
              isInGoal={redStatus.inGoal}
              isAlive={redStatus.alive}
            />
            <MarbleStatus
              colorId="blue"
              isInGoal={blueStatus.inGoal}
              isAlive={blueStatus.alive}
            />
            <MarbleStatus
              colorId="green"
              isInGoal={greenStatus.inGoal}
              isAlive={greenStatus.alive}
            />
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
          colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.98)']}
          style={styles.overlayGradient}
        >
          {/* Pause Menu */}
          {gameState === 'paused' && (
            <View style={styles.overlayContent}>
              <Text style={styles.overlayTitle}>Paused</Text>

              <View style={styles.pauseMarbles}>
                <View style={[styles.pauseMarble, { backgroundColor: MARBLE_COLORS.red.main }]} />
                <View style={[styles.pauseMarble, { backgroundColor: MARBLE_COLORS.blue.main }]} />
                <View style={[styles.pauseMarble, { backgroundColor: MARBLE_COLORS.green.main }]} />
              </View>

              <View style={styles.pauseStats}>
                <View style={styles.pauseStat}>
                  <Ionicons name="time" size={20} color={CLOUD9_COLORS.primary} />
                  <Text style={styles.pauseStatValue}>
                    {formatTime(elapsedTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.overlayButtons}>
                <Button
                  title="Resume"
                  onPress={handleResume}
                  size="large"
                  icon={
                    <Ionicons name="play" size={22} color={CLOUD9_COLORS.white} />
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
                      color={CLOUD9_COLORS.primary}
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

              <View style={styles.completeMarbles}>
                <View style={[styles.completeMarble, { backgroundColor: MARBLE_COLORS.red.main }]}>
                  <Ionicons name="checkmark" size={16} color={CLOUD9_COLORS.white} />
                </View>
                <View style={[styles.completeMarble, { backgroundColor: MARBLE_COLORS.blue.main }]}>
                  <Ionicons name="checkmark" size={16} color={CLOUD9_COLORS.white} />
                </View>
                <View style={[styles.completeMarble, { backgroundColor: MARBLE_COLORS.green.main }]}>
                  <Ionicons name="checkmark" size={16} color={CLOUD9_COLORS.white} />
                </View>
              </View>

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
                    <Ionicons name="trophy" size={16} color={CLOUD9_COLORS.warning} />
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
                      color={CLOUD9_COLORS.white}
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
                      color={CLOUD9_COLORS.primary}
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
    backgroundColor: CLOUD9_COLORS.background,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  loadingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    color: CLOUD9_COLORS.textSecondary,
    fontSize: 16,
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
  pauseButton: {
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  levelName: {
    fontSize: 14,
    color: CLOUD9_COLORS.textSecondary,
    fontWeight: '500',
  },
  timer: {
    fontSize: 32,
    color: CLOUD9_COLORS.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  marbleStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  marbleStatusItem: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    color: CLOUD9_COLORS.textPrimary,
    marginBottom: 16,
  },
  pauseMarbles: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  pauseMarble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pauseStatValue: {
    color: CLOUD9_COLORS.textPrimary,
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
    color: CLOUD9_COLORS.textPrimary,
    marginBottom: 16,
  },
  completeMarbles: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  completeMarble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
    color: CLOUD9_COLORS.textSecondary,
    fontSize: 14,
  },
  completeStatValue: {
    color: CLOUD9_COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  newBestText: {
    color: CLOUD9_COLORS.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  starThresholds: {
    marginBottom: 32,
  },
  thresholdLabel: {
    color: CLOUD9_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
