import { useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface UseHapticsOptions {
  enabled: boolean;
}

export function useHaptics({ enabled }: UseHapticsOptions) {
  // Throttle haptics to prevent overwhelming the device
  const lastHapticRef = useRef<number>(0);
  const minInterval = 50; // ms between haptic events

  const canTrigger = useCallback(() => {
    if (!enabled) return false;
    if (Platform.OS === 'web') return false;

    const now = Date.now();
    if (now - lastHapticRef.current < minInterval) return false;

    lastHapticRef.current = now;
    return true;
  }, [enabled]);

  const wallHit = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [canTrigger]);

  const pitFall = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [canTrigger]);

  const checkpoint = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [canTrigger]);

  const goal = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [canTrigger]);

  const button = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [canTrigger]);

  return {
    wallHit,
    pitFall,
    checkpoint,
    goal,
    button,
  };
}
