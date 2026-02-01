// Multi-Marble Game Canvas - Cloud9 Mode
import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { MultiMarbleLevel, MultiMarbleState, Vector2D, ColoredGoal } from '../types';
import { GAME_CONFIG } from '../constants';
import { CLOUD9_COLORS } from '../constants/cloud9';
import { Cloud9MazeRenderer } from './Cloud9MazeRenderer';
import { MultiMarbleRenderer } from './MultiMarbleRenderer';
import { RippleEffectComponent } from './RippleEffect';

interface MultiMarbleGameCanvasProps {
  level: MultiMarbleLevel;
  marbles: MultiMarbleState[];
  showCelebration: boolean;
  onCelebrationComplete?: () => void;
  activatedCheckpoints: Set<string>;
  completedGoals: Set<string>;
}

export function MultiMarbleGameCanvas({
  level,
  marbles,
  showCelebration,
  onCelebrationComplete,
  activatedCheckpoints,
  completedGoals,
}: MultiMarbleGameCanvasProps) {
  const { width, height } = useWindowDimensions();

  // Calculate scale and center
  const { scale, center, size } = useMemo(() => {
    const padding = GAME_CONFIG.mazePadding;
    const availableSize = Math.min(width, height) - padding * 2;
    const mazeSize = level.mazeRadius * 2;
    const calculatedScale = (availableSize / mazeSize) * GAME_CONFIG.mazeScale;

    return {
      scale: calculatedScale,
      center: { x: width / 2, y: height / 2 },
      size: availableSize,
    };
  }, [width, height, level.mazeRadius]);

  // Create modified level with activated checkpoints and completed goals
  const levelWithState = useMemo(
    () => ({
      ...level,
      checkpoints: level.checkpoints.map((cp) => ({
        ...cp,
        activated: activatedCheckpoints.has(cp.id),
      })),
      goals: level.goals.map((goal) => ({
        ...goal,
        isComplete: completedGoals.has(goal.id),
      })),
    }),
    [level, activatedCheckpoints, completedGoals]
  );

  // Get center of all goals for celebration effect
  const celebrationCenter = useMemo(() => {
    if (level.goals.length === 0) return { x: 0, y: 0 };
    const sum = level.goals.reduce(
      (acc, goal) => ({
        x: acc.x + goal.position.x,
        y: acc.y + goal.position.y,
      }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / level.goals.length,
      y: sum.y / level.goals.length,
    };
  }, [level.goals]);

  return (
    <Canvas style={styles.canvas}>
      {/* Cloud9 Maze with white background and blue walls */}
      <Cloud9MazeRenderer
        level={levelWithState}
        size={size}
        scale={scale}
        center={center}
      />

      {/* Multiple colored marbles */}
      <MultiMarbleRenderer
        marbles={marbles}
        scale={scale}
        center={center}
      />

      {/* Celebration ripple effect */}
      <RippleEffectComponent
        position={celebrationCenter}
        scale={scale}
        center={center}
        active={showCelebration}
        onComplete={onCelebrationComplete}
      />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: CLOUD9_COLORS.background,
  },
});
