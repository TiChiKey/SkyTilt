import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, GAME_CONFIG } from '../constants';
import {
  GameProgress,
  GameSettings,
  CalibrationData,
  LevelProgress,
  StarRating,
} from '../types';

// Default values
const DEFAULT_SETTINGS: GameSettings = {
  tiltSensitivity: GAME_CONFIG.defaultSensitivity,
  soundEnabled: true,
  hapticsEnabled: true,
  virtualJoystickEnabled: false,
  musicVolume: 0.7,
  sfxVolume: 0.8,
};

const DEFAULT_CALIBRATION: CalibrationData = {
  neutralX: 0,
  neutralY: 0,
  neutralZ: 0,
  isCalibrated: false,
};

const DEFAULT_PROGRESS: GameProgress = {
  currentLevel: 0,
  levels: {},
  totalStars: 0,
};

// Store class for game data persistence
class GameStore {
  private settings: GameSettings = DEFAULT_SETTINGS;
  private calibration: CalibrationData = DEFAULT_CALIBRATION;
  private progress: GameProgress = DEFAULT_PROGRESS;
  private initialized: boolean = false;
  private listeners: Set<() => void> = new Set();

  // Initialize store from AsyncStorage
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const [settingsStr, calibrationStr, progressStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.settings),
        AsyncStorage.getItem(STORAGE_KEYS.calibration),
        AsyncStorage.getItem(STORAGE_KEYS.gameProgress),
      ]);

      if (settingsStr) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsStr) };
      }
      if (calibrationStr) {
        this.calibration = { ...DEFAULT_CALIBRATION, ...JSON.parse(calibrationStr) };
      }
      if (progressStr) {
        this.progress = { ...DEFAULT_PROGRESS, ...JSON.parse(progressStr) };
      }

      this.initialized = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize game store:', error);
      this.initialized = true;
    }
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Settings
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<GameSettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings));
    this.notifyListeners();
  }

  // Calibration
  getCalibration(): CalibrationData {
    return { ...this.calibration };
  }

  async setCalibration(data: CalibrationData): Promise<void> {
    this.calibration = { ...data };
    await AsyncStorage.setItem(STORAGE_KEYS.calibration, JSON.stringify(this.calibration));
    this.notifyListeners();
  }

  // Progress
  getProgress(): GameProgress {
    return { ...this.progress };
  }

  getLevelProgress(levelId: string): LevelProgress | null {
    return this.progress.levels[levelId] || null;
  }

  isLevelUnlocked(levelIndex: number): boolean {
    if (levelIndex === 0) return true;
    // Level is unlocked if the previous level is completed
    const prevLevelId = `level_${levelIndex}`;
    const prevProgress = this.progress.levels[prevLevelId];
    return prevProgress?.completed ?? false;
  }

  async completeLevel(
    levelId: string,
    time: number,
    baseTime: number
  ): Promise<{ stars: StarRating; isNewBest: boolean }> {
    const existingProgress = this.progress.levels[levelId];
    const isNewBest = !existingProgress?.bestTime || time < existingProgress.bestTime;

    // Calculate star rating based on time
    let stars: StarRating = 0;
    if (time <= baseTime * GAME_CONFIG.goldTimeMultiplier * 1000) {
      stars = 3;
    } else if (time <= baseTime * GAME_CONFIG.silverTimeMultiplier * 1000) {
      stars = 2;
    } else if (time <= baseTime * GAME_CONFIG.bronzeTimeMultiplier * 1000) {
      stars = 1;
    }

    // Only update if better stars or new best time
    const currentStars = existingProgress?.starRating ?? 0;
    const newStars = Math.max(stars, currentStars) as StarRating;

    this.progress.levels[levelId] = {
      levelId,
      completed: true,
      bestTime: isNewBest ? time : existingProgress?.bestTime ?? time,
      starRating: newStars,
    };

    // Recalculate total stars
    this.progress.totalStars = Object.values(this.progress.levels).reduce(
      (sum, level) => sum + level.starRating,
      0
    );

    await AsyncStorage.setItem(STORAGE_KEYS.gameProgress, JSON.stringify(this.progress));
    this.notifyListeners();

    return { stars: newStars, isNewBest };
  }

  async resetProgress(): Promise<void> {
    this.progress = DEFAULT_PROGRESS;
    await AsyncStorage.setItem(STORAGE_KEYS.gameProgress, JSON.stringify(this.progress));
    this.notifyListeners();
  }

  // Check initialization
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const gameStore = new GameStore();
