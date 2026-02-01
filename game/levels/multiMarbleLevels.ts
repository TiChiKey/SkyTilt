// Cloud9 Multi-Marble Levels - Triple Marble Challenge
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
// LEVEL 1: First Flight - Introduction to triple marble control
// ============================================================================
export const cloud9Level1: MultiMarbleLevel = {
  id: 'cloud9_first_flight',
  name: 'First Flight',
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
    // Small central obstacle
    createArcWall(0, 0, 0, 25, 0, 360),
  ],

  checkpoints: [],
  deathPits: [],
};

// ============================================================================
// LEVEL 2: The Trident - Three diverging paths
// ============================================================================
export const cloud9Level2: MultiMarbleLevel = {
  id: 'cloud9_trident',
  name: 'The Trident',
  description: 'Guide each marble down its dedicated path',
  difficulty: 1,
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
    // Channel walls creating three paths
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
// LEVEL 3: Crossroads - Strategic marble collisions
// ============================================================================
export const cloud9Level3: MultiMarbleLevel = {
  id: 'cloud9_crossroads',
  name: 'Crossroads',
  description: 'Use marble collisions strategically',
  difficulty: 2,
  baseTime: 50,
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
      position: { x: 90, y: 0 },
      radius: 20,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: -90, y: 0 },
      radius: 20,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 0, y: -90 },
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

  checkpoints: [],
  deathPits: [],
};

// ============================================================================
// LEVEL 4: Traffic Jam - Bottleneck coordination
// ============================================================================
export const cloud9Level4: MultiMarbleLevel = {
  id: 'cloud9_traffic_jam',
  name: 'Traffic Jam',
  description: 'Navigate bottlenecks one marble at a time',
  difficulty: 2,
  baseTime: 60,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: 110 } },
    { colorId: 'blue', position: { x: -80, y: 80 } },
    { colorId: 'green', position: { x: 80, y: 80 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: -110 },
      radius: 20,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: -80, y: -80 },
      radius: 20,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 80, y: -80 },
      radius: 20,
      isComplete: false,
    },
  ],

  walls: [
    // Narrow central corridor - only one marble fits at a time
    createArcWall(0, 0, 18, 80, 60, 120),
    createArcWall(0, 0, 18, 80, 240, 300),
    // Outer rings
    createArcWall(0, 0, 90, 105, 30, 60),
    createArcWall(0, 0, 90, 105, 120, 150),
    createArcWall(0, 0, 90, 105, 210, 240),
    createArcWall(0, 0, 90, 105, 300, 330),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 0, y: 0 }, radius: 14, activated: false },
  ],
  deathPits: [],
};

// ============================================================================
// LEVEL 5: The Cloud - Cloud9 logo inspired
// ============================================================================
export const cloud9Level5: MultiMarbleLevel = {
  id: 'cloud9_the_cloud',
  name: 'The Cloud',
  description: 'Navigate the iconic Cloud9 pattern',
  difficulty: 3,
  baseTime: 75,
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
    // Cloud9 logo inspired pattern - two loops
    createArcWall(-50, 20, 20, 35, 90, 360),
    createArcWall(-50, 20, 20, 35, 0, 70),
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
// LEVEL 6: Spiral Galaxy - Rotating maze concept
// ============================================================================
export const cloud9Level6: MultiMarbleLevel = {
  id: 'cloud9_spiral_galaxy',
  name: 'Spiral Galaxy',
  description: 'Follow the spiral paths to the center',
  difficulty: 3,
  baseTime: 80,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 120, y: 0 } },
    { colorId: 'blue', position: { x: -60, y: 104 } },
    { colorId: 'green', position: { x: -60, y: -104 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: -30, y: 0 },
      radius: 18,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 15, y: -26 },
      radius: 18,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 15, y: 26 },
      radius: 18,
      isComplete: false,
    },
  ],

  walls: [
    // Spiral arms
    createArcWall(0, 0, 40, 55, 0, 120),
    createArcWall(0, 0, 40, 55, 120, 240),
    createArcWall(0, 0, 40, 55, 240, 360),
    // Outer barriers
    createArcWall(0, 0, 80, 95, 30, 90),
    createArcWall(0, 0, 80, 95, 150, 210),
    createArcWall(0, 0, 80, 95, 270, 330),
    // Spoke walls
    createRadialWall(0, 0, 55, 80, 0, 8),
    createRadialWall(0, 0, 55, 80, 120, 8),
    createRadialWall(0, 0, 55, 80, 240, 8),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 60, y: 35 }, radius: 12, activated: false },
    { id: 'cp2', position: { x: -70, y: 0 }, radius: 12, activated: false },
    { id: 'cp3', position: { x: 60, y: -35 }, radius: 12, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 0, y: 65 }, radius: 12 },
    { id: 'pit2', position: { x: 56, y: -32 }, radius: 12 },
    { id: 'pit3', position: { x: -56, y: -32 }, radius: 12 },
  ],
};

// ============================================================================
// LEVEL 7: Waiting Game - Block and wait mechanics
// ============================================================================
export const cloud9Level7: MultiMarbleLevel = {
  id: 'cloud9_waiting_game',
  name: 'Waiting Game',
  description: 'Use marbles to block paths for others',
  difficulty: 3,
  baseTime: 90,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: -110 } },
    { colorId: 'blue', position: { x: -95, y: 55 } },
    { colorId: 'green', position: { x: 95, y: 55 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: 110 },
      radius: 18,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 95, y: -55 },
      radius: 18,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: -95, y: -55 },
      radius: 18,
      isComplete: false,
    },
  ],

  walls: [
    // Inner ring with narrow gaps
    createArcWall(0, 0, 35, 50, 10, 80),
    createArcWall(0, 0, 35, 50, 100, 170),
    createArcWall(0, 0, 35, 50, 190, 260),
    createArcWall(0, 0, 35, 50, 280, 350),
    // Middle ring
    createArcWall(0, 0, 65, 80, 45, 135),
    createArcWall(0, 0, 65, 80, 165, 255),
    createArcWall(0, 0, 65, 80, 285, 15),
    // Outer barriers
    createArcWall(0, 0, 100, 115, 0, 60),
    createArcWall(0, 0, 100, 115, 120, 180),
    createArcWall(0, 0, 100, 115, 240, 300),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 0, y: 0 }, radius: 15, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 55, y: 0 }, radius: 10 },
    { id: 'pit2', position: { x: -28, y: 48 }, radius: 10 },
    { id: 'pit3', position: { x: -28, y: -48 }, radius: 10 },
  ],
};

// ============================================================================
// LEVEL 8: Hazard Zone - Blue hazard barriers
// ============================================================================
export const cloud9Level8: MultiMarbleLevel = {
  id: 'cloud9_hazard_zone',
  name: 'Hazard Zone',
  description: 'Avoid the Cloud9 Blue danger zones',
  difficulty: 4,
  baseTime: 100,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 110, y: 0 } },
    { colorId: 'blue', position: { x: -55, y: 95 } },
    { colorId: 'green', position: { x: -55, y: -95 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: -110, y: 0 },
      radius: 16,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 55, y: -95 },
      radius: 16,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 55, y: 95 },
      radius: 16,
      isComplete: false,
    },
  ],

  walls: [
    // Chevron barriers pointing inward
    createRadialWall(0, 0, 25, 90, 0, 10),
    createRadialWall(0, 0, 25, 90, 60, 10),
    createRadialWall(0, 0, 25, 90, 120, 10),
    createRadialWall(0, 0, 25, 90, 180, 10),
    createRadialWall(0, 0, 25, 90, 240, 10),
    createRadialWall(0, 0, 25, 90, 300, 10),
    // Inner blockers
    createArcWall(0, 0, 0, 20, 0, 360),
    // Outer segments
    createArcWall(0, 0, 100, 115, 15, 45),
    createArcWall(0, 0, 100, 115, 75, 105),
    createArcWall(0, 0, 100, 115, 135, 165),
    createArcWall(0, 0, 100, 115, 195, 225),
    createArcWall(0, 0, 100, 115, 255, 285),
    createArcWall(0, 0, 100, 115, 315, 345),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 0, y: 60 }, radius: 12, activated: false },
    { id: 'cp2', position: { x: 0, y: -60 }, radius: 12, activated: false },
    { id: 'cp3', position: { x: 60, y: 0 }, radius: 12, activated: false },
    { id: 'cp4', position: { x: -60, y: 0 }, radius: 12, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 42, y: 42 }, radius: 12 },
    { id: 'pit2', position: { x: -42, y: 42 }, radius: 12 },
    { id: 'pit3', position: { x: 42, y: -42 }, radius: 12 },
    { id: 'pit4', position: { x: -42, y: -42 }, radius: 12 },
  ],
};

// ============================================================================
// LEVEL 9: Synchronized - Timing is everything
// ============================================================================
export const cloud9Level9: MultiMarbleLevel = {
  id: 'cloud9_synchronized',
  name: 'Synchronized',
  description: 'All marbles must move together through gaps',
  difficulty: 4,
  baseTime: 100,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: -110 } },
    { colorId: 'blue', position: { x: -95, y: 55 } },
    { colorId: 'green', position: { x: 95, y: 55 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: 0 },
      radius: 15,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 95, y: -55 },
      radius: 15,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: -95, y: 55 },
      radius: 15,
      isComplete: false,
    },
  ],

  walls: [
    // Concentric ring maze
    createArcWall(0, 0, 95, 110, 20, 100),
    createArcWall(0, 0, 95, 110, 140, 220),
    createArcWall(0, 0, 95, 110, 260, 340),
    createArcWall(0, 0, 65, 80, 60, 140),
    createArcWall(0, 0, 65, 80, 180, 260),
    createArcWall(0, 0, 65, 80, 300, 20),
    createArcWall(0, 0, 35, 50, 100, 180),
    createArcWall(0, 0, 35, 50, 220, 300),
    createArcWall(0, 0, 35, 50, 340, 60),
    // Center protection
    createArcWall(0, 0, 0, 12, 0, 360),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: -50, y: 0 }, radius: 10, activated: false },
    { id: 'cp2', position: { x: 25, y: 43 }, radius: 10, activated: false },
    { id: 'cp3', position: { x: 25, y: -43 }, radius: 10, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 0, y: 75 }, radius: 10 },
    { id: 'pit2', position: { x: 65, y: -38 }, radius: 10 },
    { id: 'pit3', position: { x: -65, y: -38 }, radius: 10 },
    { id: 'pit4', position: { x: 55, y: 55 }, radius: 8 },
    { id: 'pit5', position: { x: -55, y: 55 }, radius: 8 },
  ],
};

// ============================================================================
// LEVEL 10: Cloud9 Master - The ultimate challenge
// ============================================================================
export const cloud9Level10: MultiMarbleLevel = {
  id: 'cloud9_master',
  name: 'Cloud9 Master',
  description: 'The ultimate triple-marble challenge',
  difficulty: 5,
  baseTime: 120,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: 120 } },
    { colorId: 'blue', position: { x: -104, y: -60 } },
    { colorId: 'green', position: { x: 104, y: -60 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: -15 },
      radius: 14,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 104, y: 60 },
      radius: 14,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: -104, y: 60 },
      radius: 14,
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

// ============================================================================
// LEVEL 11: Triple Helix - Advanced coordination
// ============================================================================
export const cloud9Level11: MultiMarbleLevel = {
  id: 'cloud9_triple_helix',
  name: 'Triple Helix',
  description: 'Navigate interlocking spiral paths',
  difficulty: 5,
  baseTime: 130,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 115, y: 20 } },
    { colorId: 'blue', position: { x: -80, y: 85 } },
    { colorId: 'green', position: { x: -35, y: -105 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: -115, y: -20 },
      radius: 14,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: 80, y: -85 },
      radius: 14,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 35, y: 105 },
      radius: 14,
      isComplete: false,
    },
  ],

  walls: [
    // Triple interlocking spirals
    createArcWall(0, 0, 20, 35, 0, 100),
    createArcWall(0, 0, 20, 35, 120, 220),
    createArcWall(0, 0, 20, 35, 240, 340),
    createArcWall(0, 0, 50, 65, 40, 140),
    createArcWall(0, 0, 50, 65, 160, 260),
    createArcWall(0, 0, 50, 65, 280, 20),
    createArcWall(0, 0, 80, 95, 80, 180),
    createArcWall(0, 0, 80, 95, 200, 300),
    createArcWall(0, 0, 80, 95, 320, 60),
    // Spoke barriers
    createRadialWall(0, 0, 35, 50, 20, 6),
    createRadialWall(0, 0, 35, 50, 140, 6),
    createRadialWall(0, 0, 35, 50, 260, 6),
    createRadialWall(0, 0, 65, 80, 60, 6),
    createRadialWall(0, 0, 65, 80, 180, 6),
    createRadialWall(0, 0, 65, 80, 300, 6),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 0, y: 40 }, radius: 10, activated: false },
    { id: 'cp2', position: { x: 35, y: -20 }, radius: 10, activated: false },
    { id: 'cp3', position: { x: -35, y: -20 }, radius: 10, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 0, y: 0 }, radius: 12 },
    { id: 'pit2', position: { x: 0, y: 70 }, radius: 10 },
    { id: 'pit3', position: { x: 61, y: -35 }, radius: 10 },
    { id: 'pit4', position: { x: -61, y: -35 }, radius: 10 },
    { id: 'pit5', position: { x: 70, y: 70 }, radius: 8 },
    { id: 'pit6', position: { x: -70, y: 70 }, radius: 8 },
    { id: 'pit7', position: { x: 0, y: -85 }, radius: 8 },
  ],
};

// ============================================================================
// LEVEL 12: Endgame - Maximum difficulty
// ============================================================================
export const cloud9Level12: MultiMarbleLevel = {
  id: 'cloud9_endgame',
  name: 'Endgame',
  description: 'Only masters complete this challenge',
  difficulty: 5,
  baseTime: 150,
  mazeRadius: 140,
  isMultiMarble: true,

  marbleSpawns: [
    { colorId: 'red', position: { x: 0, y: 125 } },
    { colorId: 'blue', position: { x: 108, y: -63 } },
    { colorId: 'green', position: { x: -108, y: -63 } },
  ],

  goals: [
    {
      id: 'goal_red',
      colorId: 'red',
      position: { x: 0, y: -10 },
      radius: 12,
      isComplete: false,
    },
    {
      id: 'goal_blue',
      colorId: 'blue',
      position: { x: -8, y: 8 },
      radius: 12,
      isComplete: false,
    },
    {
      id: 'goal_green',
      colorId: 'green',
      position: { x: 8, y: 8 },
      radius: 12,
      isComplete: false,
    },
  ],

  walls: [
    // Multi-layer protection around center
    createArcWall(0, 0, 15, 25, 0, 90),
    createArcWall(0, 0, 15, 25, 120, 210),
    createArcWall(0, 0, 15, 25, 240, 330),
    createArcWall(0, 0, 35, 48, 30, 120),
    createArcWall(0, 0, 35, 48, 150, 240),
    createArcWall(0, 0, 35, 48, 270, 360),
    createArcWall(0, 0, 60, 75, 0, 60),
    createArcWall(0, 0, 60, 75, 90, 150),
    createArcWall(0, 0, 60, 75, 180, 240),
    createArcWall(0, 0, 60, 75, 270, 330),
    createArcWall(0, 0, 90, 105, 20, 70),
    createArcWall(0, 0, 90, 105, 110, 160),
    createArcWall(0, 0, 90, 105, 200, 250),
    createArcWall(0, 0, 90, 105, 290, 340),
    // Radial barriers
    createRadialWall(0, 0, 25, 35, 90, 5),
    createRadialWall(0, 0, 25, 35, 210, 5),
    createRadialWall(0, 0, 25, 35, 330, 5),
    createRadialWall(0, 0, 48, 60, 0, 5),
    createRadialWall(0, 0, 48, 60, 120, 5),
    createRadialWall(0, 0, 48, 60, 240, 5),
    createRadialWall(0, 0, 75, 90, 75, 5),
    createRadialWall(0, 0, 75, 90, 195, 5),
    createRadialWall(0, 0, 75, 90, 315, 5),
  ],

  checkpoints: [
    { id: 'cp1', position: { x: 50, y: 29 }, radius: 8, activated: false },
    { id: 'cp2', position: { x: -50, y: 29 }, radius: 8, activated: false },
    { id: 'cp3', position: { x: 0, y: -58 }, radius: 8, activated: false },
    { id: 'cp4', position: { x: 30, y: -17 }, radius: 8, activated: false },
    { id: 'cp5', position: { x: -30, y: -17 }, radius: 8, activated: false },
  ],
  deathPits: [
    { id: 'pit1', position: { x: 40, y: 69 }, radius: 10 },
    { id: 'pit2', position: { x: -40, y: 69 }, radius: 10 },
    { id: 'pit3', position: { x: 80, y: 0 }, radius: 10 },
    { id: 'pit4', position: { x: -80, y: 0 }, radius: 10 },
    { id: 'pit5', position: { x: 40, y: -69 }, radius: 10 },
    { id: 'pit6', position: { x: -40, y: -69 }, radius: 10 },
    { id: 'pit7', position: { x: 0, y: 80 }, radius: 8 },
    { id: 'pit8', position: { x: 69, y: -40 }, radius: 8 },
    { id: 'pit9', position: { x: -69, y: -40 }, radius: 8 },
  ],
};

// Export all Cloud9 levels
export const MULTI_MARBLE_LEVELS: MultiMarbleLevel[] = [
  cloud9Level1,
  cloud9Level2,
  cloud9Level3,
  cloud9Level4,
  cloud9Level5,
  cloud9Level6,
  cloud9Level7,
  cloud9Level8,
  cloud9Level9,
  cloud9Level10,
  cloud9Level11,
  cloud9Level12,
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
