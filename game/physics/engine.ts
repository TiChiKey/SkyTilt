import {
  Vector2D,
  MarbleState,
  Level,
  TiltInput,
  JoystickInput,
  Checkpoint,
} from '../types';
import { PHYSICS, GAME_CONFIG } from '../constants';
import {
  vectorAdd,
  vectorMultiply,
  vectorLength,
  checkWallCollision,
  checkDeathPitCollision,
  checkCheckpointCollision,
  checkGoalCollision,
  checkBoundsCollision,
  resolveCollision,
  CollisionResult,
} from './collision';

export interface PhysicsUpdate {
  marble: MarbleState;
  hitWall: boolean;
  hitPit: boolean;
  reachedCheckpoint: Checkpoint | null;
  reachedGoal: boolean;
}

export class PhysicsEngine {
  private level: Level;
  private sensitivity: number;
  private activatedCheckpoints: Set<string>;

  constructor(level: Level, sensitivity: number = 1.0) {
    this.level = level;
    this.sensitivity = sensitivity;
    this.activatedCheckpoints = new Set();
  }

  setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
  }

  resetCheckpoints(): void {
    this.activatedCheckpoints.clear();
  }

  activateCheckpoint(checkpointId: string): void {
    this.activatedCheckpoints.add(checkpointId);
  }

  isCheckpointActivated(checkpointId: string): boolean {
    return this.activatedCheckpoints.has(checkpointId);
  }

  // Get the latest activated checkpoint position for respawn
  getLastCheckpointPosition(): Vector2D {
    const checkpoints = this.level.checkpoints;
    for (let i = checkpoints.length - 1; i >= 0; i--) {
      if (this.activatedCheckpoints.has(checkpoints[i].id)) {
        return { ...checkpoints[i].position };
      }
    }
    return { ...this.level.startPosition };
  }

  update(
    marble: MarbleState,
    tiltInput: TiltInput,
    joystickInput: JoystickInput | null,
    deltaTime: number
  ): PhysicsUpdate {
    let result: PhysicsUpdate = {
      marble: { ...marble },
      hitWall: false,
      hitPit: false,
      reachedCheckpoint: null,
      reachedGoal: false,
    };

    if (!marble.isAlive) {
      return result;
    }

    // Calculate acceleration from input
    let acceleration: Vector2D;

    if (joystickInput?.active) {
      // Use joystick input
      acceleration = {
        x: joystickInput.x * PHYSICS.tiltMultiplier * this.sensitivity,
        y: joystickInput.y * PHYSICS.tiltMultiplier * this.sensitivity,
      };
    } else {
      // Use tilt input
      acceleration = {
        x: tiltInput.x * PHYSICS.tiltMultiplier * this.sensitivity,
        y: tiltInput.y * PHYSICS.tiltMultiplier * this.sensitivity,
      };
    }

    // Update velocity with acceleration
    let newVelocity = vectorAdd(
      marble.velocity,
      vectorMultiply(acceleration, deltaTime)
    );

    // Apply friction
    newVelocity = vectorMultiply(newVelocity, PHYSICS.friction);

    // Clamp velocity to max
    const speed = vectorLength(newVelocity);
    if (speed > PHYSICS.maxVelocity) {
      newVelocity = vectorMultiply(
        newVelocity,
        PHYSICS.maxVelocity / speed
      );
    }

    // Update position
    let newPosition = vectorAdd(
      marble.position,
      vectorMultiply(newVelocity, deltaTime)
    );

    // Check boundary collision
    const boundsCollision = checkBoundsCollision(
      newPosition,
      PHYSICS.marbleRadius,
      this.level.mazeRadius
    );
    if (boundsCollision) {
      const resolved = resolveCollision(newPosition, newVelocity, boundsCollision);
      newPosition = resolved.position;
      newVelocity = resolved.velocity;
      result.hitWall = true;
    }

    // Check wall collisions
    for (const wall of this.level.walls) {
      const collision = checkWallCollision(
        newPosition,
        PHYSICS.marbleRadius,
        wall
      );
      if (collision) {
        const resolved = resolveCollision(newPosition, newVelocity, collision);
        newPosition = resolved.position;
        newVelocity = resolved.velocity;
        result.hitWall = true;
      }
    }

    // Check death pits
    for (const pit of this.level.deathPits) {
      if (checkDeathPitCollision(newPosition, PHYSICS.marbleRadius, pit)) {
        result.hitPit = true;
        result.marble = {
          ...marble,
          position: newPosition,
          velocity: { x: 0, y: 0 },
          isAlive: false,
          respawnPosition: this.getLastCheckpointPosition(),
        };
        return result;
      }
    }

    // Check checkpoints
    for (const checkpoint of this.level.checkpoints) {
      if (
        !this.activatedCheckpoints.has(checkpoint.id) &&
        checkCheckpointCollision(newPosition, PHYSICS.marbleRadius, checkpoint)
      ) {
        this.activateCheckpoint(checkpoint.id);
        result.reachedCheckpoint = checkpoint;
      }
    }

    // Check goal
    if (checkGoalCollision(newPosition, PHYSICS.marbleRadius, this.level.goal)) {
      result.reachedGoal = true;
    }

    // Update marble state
    result.marble = {
      ...marble,
      position: newPosition,
      velocity: newVelocity,
    };

    return result;
  }

  // Respawn marble at checkpoint or start
  respawnMarble(marble: MarbleState): MarbleState {
    const spawnPosition = this.getLastCheckpointPosition();
    return {
      position: { ...spawnPosition },
      velocity: { x: 0, y: 0 },
      isAlive: true,
      respawnPosition: spawnPosition,
    };
  }
}

// Create initial marble state
export function createInitialMarbleState(level: Level): MarbleState {
  return {
    position: { ...level.startPosition },
    velocity: { x: 0, y: 0 },
    isAlive: true,
    respawnPosition: { ...level.startPosition },
  };
}
