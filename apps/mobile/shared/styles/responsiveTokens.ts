import responsive from "../utils/responsive";

export const spacing = {
  xs: responsive.moderateScale(4),
  sm: responsive.moderateScale(8),
  md: responsive.moderateScale(12),
  lg: responsive.moderateScale(16),
  xl: responsive.moderateScale(20),
  xxl: responsive.moderateScale(28),
};

export const radii = {
  sm: responsive.moderateScale(4),
  md: responsive.moderateScale(8),
  lg: responsive.moderateScale(12),
  xl: responsive.moderateScale(20),
  full: 9999,
};

export const fonts = {
  xs: responsive.scaleFont(10),
  sm: responsive.scaleFont(12),
  md: responsive.scaleFont(14),
  lg: responsive.scaleFont(16),
  xl: responsive.scaleFont(20),
  xxl: responsive.scaleFont(24),
};

export const iconSizes = {
  sm: responsive.scaleIcon(16),
  md: responsive.scaleIcon(22),
  lg: responsive.scaleIcon(28),
  xl: responsive.scaleIcon(34),
};
