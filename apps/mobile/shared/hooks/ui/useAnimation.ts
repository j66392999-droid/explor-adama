import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';

// Configure LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Animation configurations
export const AnimationPresets = {
  // Basic animations
  fadeIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.ease,
  },
  fadeOut: {
    toValue: 0,
    duration: 300,
    easing: Easing.ease,
  },
  slideInUp: {
    toValue: 0,
    duration: 400,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  },
  slideOutDown: {
    toValue: 100,
    duration: 400,
    easing: Easing.bezier(0.55, 0.085, 0.68, 0.53),
  },
  slideInLeft: {
    toValue: 0,
    duration: 400,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  },
  slideOutRight: {
    toValue: -100,
    duration: 400,
    easing: Easing.bezier(0.55, 0.085, 0.68, 0.53),
  },
  scaleIn: {
    toValue: 1,
    duration: 400,
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  },
  scaleOut: {
    toValue: 0,
    duration: 300,
    easing: Easing.ease,
  },
  bounce: {
    toValue: 1,
    duration: 600,
    easing: Easing.bounce,
  },
  
  // Spring animations
  spring: {
    tension: 40,
    friction: 7,
    useNativeDriver: true,
  },
  springGentle: {
    tension: 30,
    friction: 10,
    useNativeDriver: true,
  },
  springBouncy: {
    tension: 100,
    friction: 3,
    useNativeDriver: true,
  },
};

// Layout animation presets
export const LayoutAnimationPresets = {
  easeInEaseOut: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  },
  spring: {
    duration: 500,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.7,
    },
  },
  linear: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.linear,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.linear,
    },
  },
};

// Main animation hook
export const useAnimation = (initialValue: number = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  // Basic value setter
  const setValue = useCallback((value: number) => {
    animatedValue.setValue(value);
  }, [animatedValue]);

  // Basic animation
  const animate = useCallback((
    toValue: number,
    duration: number = 300,
    easing: any = Easing.ease,
    useNativeDriver: boolean = true
  ): Promise<void> => {
    return new Promise((resolve) => {
      Animated.timing(animatedValue, {
        toValue,
        duration,
        easing,
        useNativeDriver,
      }).start(() => resolve());
    });
  }, [animatedValue]);

  // Spring animation (async)
  const spring = useCallback((
    toValue: number,
    config: Omit<Animated.SpringAnimationConfig, 'toValue'> = AnimationPresets.spring
  ): Promise<void> => {
    return new Promise((resolve) => {
      const springConfig: Animated.SpringAnimationConfig = {
        toValue,
        ...config,
      };

      Animated.spring(animatedValue, springConfig).start(() => resolve());
    });
  }, [animatedValue]);

  // Timing animation as CompositeAnimation (not started) for use in sequence/parallel/stagger
  const timing = useCallback((
    toValue: number,
    duration: number = 300,
    easing: any = Easing.ease,
    useNativeDriver: boolean = true
  ): Animated.CompositeAnimation => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing,
      useNativeDriver,
    });
  }, [animatedValue]);

  // Spring as CompositeAnimation (not started) for use in sequence/parallel/stagger
  const springAnim = useCallback((
    toValue: number,
    config: Omit<Animated.SpringAnimationConfig, 'toValue'> = AnimationPresets.spring
  ): Animated.CompositeAnimation => {
    const springConfig: Animated.SpringAnimationConfig = {
      toValue,
      ...config,
    };

    return Animated.spring(animatedValue, springConfig);
  }, [animatedValue]);

  // Sequence animation
  const sequence = useCallback((
    animations: Array<() => Animated.CompositeAnimation>,
  ): Promise<void> => {
    return new Promise((resolve) => {
      Animated.sequence(animations.map(anim => anim())).start(() => resolve());
    });
  }, []);

  // Parallel animation
  const parallel = useCallback((
    animations: Array<() => Animated.CompositeAnimation>,
  ): Promise<void> => {
    return new Promise((resolve) => {
      Animated.parallel(animations.map(anim => anim())).start(() => resolve());
    });
  }, []);

  // Stagger animation
  const stagger = useCallback((
    animations: Array<() => Animated.CompositeAnimation>,
    delay: number = 100
  ): Promise<void> => {
    return new Promise((resolve) => {
      Animated.stagger(
        delay,
        animations.map(anim => anim())
      ).start(() => resolve());
    });
  }, []);

  // Loop animation
  const loop = useCallback((
    animation: () => Animated.CompositeAnimation,
    iterations?: number
  ): Animated.CompositeAnimation => {
    return Animated.loop(animation(), { iterations });
  }, []);

  // Stop animation
  const stop = useCallback(() => {
    animatedValue.stopAnimation();
  }, [animatedValue]);

  // Reset animation
  const reset = useCallback(() => {
    animatedValue.setValue(initialValue);
  }, [animatedValue, initialValue]);

  // Interpolate value
  const interpolate = useCallback((
    inputRange: number[],
    outputRange: number[] | string[],
    extrapolate?: Animated.ExtrapolateType
  ): Animated.AnimatedInterpolation<number | string> => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate,
    });
  }, [animatedValue]);

  // Helper to create an animated style object from a style map
  const createStyle = useCallback((
    styleMap: Record<string, {
      inputRange: number[];
      outputRange: number[] | string[];
      extrapolate?: Animated.ExtrapolateType;
    }>
  ) => {
    const animatedStyle: Record<string, Animated.AnimatedInterpolation<number | string>> = {};

    Object.keys(styleMap).forEach((key) => {
      const map = styleMap[key];
      animatedStyle[key] = interpolate(map.inputRange, map.outputRange, map.extrapolate);
    });

    return animatedStyle;
  }, [interpolate]);

  return {
    // Value
    value: animatedValue,
    
    // Methods
    setValue,
    animate,
    timing,
    spring,
    springAnim,
    sequence,
    parallel,
    stagger,
    loop,
    stop,
    reset,
    interpolate,
    createStyle,
    
    // Common animations
    fadeIn: (duration?: number) => animate(1, duration),
    fadeOut: (duration?: number) => animate(0, duration),
    slideIn: (fromValue: number = -100, duration?: number) => {
      animatedValue.setValue(fromValue);
      return animate(0, duration);
    },
    slideOut: (toValue: number = 100, duration?: number) => animate(toValue, duration),
    scale: (toValue: number, duration?: number) => animate(toValue, duration),
  };
};

// Hook for fade animations
export const useFadeAnimation = (initialOpacity: number = 0) => {
  const opacity = useAnimation(initialOpacity);

  const fadeIn = useCallback(async (duration: number = 300) => {
    await opacity.animate(1, duration);
  }, [opacity]);

  const fadeOut = useCallback(async (duration: number = 300) => {
    await opacity.animate(0, duration);
  }, [opacity]);

  const fadeToggle = useCallback(async (duration: number = 300) => {
    const currentValue = await new Promise<number>((resolve) => {
      opacity.value.addListener(({ value }) => resolve(value));
    });
    
    if (currentValue === 0) {
      await fadeIn(duration);
    } else {
      await fadeOut(duration);
    }
  }, [opacity, fadeIn, fadeOut]);

  return {
    opacity: opacity.value,
    fadeIn,
    fadeOut,
    fadeToggle,
  };
};

// Hook for slide animations
export const useSlideAnimation = (initialPosition: number = -100) => {
  const translateX = useAnimation(initialPosition);
  const translateY = useAnimation(initialPosition);

  const slideInX = useCallback(async (fromValue: number = -100, duration: number = 400) => {
    translateX.setValue(fromValue);
    await translateX.animate(0, duration, Easing.bezier(0.25, 0.46, 0.45, 0.94));
  }, [translateX]);

  const slideOutX = useCallback(async (toValue: number = 100, duration: number = 400) => {
    await translateX.animate(toValue, duration, Easing.bezier(0.55, 0.085, 0.68, 0.53));
  }, [translateX]);

  const slideInY = useCallback(async (fromValue: number = -100, duration: number = 400) => {
    translateY.setValue(fromValue);
    await translateY.animate(0, duration, Easing.bezier(0.25, 0.46, 0.45, 0.94));
  }, [translateY]);

  const slideOutY = useCallback(async (toValue: number = 100, duration: number = 400) => {
    await translateY.animate(toValue, duration, Easing.bezier(0.55, 0.085, 0.68, 0.53));
  }, [translateY]);

  return {
    translateX: translateX.value,
    translateY: translateY.value,
    slideInX,
    slideOutX,
    slideInY,
    slideOutY,
  };
};

// Hook for scale animations
export const useScaleAnimation = (initialScale: number = 0) => {
  const scale = useAnimation(initialScale);

  const scaleIn = useCallback(async (duration: number = 400) => {
    await scale.animate(1, duration, Easing.bezier(0.175, 0.885, 0.32, 1.275));
  }, [scale]);

  const scaleOut = useCallback(async (duration: number = 300) => {
    await scale.animate(0, duration);
  }, [scale]);

  const pulse = useCallback(async () => {
    await scale.sequence([
      () => scale.timing(1.1, 150),
      () => scale.timing(1, 150),
    ]);
  }, [scale]);

  return {
    scale: scale.value,
    scaleIn,
    scaleOut,
    pulse,
  };
};

// Hook for layout animations
// Hook for layout animations
export const useLayoutAnimation = () => {
  const easeInEaseOut = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimationPresets.easeInEaseOut as any);
  }, []);

  const spring = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimationPresets.spring as any);
  }, []);

  const linear = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimationPresets.linear as any);
  }, []);

  return {
    easeInEaseOut,
    spring,
    linear,
  };
};
