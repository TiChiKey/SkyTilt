import { Vector2D, WallSegment, ArcWall, LineWall, DeathPit, Checkpoint, Goal } from '../types';
import { PHYSICS } from '../constants';

// Vector math utilities
export function vectorAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vectorSubtract(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vectorMultiply(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function vectorDot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

export function vectorLength(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vectorNormalize(v: Vector2D): Vector2D {
  const len = vectorLength(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function vectorDistance(a: Vector2D, b: Vector2D): number {
  return vectorLength(vectorSubtract(a, b));
}

export function vectorReflect(v: Vector2D, normal: Vector2D): Vector2D {
  const d = 2 * vectorDot(v, normal);
  return vectorSubtract(v, vectorMultiply(normal, d));
}

// Normalize angle to [-PI, PI]
function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

// Check if angle is within arc range
function isAngleInArc(angle: number, startAngle: number, endAngle: number): boolean {
  // Normalize angles
  angle = normalizeAngle(angle);
  let start = normalizeAngle(startAngle);
  let end = normalizeAngle(endAngle);

  // Handle wrap-around
  if (start <= end) {
    return angle >= start && angle <= end;
  } else {
    return angle >= start || angle <= end;
  }
}

// Collision result
export interface CollisionResult {
  collided: boolean;
  normal: Vector2D;
  penetration: number;
  point: Vector2D;
}

// Check collision with arc wall
export function checkArcWallCollision(
  position: Vector2D,
  radius: number,
  arcWall: ArcWall
): CollisionResult | null {
  const { center, innerRadius, outerRadius, startAngle, endAngle } = arcWall;

  // Vector from arc center to marble
  const toMarble = vectorSubtract(position, center);
  const distance = vectorLength(toMarble);
  const angle = Math.atan2(toMarble.y, toMarble.x);

  // Check if within arc angle range
  const inAngleRange = isAngleInArc(angle, startAngle, endAngle);

  if (!inAngleRange) {
    // Check collision with arc endpoints
    const startPoint = {
      x: center.x + Math.cos(startAngle) * ((innerRadius + outerRadius) / 2),
      y: center.y + Math.sin(startAngle) * ((innerRadius + outerRadius) / 2),
    };
    const endPoint = {
      x: center.x + Math.cos(endAngle) * ((innerRadius + outerRadius) / 2),
      y: center.y + Math.sin(endAngle) * ((innerRadius + outerRadius) / 2),
    };

    // Point collision at endpoints
    const wallThickness = (outerRadius - innerRadius) / 2;
    const startDist = vectorDistance(position, startPoint);
    const endDist = vectorDistance(position, endPoint);

    if (startDist < radius + wallThickness) {
      const normal = vectorNormalize(vectorSubtract(position, startPoint));
      return {
        collided: true,
        normal,
        penetration: radius + wallThickness - startDist,
        point: startPoint,
      };
    }

    if (endDist < radius + wallThickness) {
      const normal = vectorNormalize(vectorSubtract(position, endPoint));
      return {
        collided: true,
        normal,
        penetration: radius + wallThickness - endDist,
        point: endPoint,
      };
    }

    return null;
  }

  // Check inner edge collision
  if (distance < innerRadius + radius && distance > 0) {
    const normal = vectorNormalize(toMarble);
    return {
      collided: true,
      normal,
      penetration: innerRadius + radius - distance,
      point: vectorAdd(center, vectorMultiply(normal, innerRadius)),
    };
  }

  // Check outer edge collision
  if (distance > outerRadius - radius) {
    const normal = vectorMultiply(vectorNormalize(toMarble), -1);
    return {
      collided: true,
      normal,
      penetration: distance - (outerRadius - radius),
      point: vectorAdd(center, vectorMultiply(vectorNormalize(toMarble), outerRadius)),
    };
  }

  return null;
}

// Check collision with line wall
export function checkLineWallCollision(
  position: Vector2D,
  radius: number,
  lineWall: LineWall
): CollisionResult | null {
  const { start, end, thickness } = lineWall;

  // Line direction and length
  const lineDir = vectorSubtract(end, start);
  const lineLength = vectorLength(lineDir);

  if (lineLength === 0) return null;

  const lineNormalized = vectorNormalize(lineDir);

  // Vector from start to marble
  const toMarble = vectorSubtract(position, start);

  // Project marble position onto line
  const projection = vectorDot(toMarble, lineNormalized);

  // Clamp projection to line segment
  const clampedProjection = Math.max(0, Math.min(lineLength, projection));

  // Find closest point on line
  const closestPoint = vectorAdd(start, vectorMultiply(lineNormalized, clampedProjection));

  // Distance to closest point
  const distance = vectorDistance(position, closestPoint);
  const collisionRadius = radius + thickness / 2;

  if (distance < collisionRadius) {
    const normal = vectorNormalize(vectorSubtract(position, closestPoint));
    return {
      collided: true,
      normal: normal.x === 0 && normal.y === 0 ? { x: 0, y: -1 } : normal,
      penetration: collisionRadius - distance,
      point: closestPoint,
    };
  }

  return null;
}

// Check collision with any wall segment
export function checkWallCollision(
  position: Vector2D,
  radius: number,
  wall: WallSegment
): CollisionResult | null {
  if (wall.type === 'arc') {
    return checkArcWallCollision(position, radius, wall.data as ArcWall);
  } else {
    return checkLineWallCollision(position, radius, wall.data as LineWall);
  }
}

// Check if marble is in a death pit
export function checkDeathPitCollision(
  position: Vector2D,
  radius: number,
  pit: DeathPit
): boolean {
  const distance = vectorDistance(position, pit.position);
  return distance < pit.radius - radius * 0.5; // Need to be mostly inside
}

// Check if marble reached checkpoint
export function checkCheckpointCollision(
  position: Vector2D,
  radius: number,
  checkpoint: Checkpoint
): boolean {
  const distance = vectorDistance(position, checkpoint.position);
  return distance < checkpoint.radius + radius * 0.5;
}

// Check if marble reached goal
export function checkGoalCollision(
  position: Vector2D,
  radius: number,
  goal: Goal
): boolean {
  const distance = vectorDistance(position, goal.position);
  return distance < goal.radius;
}

// Check if marble is within maze bounds
export function checkBoundsCollision(
  position: Vector2D,
  radius: number,
  mazeRadius: number
): CollisionResult | null {
  const distance = vectorLength(position);
  if (distance > mazeRadius - radius) {
    const normal = vectorMultiply(vectorNormalize(position), -1);
    return {
      collided: true,
      normal,
      penetration: distance - (mazeRadius - radius),
      point: vectorMultiply(vectorNormalize(position), mazeRadius),
    };
  }
  return null;
}

// Resolve collision by moving marble out of wall and reflecting velocity
export function resolveCollision(
  position: Vector2D,
  velocity: Vector2D,
  collision: CollisionResult
): { position: Vector2D; velocity: Vector2D } {
  // Move marble out of collision
  const newPosition = vectorAdd(
    position,
    vectorMultiply(collision.normal, collision.penetration)
  );

  // Reflect velocity
  const reflected = vectorReflect(velocity, collision.normal);
  const newVelocity = vectorMultiply(reflected, PHYSICS.wallBounce);

  return { position: newPosition, velocity: newVelocity };
}
