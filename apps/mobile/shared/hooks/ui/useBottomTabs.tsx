import React, { createContext, useContext, useRef, useMemo } from 'react';
import { Animated } from 'react-native';

type BottomTabsContextType = {
  animatedValue: Animated.Value;
  hide: (duration?: number) => void;
  show: (duration?: number) => void;
};

const BottomTabsContext = createContext<BottomTabsContextType | null>(null);

export const BottomTabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const animatedValueRef = useRef(new Animated.Value(0)); // 0 = visible, 1 = hidden

  const hide = (duration = 250) => {
    Animated.timing(animatedValueRef.current, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const show = (duration = 200) => {
    Animated.timing(animatedValueRef.current, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const value = useMemo(() => ({ animatedValue: animatedValueRef.current, hide, show }), []);

  return (
    <BottomTabsContext.Provider value={value}>
      {children}
    </BottomTabsContext.Provider>
  );
};

export const useBottomTabs = () => {
  const ctx = useContext(BottomTabsContext);
  if (!ctx) throw new Error('useBottomTabs must be used within BottomTabsProvider');
  return ctx;
};

// Hook to attach to scroll views. Call in a screen to auto-hide/show on user scroll.
export const useHideOnScroll = (threshold = 40) => {
  const { hide, show } = useBottomTabs();
  const lastY = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  const acc = useRef(0); // accumulated delta in current direction
  const dir = useRef<number | null>(null); // 1 = down, -1 = up

  const VELOCITY_THRESHOLD_PX_S = 1000; // px per second to treat as a fling

  const onScroll = (event: any) => {
    const y = event?.nativeEvent?.contentOffset?.y;
    if (typeof y !== 'number') return;

    const now = Date.now();

    if (lastY.current === null) {
      lastY.current = y;
      lastTime.current = now;
      return;
    }

    const dy = y - lastY.current;
    const dt = Math.max(1, (now - (lastTime.current ?? now)));
    const velocity = (dy / dt) * 1000; // px per second

    // ignore tiny jitters
    if (Math.abs(dy) < 2 && Math.abs(velocity) < 50) {
      lastY.current = y;
      lastTime.current = now;
      return;
    }

    // If user flings quickly — use velocity to immediately hide/show with shorter duration
    if (Math.abs(velocity) > VELOCITY_THRESHOLD_PX_S) {
      if (velocity > 0) {
        // scrolling down content (user swiped up) -> hide tabs
        hide(150);
      } else {
        // scrolling up content (user swiped down) -> show tabs
        show(150);
      }
      acc.current = 0;
      dir.current = null;
      lastY.current = y;
      lastTime.current = now;
      return;
    }

    const currentDir = Math.sign(dy) || 0;

    // if direction changed, reset accumulator
    if (dir.current === null || currentDir === dir.current) {
      acc.current += dy;
    } else {
      acc.current = dy;
    }
    dir.current = currentDir;

    // when accumulated movement exceeds threshold, trigger hide/show
    if (acc.current > threshold) {
      hide();
      acc.current = 0;
      dir.current = null;
    } else if (acc.current < -threshold) {
      show();
      acc.current = 0;
      dir.current = null;
    }

    lastY.current = y;
    lastTime.current = now;
  };

  return { onScroll, scrollEventThrottle: 16 } as const;
};

export default useBottomTabs;
