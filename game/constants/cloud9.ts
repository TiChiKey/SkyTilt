// Cloud9 Visual Aesthetic - Clean white background with vivid blue accents
export const CLOUD9_COLORS = {
  // Core Cloud9 palette
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  primary: '#0099FF',
  primaryLight: '#33ADFF',
  primaryDark: '#007ACC',
  primaryTranslucent: 'rgba(0, 153, 255, 0.3)',
  primaryGlow: 'rgba(0, 153, 255, 0.5)',

  // Marble colors
  marbleRed: '#FF3B30',
  marbleRedLight: '#FF6B61',
  marbleRedDark: '#CC2E26',
  marbleRedGlow: 'rgba(255, 59, 48, 0.4)',

  marbleBlue: '#007AFF',
  marbleBlueLight: '#4DA3FF',
  marbleBlueDark: '#0062CC',
  marbleBlueGlow: 'rgba(0, 122, 255, 0.4)',

  marbleGreen: '#34C759',
  marbleGreenLight: '#5ED880',
  marbleGreenDark: '#28A745',
  marbleGreenGlow: 'rgba(52, 199, 89, 0.4)',

  // Goal colors (matched to marbles)
  goalRed: '#FF3B30',
  goalRedGlow: 'rgba(255, 59, 48, 0.6)',
  goalBlue: '#007AFF',
  goalBlueGlow: 'rgba(0, 122, 255, 0.6)',
  goalGreen: '#34C759',
  goalGreenGlow: 'rgba(52, 199, 89, 0.6)',

  // UI elements
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  grayLight: '#E5E5EA',
  grayDark: '#3A3A3C',

  // Maze elements
  mazeWall: '#0099FF',
  mazeWallHighlight: '#33ADFF',
  mazeWallShadow: '#007ACC',
  mazeBoundary: '#0099FF',
  mazeFloor: '#FFFFFF',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#3A3A3C',
  textMuted: '#8E8E93',
  textOnPrimary: '#FFFFFF',

  // Feedback states
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Overlays
  overlayLight: 'rgba(0, 0, 0, 0.05)',
  overlayMedium: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayWhite: 'rgba(255, 255, 255, 0.9)',
} as const;

// Marble color identifiers
export type MarbleColorId = 'red' | 'blue' | 'green';

// Marble color configurations
export const MARBLE_COLORS: Record<MarbleColorId, {
  main: string;
  light: string;
  dark: string;
  glow: string;
}> = {
  red: {
    main: CLOUD9_COLORS.marbleRed,
    light: CLOUD9_COLORS.marbleRedLight,
    dark: CLOUD9_COLORS.marbleRedDark,
    glow: CLOUD9_COLORS.marbleRedGlow,
  },
  blue: {
    main: CLOUD9_COLORS.marbleBlue,
    light: CLOUD9_COLORS.marbleBlueLight,
    dark: CLOUD9_COLORS.marbleBlueDark,
    glow: CLOUD9_COLORS.marbleBlueGlow,
  },
  green: {
    main: CLOUD9_COLORS.marbleGreen,
    light: CLOUD9_COLORS.marbleGreenLight,
    dark: CLOUD9_COLORS.marbleGreenDark,
    glow: CLOUD9_COLORS.marbleGreenGlow,
  },
};

// Goal color configurations
export const GOAL_COLORS: Record<MarbleColorId, {
  main: string;
  glow: string;
}> = {
  red: {
    main: CLOUD9_COLORS.goalRed,
    glow: CLOUD9_COLORS.goalRedGlow,
  },
  blue: {
    main: CLOUD9_COLORS.goalBlue,
    glow: CLOUD9_COLORS.goalBlueGlow,
  },
  green: {
    main: CLOUD9_COLORS.goalGreen,
    glow: CLOUD9_COLORS.goalGreenGlow,
  },
};

export type Cloud9ColorKey = keyof typeof CLOUD9_COLORS;
