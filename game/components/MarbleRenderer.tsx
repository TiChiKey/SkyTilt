import React from 'react';
import {
  Circle,
  Group,
  RadialGradient,
  vec,
  Shadow,
} from '@shopify/react-native-skia';
import { Vector2D } from '../types';
import { COLORS, PHYSICS } from '../constants';

interface MarbleRendererProps {
  position: Vector2D;
  scale: number;
  center: Vector2D;
  velocity: Vector2D;
  isAlive: boolean;
}

export function MarbleRenderer({
  position,
  scale,
  center,
  velocity,
  isAlive,
}: MarbleRendererProps) {
  // Transform position to screen coordinates
  const screenPos = {
    x: center.x + position.x * scale,
    y: center.y + position.y * scale,
  };

  const radius = PHYSICS.marbleRadius * scale;

  // Calculate shadow offset based on velocity (dynamic shadow)
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  const shadowOffset = Math.min(speed / 100, 6);
  const shadowDir = speed > 1
    ? { x: -velocity.x / speed, y: -velocity.y / speed }
    : { x: 0.5, y: 0.5 };

  if (!isAlive) {
    return null;
  }

  return (
    <Group>
      {/* Dynamic shadow based on velocity */}
      <Circle
        cx={screenPos.x + shadowDir.x * shadowOffset}
        cy={screenPos.y + shadowDir.y * shadowOffset + 3}
        r={radius * 0.9}
        color="rgba(0,0,0,0.4)"
      />

      {/* Main marble body */}
      <Circle cx={screenPos.x} cy={screenPos.y} r={radius}>
        <RadialGradient
          c={vec(screenPos.x - radius * 0.3, screenPos.y - radius * 0.3)}
          r={radius * 1.5}
          colors={[
            COLORS.marbleHighlight,
            COLORS.marbleWhite,
            'rgba(200, 210, 220, 1)',
          ]}
          positions={[0, 0.3, 1]}
        />
      </Circle>

      {/* Marble highlight/shine */}
      <Circle
        cx={screenPos.x - radius * 0.25}
        cy={screenPos.y - radius * 0.25}
        r={radius * 0.3}
        color="rgba(255,255,255,0.6)"
      />

      {/* Secondary small highlight */}
      <Circle
        cx={screenPos.x + radius * 0.2}
        cy={screenPos.y + radius * 0.3}
        r={radius * 0.15}
        color="rgba(255,255,255,0.3)"
      />

      {/* Subtle outline */}
      <Circle
        cx={screenPos.x}
        cy={screenPos.y}
        r={radius}
        style="stroke"
        strokeWidth={1}
        color="rgba(150,160,170,0.5)"
      />
    </Group>
  );
}
