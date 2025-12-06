import React, { createContext, useContext, useState, useEffect, JSX } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import responsive from '../../utils/responsive';
import { storage } from '../../services/storage/asyncStorage';

// Theme colors for light and dark modes
const lightColors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0056CC',
  
  // Secondary colors
  secondary: '#5856D6',
  secondaryLight: '#7D7AFF',
  secondaryDark: '#3D3AA3',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Background colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#E9ECEF',
  
  // Text colors
  text: '#212529',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  
  // Border colors
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  borderDark: '#CED4DA',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
  
  // Special colors
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onSurface: '#212529',
  onBackground: '#212529',
};

const darkColors = {
  // Primary colors
  primary: '#0A84FF',
  primaryLight: '#409CFF',
  primaryDark: '#0066CC',
  
  // Secondary colors
  secondary: '#5E5CE6',
  secondaryLight: '#7D7AFF',
  secondaryDark: '#4D4AC4',
  
  // Status colors
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  
  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  
  // Border colors
  border: '#38383A',
  borderLight: '#2C2C2E',
  borderDark: '#48484A',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  
  // Special colors
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onSurface: '#FFFFFF',
  onBackground: '#FFFFFF',
};

// Typography scale
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  large: {
    fontSize: 18,
    fontWeight: 'normal' as const,
    lineHeight: 26,
  },
  small: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
};

// Spacing scale
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 24,
};

// Shadows
const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Animation durations
const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Theme type
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: ThemeMode;
  colors: typeof lightColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  animation: typeof animation;
  isDark: boolean;
}

// Theme context
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme provider component
export const ThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => {
  const systemColorScheme = useColorScheme();
  // Default to light theme mode instead of 'auto'
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await storage.getThemePreference();
        if (savedTheme) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Determine current theme based on mode and system preference
  const getCurrentTheme = (): Theme => {
    const isDark = 
      themeMode === 'dark' || 
      (themeMode === 'auto' && systemColorScheme === 'dark');
    
    const colors = isDark ? darkColors : lightColors;

    return {
      mode: themeMode,
      colors,
      typography,
      spacing,
      borderRadius,
      shadows,
      animation,
      isDark,
    };
  };

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await storage.setThemePreference(mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const theme = getCurrentTheme();

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context.theme;
};

// Hook to use theme actions
export const useThemeActions = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeActions must be used within a ThemeProvider');
  }
  
  return {
    toggleTheme: context.toggleTheme,
    setTheme: context.setTheme,
  };
};

// Hook to get current theme mode
export const useThemeMode = (): {
  mode: ThemeMode;
  isDark: boolean;
  isLight: boolean;
} => {
  const theme = useTheme();
  
  return {
    mode: theme.mode,
    isDark: theme.isDark,
    isLight: !theme.isDark,
  };
};

// Utility functions for theme
export const themeUtils = {
  // Color manipulation utilities
  lighten: (color: string, percent: number): string => {
    // Simple lighten function - in a real app, you might want to use a library like polished
    return color; // Implementation would go here
  },
  
  darken: (color: string, percent: number): string => {
    // Simple darken function
    return color; // Implementation would go here
  },
  
  alpha: (color: string, opacity: number): string => {
    // Convert hex to rgba
    return color; // Implementation would go here
  },
  
  // Responsive size calculator — scales relative to base guideline width
  responsiveSize: (baseSize: number, factor: number = 1): number => {
    return Math.round(responsive.moderateScale(baseSize * factor, 0.5));
  },
  
  // Get color with opacity
  withOpacity: (color: string, opacity: number): string => {
    // This is a simplified version - you might want to use a proper color library
    if (color.startsWith('#')) {
      // Handle hex colors
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    if (color.startsWith('rgb')) {
      // Handle rgb colors
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
    return color;
  },
};