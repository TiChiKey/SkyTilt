// Cloud9 Main Menu - Dedicated Triple-Marble Experience
import React, { useEffect, useRef } from 'react';
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
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  useProgress,
  useCalibrationData,
  useHaptics,
} from '../game';
import { CLOUD9_COLORS, MARBLE_COLORS } from '../game/constants/cloud9';
import { MULTI_MARBLE_LEVELS } from '../game/levels/multiMarbleLevels';

// Cloud9 Logo Component
function Cloud9LogoLarge({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.7} viewBox="0 0 200 140">
      <Defs>
        <RadialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={CLOUD9_COLORS.primaryLight} />
          <Stop offset="100%" stopColor={CLOUD9_COLORS.primary} />
        </RadialGradient>
      </Defs>
      {/* Cloud9-inspired logo path */}
      <Path
        d="M60 70 C60 40, 90 20, 100 50 C110 20, 140 40, 140 70 C160 70, 180 90, 160 110 C180 130, 140 140, 100 120 C60 140, 20 130, 40 110 C20 90, 40 70, 60 70 Z"
        fill="url(#logoGradient)"
      />
      {/* Number 9 inside */}
      <Circle cx="100" cy="75" r="20" fill={CLOUD9_COLORS.white} />
      <Circle cx="100" cy="75" r="12" fill={CLOUD9_COLORS.primary} />
      <Path
        d="M100 85 L100 110"
        stroke={CLOUD9_COLORS.white}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Three Marbles Display Component
function ThreeMarblesDisplay({ size }: { size: number }) {
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseAnim3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createPulse(pulseAnim1, 0),
      createPulse(pulseAnim2, 200),
      createPulse(pulseAnim3, 400),
    ]).start();
  }, []);

  const marbleSize = size * 0.28;

  return (
    <View style={[styles.marblesContainer, { width: size, height: size * 0.5 }]}>
      <Animated.View
        style={[
          styles.marbleWrapper,
          { transform: [{ scale: pulseAnim1 }] },
        ]}
      >
        <View
          style={[
            styles.marble,
            {
              width: marbleSize,
              height: marbleSize,
              borderRadius: marbleSize / 2,
              backgroundColor: MARBLE_COLORS.red.main,
              shadowColor: MARBLE_COLORS.red.glow,
            },
          ]}
        >
          <View style={[styles.marbleHighlight, { width: marbleSize * 0.3, height: marbleSize * 0.3 }]} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.marbleWrapper,
          { transform: [{ scale: pulseAnim2 }], marginTop: -15 },
        ]}
      >
        <View
          style={[
            styles.marble,
            {
              width: marbleSize,
              height: marbleSize,
              borderRadius: marbleSize / 2,
              backgroundColor: MARBLE_COLORS.blue.main,
              shadowColor: MARBLE_COLORS.blue.glow,
            },
          ]}
        >
          <View style={[styles.marbleHighlight, { width: marbleSize * 0.3, height: marbleSize * 0.3 }]} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.marbleWrapper,
          { transform: [{ scale: pulseAnim3 }] },
        ]}
      >
        <View
          style={[
            styles.marble,
            {
              width: marbleSize,
              height: marbleSize,
              borderRadius: marbleSize / 2,
              backgroundColor: MARBLE_COLORS.green.main,
              shadowColor: MARBLE_COLORS.green.glow,
            },
          ]}
        >
          <View style={[styles.marbleHighlight, { width: marbleSize * 0.3, height: marbleSize * 0.3 }]} />
        </View>
      </Animated.View>
    </View>
  );
}

// Menu Button Component
interface MenuButtonProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

function MenuButton({ title, subtitle, icon, onPress, variant = 'primary' }: MenuButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View
        style={[
          styles.menuButton,
          isPrimary && styles.menuButtonPrimary,
          isSecondary && styles.menuButtonSecondary,
          variant === 'ghost' && styles.menuButtonGhost,
        ]}
        onTouchStart={handlePressIn}
        onTouchEnd={() => {
          handlePressOut();
          onPress();
        }}
      >
        <View style={styles.menuButtonIcon}>{icon}</View>
        <View style={styles.menuButtonText}>
          <Text
            style={[
              styles.menuButtonTitle,
              isPrimary && styles.menuButtonTitlePrimary,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.menuButtonSubtitle}>{subtitle}</Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={isPrimary ? CLOUD9_COLORS.white : CLOUD9_COLORS.primary}
        />
      </View>
    </Animated.View>
  );
}

export default function Cloud9MainMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { progress } = useProgress();
  const { calibration } = useCalibrationData();
  const haptics = useHaptics({ enabled: true });

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleBeginOrbit = () => {
    haptics.button();
    if (!calibration.isCalibrated) {
      router.push('/calibration');
    } else {
      router.push('/levels');
    }
  };

  const handleCalibration = () => {
    haptics.button();
    router.push('/calibration');
  };

  const handleSettings = () => {
    haptics.button();
    router.push('/settings');
  };

  // Calculate progress
  const completedLevels = Object.values(progress.levels).filter(
    (l) => l.completed
  ).length;
  const totalLevels = MULTI_MARBLE_LEVELS.length;

  return (
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
        <View style={[styles.bgCircle, styles.bgCircle3]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Cloud9LogoLarge size={Math.min(width * 0.6, 220)} />
          <Text style={styles.title}>CLOUD9</Text>
          <Text style={styles.subtitle}>TRIPLE MARBLE CHALLENGE</Text>
          <ThreeMarblesDisplay size={Math.min(width * 0.5, 180)} />
        </Animated.View>

        {/* Progress Badge */}
        {completedLevels > 0 && (
          <Animated.View
            style={[
              styles.progressBadge,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <View style={styles.progressItem}>
              <Ionicons name="star" size={16} color={CLOUD9_COLORS.warning} />
              <Text style={styles.progressText}>{progress.totalStars} Stars</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Ionicons name="checkmark-circle" size={16} color={CLOUD9_COLORS.success} />
              <Text style={styles.progressText}>
                {completedLevels}/{totalLevels} Levels
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Menu Buttons */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <MenuButton
            title="Begin Orbit"
            subtitle="Start your triple-marble journey"
            icon={<Ionicons name="play-circle" size={28} color={CLOUD9_COLORS.white} />}
            onPress={handleBeginOrbit}
            variant="primary"
          />

          <MenuButton
            title="Calibration"
            subtitle={calibration.isCalibrated ? 'Device calibrated' : 'Set your neutral position'}
            icon={<Ionicons name="compass" size={24} color={CLOUD9_COLORS.primary} />}
            onPress={handleCalibration}
            variant="secondary"
          />

          <MenuButton
            title="Settings"
            subtitle="Controls, audio & more"
            icon={<Ionicons name="settings-outline" size={24} color={CLOUD9_COLORS.textSecondary} />}
            onPress={handleSettings}
            variant="ghost"
          />
        </Animated.View>

        {/* Calibration Notice */}
        {!calibration.isCalibrated && (
          <Animated.View
            style={[
              styles.notice,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <Ionicons name="information-circle" size={18} color={CLOUD9_COLORS.primary} />
            <Text style={styles.noticeText}>
              Calibration required for the best experience
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Version */}
      <Text style={[styles.version, { bottom: insets.bottom + 16 }]}>
        Cloud9 v2.0
      </Text>
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
    width: 500,
    height: 500,
    top: -200,
    right: -200,
    opacity: 0.3,
  },
  bgCircle2: {
    width: 400,
    height: 400,
    bottom: 50,
    left: -150,
    opacity: 0.2,
  },
  bgCircle3: {
    width: 300,
    height: 300,
    bottom: -100,
    right: 20,
    opacity: 0.15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: CLOUD9_COLORS.primary,
    letterSpacing: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: CLOUD9_COLORS.textSecondary,
    letterSpacing: 3,
    marginTop: 4,
  },
  marblesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  marbleWrapper: {
    alignItems: 'center',
  },
  marble: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 4,
    paddingRight: 6,
  },
  marbleHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 100,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
    alignSelf: 'center',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDivider: {
    width: 1,
    height: 16,
    backgroundColor: CLOUD9_COLORS.grayLight,
    marginHorizontal: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: CLOUD9_COLORS.textPrimary,
  },
  menuContainer: {
    gap: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  menuButtonPrimary: {
    backgroundColor: CLOUD9_COLORS.primary,
    shadowColor: CLOUD9_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  menuButtonSecondary: {
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.primary,
  },
  menuButtonGhost: {
    backgroundColor: CLOUD9_COLORS.overlayLight,
  },
  menuButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
  },
  menuButtonTitlePrimary: {
    color: CLOUD9_COLORS.white,
  },
  menuButtonSubtitle: {
    fontSize: 13,
    color: CLOUD9_COLORS.textSecondary,
    marginTop: 2,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: CLOUD9_COLORS.primary,
  },
  noticeText: {
    fontSize: 13,
    color: CLOUD9_COLORS.textSecondary,
    flex: 1,
  },
  version: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 12,
    color: CLOUD9_COLORS.textMuted,
  },
});
