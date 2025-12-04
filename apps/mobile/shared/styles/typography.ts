import { Theme } from './theme';

// Font weight constants
export const FONT_WEIGHT = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

// Text variant configurations
export const TEXT_VARIANTS = {
  // Display text
  display: {
    large: {
      fontSize: 57,
      lineHeight: 64,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: -0.25,
    },
    medium: {
      fontSize: 45,
      lineHeight: 52,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0,
    },
    small: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0,
    },
  },
  
  // Headline text
  headline: {
    large: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0,
    },
    medium: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0,
    },
    small: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0,
    },
  },
  
  // Title text
  title: {
    large: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: FONT_WEIGHT.medium,
      letterSpacing: 0,
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: FONT_WEIGHT.medium,
      letterSpacing: 0.15,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: FONT_WEIGHT.medium,
      letterSpacing: 0.1,
    },
  },
  
  // Body text
  body: {
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0.5,
    },
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0.25,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: FONT_WEIGHT.regular,
      letterSpacing: 0.4,
    },
  },
  
  // Label text
  label: {
    large: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: FONT_WEIGHT.medium,
      letterSpacing: 0.1,
    },
    medium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: FONT_WEIGHT.medium,
      letterSpacing: 0.5,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: FONT_WEIGHT.medium,
      letterSpacing: 0.5,
    },
  },
} as const;

// Text alignment
export const TEXT_ALIGNMENT = {
  auto: 'auto',
  left: 'left',
  right: 'right',
  center: 'center',
  justify: 'justify',
} as const;

// Text transform
export const TEXT_TRANSFORM = {
  none: 'none',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
} as const;

// Text decoration
export const TEXT_DECORATION = {
  none: 'none',
  underline: 'underline',
  lineThrough: 'line-through',
  underlineLineThrough: 'underline line-through',
} as const;

// Typography utility functions
export const typographyUtils = {
  // Create text style from variant
  createTextStyle: (
    variant: keyof typeof TEXT_VARIANTS,
    size: 'large' | 'medium' | 'small' = 'medium',
    theme: Theme
  ) => {
    const variantConfig = TEXT_VARIANTS[variant][size];
    
    return {
      fontSize: variantConfig.fontSize,
      lineHeight: variantConfig.lineHeight,
      fontWeight: variantConfig.fontWeight,
      letterSpacing: variantConfig.letterSpacing,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary,
    };
  },
  
  // Get responsive font size
  responsiveFontSize: (baseSize: number, factor: number = 1): number => {
    return baseSize * factor;
  },
  
  // Calculate line height from font size
  calculateLineHeight: (fontSize: number, multiplier: number = 1.5): number => {
    return Math.round(fontSize * multiplier);
  },
  
  // Create font scale
  createFontScale: (baseSize: number, ratio: number = 1.2) => ({
    xs: baseSize / (ratio * ratio),
    sm: baseSize / ratio,
    base: baseSize,
    lg: baseSize * ratio,
    xl: baseSize * ratio * ratio,
    '2xl': baseSize * ratio * ratio * ratio,
    '3xl': baseSize * ratio * ratio * ratio * ratio,
  }),
};

// Component-specific typography
export const COMPONENT_TYPOGRAPHY = {
  button: {
    small: TEXT_VARIANTS.label.medium,
    medium: TEXT_VARIANTS.label.large,
    large: TEXT_VARIANTS.title.small,
  },
  input: {
    text: TEXT_VARIANTS.body.medium,
    label: TEXT_VARIANTS.label.medium,
    helper: TEXT_VARIANTS.body.small,
  },
  card: {
    title: TEXT_VARIANTS.title.medium,
    subtitle: TEXT_VARIANTS.body.medium,
    caption: TEXT_VARIANTS.body.small,
  },
  navigation: {
    header: TEXT_VARIANTS.title.medium,
    tab: TEXT_VARIANTS.label.medium,
  },
} as const;

// Type definitions
export type FontWeight = typeof FONT_WEIGHT;
export type TextVariants = typeof TEXT_VARIANTS;
export type TextAlignment = typeof TEXT_ALIGNMENT;
export type TextTransform = typeof TEXT_TRANSFORM;
export type TextDecoration = typeof TEXT_DECORATION;
export type ComponentTypography = typeof COMPONENT_TYPOGRAPHY;

// Export default typography configuration
export default {
  FONT_WEIGHT,
  TEXT_VARIANTS,
  TEXT_ALIGNMENT,
  TEXT_TRANSFORM,
  TEXT_DECORATION,
  COMPONENT_TYPOGRAPHY,
  utils: typographyUtils,
};