// Cloud9 Level Select - Triple-Marble Challenge
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  IconButton,
  StarRatingDisplay,
  useProgress,
  useHaptics,
  MULTI_MARBLE_LEVELS,
  MultiMarbleLevel,
} from '../game';
import { CLOUD9_COLORS, MARBLE_COLORS } from '../game/constants/cloud9';

// Three marble indicator dots
function MarbleTrioIndicator({ completed }: { completed: boolean }) {
  return (
    <View style={styles.marbleIndicator}>
      <View
        style={[
          styles.marbleDot,
          { backgroundColor: MARBLE_COLORS.red.main },
          completed && styles.marbleDotComplete,
        ]}
      />
      <View
        style={[
          styles.marbleDot,
          { backgroundColor: MARBLE_COLORS.blue.main },
          completed && styles.marbleDotComplete,
        ]}
      />
      <View
        style={[
          styles.marbleDot,
          { backgroundColor: MARBLE_COLORS.green.main },
          completed && styles.marbleDotComplete,
        ]}
      />
    </View>
  );
}

// Circular difficulty indicator
function DifficultyRing({ difficulty }: { difficulty: number }) {
  const getDifficultyColor = () => {
    if (difficulty <= 2) return CLOUD9_COLORS.success;
    if (difficulty <= 3) return CLOUD9_COLORS.warning;
    return CLOUD9_COLORS.error;
  };

  const segments = 5;
  const filledSegments = difficulty;

  return (
    <View style={styles.difficultyRing}>
      {[...Array(segments)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.difficultySegment,
            {
              backgroundColor: i < filledSegments ? getDifficultyColor() : CLOUD9_COLORS.grayLight,
              transform: [{ rotate: `${i * 72}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

interface LevelCardProps {
  level: MultiMarbleLevel;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: 0 | 1 | 2 | 3;
  bestTime: number | null;
  onPress: () => void;
}

function LevelCard({
  level,
  index,
  isUnlocked,
  isCompleted,
  stars,
  bestTime,
  onPress,
}: LevelCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isUnlocked && !isCompleted) {
      // Pulse animation for unlocked, incomplete levels
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isUnlocked, isCompleted]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${seconds}.${millis.toString().padStart(2, '0')}s`;
  };

  const handlePressIn = () => {
    if (!isUnlocked) return;
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

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CLOUD9_COLORS.primaryTranslucent, CLOUD9_COLORS.primary],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!isUnlocked}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.card,
          !isUnlocked && styles.cardLocked,
          isCompleted && styles.cardCompleted,
          { transform: [{ scale: scaleAnim }] },
          isUnlocked && !isCompleted && { borderColor },
        ]}
      >
        {/* Level number badge */}
        <View
          style={[
            styles.levelNumber,
            {
              backgroundColor: isUnlocked
                ? isCompleted
                  ? CLOUD9_COLORS.success
                  : CLOUD9_COLORS.primary
                : CLOUD9_COLORS.gray,
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={20} color={CLOUD9_COLORS.white} />
          ) : (
            <Text style={styles.levelNumberText}>{index + 1}</Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text
              style={[
                styles.levelName,
                !isUnlocked && styles.textLocked,
              ]}
            >
              {level.name}
            </Text>
            <DifficultyRing difficulty={level.difficulty} />
          </View>

          {isUnlocked ? (
            <View style={styles.cardStats}>
              <StarRatingDisplay rating={stars} size={16} />
              {bestTime !== null && (
                <Text style={styles.bestTime}>
                  <Ionicons name="time-outline" size={12} color={CLOUD9_COLORS.textSecondary} />
                  {' '}{formatTime(bestTime)}
                </Text>
              )}
              <MarbleTrioIndicator completed={isCompleted} />
            </View>
          ) : (
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={16} color={CLOUD9_COLORS.gray} />
              <Text style={styles.lockedText}>Complete previous level</Text>
            </View>
          )}
        </View>

        {/* Arrow indicator */}
        {isUnlocked && (
          <View style={styles.arrowContainer}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={CLOUD9_COLORS.primary}
            />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function Cloud9LevelSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, isLevelUnlocked } = useProgress();
  const haptics = useHaptics({ enabled: true });

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLevelPress = (level: MultiMarbleLevel, index: number) => {
    if (!isLevelUnlocked(index)) return;
    haptics.button();
    router.push(`/game/${level.id}`);
  };

  const handleBack = () => {
    haptics.button();
    router.back();
  };

  // Calculate stats
  const completedLevels = Object.values(progress.levels).filter((l) => l.completed).length;
  const totalStars = progress.totalStars;
  const maxStars = MULTI_MARBLE_LEVELS.length * 3;

  return (
    <View style={styles.container}>
      {/* Decorative background */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
      </View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, opacity: headerOpacity },
        ]}
      >
        <IconButton
          onPress={handleBack}
          icon={<Ionicons name="arrow-back" size={24} color={CLOUD9_COLORS.textPrimary} />}
          style={styles.backButton}
        />
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Select Level</Text>
          <Text style={styles.subtitle}>Triple Marble Challenge</Text>
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      {/* Progress summary */}
      <Animated.View style={[styles.progressSummary, { opacity: headerOpacity }]}>
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <Ionicons name="star" size={24} color={CLOUD9_COLORS.warning} />
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressValue}>{totalStars}</Text>
              <Text style={styles.progressLabel}>/ {maxStars}</Text>
            </View>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Ionicons name="trophy" size={24} color={CLOUD9_COLORS.success} />
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressValue}>{completedLevels}</Text>
              <Text style={styles.progressLabel}>/ {MULTI_MARBLE_LEVELS.length}</Text>
            </View>
          </View>
        </View>

        {/* Three marble preview */}
        <View style={styles.marblePreview}>
          <View style={[styles.previewMarble, { backgroundColor: MARBLE_COLORS.red.main }]} />
          <View style={[styles.previewMarble, { backgroundColor: MARBLE_COLORS.blue.main }]} />
          <View style={[styles.previewMarble, { backgroundColor: MARBLE_COLORS.green.main }]} />
        </View>
      </Animated.View>

      {/* Level list */}
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: listOpacity }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {MULTI_MARBLE_LEVELS.map((level, index) => {
          const levelProgress = progress.levels[level.id];
          const isUnlocked = isLevelUnlocked(index);
          const isCompleted = levelProgress?.completed ?? false;
          return (
            <LevelCard
              key={level.id}
              level={level}
              index={index}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              stars={levelProgress?.starRating ?? 0}
              bestTime={levelProgress?.bestTime ?? null}
              onPress={() => handleLevelPress(level, index)}
            />
          );
        })}
      </Animated.ScrollView>
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
    right: -100,
    opacity: 0.2,
  },
  bgCircle2: {
    width: 300,
    height: 300,
    bottom: -50,
    left: -100,
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
  progressSummary: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
  },
  progressLabel: {
    fontSize: 16,
    color: CLOUD9_COLORS.textSecondary,
    marginLeft: 4,
  },
  progressDivider: {
    width: 1,
    height: 32,
    backgroundColor: CLOUD9_COLORS.grayLight,
    marginHorizontal: 24,
  },
  marblePreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  previewMarble: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
    shadowColor: CLOUD9_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLocked: {
    opacity: 0.5,
    borderColor: CLOUD9_COLORS.grayLight,
  },
  cardCompleted: {
    borderColor: CLOUD9_COLORS.success,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  levelNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: CLOUD9_COLORS.white,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 17,
    fontWeight: '600',
    color: CLOUD9_COLORS.textPrimary,
    flex: 1,
  },
  textLocked: {
    color: CLOUD9_COLORS.gray,
  },
  difficultyRing: {
    width: 24,
    height: 24,
    position: 'relative',
    marginLeft: 8,
  },
  difficultySegment: {
    position: 'absolute',
    width: 4,
    height: 8,
    borderRadius: 2,
    top: 0,
    left: 10,
    transformOrigin: 'center bottom',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bestTime: {
    fontSize: 12,
    color: CLOUD9_COLORS.textSecondary,
  },
  lockedOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedText: {
    fontSize: 13,
    color: CLOUD9_COLORS.gray,
  },
  marbleIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  marbleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.6,
  },
  marbleDotComplete: {
    opacity: 1,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.success,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});
