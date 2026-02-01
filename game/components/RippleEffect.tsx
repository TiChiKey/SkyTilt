import React, { useEffect, useState, useRef } from 'react';
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

  // Use refs to avoid effect re-triggering when position/onComplete change reference
  const positionRef = useRef(position);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Main effect only depends on `active` to prevent infinite loops
  useEffect(() => {
    if (!active) {
      setRipples([]);
      hasCompletedRef.current = false;
      return;
    }

    // Reset completion flag when starting new animation
    hasCompletedRef.current = false;

    // Create multiple ripples with staggered timing
    const currentPosition = positionRef.current;
    const newRipples: RippleType[] = [];
    const rippleCount = 4;

    for (let i = 0; i < rippleCount; i++) {
      newRipples.push({
        id: `ripple-${i}`,
        position: { ...currentPosition },
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

        // Call onComplete only once when all ripples are done
        if (updated.length === 0 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          // Use setTimeout to avoid calling setState during render
          setTimeout(() => {
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }, 0);
        }

        return updated;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active]); // Only depend on `active` to prevent infinite re-renders

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
