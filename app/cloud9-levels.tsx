// Cloud9 Multi-Marble Level Selection Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  IconButton,
  StarRatingDisplay,
  Cloud9Logo,
  ThreeMarblesIcon,
  useProgress,
  useHaptics,
  MULTI_MARBLE_LEVELS,
  MultiMarbleLevel,
} from '../game';
import { CLOUD9_COLORS, MARBLE_COLORS } from '../game/constants/cloud9';

interface LevelCardProps {
  level: MultiMarbleLevel;
  index: number;
  isUnlocked: boolean;
  stars: 0 | 1 | 2 | 3;
  bestTime: number | null;
  onPress: () => void;
}

function LevelCard({
  level,
  index,
  isUnlocked,
  stars,
  bestTime,
  onPress,
}: LevelCardProps) {
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${seconds}.${millis.toString().padStart(2, '0')}s`;
  };

  const getDifficultyColor = (difficulty: number): string => {
    const colors = {
      1: CLOUD9_COLORS.success,
      2: '#4CAF50',
      3: CLOUD9_COLORS.warning,
      4: '#FF9800',
      5: CLOUD9_COLORS.error,
    };
    return colors[difficulty as keyof typeof colors] || CLOUD9_COLORS.gray;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isUnlocked}
      activeOpacity={0.8}
    >
      <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
        {/* Level number with Cloud9 styling */}
        <View
          style={[
            styles.levelNumber,
            { backgroundColor: isUnlocked ? CLOUD9_COLORS.primary : CLOUD9_COLORS.gray },
          ]}
        >
          <Text style={styles.levelNumberText}>{index + 1}</Text>
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
            <View style={styles.difficultyDots}>
              {[1, 2, 3, 4, 5].map((d) => (
                <View
                  key={d}
                  style={[
                    styles.difficultyDot,
                    {
                      backgroundColor:
                        d <= level.difficulty
                          ? getDifficultyColor(level.difficulty)
                          : CLOUD9_COLORS.grayLight,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {isUnlocked ? (
            <View style={styles.cardStats}>
              <StarRatingDisplay rating={stars} size={18} />
              {bestTime !== null && (
                <Text style={styles.bestTime}>
                  Best: {formatTime(bestTime)}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={20} color={CLOUD9_COLORS.gray} />
              <Text style={styles.lockedText}>Complete previous level</Text>
            </View>
          )}

          {/* Three marble indicator */}
          <View style={styles.marbleIndicator}>
            <View style={[styles.marbleDot, { backgroundColor: MARBLE_COLORS.red.main }]} />
            <View style={[styles.marbleDot, { backgroundColor: MARBLE_COLORS.blue.main }]} />
            <View style={[styles.marbleDot, { backgroundColor: MARBLE_COLORS.green.main }]} />
          </View>
        </View>

        {/* Arrow indicator */}
        {isUnlocked && (
          <Ionicons
            name="chevron-forward"
            size={24}
            color={CLOUD9_COLORS.primary}
            style={styles.arrow}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function Cloud9LevelSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const haptics = useHaptics({ enabled: true });

  const handleLevelPress = (level: MultiMarbleLevel, index: number) => {
    // For multi-marble mode, all levels are unlocked for testing
    // In production, you might want: if (!isLevelUnlocked(index)) return;
    haptics.button();
    router.push(`/game/multi/${level.id}`);
  };

  const handleBack = () => {
    haptics.button();
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <IconButton
          onPress={handleBack}
          icon={<Ionicons name="arrow-back" size={24} color={CLOUD9_COLORS.textPrimary} />}
          style={styles.backButton}
        />
        <Text style={styles.title}>Cloud9 Mode</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Mode description */}
      <View style={styles.modeDescription}>
        <Cloud9Logo size={80} />
        <View style={styles.modeInfo}>
          <Text style={styles.modeTitle}>Multi-Marble Challenge</Text>
          <Text style={styles.modeSubtitle}>
            Control three marbles simultaneously!
          </Text>
        </View>
        <ThreeMarblesIcon size={60} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <Ionicons name="phone-portrait" size={20} color={CLOUD9_COLORS.primary} />
          <Text style={styles.instructionText}>
            All marbles respond to the same tilt
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="flag" size={20} color={CLOUD9_COLORS.success} />
          <Text style={styles.instructionText}>
            Guide each marble to its matching goal
          </Text>
        </View>
      </View>

      {/* Level list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {MULTI_MARBLE_LEVELS.map((level, index) => {
          const levelProgress = progress.levels[level.id];
          // For Cloud9 mode, unlock all levels for testing
          const isUnlocked = true; // or isLevelUnlocked(index)
          return (
            <LevelCard
              key={level.id}
              level={level}
              index={index}
              isUnlocked={isUnlocked}
              stars={levelProgress?.starRating ?? 0}
              bestTime={levelProgress?.bestTime ?? null}
              onPress={() => handleLevelPress(level, index)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CLOUD9_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    backgroundColor: CLOUD9_COLORS.overlayLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
  },
  modeDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.primary,
  },
  modeInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CLOUD9_COLORS.primary,
    textAlign: 'center',
  },
  modeSubtitle: {
    fontSize: 13,
    color: CLOUD9_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: CLOUD9_COLORS.overlayLight,
    borderRadius: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionText: {
    fontSize: 12,
    color: CLOUD9_COLORS.textSecondary,
    maxWidth: 120,
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
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  cardLocked: {
    opacity: 0.5,
    borderColor: CLOUD9_COLORS.grayLight,
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
    fontSize: 18,
    fontWeight: '600',
    color: CLOUD9_COLORS.textPrimary,
  },
  textLocked: {
    color: CLOUD9_COLORS.gray,
  },
  difficultyDots: {
    flexDirection: 'row',
    gap: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bestTime: {
    fontSize: 13,
    color: CLOUD9_COLORS.textSecondary,
  },
  lockedOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedText: {
    fontSize: 13,
    color: CLOUD9_COLORS.gray,
  },
  marbleIndicator: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  marbleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  arrow: {
    marginLeft: 8,
  },
});
