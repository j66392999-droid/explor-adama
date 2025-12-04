// Color palette following design system principles
export const COLORS = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  // Neutral colors
  neutral: {
    white: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    black: '#000000',
  },
  
  // Additional semantic colors
  semantic: {
    info: '#3b82f6',
    highlight: '#8b5cf6',
    purple: '#a855f7',
    pink: '#ec4899',
    rose: '#f43f5e',
    orange: '#f97316',
    amber: '#f59e0b',
    lime: '#84cc16',
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    sky: '#0ea5e9',
    indigo: '#6366f1',
    violet: '#8b5cf6',
  },
} as const;

// Light theme colors
export const LIGHT_COLORS = {
  background: {
    primary: COLORS.neutral.white,
    secondary: COLORS.neutral[50],
    tertiary: COLORS.neutral[100],
    inverse: COLORS.neutral[900],
  },
  text: {
    primary: COLORS.neutral[900],
    secondary: COLORS.neutral[700],
    tertiary: COLORS.neutral[500],
    inverse: COLORS.neutral.white,
    disabled: COLORS.neutral[400],
    placeholder: COLORS.neutral[500],
  },
  border: {
    primary: COLORS.neutral[200],
    secondary: COLORS.neutral[300],
    focus: COLORS.primary[500],
    error: COLORS.error[500],
  },
  status: {
    success: COLORS.success[500],
    warning: COLORS.warning[500],
    error: COLORS.error[500],
    info: COLORS.primary[500],
  },
} as const;

// Dark theme colors
export const DARK_COLORS = {
  background: {
    primary: COLORS.neutral[900],
    secondary: COLORS.neutral[800],
    tertiary: COLORS.neutral[700],
    inverse: COLORS.neutral.white,
  },
  text: {
    primary: COLORS.neutral.white,
    secondary: COLORS.neutral[200],
    tertiary: COLORS.neutral[400],
    inverse: COLORS.neutral[900],
    disabled: COLORS.neutral[600],
    placeholder: COLORS.neutral[500],
  },
  border: {
    primary: COLORS.neutral[700],
    secondary: COLORS.neutral[600],
    focus: COLORS.primary[400],
    error: COLORS.error[400],
  },
  status: {
    success: COLORS.success[400],
    warning: COLORS.warning[400],
    error: COLORS.error[400],
    info: COLORS.primary[400],
  },
} as const;

// Common colors used across the app
export const COMMON_COLORS = {
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
} as const;

// Type definitions
export type ColorPalette = typeof COLORS;
export type LightColors = typeof LIGHT_COLORS;
export type DarkColors = typeof DARK_COLORS;
export type CommonColors = typeof COMMON_COLORS;

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};