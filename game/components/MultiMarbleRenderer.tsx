// Multi-Marble Renderer - Renders multiple colored marbles
import React from 'react';
import {
  Circle,
  Group,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import { MultiMarbleState, Vector2D } from '../types';
import { PHYSICS } from '../constants';
import { MARBLE_COLORS, MarbleColorId } from '../constants/cloud9';

interface SingleMarbleProps {
  marble: MultiMarbleState;
  scale: number;
  center: Vector2D;
}

// Single colored marble renderer
function SingleColoredMarble({ marble, scale, center }: SingleMarbleProps) {
  // Transform position to screen coordinates
  const screenPos = {
    x: center.x + marble.position.x * scale,
    y: center.y + marble.position.y * scale,
  };

  const radius = PHYSICS.marbleRadius * scale;

  // Get marble colors based on color ID
  const colors = MARBLE_COLORS[marble.colorId];

  // Calculate shadow offset based on velocity
  const speed = Math.sqrt(
    marble.velocity.x * marble.velocity.x +
    marble.velocity.y * marble.velocity.y
  );
  const shadowOffset = Math.min(speed / 100, 6);
  const shadowDir = speed > 1
    ? { x: -marble.velocity.x / speed, y: -marble.velocity.y / speed }
    : { x: 0.5, y: 0.5 };

  // If marble is not alive, show faded version
  const opacity = marble.isAlive ? 1 : 0.3;

  // If marble is in goal, show pulsing glow effect
  const glowRadius = marble.isInGoal ? radius * 1.8 : radius * 1.2;

  return (
    <Group opacity={opacity}>
      {/* Glow effect (stronger when in goal) */}
      <Circle cx={screenPos.x} cy={screenPos.y} r={glowRadius}>
        <RadialGradient
          c={vec(screenPos.x, screenPos.y)}
          r={glowRadius}
          colors={[
            marble.isInGoal ? colors.glow : 'transparent',
            'transparent',
          ]}
        />
      </Circle>

      {/* Dynamic shadow based on velocity */}
      <Circle
        cx={screenPos.x + shadowDir.x * shadowOffset}
        cy={screenPos.y + shadowDir.y * shadowOffset + 3}
        r={radius * 0.9}
        color="rgba(0,0,0,0.3)"
      />

      {/* Main marble body with color gradient */}
      <Circle cx={screenPos.x} cy={screenPos.y} r={radius}>
        <RadialGradient
          c={vec(screenPos.x - radius * 0.3, screenPos.y - radius * 0.3)}
          r={radius * 1.5}
          colors={[
            colors.light,
            colors.main,
            colors.dark,
          ]}
          positions={[0, 0.4, 1]}
        />
      </Circle>

      {/* Primary highlight/shine */}
      <Circle
        cx={screenPos.x - radius * 0.25}
        cy={screenPos.y - radius * 0.25}
        r={radius * 0.35}
        color="rgba(255,255,255,0.7)"
      />

      {/* Secondary small highlight */}
      <Circle
        cx={screenPos.x + radius * 0.2}
        cy={screenPos.y + radius * 0.3}
        r={radius * 0.15}
        color="rgba(255,255,255,0.4)"
      />

      {/* Subtle outline */}
      <Circle
        cx={screenPos.x}
        cy={screenPos.y}
        r={radius}
        style="stroke"
        strokeWidth={1.5}
        color={colors.dark}
      />

      {/* In-goal indicator ring */}
      {marble.isInGoal && (
        <Circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={radius + 4}
          style="stroke"
          strokeWidth={3}
          color={colors.main}
        />
      )}
    </Group>
  );
}

interface MultiMarbleRendererProps {
  marbles: MultiMarbleState[];
  scale: number;
  center: Vector2D;
}

export function MultiMarbleRenderer({
  marbles,
  scale,
  center,
}: MultiMarbleRendererProps) {
  // Sort marbles so alive ones render on top of dead ones
  const sortedMarbles = [...marbles].sort((a, b) => {
    if (a.isAlive && !b.isAlive) return 1;
    if (!a.isAlive && b.isAlive) return -1;
    return 0;
  });

  return (
    <Group>
      {sortedMarbles.map((marble) => (
        <SingleColoredMarble
          key={marble.id}
          marble={marble}
          scale={scale}
          center={center}
        />
      ))}
    </Group>
  );
}

// Export marble color utilities
export function getMarbleColors(colorId: MarbleColorId) {
  return MARBLE_COLORS[colorId];
}
