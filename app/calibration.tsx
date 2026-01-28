import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  Button,
  IconButton,
  OrbitIcon,
  useCalibration,
  useCalibrationData,
  useHaptics,
} from '../game';

type CalibrationStep = 'intro' | 'calibrating' | 'complete';

export default function CalibrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics({ enabled: true });

  const [step, setStep] = useState<CalibrationStep>('intro');
  const { startCalibration, getCalibrationData, isCalibrating, sampleCount } =
    useCalibration();
  const { saveCalibration } = useCalibrationData();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  // Pulse animation during calibration
  useEffect(() => {
    if (step === 'calibrating') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [step]);

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

  // Complete animation
  useEffect(() => {
    if (step === 'complete') {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  // Handle calibration completion
  useEffect(() => {
    if (step === 'calibrating' && !isCalibrating && sampleCount > 0) {
      const data = getCalibrationData();
      if (data) {
        saveCalibration(data).then(() => {
          haptics.goal();
          setStep('complete');
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

  return (
    <LinearGradient
      colors={[COLORS.bgDark, COLORS.bgMid]}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <IconButton
          onPress={handleBack}
          icon={<Ionicons name="arrow-back" size={24} color={COLORS.white} />}
        />
        <Text style={styles.title}>Calibration</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {step === 'intro' && (
          <>
            {/* Instruction illustration */}
            <View style={styles.illustration}>
              <View style={styles.phoneIllustration}>
                <View style={styles.phoneScreen}>
                  <OrbitIcon size={40} />
                </View>
              </View>
              <View style={styles.tiltIndicator}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={60}
                  color={COLORS.skyBlue}
                />
                <Text style={styles.tiltAngle}>0°</Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>
                Set Your Neutral Position
              </Text>
              <Text style={styles.instructionText}>
                Hold your device in the position you want to use while playing.
                This becomes your neutral position - when the marble will not
                move.
              </Text>
              <View style={styles.tips}>
                <View style={styles.tip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.success}
                  />
                  <Text style={styles.tipText}>Find a comfortable angle</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.success}
                  />
                  <Text style={styles.tipText}>Hold device steady</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.success}
                  />
                  <Text style={styles.tipText}>
                    Calibration takes 1 second
                  </Text>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <Button
                title="Calibrate Now"
                onPress={handleStartCalibration}
                size="large"
                icon={
                  <Ionicons name="compass" size={22} color={COLORS.white} />
                }
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
            {/* Calibrating animation */}
            <Animated.View
              style={[
                styles.calibratingCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <LinearGradient
                colors={[COLORS.skyBlueLight, COLORS.skyBlue]}
                style={styles.calibratingInner}
              >
                <Ionicons name="compass" size={60} color={COLORS.white} />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.calibratingTitle}>Hold Still...</Text>
            <Text style={styles.calibratingText}>
              Keep your device in position
            </Text>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[styles.progressFill, { width: progressWidth }]}
                />
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
              <LinearGradient
                colors={[COLORS.success, '#00C853']}
                style={styles.successInner}
              >
                <Ionicons name="checkmark" size={60} color={COLORS.white} />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.successTitle}>Calibration Complete!</Text>
            <Text style={styles.successText}>
              Your device is now calibrated. You can recalibrate anytime from
              settings.
            </Text>

            <View style={[styles.buttons, { marginTop: 40 }]}>
              <Button
                title="Start Playing"
                onPress={handleContinue}
                size="large"
                icon={<Ionicons name="play" size={22} color={COLORS.white} />}
              />
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: 40,
  },
  phoneIllustration: {
    width: 120,
    height: 200,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.skyBlue,
    backgroundColor: COLORS.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneScreen: {
    width: 100,
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiltIndicator: {
    position: 'absolute',
    right: -80,
    top: '50%',
    marginTop: -30,
    alignItems: 'center',
  },
  tiltAngle: {
    color: COLORS.skyBlue,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  tips: {
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  buttons: {
    gap: 16,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  calibratingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.skyBlueTranslucent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  calibratingInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibratingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  calibratingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  progressContainer: {
    width: '80%',
    maxWidth: 280,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.charcoal,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.skyBlue,
    borderRadius: 3,
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  successInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
