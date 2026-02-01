import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface UseSoundOptions {
  enabled: boolean;
  volume: number;
}

// Sound effects are generated programmatically since we don't have audio files
// In a production app, you would load actual audio files

export function useSound({ enabled, volume }: UseSoundOptions) {
  const soundsRef = useRef<Record<string, Audio.Sound | null>>({});
  const lastCollisionRef = useRef<number>(0);

  // Initialize audio mode
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.log('Audio mode setup failed:', error);
      }
    };

    setupAudio();
  }, []);

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        if (sound) {
          sound.unloadAsync().catch(() => {});
        }
      });
    };
  }, []);

  // Wall collision sound - simple beep
  const playWallHit = useCallback(async () => {
    if (!enabled || Platform.OS === 'web') return;

    // Throttle collision sounds
    const now = Date.now();
    if (now - lastCollisionRef.current < 80) return;
    lastCollisionRef.current = now;

    // In a real app, you'd play an actual sound file
    // For now, we rely on haptics for feedback
  }, [enabled, volume]);

  // Rolling sound with pitch based on speed
  const playRolling = useCallback(
    async (speed: number) => {
      if (!enabled || Platform.OS === 'web') return;
      // Would implement continuous rolling sound with pitch variation
    },
    [enabled, volume]
  );

  const stopRolling = useCallback(async () => {
    // Stop rolling sound
  }, []);

  // Checkpoint activation sound
  const playCheckpoint = useCallback(async () => {
    if (!enabled || Platform.OS === 'web') return;
    // Play checkpoint sound
  }, [enabled, volume]);

  // Goal reached celebration sound
  const playGoal = useCallback(async () => {
    if (!enabled || Platform.OS === 'web') return;
    // Play victory sound
  }, [enabled, volume]);

  // Pit fall sound
  const playPitFall = useCallback(async () => {
    if (!enabled || Platform.OS === 'web') return;
    // Play falling sound
  }, [enabled, volume]);

  // Button click sound
  const playButton = useCallback(async () => {
    if (!enabled || Platform.OS === 'web') return;
    // Play button click sound
  }, [enabled, volume]);

  // Marble-to-marble collision sound (clink)
  const playMarbleClink = useCallback(async () => {
    if (!enabled || Platform.OS === 'web') return;

    // Throttle collision sounds
    const now = Date.now();
    if (now - lastCollisionRef.current < 60) return;
    lastCollisionRef.current = now;

    // In a real app, you'd play a glass/marble clink sound file
    // For now, we rely on haptics for feedback
  }, [enabled, volume]);

  // Wall thud sound (heavier than clink)
  const playWallThud = useCallback(async () => {
    if (!enabled || Platform.OS === 'web') return;

    // Throttle collision sounds
    const now = Date.now();
    if (now - lastCollisionRef.current < 80) return;
    lastCollisionRef.current = now;

    // In a real app, you'd play a soft thud sound file
    // For now, we rely on haptics for feedback
  }, [enabled, volume]);

  return {
    playWallHit,
    playRolling,
    stopRolling,
    playCheckpoint,
    playGoal,
    playPitFall,
    playButton,
    playMarbleClink,
    playWallThud,
  };
}
