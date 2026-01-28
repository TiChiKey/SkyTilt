// Game physics and gameplay constants
export const PHYSICS = {
  // Marble properties
  marbleRadius: 12,
  marbleMass: 1,
  marbleBounciness: 0.5,

  // Movement
  gravity: 9.8,
  maxVelocity: 400,
  friction: 0.985,
  tiltMultiplier: 800,

  // Collision
  wallBounce: 0.6,
  wallFriction: 0.8,

  // Death pit
  pitFallSpeed: 300,
  pitRespawnDelay: 500,
} as const;

export const GAME_CONFIG = {
  // Frame rate
  targetFPS: 60,
  physicsFPS: 120,

  // Maze dimensions (relative to screen)
  mazeScale: 0.85,
  mazePadding: 20,

  // Star thresholds (multiplier of base time)
  goldTimeMultiplier: 1.0,
  silverTimeMultiplier: 1.5,
  bronzeTimeMultiplier: 2.0,

  // Checkpoint
  checkpointRadius: 20,
  goalRadius: 25,

  // UI
  transitionDuration: 300,
  celebrationDuration: 2000,

  // Sensitivity settings
  minSensitivity: 0.3,
  maxSensitivity: 2.0,
  defaultSensitivity: 1.0,
} as const;

export const HAPTICS = {
  wallHitIntensity: 'medium' as const,
  pitFallIntensity: 'heavy' as const,
  checkpointIntensity: 'light' as const,
  goalIntensity: 'success' as const,
  buttonIntensity: 'light' as const,
} as const;

export const STORAGE_KEYS = {
  gameProgress: 'orbit_game_progress',
  settings: 'orbit_settings',
  calibration: 'orbit_calibration',
} as const;
