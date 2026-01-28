import { Level, WallSegment, ArcWall, Checkpoint, DeathPit, Goal, Vector2D } from '../types';

// Helper to create arc walls
function createArcWall(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): WallSegment {
  return {
    type: 'arc',
    data: {
      center: { x: centerX, y: centerY },
      innerRadius,
      outerRadius,
      startAngle: (startAngle * Math.PI) / 180,
      endAngle: (endAngle * Math.PI) / 180,
    } as ArcWall,
  };
}

// Helper to create radial walls (straight lines from center outward)
function createRadialWall(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  angle: number,
  thickness: number = 8
): WallSegment {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    type: 'line',
    data: {
      start: { x: centerX + cos * innerRadius, y: centerY + sin * innerRadius },
      end: { x: centerX + cos * outerRadius, y: centerY + sin * outerRadius },
      thickness,
    },
  };
}

// Level 1: Introduction - Simple circular path
const level1: Level = {
  id: 'level_1',
  name: 'First Orbit',
  description: 'Learn the basics of marble control',
  difficulty: 1,
  baseTime: 10,
  mazeRadius: 140,
  startPosition: { x: 0, y: -100 },
  goal: { position: { x: 0, y: 100 }, radius: 25 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Inner circle
    createArcWall(0, 0, 0, 40, 0, 360),
    // Opening at start
    // Opening at goal
  ],
  checkpoints: [],
  deathPits: [],
};

// Level 2: The Loop
const level2: Level = {
  id: 'level_2',
  name: 'The Loop',
  description: 'Navigate around the central core',
  difficulty: 1,
  baseTime: 15,
  mazeRadius: 140,
  startPosition: { x: -100, y: 0 },
  goal: { position: { x: 100, y: 0 }, radius: 25 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Inner spiral
    createArcWall(0, 0, 50, 70, 45, 315),
    // Radial dividers
    createRadialWall(0, 0, 70, 130, 90),
    createRadialWall(0, 0, 70, 130, 270),
  ],
  checkpoints: [],
  deathPits: [],
};

// Level 3: Split Path
const level3: Level = {
  id: 'level_3',
  name: 'Split Path',
  description: 'Choose your route wisely',
  difficulty: 2,
  baseTime: 20,
  mazeRadius: 140,
  startPosition: { x: 0, y: 120 },
  goal: { position: { x: 0, y: -100 }, radius: 25 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Central blocking arc
    createArcWall(0, 0, 30, 50, 30, 150),
    createArcWall(0, 0, 30, 50, 210, 330),
    // Mid rings
    createArcWall(0, 0, 70, 90, 0, 80),
    createArcWall(0, 0, 70, 90, 100, 180),
    createArcWall(0, 0, 70, 90, 200, 260),
    createArcWall(0, 0, 70, 90, 280, 360),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: 80, y: 0 }, radius: 18, activated: false },
  ],
  deathPits: [],
};

// Level 4: The Cloud (inspired by the logo)
const level4: Level = {
  id: 'level_4',
  name: 'Cloud Nine',
  description: 'Navigate the iconic cloud pattern',
  difficulty: 2,
  baseTime: 25,
  mazeRadius: 140,
  startPosition: { x: -90, y: 60 },
  goal: { position: { x: 90, y: 60 }, radius: 22 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Left loop (like the logo)
    createArcWall(-50, 30, 25, 45, 90, 360),
    createArcWall(-50, 30, 25, 45, 0, 70),
    // Right loop
    createArcWall(50, 30, 25, 45, 90, 360),
    createArcWall(50, 30, 25, 45, 0, 70),
    // Bottom connector
    createArcWall(0, -30, 20, 40, 180, 360),
    // Center blocker
    createArcWall(0, 30, 0, 15, 0, 360),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: 0, y: -70 }, radius: 18, activated: false },
  ],
  deathPits: [],
};

// Level 5: Death Valley
const level5: Level = {
  id: 'level_5',
  name: 'Death Valley',
  description: 'Avoid the pits at all costs',
  difficulty: 3,
  baseTime: 25,
  mazeRadius: 140,
  startPosition: { x: 0, y: 110 },
  goal: { position: { x: 0, y: -110 }, radius: 22 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Winding path walls
    createArcWall(0, 50, 30, 50, 0, 180),
    createArcWall(0, -50, 30, 50, 180, 360),
    // Dividers
    createRadialWall(0, 0, 50, 100, 45),
    createRadialWall(0, 0, 50, 100, 135),
    createRadialWall(0, 0, 50, 100, 225),
    createRadialWall(0, 0, 50, 100, 315),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: 70, y: 0 }, radius: 18, activated: false },
    { id: 'cp2', position: { x: -70, y: 0 }, radius: 18, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 40, y: 60 }, radius: 15 },
    { id: 'pit2', position: { x: -40, y: 60 }, radius: 15 },
    { id: 'pit3', position: { x: 40, y: -60 }, radius: 15 },
    { id: 'pit4', position: { x: -40, y: -60 }, radius: 15 },
  ],
};

// Level 6: The Spiral
const level6: Level = {
  id: 'level_6',
  name: 'The Spiral',
  description: 'Follow the spiral to the center',
  difficulty: 3,
  baseTime: 30,
  mazeRadius: 140,
  startPosition: { x: 110, y: 0 },
  goal: { position: { x: 0, y: 0 }, radius: 20 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Spiral walls
    createArcWall(0, 0, 100, 115, 20, 340),
    createArcWall(0, 0, 70, 85, 50, 320),
    createArcWall(0, 0, 40, 55, 80, 290),
    createArcWall(0, 0, 15, 25, 110, 260),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: -90, y: 0 }, radius: 16, activated: false },
    { id: 'cp2', position: { x: 50, y: -50 }, radius: 16, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 60, y: 60 }, radius: 12 },
    { id: 'pit2', position: { x: -60, y: -60 }, radius: 12 },
  ],
};

// Level 7: Interlocking Rings
const level7: Level = {
  id: 'level_7',
  name: 'Interlocking Rings',
  description: 'Master the orbital paths',
  difficulty: 4,
  baseTime: 35,
  mazeRadius: 140,
  startPosition: { x: -100, y: -70 },
  goal: { position: { x: 100, y: 70 }, radius: 20 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Top-left ring
    createArcWall(-45, -45, 25, 40, 45, 315),
    // Top-right ring
    createArcWall(45, -45, 25, 40, 225, 495),
    // Bottom-left ring
    createArcWall(-45, 45, 25, 40, 45, 315),
    // Bottom-right ring
    createArcWall(45, 45, 25, 40, 135, 405),
    // Center connector
    createArcWall(0, 0, 15, 30, 0, 360),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: 0, y: -80 }, radius: 15, activated: false },
    { id: 'cp2', position: { x: 0, y: 80 }, radius: 15, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: -45, y: 0 }, radius: 12 },
    { id: 'pit2', position: { x: 45, y: 0 }, radius: 12 },
    { id: 'pit3', position: { x: 0, y: -45 }, radius: 10 },
    { id: 'pit4', position: { x: 0, y: 45 }, radius: 10 },
  ],
};

// Level 8: Narrow Ridge
const level8: Level = {
  id: 'level_8',
  name: 'Narrow Ridge',
  description: 'Precision is everything',
  difficulty: 4,
  baseTime: 40,
  mazeRadius: 140,
  startPosition: { x: 0, y: 110 },
  goal: { position: { x: 0, y: -110 }, radius: 18 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Narrow pathways
    createArcWall(0, 0, 95, 110, 30, 150),
    createArcWall(0, 0, 95, 110, 210, 330),
    createArcWall(0, 0, 60, 75, 0, 90),
    createArcWall(0, 0, 60, 75, 120, 240),
    createArcWall(0, 0, 60, 75, 270, 360),
    createArcWall(0, 0, 25, 40, 45, 135),
    createArcWall(0, 0, 25, 40, 225, 315),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: 85, y: 0 }, radius: 14, activated: false },
    { id: 'cp2', position: { x: -85, y: 0 }, radius: 14, activated: false },
    { id: 'cp3', position: { x: 0, y: 0 }, radius: 14, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 50, y: 50 }, radius: 18 },
    { id: 'pit2', position: { x: -50, y: 50 }, radius: 18 },
    { id: 'pit3', position: { x: 50, y: -50 }, radius: 18 },
    { id: 'pit4', position: { x: -50, y: -50 }, radius: 18 },
  ],
};

// Level 9: The Infinity
const level9: Level = {
  id: 'level_9',
  name: 'The Infinity',
  description: 'The ultimate orbital challenge',
  difficulty: 5,
  baseTime: 50,
  mazeRadius: 140,
  startPosition: { x: -120, y: 0 },
  goal: { position: { x: 120, y: 0 }, radius: 18 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Left infinity loop
    createArcWall(-55, 0, 35, 50, 90, 270),
    createArcWall(-55, 0, 15, 25, 0, 360),
    // Right infinity loop
    createArcWall(55, 0, 35, 50, -90, 90),
    createArcWall(55, 0, 15, 25, 0, 360),
    // Center crossing
    createArcWall(0, 0, 8, 18, 0, 360),
    // Outer obstacles
    createArcWall(0, 80, 15, 25, 0, 360),
    createArcWall(0, -80, 15, 25, 0, 360),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: -55, y: 60 }, radius: 14, activated: false },
    { id: 'cp2', position: { x: 0, y: 0 }, radius: 12, activated: false },
    { id: 'cp3', position: { x: 55, y: -60 }, radius: 14, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: -90, y: 50 }, radius: 14 },
    { id: 'pit2', position: { x: -90, y: -50 }, radius: 14 },
    { id: 'pit3', position: { x: 90, y: 50 }, radius: 14 },
    { id: 'pit4', position: { x: 90, y: -50 }, radius: 14 },
    { id: 'pit5', position: { x: 0, y: 50 }, radius: 12 },
    { id: 'pit6', position: { x: 0, y: -50 }, radius: 12 },
  ],
};

// Level 10: Master's Orbit
const level10: Level = {
  id: 'level_10',
  name: "Master's Orbit",
  description: 'Only the worthy shall pass',
  difficulty: 5,
  baseTime: 60,
  mazeRadius: 140,
  startPosition: { x: 0, y: 120 },
  goal: { position: { x: 0, y: -5 }, radius: 15 },
  walls: [
    // Outer boundary
    createArcWall(0, 0, 130, 150, 0, 360),
    // Complex multi-ring structure
    createArcWall(0, 0, 105, 118, 20, 70),
    createArcWall(0, 0, 105, 118, 110, 160),
    createArcWall(0, 0, 105, 118, 200, 250),
    createArcWall(0, 0, 105, 118, 290, 340),
    // Second ring
    createArcWall(0, 0, 75, 88, 45, 95),
    createArcWall(0, 0, 75, 88, 135, 185),
    createArcWall(0, 0, 75, 88, 225, 275),
    createArcWall(0, 0, 75, 88, 315, 365),
    // Third ring
    createArcWall(0, 0, 45, 58, 0, 45),
    createArcWall(0, 0, 45, 58, 90, 135),
    createArcWall(0, 0, 45, 58, 180, 225),
    createArcWall(0, 0, 45, 58, 270, 315),
    // Inner core
    createArcWall(0, 0, 15, 28, 30, 150),
    createArcWall(0, 0, 15, 28, 210, 330),
  ],
  checkpoints: [
    { id: 'cp1', position: { x: 95, y: 0 }, radius: 12, activated: false },
    { id: 'cp2', position: { x: -95, y: 0 }, radius: 12, activated: false },
    { id: 'cp3', position: { x: 0, y: 95 }, radius: 12, activated: false },
    { id: 'cp4', position: { x: 65, y: -65 }, radius: 12, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 65, y: 65 }, radius: 12 },
    { id: 'pit2', position: { x: -65, y: 65 }, radius: 12 },
    { id: 'pit3', position: { x: -65, y: -65 }, radius: 12 },
    { id: 'pit4', position: { x: 35, y: 35 }, radius: 10 },
    { id: 'pit5', position: { x: -35, y: 35 }, radius: 10 },
    { id: 'pit6', position: { x: -35, y: -35 }, radius: 10 },
    { id: 'pit7', position: { x: 35, y: -35 }, radius: 10 },
  ],
};

// Export all levels
export const LEVELS: Level[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
];

export function getLevel(index: number): Level | null {
  return LEVELS[index] ?? null;
}

export function getLevelById(id: string): Level | null {
  return LEVELS.find((l) => l.id === id) ?? null;
}

export function getTotalLevels(): number {
  return LEVELS.length;
}
