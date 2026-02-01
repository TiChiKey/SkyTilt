import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  Button,
  OrbitLogo,
  useProgress,
  useCalibrationData,
  useHaptics,
  getTotalLevels,
} from '../game';

export default function MainMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { progress } = useProgress();
  const { calibration } = useCalibrationData();
  const haptics = useHaptics({ enabled: true });

  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(50)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(buttonsTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePlay = () => {
    haptics.button();
    if (!calibration.isCalibrated) {
      router.push('/calibration');
    } else {
      router.push('/levels');
    }
  };

  const handleSettings = () => {
    haptics.button();
    router.push('/settings');
  };

  const handleCloud9Mode = () => {
    haptics.button();
    if (!calibration.isCalibrated) {
      router.push('/calibration');
    } else {
      router.push('/cloud9-levels');
    }
  };

  const totalLevels = getTotalLevels();
  const completedLevels = Object.values(progress.levels).filter(
    (l) => l.completed
  ).length;

  return (
    <LinearGradient
      colors={[COLORS.bgDark, COLORS.bgMid, COLORS.bgLight]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Decorative background circles */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
        <View style={[styles.bgCircle, styles.bgCircle3]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo and Title */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <OrbitLogo size={Math.min(width * 0.5, 200)} />
          <Text style={styles.title}>ORBIT</Text>
          <Text style={styles.subtitle}>Tilt • Roll • Conquer</Text>
        </Animated.View>

        {/* Progress indicator */}
        {completedLevels > 0 && (
          <Animated.View
            style={[
              styles.progressContainer,
              { opacity: buttonsOpacity },
            ]}
          >
            <View style={styles.progressBadge}>
              <Ionicons name="star" size={16} color={COLORS.gold} />
              <Text style={styles.progressText}>
                {progress.totalStars} Stars
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.progressText}>
                {completedLevels}/{totalLevels} Levels
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Menu Buttons */}
        <Animated.View
          style={[
            styles.buttons,
            {
              opacity: buttonsOpacity,
              transform: [{ translateY: buttonsTranslateY }],
            },
          ]}
        >
          <Button
            title="Play"
            onPress={handlePlay}
            size="large"
            icon={<Ionicons name="play" size={24} color={COLORS.white} />}
          />

          <Button
            title="Cloud9 Mode"
            onPress={handleCloud9Mode}
            variant="secondary"
            size="medium"
            icon={<Ionicons name="cloudy" size={20} color={COLORS.skyBlue} />}
          />

          <Button
            title="Settings"
            onPress={handleSettings}
            variant="ghost"
            size="small"
            icon={<Ionicons name="settings-outline" size={18} color={COLORS.textSecondary} />}
          />
        </Animated.View>

        {/* Calibration notice */}
        {!calibration.isCalibrated && (
          <Animated.View
            style={[styles.notice, { opacity: buttonsOpacity }]}
          >
            <Ionicons name="information-circle" size={16} color={COLORS.skyBlue} />
            <Text style={styles.noticeText}>
              Calibration required for best experience
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Version */}
      <Text style={[styles.version, { bottom: insets.bottom + 16 }]}>
        v1.0.0
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: COLORS.skyBlueTranslucent,
  },
  bgCircle1: {
    width: 400,
    height: 400,
    top: -100,
    right: -150,
    opacity: 0.3,
  },
  bgCircle2: {
    width: 300,
    height: 300,
    bottom: 100,
    left: -100,
    opacity: 0.2,
  },
  bgCircle3: {
    width: 200,
    height: 200,
    bottom: -50,
    right: 50,
    opacity: 0.15,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 12,
    marginTop: 24,
    textShadowColor: COLORS.skyBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.overlayDark,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.skyBlueTranslucent,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttons: {
    gap: 16,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.overlayLight,
    borderRadius: 20,
  },
  noticeText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  version: {
    position: 'absolute',
    alignSelf: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
