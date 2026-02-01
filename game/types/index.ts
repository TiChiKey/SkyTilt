// Vector type for 2D operations
export interface Vector2D {
  x: number;
  y: number;
}

// Marble state
export interface MarbleState {
  position: Vector2D;
  velocity: Vector2D;
  isAlive: boolean;
  respawnPosition: Vector2D;
}

// Wall segment for collision
export interface WallSegment {
  type: 'arc' | 'line';
  // For arc: center, radius, startAngle, endAngle
  // For line: start, end points
  data: ArcWall | LineWall;
}

export interface ArcWall {
  center: Vector2D;
  innerRadius: number;
  outerRadius: number;
  startAngle: number; // radians
  endAngle: number; // radians
}

export interface LineWall {
  start: Vector2D;
  end: Vector2D;
  thickness: number;
}

// Checkpoint (Energy Pad)
export interface Checkpoint {
  id: string;
  position: Vector2D;
  radius: number;
  activated: boolean;
}

// Death pit
export interface DeathPit {
  id: string;
  position: Vector2D;
  radius: number;
}

// Goal zone
export interface Goal {
  position: Vector2D;
  radius: number;
}

// Level structure
export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseTime: number; // seconds for gold star
  startPosition: Vector2D;
  goal: Goal;
  walls: WallSegment[];
  checkpoints: Checkpoint[];
  deathPits: DeathPit[];
  mazeRadius: number; // outer boundary radius
}

// Star rating
export type StarRating = 0 | 1 | 2 | 3;

// Level progress
export interface LevelProgress {
  levelId: string;
  completed: boolean;
  bestTime: number | null; // milliseconds
  starRating: StarRating;
}

// Game progress
export interface GameProgress {
  currentLevel: number;
  levels: Record<string, LevelProgress>;
  totalStars: number;
}

// Settings
export interface GameSettings {
  tiltSensitivity: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  virtualJoystickEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

// Calibration data
export interface CalibrationData {
  neutralX: number;
  neutralY: number;
  neutralZ: number;
  isCalibrated: boolean;
}

// Device tilt input
export interface TiltInput {
  x: number; // left/right tilt
  y: number; // forward/backward tilt
}

// Joystick input
export interface JoystickInput {
  x: number; // -1 to 1
  y: number; // -1 to 1
  active: boolean;
}

// Game state
export type GameState = 'menu' | 'calibrating' | 'playing' | 'paused' | 'completed' | 'failed';

// Game session data
export interface GameSession {
  levelId: string;
  state: GameState;
  startTime: number;
  elapsedTime: number;
  marble: MarbleState;
  activeCheckpointIndex: number;
}

// Ripple effect for celebrations
export interface RippleEffect {
  id: string;
  position: Vector2D;
  radius: number;
  maxRadius: number;
  opacity: number;
  startTime: number;
}

// Re-export multi-marble types
export * from './multiMarble';
