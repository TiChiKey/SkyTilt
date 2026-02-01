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

  // Wall hit - heavier "thud" vibration for wall impacts
  const wallHit = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [canTrigger]);

  // Marble collision - sharp "clink" vibration for marble-to-marble impacts
  // Uses Rigid for a sharper, more metallic feel
  const marbleClink = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }, [canTrigger]);

  // Pit fall - heavy impact
  const pitFall = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [canTrigger]);

  // Checkpoint - light success pulse (used for marble clink in game)
  const checkpoint = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [canTrigger]);

  // Goal reached - celebratory success notification
  const goal = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [canTrigger]);

  // Button press - subtle feedback
  const button = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [canTrigger]);

  // Selection change - very subtle
  const selection = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.selectionAsync();
  }, [canTrigger]);

  // Warning - for errors or warnings
  const warning = useCallback(() => {
    if (!canTrigger()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [canTrigger]);

  return {
    wallHit,
    marbleClink,
    pitFall,
    checkpoint,
    goal,
    button,
    selection,
    warning,
  };
}
