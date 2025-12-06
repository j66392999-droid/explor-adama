// shared/utils/responsive.ts

import { Dimensions, ScaledSize, Platform } from "react-native";

/**
 * Base reference dimensions (iPhone 8)
 */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

export const BREAKPOINTS = {
  xs: 360, // very small phones
  sm: 600, // regular phones
  md: 900, // tablets
  lg: 1200, // large tablets / small desktops
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS | "xl";

export const getWindow = (): ScaledSize => Dimensions.get("window");

/**
 * Determine breakpoint based on width
 */
export const getBreakpoint = (width?: number): Breakpoint => {
  const w = width ?? getWindow().width;
  if (w <= BREAKPOINTS.xs) return "xs";
  if (w <= BREAKPOINTS.sm) return "sm";
  if (w <= BREAKPOINTS.md) return "md";
  if (w <= BREAKPOINTS.lg) return "lg";
  return "xl";
};

/**
 * Basic scale relative to BASE_WIDTH
 */
export const scale = (size: number, width?: number): number => {
  const w = width ?? getWindow().width;
  return Math.round((w / BASE_WIDTH) * size);
};

/**
 * Blend scaling (avoids making things too big)
 */
export const moderateScale = (
  size: number,
  factor = 0.5,
  width?: number
): number => {
  const scaled = scale(size, width);
  return Math.round(size + (scaled - size) * factor);
};

export const responsiveWidth = (percentage: number): number => {
  const { width } = getWindow();
  return Math.round((percentage * width) / 100);
};

export const responsiveHeight = (percentage: number): number => {
  const { height } = getWindow();
  return Math.round((percentage * height) / 100);
};

/**
 * Device helpers
 */
export const isSmallDevice = (): boolean => {
  return getWindow().width <= BREAKPOINTS.sm;
};

export const isTablet = (): boolean => {
  const { width, height } = getWindow();
  const minDim = Math.min(width, height);
  return minDim >= 600;
};

/**
 * NEW: Dynamic icon scaling based on breakpoint
 */
export const scaleIcon = (baseSize: number): number => {
  const bp = getBreakpoint();

  switch (bp) {
    case "xs":
      return moderateScale(baseSize * 0.85); // tiny phones
    case "sm":
      return moderateScale(baseSize); // default
    case "md":
      return moderateScale(baseSize * 1.2); // tablets
    case "lg":
      return moderateScale(baseSize * 1.3);
    case "xl":
      return moderateScale(baseSize * 1.4);
    default:
      return moderateScale(baseSize);
  }
};

/**
 * NEW: Tab bar height scaling (Twitter/Threads style)
 */
export const scaleTabBarHeight = (): number => {
  const bp = getBreakpoint();

  switch (bp) {
    case "xs":
      return 52;
    case "sm":
      return 60;
    case "md":
      return 72;
    case "lg":
      return 80;
    default:
      return 88; // xl
  }
};

/**
 * NEW: Font scaling by breakpoint
 */
export const scaleFont = (size: number): number => {
  const bp = getBreakpoint();

  switch (bp) {
    case "xs":
      return moderateScale(size * 0.9);
    case "sm":
      return moderateScale(size);
    case "md":
      return moderateScale(size * 1.1);
    case "lg":
      return moderateScale(size * 1.2);
    default:
      return moderateScale(size * 1.3);
  }
};

export default {
  getWindow,
  getBreakpoint,
  scale,
  moderateScale,
  responsiveWidth,
  responsiveHeight,
  isSmallDevice,
  isTablet,
  scaleIcon,
  scaleTabBarHeight,
  scaleFont,
};
