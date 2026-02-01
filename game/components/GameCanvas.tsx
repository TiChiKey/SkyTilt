import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { Level, MarbleState, Vector2D } from '../types';
import { COLORS, GAME_CONFIG } from '../constants';
import { MazeRenderer } from './MazeRenderer';
import { MarbleRenderer } from './MarbleRenderer';
import { RippleEffectComponent } from './RippleEffect';

interface GameCanvasProps {
  level: Level;
  marble: MarbleState;
  showCelebration: boolean;
  onCelebrationComplete?: () => void;
  activatedCheckpoints: Set<string>;
}

export function GameCanvas({
  level,
  marble,
  showCelebration,
  onCelebrationComplete,
  activatedCheckpoints,
}: GameCanvasProps) {
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

  // Create a modified level with activated checkpoints
  const levelWithCheckpoints = useMemo(() => ({
    ...level,
    checkpoints: level.checkpoints.map((cp) => ({
      ...cp,
      activated: activatedCheckpoints.has(cp.id),
    })),
  }), [level, activatedCheckpoints]);

  return (
    <Canvas style={styles.canvas}>
      {/* Maze background and walls */}
      <MazeRenderer
        level={levelWithCheckpoints}
        size={size}
        scale={scale}
        center={center}
      />

      {/* Marble */}
      <MarbleRenderer
        position={marble.position}
        scale={scale}
        center={center}
        velocity={marble.velocity}
        isAlive={marble.isAlive}
      />

      {/* Celebration ripple effect */}
      <RippleEffectComponent
        position={level.goal.position}
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
    backgroundColor: COLORS.bgDark,
  },
});
