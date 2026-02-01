// Multi-Marble Levels for Cloud9 Mode
import { MultiMarbleLevel, WallSegment, ArcWall, ColoredGoal } from '../types';

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

// Helper to create radial walls
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

// ============================================================================
// PHASE 1: TEST ARENA - Simple circular arena for physics testing
// ============================================================================
export const testArenaLevel: MultiMarbleLevel = {
  id: 'test_arena',
  name: 'Test Arena',
  description: 'Phase 1: Test marble physics and collisions',
  difficulty: 1,
  baseTime: 60,
  mazeRadius: 140,
  isMultiMarble: true,

  // Three marbles positioned around the circle
  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: -80 } },       // Top
    { colorId: 'blue', position: { x: -70, y: 40 } },    // Bottom-left
    { colorId: 'green', position: { x: 70, y: 40 } },    // Bottom-right
  ],

  // Color-matched goals at opposite sides
  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: 80 },      // Bottom (opposite to red start)
      radius: 22,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 70, y: -40 },    // Top-right (opposite to blue start)
      radius: 22,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: -70, y: -40 },   // Top-left (opposite to green start)
      radius: 22,
      isComplete: false,
    },
  ],

  // Simple boundary only - no internal walls for testing
  walls: [],

  checkpoints: [],
  deathPits: [],
};

// ============================================================================
// LEVEL 1: Cloud9 Basics - Introduction to multi-marble
// ============================================================================
export const cloud9Level1: MultiMarbleLevel = {
  id: 'cloud9_level_1',
  name: 'Cloud9 Basics',
  description: 'Learn to control three marbles at once',
  difficulty: 1,
  baseTime: 30,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: -100 } },
    { colorId: 'blue', position: { x: -80, y: 60 } },
    { colorId: 'green', position: { x: 80, y: 60 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: 100 },
      radius: 25,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 80, y: -60 },
      radius: 25,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: -80, y: -60 },
      radius: 25,
      isComplete: false,
    },
  ],

  walls: [
    // Central obstacle
    createArcWall(0, 0, 0, 30, 0, 360),
  ],

  checkpoints: [],
  deathPits: [],
};

// ============================================================================
// LEVEL 2: The Trident - Three paths diverge
// ============================================================================
export const cloud9Level2: MultiMarbleLevel = {
  id: 'cloud9_level_2',
  name: 'The Trident',
  description: 'Guide each marble down its path',
  difficulty: 2,
  baseTime: 45,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: 110 } },
    { colorId: 'blue', position: { x: -90, y: 60 } },
    { colorId: 'green', position: { x: 90, y: 60 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: -110 },
      radius: 22,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: -90, y: -60 },
      radius: 22,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 90, y: -60 },
      radius: 22,
      isComplete: false,
    },
  ],

  walls: [
    // Channel walls
    createRadialWall(0, 0, 30, 100, 30, 8),
    createRadialWall(0, 0, 30, 100, 150, 8),
    createRadialWall(0, 0, 30, 100, 210, 8),
    createRadialWall(0, 0, 30, 100, 330, 8),
    // Central hub
    createArcWall(0, 0, 0, 30, 0, 360),
  ],

  checkpoints: [],
  deathPits: [],
};

// ============================================================================
// LEVEL 3: Collision Course - Marbles must interact
// ============================================================================
export const cloud9Level3: MultiMarbleLevel = {
  id: 'cloud9_level_3',
  name: 'Collision Course',
  description: 'Use marble collisions strategically',
  difficulty: 3,
  baseTime: 60,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: -90, y: 0 } },
    { colorId: 'blue', position: { x: 90, y: 0 } },
    { colorId: 'green', position: { x: 0, y: 90 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 90, y: 0 },      // Opposite side
      radius: 20,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: -90, y: 0 },     // Opposite side
      radius: 20,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 0, y: -90 },     // Opposite side
      radius: 20,
      isComplete: false,
    },
  ],

  walls: [
    // Cross barriers - marbles must cross paths
    createArcWall(0, 0, 30, 50, 0, 90),
    createArcWall(0, 0, 30, 50, 180, 270),
    // Inner core
    createArcWall(0, 0, 0, 20, 0, 360),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 0, y: 0 }, radius: 12, activated: false },
  ],
  deathPits: [],
};

// ============================================================================
// LEVEL 4: The Maze - Complex navigation
// ============================================================================
export const cloud9Level4: MultiMarbleLevel = {
  id: 'cloud9_level_4',
  name: 'Cloud9 Maze',
  description: 'Navigate the iconic cloud pattern',
  difficulty: 4,
  baseTime: 90,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: -100, y: 50 } },
    { colorId: 'blue', position: { x: 0, y: -100 } },
    { colorId: 'green', position: { x: 100, y: 50 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 100, y: -50 },
      radius: 18,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 0, y: 100 },
      radius: 18,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: -100, y: -50 },
      radius: 18,
      isComplete: false,
    },
  ],

  walls: [
    // Cloud9 logo inspired pattern
    // Left loop
    createArcWall(-50, 20, 20, 35, 90, 360),
    createArcWall(-50, 20, 20, 35, 0, 70),
    // Right loop
    createArcWall(50, 20, 20, 35, 90, 360),
    createArcWall(50, 20, 20, 35, 0, 70),
    // Bottom connector
    createArcWall(0, -30, 15, 30, 180, 360),
    // Center blocker
    createArcWall(0, 20, 0, 12, 0, 360),
    // Outer rings
    createArcWall(0, 0, 100, 115, 20, 70),
    createArcWall(0, 0, 100, 115, 110, 160),
    createArcWall(0, 0, 100, 115, 200, 250),
    createArcWall(0, 0, 100, 115, 290, 340),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: -50, y: -60 }, radius: 14, activated: false },
    { id: 'cp2', position: { x: 50, y: -60 }, radius: 14, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 0, y: 60 }, radius: 14 },
  ],
};

// ============================================================================
// LEVEL 5: Master Challenge - The ultimate test
// ============================================================================
export const cloud9Level5: MultiMarbleLevel = {
  id: 'cloud9_level_5',
  name: 'Cloud9 Master',
  description: 'The ultimate multi-marble challenge',
  difficulty: 5,
  baseTime: 120,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: 110 } },
    { colorId: 'blue', position: { x: -95, y: -55 } },
    { colorId: 'green', position: { x: 95, y: -55 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: 0 },       // Center - hardest to reach
      radius: 15,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 95, y: 55 },     // Diagonal opposite
      radius: 15,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: -95, y: 55 },    // Diagonal opposite
      radius: 15,
      isComplete: false,
    },
  ],

  walls: [
    // Outer ring barriers
    createArcWall(0, 0, 105, 120, 10, 50),
    createArcWall(0, 0, 105, 120, 70, 110),
    createArcWall(0, 0, 105, 120, 130, 170),
    createArcWall(0, 0, 105, 120, 190, 230),
    createArcWall(0, 0, 105, 120, 250, 290),
    createArcWall(0, 0, 105, 120, 310, 350),
    // Middle ring
    createArcWall(0, 0, 65, 80, 30, 90),
    createArcWall(0, 0, 65, 80, 150, 210),
    createArcWall(0, 0, 65, 80, 270, 330),
    // Inner ring protecting center
    createArcWall(0, 0, 25, 40, 0, 60),
    createArcWall(0, 0, 25, 40, 120, 180),
    createArcWall(0, 0, 25, 40, 240, 300),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 55, y: 0 }, radius: 12, activated: false },
    { id: 'cp2', position: { x: -55, y: 0 }, radius: 12, activated: false },
    { id: 'cp3', position: { x: 0, y: 55 }, radius: 12, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 45, y: 45 }, radius: 12 },
    { id: 'pit2', position: { x: -45, y: 45 }, radius: 12 },
    { id: 'pit3', position: { x: 45, y: -45 }, radius: 12 },
    { id: 'pit4', position: { x: -45, y: -45 }, radius: 12 },
    { id: 'pit5', position: { x: 0, y: -70 }, radius: 10 },
    { id: 'pit6', position: { x: 70, y: 35 }, radius: 10 },
    { id: 'pit7', position: { x: -70, y: 35 }, radius: 10 },
  ],
};

// Export all multi-marble levels
export const MULTI_MARBLE_LEVELS: MultiMarbleLevel[] = [
  testArenaLevel,
  cloud9Level1,
  cloud9Level2,
  cloud9Level3,
  cloud9Level4,
  cloud9Level5,
];

export function getMultiMarbleLevel(index: number): MultiMarbleLevel | null {
  return MULTI_MARBLE_LEVELS[index] ?? null;
}

export function getMultiMarbleLevelById(id: string): MultiMarbleLevel | null {
  return MULTI_MARBLE_LEVELS.find((l) => l.id === id) ?? null;
}

export function getTotalMultiMarbleLevels(): number {
  return MULTI_MARBLE_LEVELS.length;
}
