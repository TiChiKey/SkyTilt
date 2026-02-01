// Multi-Marble Game Types for Cloud9 Mode
import { Vector2D, WallSegment, Checkpoint, DeathPit, StarRating } from './index';
import { MarbleColorId } from '../constants/cloud9';

// Individual marble state with color
export interface MultiMarbleState {
  id: string;
  colorId: MarbleColorId;
  position: Vector2D;
  velocity: Vector2D;
  isAlive: boolean;
  isInGoal: boolean;
  respawnPosition: Vector2D;
}

// Color-matched goal
export interface ColoredGoal {
  id: string;
  colorId: MarbleColorId;
  position: Vector2D;
  radius: number;
  isComplete: boolean;
}

// Multi-marble level structure
export interface MultiMarbleLevel {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseTime: number; // seconds for gold star
  mazeRadius: number;

  // Multiple start positions for each marble
  marbleSpawns: {
    colorId: MarbleColorId;
    position: Vector2D;
  }[];

  // Color-matched goals
  goals: ColoredGoal[];

  // Maze elements
  walls: WallSegment[];
  checkpoints: Checkpoint[];
  deathPits: DeathPit[];

  // Level type indicator
  isMultiMarble: true;
}

// Multi-marble game state
export type MultiMarbleGameState =
  | 'menu'
  | 'calibrating'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'failed';

// Physics update result for multi-marble
export interface MultiMarblePhysicsUpdate {
  marbles: MultiMarbleState[];
  marbleCollisions: MarbleCollision[];
  wallCollisions: WallCollision[];
  pitFalls: string[]; // marble IDs that fell in pits
  goalReached: string[]; // marble IDs that reached their goals
  allGoalsComplete: boolean;
}

// Collision event types
export interface MarbleCollision {
  marble1Id: string;
  marble2Id: string;
  impactForce: number;
  contactPoint: Vector2D;
}

export interface WallCollision {
  marbleId: string;
  impactForce: number;
  contactPoint: Vector2D;
}

// Level progress for multi-marble levels
export interface MultiMarbleLevelProgress {
  levelId: string;
  completed: boolean;
  bestTime: number | null;
  starRating: StarRating;
}

// Session data for multi-marble game
export interface MultiMarbleSession {
  levelId: string;
  state: MultiMarbleGameState;
  startTime: number;
  elapsedTime: number;
  marbles: MultiMarbleState[];
  completedGoals: Set<string>;
}

// Create initial multi-marble states
export function createInitialMultiMarbleStates(
  level: MultiMarbleLevel
): MultiMarbleState[] {
  return level.marbleSpawns.map((spawn) => ({
    id: `marble_${spawn.colorId}`,
    colorId: spawn.colorId,
    position: { ...spawn.position },
    velocity: { x: 0, y: 0 },
    isAlive: true,
    isInGoal: false,
    respawnPosition: { ...spawn.position },
  }));
}
