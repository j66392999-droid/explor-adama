import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { Text } from '../ui/Typography/Text';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onHide: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  position?: 'top' | 'bottom' | 'center';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  duration = 3000,
  onHide,
  type = 'info',
  position = 'top',
}) => {
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim]);

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return colors.primary;
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: 60 };
      case 'bottom':
        return { bottom: 60 };
      case 'center':
        return { top: '50%' as '50%', marginTop: -25 };
      default:
        return { top: 60 };
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: position === 'top' ? [-50, 0] : position === 'bottom' ? [50, 0] : [0, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  message: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
});