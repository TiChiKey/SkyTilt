// Orbit Game Color Palette - Inspired by the Cloud9-style logo
export const COLORS = {
  // Primary brand colors
  skyBlue: '#2DAFE5',
  skyBlueLight: '#5FC4EC',
  skyBlueDark: '#1A8FBE',
  skyBlueTranslucent: 'rgba(45, 175, 229, 0.3)',

  // UI colors
  white: '#FFFFFF',
  offWhite: '#F8FAFC',

  // Marble
  marbleWhite: '#FFFFFF',
  marbleShadow: 'rgba(0, 0, 0, 0.4)',
  marbleHighlight: 'rgba(255, 255, 255, 0.8)',

  // Maze colors
  mazeFloor: '#1E2A3A',
  mazeFloorLight: '#2A3847',
  mazeWall: '#0F1A24',
  mazeWallHighlight: '#3A4857',

  // Background gradient
  bgDark: '#0A1622',
  bgMid: '#14283A',
  bgLight: '#1E3A4C',

  // UI elements
  charcoal: '#1A1A2E',
  charcoalLight: '#2D2D44',

  // Stars/ratings
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  starEmpty: 'rgba(255, 255, 255, 0.2)',

  // Game elements
  checkpoint: '#00E676',
  checkpointGlow: 'rgba(0, 230, 118, 0.5)',
  goal: '#FFD700',
  goalGlow: 'rgba(255, 215, 0, 0.6)',
  deathPit: '#FF1744',
  deathPitGlow: 'rgba(255, 23, 68, 0.4)',

  // UI overlays
  overlayDark: 'rgba(10, 22, 34, 0.85)',
  overlayLight: 'rgba(45, 175, 229, 0.1)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',

  // Success/Error
  success: '#00E676',
  error: '#FF1744',
  warning: '#FFC107',
} as const;

export type ColorKey = keyof typeof COLORS;
