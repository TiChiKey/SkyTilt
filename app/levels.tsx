import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  IconButton,
  StarRatingDisplay,
  useProgress,
  useHaptics,
  LEVELS,
  Level,
} from '../game';

interface LevelCardProps {
  level: Level;
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
      1: COLORS.success,
      2: '#4CAF50',
      3: COLORS.warning,
      4: '#FF9800',
      5: COLORS.error,
    };
    return colors[difficulty as keyof typeof colors] || COLORS.textMuted;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isUnlocked}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          isUnlocked
            ? [COLORS.charcoalLight, COLORS.charcoal]
            : ['rgba(30,30,46,0.5)', 'rgba(26,26,46,0.5)']
        }
        style={[styles.card, !isUnlocked && styles.cardLocked]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Level number */}
        <View
          style={[
            styles.levelNumber,
            { backgroundColor: isUnlocked ? COLORS.skyBlue : COLORS.textMuted },
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
                          : COLORS.textMuted,
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
              <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
              <Text style={styles.lockedText}>Complete previous level</Text>
            </View>
          )}
        </View>

        {/* Arrow indicator */}
        {isUnlocked && (
          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.skyBlue}
            style={styles.arrow}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function LevelSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, isLevelUnlocked } = useProgress();
  const haptics = useHaptics({ enabled: true });

  const handleLevelPress = (level: Level, index: number) => {
    if (!isLevelUnlocked(index)) return;
    haptics.button();
    router.push(`/game/${level.id}`);
  };

  const handleBack = () => {
    haptics.button();
    router.back();
  };

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
        <Text style={styles.title}>Select Level</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress summary */}
      <View style={styles.progressSummary}>
        <View style={styles.progressItem}>
          <Ionicons name="star" size={20} color={COLORS.gold} />
          <Text style={styles.progressValue}>{progress.totalStars}</Text>
          <Text style={styles.progressLabel}>
            / {LEVELS.length * 3} Stars
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
        {LEVELS.map((level, index) => {
          const levelProgress = progress.levels[level.id];
          return (
            <LevelCard
              key={level.id}
              level={level}
              index={index}
              isUnlocked={isLevelUnlocked(index)}
              stars={levelProgress?.starRating ?? 0}
              bestTime={levelProgress?.bestTime ?? null}
              onPress={() => handleLevelPress(level, index)}
            />
          );
        })}
      </ScrollView>
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
  progressSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: COLORS.overlayDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.skyBlueTranslucent,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    borderWidth: 1,
    borderColor: COLORS.skyBlueTranslucent,
  },
  cardLocked: {
    opacity: 0.6,
    borderColor: 'rgba(255,255,255,0.1)',
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
    color: COLORS.white,
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
    color: COLORS.white,
  },
  textLocked: {
    color: COLORS.textMuted,
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
    color: COLORS.textSecondary,
  },
  lockedOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  arrow: {
    marginLeft: 8,
  },
});
