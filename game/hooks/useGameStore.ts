import { useState, useEffect, useCallback } from 'react';
import { gameStore } from '../store/gameStore';
import {
  GameSettings,
  GameProgress,
  CalibrationData,
  StarRating,
} from '../types';

// Hook to access game settings
export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(gameStore.getSettings());

  useEffect(() => {
    return gameStore.subscribe(() => {
      setSettings(gameStore.getSettings());
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<GameSettings>) => {
    await gameStore.updateSettings(updates);
  }, []);

  return { settings, updateSettings };
}

// Hook to access game progress
export function useProgress() {
  const [progress, setProgress] = useState<GameProgress>(gameStore.getProgress());

  useEffect(() => {
    return gameStore.subscribe(() => {
      setProgress(gameStore.getProgress());
    });
  }, []);

  const completeLevel = useCallback(
    async (levelId: string, time: number, baseTime: number) => {
      return await gameStore.completeLevel(levelId, time, baseTime);
    },
    []
  );

  const isLevelUnlocked = useCallback((levelIndex: number) => {
    return gameStore.isLevelUnlocked(levelIndex);
  }, []);

  const resetProgress = useCallback(async () => {
    await gameStore.resetProgress();
  }, []);

  return {
    progress,
    completeLevel,
    isLevelUnlocked,
    resetProgress,
  };
}

// Hook to access calibration data
export function useCalibrationData() {
  const [calibration, setCalibration] = useState<CalibrationData>(
    gameStore.getCalibration()
  );

  useEffect(() => {
    return gameStore.subscribe(() => {
      setCalibration(gameStore.getCalibration());
    });
  }, []);

  const saveCalibration = useCallback(async (data: CalibrationData) => {
    await gameStore.setCalibration(data);
  }, []);

  return { calibration, saveCalibration };
}

// Hook to initialize the game store
export function useInitializeStore() {
  const [isInitialized, setIsInitialized] = useState(gameStore.isInitialized());

  useEffect(() => {
    if (!isInitialized) {
      gameStore.initialize().then(() => {
        setIsInitialized(true);
      });
    }
  }, [isInitialized]);

  return isInitialized;
}
