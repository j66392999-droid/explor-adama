// Spacing scale following 8px base unit
export const SPACING = {
  // Micro spacing (0-8px)
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  
  // Base spacing (8-32px)
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 18,
  10: 20,
  11: 22,
  12: 24,
  13: 26,
  14: 28,
  15: 30,
  16: 32,
  
  // Macro spacing (32px+)
  17: 34,
  18: 36,
  19: 38,
  20: 40,
  24: 48,
  28: 56,
  32: 64,
  36: 72,
  40: 80,
  44: 88,
  48: 96,
  52: 104,
  56: 112,
  60: 120,
  64: 128,
  72: 144,
  80: 160,
  96: 192,
} as const;

// Layout spacing constants
export const LAYOUT = {
  // Screen margins
  screenPadding: SPACING[16],
  screenPaddingHorizontal: SPACING[16],
  screenPaddingVertical: SPACING[16],
  
  // Container spacing
  containerPadding: SPACING[16],
  sectionPadding: SPACING[24],
  contentPadding: SPACING[16],
  
  // Component spacing
  cardPadding: SPACING[16],
  buttonPadding: {
    small: {
      vertical: SPACING[2],
      horizontal: SPACING[4],
    },
    medium: {
      vertical: SPACING[3],
      horizontal: SPACING[6],
    },
    large: {
      vertical: SPACING[4],
      horizontal: SPACING[8],
    },
  },
  
  // Form spacing
  formSpacing: SPACING[16],
  inputPadding: {
    vertical: SPACING[3],
    horizontal: SPACING[4],
  },
  labelMargin: SPACING[2],
  errorMargin: SPACING[1],
  
  // Grid spacing
  gridGap: {
    small: SPACING[4],
    medium: SPACING[8],
    large: SPACING[16],
  },
  
  // List spacing
  listItemPadding: SPACING[16],
  listItemGap: SPACING[8],
  sectionHeaderPadding: SPACING[8],
  
  // Header spacing
  headerPadding: {
    vertical: SPACING[4],
    horizontal: SPACING[16],
  },
  headerHeight: 56,
  
  // Tab bar spacing
  tabBarHeight: 56,
  tabBarPadding: SPACING[4],
  
  // Modal spacing
  modalPadding: SPACING[24],
  modalHeaderPadding: SPACING[16],
  modalFooterPadding: SPACING[16],
} as const;

// Border radius scale
const _BORDER_SCALE = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

export const BORDER_RADIUS = {
  ..._BORDER_SCALE,
  // Component specific
  button: {
    small: _BORDER_SCALE.md,
    medium: _BORDER_SCALE.lg,
    large: _BORDER_SCALE.xl,
  },
  card: _BORDER_SCALE.lg,
  input: _BORDER_SCALE.md,
  modal: _BORDER_SCALE['2xl'],
  avatar: _BORDER_SCALE.full,
} as const;

// Shadow elevations
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

// Z-index scale
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Type definitions
export type SpacingScale = typeof SPACING;
export type LayoutSpacing = typeof LAYOUT;
export type BorderRadius = typeof BORDER_RADIUS;
export type Shadows = typeof SHADOWS;
export type ZIndex = typeof Z_INDEX;

// Helper functions
export const getSpacing = (value: keyof SpacingScale): number => SPACING[value];
export const getLayout = (key: keyof LayoutSpacing) => LAYOUT[key];
export const getBorderRadius = (key: keyof BorderRadius) => BORDER_RADIUS[key];
export const getShadow = (key: keyof Shadows) => SHADOWS[key];
export const getZIndex = (key: keyof ZIndex) => Z_INDEX[key];