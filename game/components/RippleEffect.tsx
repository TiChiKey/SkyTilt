import React, { useEffect, useState } from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import { Vector2D, RippleEffect as RippleType } from '../types';
import { COLORS } from '../constants';

interface RippleEffectProps {
  position: Vector2D;
  scale: number;
  center: Vector2D;
  active: boolean;
  onComplete?: () => void;
}

export function RippleEffectComponent({
  position,
  scale,
  center,
  active,
  onComplete,
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<RippleType[]>([]);

  useEffect(() => {
    if (!active) {
      setRipples([]);
      return;
    }

    // Create multiple ripples with staggered timing
    const newRipples: RippleType[] = [];
    const rippleCount = 4;

    for (let i = 0; i < rippleCount; i++) {
      newRipples.push({
        id: `ripple-${i}`,
        position: { ...position },
        radius: 0,
        maxRadius: 150 + i * 30,
        opacity: 1,
        startTime: Date.now() + i * 150,
      });
    }

    setRipples(newRipples);

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      const now = Date.now();

      setRipples((prev) => {
        const updated = prev
          .map((ripple) => {
            const elapsed = now - ripple.startTime;
            if (elapsed < 0) return ripple; // Not started yet

            const progress = Math.min(elapsed / 1000, 1); // 1 second duration
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            return {
              ...ripple,
              radius: easedProgress * ripple.maxRadius,
              opacity: 1 - progress,
            };
          })
          .filter((ripple) => ripple.opacity > 0);

        if (updated.length === 0 && onComplete) {
          onComplete();
        }

        return updated;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active, position, onComplete]);

  if (!active || ripples.length === 0) {
    return null;
  }

  const screenPos = {
    x: center.x + position.x * scale,
    y: center.y + position.y * scale,
  };

  return (
    <Group>
      {ripples.map((ripple) => (
        <Circle
          key={ripple.id}
          cx={screenPos.x}
          cy={screenPos.y}
          r={ripple.radius * scale}
          style="stroke"
          strokeWidth={3}
          color={`rgba(45, 175, 229, ${ripple.opacity})`}
        />
      ))}
    </Group>
  );
}
