import { Dimensions } from 'react-native';
import { Easing } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animation configurations
export const ANIMATION_CONFIG = {
  DURATION_SHORT: 200,
  DURATION_MEDIUM: 300,
  DURATION_LONG: 500,
  EASING: Easing.bezier(0.25, 0.1, 0.25, 1),
  EASING_BOUNCE: Easing.bounce,
  EASING_ELASTIC: Easing.elastic(1.2),
} as const;

// Shared animation values
export const ANIMATION_VALUES = {
  SCALE: {
    PRESS: 0.95,
    HOVER: 1.05,
  },
  OPACITY: {
    DISABLED: 0.5,
    HOVER: 0.8,
    ACTIVE: 0.6,
  },
} as const;

// Predefined animations
export const ANIMATIONS = {
  // Fade animations
  FADE_IN: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  FADE_OUT: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  
  // Slide animations
  SLIDE_IN_RIGHT: {
    from: { translateX: SCREEN_WIDTH },
    to: { translateX: 0 },
  },
  SLIDE_OUT_RIGHT: {
    from: { translateX: 0 },
    to: { translateX: SCREEN_WIDTH },
  },
  SLIDE_IN_LEFT: {
    from: { translateX: -SCREEN_WIDTH },
    to: { translateX: 0 },
  },
  SLIDE_OUT_LEFT: {
    from: { translateX: 0 },
    to: { translateX: -SCREEN_WIDTH },
  },
  SLIDE_IN_UP: {
    from: { translateY: SCREEN_HEIGHT },
    to: { translateY: 0 },
  },
  SLIDE_OUT_DOWN: {
    from: { translateY: 0 },
    to: { translateY: SCREEN_HEIGHT },
  },
  
  // Scale animations
  SCALE_IN: {
    from: { scale: 0 },
    to: { scale: 1 },
  },
  SCALE_OUT: {
    from: { scale: 1 },
    to: { scale: 0 },
  },
  BOUNCE_IN: {
    from: { scale: 0.3, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
  
  // Complex animations
  SHAKE: {
    keyframes: [
      { translateX: 0 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: 0 },
    ],
  },
  
  PULSE: {
    keyframes: [
      { scale: 1 },
      { scale: 1.05 },
      { scale: 1 },
    ],
  },
  
  FLIP: {
    from: { rotateY: '0deg' },
    to: { rotateY: '180deg' },
  },
} as const;

// Animation presets for common components
export const ANIMATION_PRESETS = {
  BUTTON: {
    press: {
      duration: ANIMATION_CONFIG.DURATION_SHORT,
      easing: ANIMATION_CONFIG.EASING,
      scale: ANIMATION_VALUES.SCALE.PRESS,
    },
  },
  MODAL: {
    enter: {
      duration: ANIMATION_CONFIG.DURATION_MEDIUM,
      easing: ANIMATION_CONFIG.EASING,
      ...ANIMATIONS.SLIDE_IN_UP,
    },
    exit: {
      duration: ANIMATION_CONFIG.DURATION_MEDIUM,
      easing: ANIMATION_CONFIG.EASING,
      ...ANIMATIONS.SLIDE_OUT_DOWN,
    },
  },
  TOAST: {
    enter: {
      duration: ANIMATION_CONFIG.DURATION_SHORT,
      easing: ANIMATION_CONFIG.EASING,
      ...ANIMATIONS.SLIDE_IN_UP,
    },
    exit: {
      duration: ANIMATION_CONFIG.DURATION_SHORT,
      easing: ANIMATION_CONFIG.EASING,
      ...ANIMATIONS.FADE_OUT,
    },
  },
  LOADING: {
    spin: {
      duration: 1000,
      easing: Easing.linear,
      rotate: '360deg',
      loop: true,
    },
  },
} as const;

// Type definitions
export type AnimationConfig = typeof ANIMATION_CONFIG;
export type AnimationValues = typeof ANIMATION_VALUES;
export type Animations = typeof ANIMATIONS;
export type AnimationPresets = typeof ANIMATION_PRESETS;