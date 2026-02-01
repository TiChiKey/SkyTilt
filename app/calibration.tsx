// Cloud9 Calibration Screen - Three-Marble Visualization
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  IconButton,
  useCalibration,
  useCalibrationData,
  useHaptics,
} from '../game';
import { CLOUD9_COLORS, MARBLE_COLORS } from '../game/constants/cloud9';

// Animated marble that responds to tilt
interface CalibrationMarbleProps {
  color: string;
  glow: string;
  offsetX: number;
  offsetY: number;
  tiltX: number;
  tiltY: number;
  size: number;
  delay: number;
}

function CalibrationMarble({
  color,
  glow,
  offsetX,
  offsetY,
  tiltX,
  tiltY,
  size,
  delay,
}: CalibrationMarbleProps) {
  const translateX = useRef(new Animated.Value(offsetX)).current;
  const translateY = useRef(new Animated.Value(offsetY)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Respond to tilt - drift toward center as device levels
  useEffect(() => {
    const targetX = offsetX - tiltX * 60;
    const targetY = offsetY + tiltY * 60;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: targetX,
        friction: 10,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: targetY,
        friction: 10,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [tiltX, tiltY]);

  return (
    <Animated.View
      style={[
        styles.calibrationMarble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: glow,
          transform: [
            { translateX },
            { translateY },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.marbleHighlight,
          {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
          },
        ]}
      />
    </Animated.View>
  );
}

// Central target area
function CenterTarget({ size }: { size: number }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.targetContainer, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.targetOuter,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: opacityAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <View
        style={[
          styles.targetMiddle,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
          },
        ]}
      />
      <View
        style={[
          styles.targetCenter,
          {
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size * 0.1,
          },
        ]}
      />
    </View>
  );
}

type CalibrationStep = 'intro' | 'calibrating' | 'complete';

export default function Cloud9CalibrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const haptics = useHaptics({ enabled: true });

  const [step, setStep] = useState<CalibrationStep>('intro');
  const { startCalibration, getCalibrationData, isCalibrating, sampleCount, rawTilt } =
    useCalibration();
  const { saveCalibration, calibration } = useCalibrationData();

  // Animation values
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Progress animation during calibration
  useEffect(() => {
    if (step === 'calibrating' && sampleCount > 0) {
      Animated.timing(progressAnim, {
        toValue: Math.min(sampleCount / 20, 1),
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [sampleCount, step]);

  // Handle calibration completion
  useEffect(() => {
    if (step === 'calibrating' && !isCalibrating && sampleCount > 0) {
      const data = getCalibrationData();
      if (data) {
        saveCalibration(data).then(() => {
          haptics.goal();
          setStep('complete');

          Animated.spring(checkmarkScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }).start();
        });
      }
    }
  }, [isCalibrating, sampleCount, step]);

  const handleStartCalibration = () => {
    haptics.button();
    setStep('calibrating');
    startCalibration();
  };

  const handleContinue = () => {
    haptics.button();
    router.replace('/levels');
  };

  const handleBack = () => {
    haptics.button();
    router.back();
  };

  const handleSkip = () => {
    haptics.button();
    router.replace('/levels');
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const visualizerSize = Math.min(width * 0.7, 260);
  const marbleSize = 32;

  // Get raw tilt values with fallback
  const currentTiltX = rawTilt?.x ?? 0;
  const currentTiltY = rawTilt?.y ?? 0;

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <IconButton
          onPress={handleBack}
          icon={<Ionicons name="arrow-back" size={24} color={CLOUD9_COLORS.textPrimary} />}
          style={styles.backButton}
        />
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Calibration</Text>
          <Text style={styles.subtitle}>Triple Marble Control</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        {step === 'intro' && (
          <>
            {/* Three-marble visualizer */}
            <View
              style={[
                styles.visualizer,
                { width: visualizerSize, height: visualizerSize },
              ]}
            >
              <CenterTarget size={visualizerSize * 0.5} />

              {/* Three marbles that drift toward center as device levels */}
              <CalibrationMarble
                color={MARBLE_COLORS.red.main}
                glow={MARBLE_COLORS.red.glow}
                offsetX={0}
                offsetY={-50}
                tiltX={currentTiltX}
                tiltY={currentTiltY}
                size={marbleSize}
                delay={100}
              />
              <CalibrationMarble
                color={MARBLE_COLORS.blue.main}
                glow={MARBLE_COLORS.blue.glow}
                offsetX={-43}
                offsetY={25}
                tiltX={currentTiltX}
                tiltY={currentTiltY}
                size={marbleSize}
                delay={200}
              />
              <CalibrationMarble
                color={MARBLE_COLORS.green.main}
                glow={MARBLE_COLORS.green.glow}
                offsetX={43}
                offsetY={25}
                tiltX={currentTiltX}
                tiltY={currentTiltY}
                size={marbleSize}
                delay={300}
              />
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>
                Set Your Neutral Position
              </Text>
              <Text style={styles.instructionText}>
                Hold your device at your preferred playing angle. The three marbles will align toward the center when the device is level.
              </Text>
              <View style={styles.tips}>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={18} color={CLOUD9_COLORS.success} />
                  <Text style={styles.tipText}>Find a comfortable angle</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={18} color={CLOUD9_COLORS.success} />
                  <Text style={styles.tipText}>Hold device steady</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={18} color={CLOUD9_COLORS.success} />
                  <Text style={styles.tipText}>Managing 3 marbles requires precision</Text>
                </View>
              </View>
            </View>

            {/* Calibration status */}
            {calibration.isCalibrated && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={18} color={CLOUD9_COLORS.success} />
                <Text style={styles.statusText}>Device already calibrated</Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttons}>
              <Button
                title="Calibrate Now"
                onPress={handleStartCalibration}
                size="large"
                icon={<Ionicons name="locate" size={22} color={CLOUD9_COLORS.white} />}
              />
              <Button
                title="Skip for Now"
                onPress={handleSkip}
                variant="ghost"
                size="small"
              />
            </View>
          </>
        )}

        {step === 'calibrating' && (
          <>
            {/* Three-marble visualizer during calibration */}
            <View
              style={[
                styles.visualizer,
                styles.visualizerCalibrating,
                { width: visualizerSize, height: visualizerSize },
              ]}
            >
              <CenterTarget size={visualizerSize * 0.5} />

              <CalibrationMarble
                color={MARBLE_COLORS.red.main}
                glow={MARBLE_COLORS.red.glow}
                offsetX={0}
                offsetY={-50}
                tiltX={currentTiltX}
                tiltY={currentTiltY}
                size={marbleSize}
                delay={0}
              />
              <CalibrationMarble
                color={MARBLE_COLORS.blue.main}
                glow={MARBLE_COLORS.blue.glow}
                offsetX={-43}
                offsetY={25}
                tiltX={currentTiltX}
                tiltY={currentTiltY}
                size={marbleSize}
                delay={0}
              />
              <CalibrationMarble
                color={MARBLE_COLORS.green.main}
                glow={MARBLE_COLORS.green.glow}
                offsetX={43}
                offsetY={25}
                tiltX={currentTiltX}
                tiltY={currentTiltY}
                size={marbleSize}
                delay={0}
              />
            </View>

            <Text style={styles.calibratingTitle}>Hold Still...</Text>
            <Text style={styles.calibratingText}>Keep your device in position</Text>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
            </View>

            {/* Current tilt info */}
            <View style={styles.tiltInfo}>
              <View style={styles.tiltItem}>
                <Text style={styles.tiltLabel}>X</Text>
                <Text style={styles.tiltValue}>{currentTiltX.toFixed(1)}°</Text>
              </View>
              <View style={styles.tiltDivider} />
              <View style={styles.tiltItem}>
                <Text style={styles.tiltLabel}>Y</Text>
                <Text style={styles.tiltValue}>{currentTiltY.toFixed(1)}°</Text>
              </View>
            </View>
          </>
        )}

        {step === 'complete' && (
          <>
            {/* Success animation */}
            <Animated.View
              style={[
                styles.successCircle,
                { transform: [{ scale: checkmarkScale }] },
              ]}
            >
              <View style={styles.successInner}>
                <Ionicons name="checkmark" size={60} color={CLOUD9_COLORS.white} />
              </View>
            </Animated.View>

            {/* Three marbles showing success */}
            <View style={styles.successMarbles}>
              <View style={[styles.successMarble, { backgroundColor: MARBLE_COLORS.red.main }]}>
                <Ionicons name="checkmark" size={12} color={CLOUD9_COLORS.white} />
              </View>
              <View style={[styles.successMarble, { backgroundColor: MARBLE_COLORS.blue.main }]}>
                <Ionicons name="checkmark" size={12} color={CLOUD9_COLORS.white} />
              </View>
              <View style={[styles.successMarble, { backgroundColor: MARBLE_COLORS.green.main }]}>
                <Ionicons name="checkmark" size={12} color={CLOUD9_COLORS.white} />
              </View>
            </View>

            <Text style={styles.successTitle}>Calibration Complete!</Text>
            <Text style={styles.successText}>
              Your device is now calibrated for precise triple-marble control.
              You can recalibrate anytime from settings.
            </Text>

            <View style={[styles.buttons, { marginTop: 32 }]}>
              <Button
                title="Start Playing"
                onPress={handleContinue}
                size="large"
                icon={<Ionicons name="play" size={22} color={CLOUD9_COLORS.white} />}
              />
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CLOUD9_COLORS.background,
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  bgCircle1: {
    width: 400,
    height: 400,
    top: -150,
    left: -100,
    opacity: 0.2,
  },
  bgCircle2: {
    width: 300,
    height: 300,
    bottom: 100,
    right: -100,
    opacity: 0.15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  headerTitle: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: CLOUD9_COLORS.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  visualizer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
    marginBottom: 32,
  },
  visualizerCalibrating: {
    borderColor: CLOUD9_COLORS.primary,
  },
  targetContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetOuter: {
    position: 'absolute',
    backgroundColor: CLOUD9_COLORS.primaryTranslucent,
  },
  targetMiddle: {
    position: 'absolute',
    backgroundColor: CLOUD9_COLORS.primaryTranslucent,
    opacity: 0.5,
  },
  targetCenter: {
    backgroundColor: CLOUD9_COLORS.primary,
    opacity: 0.8,
  },
  calibrationMarble: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 3,
    paddingRight: 5,
  },
  marbleHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: CLOUD9_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 300,
  },
  tips: {
    gap: 10,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    color: CLOUD9_COLORS.textSecondary,
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 13,
    color: CLOUD9_COLORS.success,
    fontWeight: '500',
  },
  buttons: {
    gap: 16,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  calibratingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
    marginBottom: 8,
  },
  calibratingText: {
    fontSize: 16,
    color: CLOUD9_COLORS.textSecondary,
    marginBottom: 24,
  },
  progressContainer: {
    width: '80%',
    maxWidth: 280,
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    backgroundColor: CLOUD9_COLORS.grayLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: CLOUD9_COLORS.primary,
    borderRadius: 3,
  },
  tiltInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  tiltItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tiltLabel: {
    fontSize: 12,
    color: CLOUD9_COLORS.textMuted,
    marginBottom: 2,
  },
  tiltValue: {
    fontSize: 18,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  tiltDivider: {
    width: 1,
    height: 28,
    backgroundColor: CLOUD9_COLORS.grayLight,
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CLOUD9_COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CLOUD9_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successMarbles: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  successMarble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: CLOUD9_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
