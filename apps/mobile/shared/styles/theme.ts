import { COLORS, LIGHT_COLORS, DARK_COLORS, COMMON_COLORS } from './colors';
import { SPACING, LAYOUT, BORDER_RADIUS, SHADOWS, Z_INDEX } from './spacing';
import { ANIMATION_CONFIG, ANIMATION_PRESETS } from './animations';

// Theme configuration interface
export interface Theme {
  colors: {
    primary: typeof COLORS.primary;
    secondary: typeof COLORS.secondary;
    success: typeof COLORS.success;
    warning: typeof COLORS.warning;
    error: typeof COLORS.error;
    neutral: typeof COLORS.neutral;
    semantic: typeof COLORS.semantic;
    background: typeof LIGHT_COLORS.background | typeof DARK_COLORS.background;
    text: typeof LIGHT_COLORS.text | typeof DARK_COLORS.text;
    border: typeof LIGHT_COLORS.border | typeof DARK_COLORS.border;
    status: typeof LIGHT_COLORS.status | typeof DARK_COLORS.status;
    common: typeof COMMON_COLORS;
  };
  spacing: typeof SPACING;
  layout: typeof LAYOUT;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
  zIndex: typeof Z_INDEX;
  animation: {
    config: typeof ANIMATION_CONFIG;
    presets: typeof ANIMATION_PRESETS;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
      '5xl': number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
}

// Light theme
export const lightTheme: Theme = {
  colors: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    neutral: COLORS.neutral,
    semantic: COLORS.semantic,
    background: LIGHT_COLORS.background,
    text: LIGHT_COLORS.text,
    border: LIGHT_COLORS.border,
    status: LIGHT_COLORS.status,
    common: COMMON_COLORS,
  },
  spacing: SPACING,
  layout: LAYOUT,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
  animation: {
    config: ANIMATION_CONFIG,
    presets: ANIMATION_PRESETS,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
};

// Dark theme
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: DARK_COLORS.background,
    text: DARK_COLORS.text,
    border: DARK_COLORS.border,
    status: DARK_COLORS.status,
  },
};

// Theme context type
export type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
};

// Theme variants
export const THEME_VARIANTS = {
  light: 'light',
  dark: 'dark',
  auto: 'auto',
} as const;

export type ThemeVariant = keyof typeof THEME_VARIANTS;

// Theme configuration
export const THEME_CONFIG = {
  storageKey: 'app-theme',
  defaultVariant: 'light' as ThemeVariant,
  enableSystem: true,
} as const;

// Helper functions
export const createTheme = (isDark: boolean): Theme => 
  isDark ? darkTheme : lightTheme;

export const getThemeColor = (
  theme: Theme, 
  colorPath: string, 
  fallback?: string
): string => {
  const path = colorPath.split('.');
  let result: any = theme.colors;
  
  for (const key of path) {
    if (result[key] === undefined) {
      return fallback || theme.colors.neutral[500];
    }
    result = result[key];
  }
  
  return result;
};

// Theme utility functions
export const themeUtils = {
  // Get responsive spacing
  responsiveSpacing: (multiplier: number = 1) => ({
    padding: SPACING[4] * multiplier,
    margin: SPACING[4] * multiplier,
  }),
  
  // Create shadow with color from theme
  createShadow: (shadowKey: keyof typeof SHADOWS, color?: string) => ({
    ...SHADOWS[shadowKey],
    shadowColor: color || SHADOWS[shadowKey].shadowColor,
  }),
  
  // Get contrast color for background
  getContrastColor: (backgroundColor: string): 'light' | 'dark' => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'dark' : 'light';
  },
};

export default lightTheme;