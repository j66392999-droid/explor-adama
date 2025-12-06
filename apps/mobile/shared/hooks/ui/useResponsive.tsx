import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import responsive, { getBreakpoint } from '../../utils/responsive';

export interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: ReturnType<typeof getBreakpoint>;
  isSmallDevice: boolean;
  isTablet: boolean;
  scale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  responsiveWidth: (percentage: number) => number;
  responsiveHeight: (percentage: number) => number;
}

export const useResponsive = (): ResponsiveState => {
  const { width, height } = Dimensions.get('window');
  const [window, setWindow] = useState<ScaledSize>({ width, height, scale: 1, fontScale: 1 });

  useEffect(() => {
    const onChange = (next: { window: ScaledSize }) => {
      setWindow(next.window);
    };

    const sub = Dimensions.addEventListener?.('change', onChange);
    return () => {
      if (sub && typeof sub.remove === 'function') sub.remove();
      else Dimensions.removeEventListener && Dimensions.removeEventListener('change', onChange as any);
    };
  }, []);

  return {
    width: window.width,
    height: window.height,
    breakpoint: getBreakpoint(window.width),
    isSmallDevice: responsive.isSmallDevice(),
    isTablet: responsive.isTablet(),
    scale: (size: number) => responsive.scale(size, window.width),
    moderateScale: (size: number, factor = 0.5) => responsive.moderateScale(size, factor, window.width),
    responsiveWidth: responsive.responsiveWidth,
    responsiveHeight: responsive.responsiveHeight,
  };
};

export default useResponsive;
