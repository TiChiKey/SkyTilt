// Multi-Marble Physics Engine with Marble-to-Marble Collision
import {
  Vector2D,
  TiltInput,
  JoystickInput,
  MultiMarbleState,
  MultiMarbleLevel,
  MultiMarblePhysicsUpdate,
  MarbleCollision,
  WallCollision,
  ColoredGoal,
  createInitialMultiMarbleStates,
} from '../types';
import { PHYSICS } from '../constants';
import {
  vectorAdd,
  vectorSubtract,
  vectorMultiply,
  vectorLength,
  vectorNormalize,
  vectorDot,
  vectorDistance,
  checkWallCollision,
  checkDeathPitCollision,
  checkBoundsCollision,
  resolveCollision,
} from './collision';

// Multi-marble physics constants
export const MULTI_MARBLE_PHYSICS = {
  ...PHYSICS,
  marbleBounciness: 0.85, // Higher bounciness for marble-marble collisions
  marbleCollisionDamping: 0.95, // Energy loss on marble collision
  minCollisionForce: 5, // Minimum force to register a collision sound
  separationIterations: 3, // Iterations to resolve overlapping marbles
};

export class MultiMarblePhysicsEngine {
  private level: MultiMarbleLevel;
  private sensitivity: number;
  private activatedCheckpoints: Set<string>;

  constructor(level: MultiMarbleLevel, sensitivity: number = 1.0) {
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

  // Check if marble reached its color-matched goal
  private checkGoalCollision(
    marble: MultiMarbleState,
    goals: ColoredGoal[]
  ): ColoredGoal | null {
    for (const goal of goals) {
      if (goal.colorId === marble.colorId) {
        const distance = vectorDistance(marble.position, goal.position);
        if (distance < goal.radius) {
          return goal;
        }
      }
    }
    return null;
  }

  // Check marble-to-marble collision
  private checkMarbleCollision(
    marble1: MultiMarbleState,
    marble2: MultiMarbleState
  ): {
    collided: boolean;
    normal: Vector2D;
    penetration: number;
  } | null {
    if (!marble1.isAlive || !marble2.isAlive) {
      return null;
    }

    const diff = vectorSubtract(marble2.position, marble1.position);
    const distance = vectorLength(diff);
    const minDistance = PHYSICS.marbleRadius * 2;

    if (distance < minDistance && distance > 0.001) {
      const normal = vectorNormalize(diff);
      const penetration = minDistance - distance;
      return { collided: true, normal, penetration };
    }

    return null;
  }

  // Resolve marble-to-marble collision using elastic collision physics
  private resolveMarbleCollision(
    marble1: MultiMarbleState,
    marble2: MultiMarbleState,
    normal: Vector2D,
    penetration: number
  ): { marble1: MultiMarbleState; marble2: MultiMarbleState; impactForce: number } {
    // Separate marbles (push apart equally)
    const separation = vectorMultiply(normal, penetration / 2);
    const newPos1 = vectorSubtract(marble1.position, separation);
    const newPos2 = vectorAdd(marble2.position, separation);

    // Calculate relative velocity
    const relativeVel = vectorSubtract(marble2.velocity, marble1.velocity);
    const velAlongNormal = vectorDot(relativeVel, normal);

    // Don't resolve if velocities are separating
    if (velAlongNormal > 0) {
      return {
        marble1: { ...marble1, position: newPos1 },
        marble2: { ...marble2, position: newPos2 },
        impactForce: 0,
      };
    }

    // Calculate impulse using elastic collision formula
    // Assuming equal mass for all marbles
    const restitution = MULTI_MARBLE_PHYSICS.marbleBounciness;
    const impulseScalar = -(1 + restitution) * velAlongNormal / 2;

    const impulse = vectorMultiply(normal, impulseScalar);

    // Apply impulse to velocities (equal and opposite)
    const newVel1 = vectorMultiply(
      vectorSubtract(marble1.velocity, impulse),
      MULTI_MARBLE_PHYSICS.marbleCollisionDamping
    );
    const newVel2 = vectorMultiply(
      vectorAdd(marble2.velocity, impulse),
      MULTI_MARBLE_PHYSICS.marbleCollisionDamping
    );

    // Calculate impact force for sound effects
    const impactForce = Math.abs(velAlongNormal) * PHYSICS.marbleMass;

    return {
      marble1: {
        ...marble1,
        position: newPos1,
        velocity: newVel1,
      },
      marble2: {
        ...marble2,
        position: newPos2,
        velocity: newVel2,
      },
      impactForce,
    };
  }

  // Get respawn position for a marble
  private getRespawnPosition(marble: MultiMarbleState): Vector2D {
    // Find the spawn point for this marble's color
    const spawn = this.level.marbleSpawns.find(
      (s) => s.colorId === marble.colorId
    );
    return spawn ? { ...spawn.position } : { ...marble.respawnPosition };
  }

  // Main physics update
  update(
    marbles: MultiMarbleState[],
    tiltInput: TiltInput,
    joystickInput: JoystickInput | null,
    deltaTime: number
  ): MultiMarblePhysicsUpdate {
    const result: MultiMarblePhysicsUpdate = {
      marbles: marbles.map((m) => ({ ...m })),
      marbleCollisions: [],
      wallCollisions: [],
      pitFalls: [],
      goalReached: [],
      allGoalsComplete: false,
    };

    // Calculate acceleration from input (same for all marbles)
    let acceleration: Vector2D;
    if (joystickInput?.active) {
      acceleration = {
        x: joystickInput.x * PHYSICS.tiltMultiplier * this.sensitivity,
        y: joystickInput.y * PHYSICS.tiltMultiplier * this.sensitivity,
      };
    } else {
      acceleration = {
        x: tiltInput.x * PHYSICS.tiltMultiplier * this.sensitivity,
        y: tiltInput.y * PHYSICS.tiltMultiplier * this.sensitivity,
      };
    }

    // Update each marble individually
    for (let i = 0; i < result.marbles.length; i++) {
      const marble = result.marbles[i];

      if (!marble.isAlive || marble.isInGoal) {
        continue;
      }

      // Apply acceleration
      let newVelocity = vectorAdd(
        marble.velocity,
        vectorMultiply(acceleration, deltaTime)
      );

      // Apply friction
      newVelocity = vectorMultiply(newVelocity, PHYSICS.friction);

      // Clamp velocity
      const speed = vectorLength(newVelocity);
      if (speed > PHYSICS.maxVelocity) {
        newVelocity = vectorMultiply(newVelocity, PHYSICS.maxVelocity / speed);
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
        const impactForce = vectorLength(marble.velocity) - vectorLength(newVelocity);
        if (Math.abs(impactForce) > MULTI_MARBLE_PHYSICS.minCollisionForce) {
          result.wallCollisions.push({
            marbleId: marble.id,
            impactForce: Math.abs(impactForce),
            contactPoint: boundsCollision.point,
          });
        }
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
          const impactForce = vectorLength(newVelocity) - vectorLength(resolved.velocity);
          newVelocity = resolved.velocity;
          if (Math.abs(impactForce) > MULTI_MARBLE_PHYSICS.minCollisionForce) {
            result.wallCollisions.push({
              marbleId: marble.id,
              impactForce: Math.abs(impactForce),
              contactPoint: collision.point,
            });
          }
        }
      }

      // Check death pits
      let hitPit = false;
      for (const pit of this.level.deathPits) {
        if (checkDeathPitCollision(newPosition, PHYSICS.marbleRadius, pit)) {
          hitPit = true;
          break;
        }
      }

      if (hitPit) {
        result.pitFalls.push(marble.id);
        result.marbles[i] = {
          ...marble,
          position: newPosition,
          velocity: { x: 0, y: 0 },
          isAlive: false,
          respawnPosition: this.getRespawnPosition(marble),
        };
        continue;
      }

      // Check if marble reached its goal
      const reachedGoal = this.checkGoalCollision(
        { ...marble, position: newPosition },
        this.level.goals
      );
      if (reachedGoal && !marble.isInGoal) {
        result.goalReached.push(marble.id);
        result.marbles[i] = {
          ...marble,
          position: reachedGoal.position, // Snap to goal center
          velocity: { x: 0, y: 0 },
          isInGoal: true,
        };
        continue;
      }

      // Update marble state
      result.marbles[i] = {
        ...marble,
        position: newPosition,
        velocity: newVelocity,
      };
    }

    // Resolve marble-to-marble collisions (multiple iterations for stability)
    for (let iteration = 0; iteration < MULTI_MARBLE_PHYSICS.separationIterations; iteration++) {
      for (let i = 0; i < result.marbles.length; i++) {
        for (let j = i + 1; j < result.marbles.length; j++) {
          const marble1 = result.marbles[i];
          const marble2 = result.marbles[j];

          // Skip if either marble is in goal or dead
          if (!marble1.isAlive || !marble2.isAlive || marble1.isInGoal || marble2.isInGoal) {
            continue;
          }

          const collision = this.checkMarbleCollision(marble1, marble2);
          if (collision && collision.collided) {
            const resolved = this.resolveMarbleCollision(
              marble1,
              marble2,
              collision.normal,
              collision.penetration
            );

            result.marbles[i] = resolved.marble1;
            result.marbles[j] = resolved.marble2;

            // Only record collision on first iteration to avoid duplicates
            if (
              iteration === 0 &&
              resolved.impactForce > MULTI_MARBLE_PHYSICS.minCollisionForce
            ) {
              result.marbleCollisions.push({
                marble1Id: marble1.id,
                marble2Id: marble2.id,
                impactForce: resolved.impactForce,
                contactPoint: vectorMultiply(
                  vectorAdd(resolved.marble1.position, resolved.marble2.position),
                  0.5
                ),
              });
            }
          }
        }
      }
    }

    // Check if all marbles are in their goals
    result.allGoalsComplete = result.marbles.every((m) => m.isInGoal);

    return result;
  }

  // Respawn a specific marble
  respawnMarble(
    marbles: MultiMarbleState[],
    marbleId: string
  ): MultiMarbleState[] {
    return marbles.map((marble) => {
      if (marble.id === marbleId && !marble.isAlive) {
        const spawnPosition = this.getRespawnPosition(marble);
        return {
          ...marble,
          position: { ...spawnPosition },
          velocity: { x: 0, y: 0 },
          isAlive: true,
          isInGoal: false,
        };
      }
      return marble;
    });
  }

  // Respawn all dead marbles
  respawnAllDeadMarbles(marbles: MultiMarbleState[]): MultiMarbleState[] {
    return marbles.map((marble) => {
      if (!marble.isAlive) {
        const spawnPosition = this.getRespawnPosition(marble);
        return {
          ...marble,
          position: { ...spawnPosition },
          velocity: { x: 0, y: 0 },
          isAlive: true,
          isInGoal: false,
        };
      }
      return marble;
    });
  }

  // Reset all marbles to starting positions
  resetAllMarbles(): MultiMarbleState[] {
    return createInitialMultiMarbleStates(this.level);
  }
}
