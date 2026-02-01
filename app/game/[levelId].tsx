// Cloud9 Triple-Marble Game Screen
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

// Constants
const GOAL_HOLD_TIME = 2000; // 2 seconds to complete

type Cloud9GameState = 'playing' | 'paused' | 'completed';

// Pulsing Marble Status Indicator
interface MarbleStatusProps {
  colorId: 'red' | 'blue' | 'green';
  isInGoal: boolean;
  holdProgress: number; // 0-1 progress toward goal completion
  isAlive: boolean;
}

function MarbleStatus({ colorId, isInGoal, holdProgress, isAlive }: MarbleStatusProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isInGoal) {
      // Start pulsing glow when in goal
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
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

      {/* Main marble indicator */}
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: isAlive ? color.main : CLOUD9_COLORS.gray,
          },
        ]}
      >
        {isInGoal && holdProgress >= 1 && (
          <Ionicons name="checkmark" size={12} color={CLOUD9_COLORS.white} />
        )}
      </View>

      {/* Progress ring for goal hold */}
      {isInGoal && holdProgress < 1 && (
        <View style={styles.progressRing}>
          <View
            style={[
              styles.progressArc,
              {
                borderColor: color.main,
                transform: [{ rotate: `${holdProgress * 360}deg` }],
              },
            ]}
          />
        </View>
      )}
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

  // Goal hold tracking for timed validation
  const [goalHoldTimes, setGoalHoldTimes] = useState<Record<string, number>>({
    red: 0,
    blue: 0,
    green: 0,
  });

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const hudOpacity = useRef(new Animated.Value(1)).current;

  // Physics engine ref
  const physicsEngineRef = useRef<MultiMarblePhysicsEngine | null>(null);
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
    setGoalHoldTimes({ red: 0, blue: 0, green: 0 });
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
    if (gameState !== 'playing' || marbles.length === 0 || !physicsEngineRef.current) {
      return;
    }

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastUpdateRef.current) / 1000, 0.05);
      const deltaMs = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Update elapsed time
      setElapsedTime(now - startTimeRef.current);

      // Update physics for all marbles
      const result = physicsEngineRef.current!.update(
        marbles,
        tilt,
        settings.virtualJoystickEnabled ? joystickInput : null,
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
            // Reset goal hold times for respawned marbles
            setGoalHoldTimes({ red: 0, blue: 0, green: 0 });
          }
        }, PHYSICS.pitRespawnDelay);
      }

      // Update goal hold times for timed validation
      setGoalHoldTimes((prev) => {
        const newHoldTimes = { ...prev };
        let allComplete = true;

        for (const marble of result.marbles) {
          if (marble.isInGoal) {
            // Increment hold time
            newHoldTimes[marble.colorId] = Math.min(
              prev[marble.colorId] + deltaMs,
              GOAL_HOLD_TIME
            );

            // Check if this marble just completed (reached 2 seconds)
            if (prev[marble.colorId] < GOAL_HOLD_TIME && newHoldTimes[marble.colorId] >= GOAL_HOLD_TIME) {
              haptics.goal();
              sounds.playCheckpoint();
            }
          } else {
            // Reset hold time if marble leaves goal
            newHoldTimes[marble.colorId] = 0;
          }

          // Check if all marbles have completed
          if (newHoldTimes[marble.colorId] < GOAL_HOLD_TIME) {
            allComplete = false;
          }
        }

        // Check for level completion
        if (allComplete && gameState === 'playing') {
          handleLevelComplete();
        }

        return newHoldTimes;
      });

      setMarbles(result.marbles);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, marbles, tilt, joystickInput, settings.virtualJoystickEnabled, level]);

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

    const initialMarbles = createInitialMultiMarbleStates(level);
    setMarbles(initialMarbles);

    if (physicsEngineRef.current) {
      physicsEngineRef.current.resetCheckpoints();
    }

    setCompletedGoals(new Set());
    setGoalHoldTimes({ red: 0, blue: 0, green: 0 });
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
    if (!marble) return { inGoal: false, alive: false, holdProgress: 0 };
    return {
      inGoal: marble.isInGoal,
      alive: marble.isAlive,
      holdProgress: goalHoldTimes[colorId] / GOAL_HOLD_TIME,
    };
  };

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
        onCelebrationComplete={() => setShowCelebration(false)}
        activatedCheckpoints={new Set()}
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
          {/* Enhanced marble status indicators with pulse animation */}
          <View style={styles.marbleStatusContainer}>
            <MarbleStatus
              colorId="red"
              isInGoal={redStatus.inGoal}
              holdProgress={redStatus.holdProgress}
              isAlive={redStatus.alive}
            />
            <MarbleStatus
              colorId="blue"
              isInGoal={blueStatus.inGoal}
              holdProgress={blueStatus.holdProgress}
              isAlive={blueStatus.alive}
            />
            <MarbleStatus
              colorId="green"
              isInGoal={greenStatus.inGoal}
              holdProgress={greenStatus.holdProgress}
              isAlive={greenStatus.alive}
            />
          </View>
        </View>
      </Animated.View>

      {/* Goal hold instruction */}
      {(redStatus.inGoal || blueStatus.inGoal || greenStatus.inGoal) &&
       gameState === 'playing' && (
        <View style={[styles.holdInstruction, { top: insets.top + 80 }]}>
          <Text style={styles.holdInstructionText}>
            Hold all marbles in goals for 2 seconds
          </Text>
        </View>
      )}

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
  progressRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  progressArc: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  holdInstruction: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  holdInstructionText: {
    backgroundColor: CLOUD9_COLORS.primaryTranslucent,
    color: CLOUD9_COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
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
