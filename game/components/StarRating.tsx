import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { StarRating as StarRatingType } from '../types';
import { COLORS } from '../constants';

interface StarRatingProps {
  rating: StarRatingType;
  size?: number;
  showAll?: boolean;
}

const StarIcon = ({
  filled,
  size,
  color,
}: {
  filled: boolean;
  size: number;
  color: string;
}) => {
  const starPath =
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {filled ? (
        <>
          <Defs>
            <LinearGradient id={`starGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color === COLORS.gold ? '#FFE066' : color} />
              <Stop offset="100%" stopColor={color} />
            </LinearGradient>
          </Defs>
          <Path
            d={starPath}
            fill={`url(#starGrad-${color})`}
            stroke={color}
            strokeWidth={1}
          />
        </>
      ) : (
        <Path
          d={starPath}
          fill="transparent"
          stroke={COLORS.starEmpty}
          strokeWidth={1.5}
        />
      )}
    </Svg>
  );
};

export function StarRatingDisplay({
  rating,
  size = 24,
  showAll = true,
}: StarRatingProps) {
  const stars = [];

  // Determine colors based on rating
  const getStarColor = (index: number): string => {
    if (index >= rating) return COLORS.starEmpty;
    if (rating === 3) return COLORS.gold;
    if (rating === 2) return COLORS.silver;
    return COLORS.bronze;
  };

  const count = showAll ? 3 : rating;

  for (let i = 0; i < count; i++) {
    stars.push(
      <StarIcon
        key={i}
        filled={i < rating}
        size={size}
        color={getStarColor(i)}
      />
    );
  }

  return <View style={styles.container}>{stars}</View>;
}

// Large animated star display for level completion
export function CompletionStars({
  rating,
  size = 48,
}: {
  rating: StarRatingType;
  size?: number;
}) {
  const colors = {
    3: COLORS.gold,
    2: COLORS.silver,
    1: COLORS.bronze,
    0: COLORS.starEmpty,
  };

  return (
    <View style={styles.completionContainer}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.starWrapper,
            {
              transform: [
                { scale: index === 1 ? 1.2 : 1 },
                { translateY: index === 1 ? -8 : 0 },
              ],
            },
          ]}
        >
          <StarIcon
            filled={index < rating}
            size={size}
            color={index < rating ? colors[rating] : COLORS.starEmpty}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  starWrapper: {
    padding: 4,
  },
});
