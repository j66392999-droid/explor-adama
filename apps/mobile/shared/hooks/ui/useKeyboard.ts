import { useState, useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardEvent,
  Platform,
  EmitterSubscription,
  Animated,
} from 'react-native';

// Keyboard event types
interface KeyboardMetrics {
  height: number;
  duration: number;
  easing: 'easeIn' | 'easeOut' | 'easeInEaseOut' | 'linear' | 'keyboard';
}

interface KeyboardState {
  isVisible: boolean;
  height: number;
  duration: number;
  easing: string;
}

// Main keyboard hook
export const useKeyboard = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    duration: 0,
    easing: 'easeInEaseOut',
  });

  useEffect(() => {
    const keyboardWillShowSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardState({
          isVisible: true,
          height: event.endCoordinates.height,
          duration: event.duration || 250,
          easing: event.easing || 'easeInEaseOut',
        });
      }
    );

    const keyboardWillHideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event: KeyboardEvent) => {
        setKeyboardState({
          isVisible: false,
          height: 0,
          duration: event.duration || 250,
          easing: event.easing || 'easeInEaseOut',
        });
      }
    );

    const keyboardWillChangeFrameSub = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillChangeFrame', (event: KeyboardEvent) => {
          setKeyboardState(prev => ({
            ...prev,
            height: event.endCoordinates.height,
            duration: event.duration || 250,
            easing: event.easing || 'easeInEaseOut',
          }));
        })
      : null;

    return () => {
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
      keyboardWillChangeFrameSub?.remove();
    };
  }, []);

  return keyboardState;
};

// Hook for keyboard-aware animations
export const useKeyboardAnimation = () => {
  const keyboardState = useKeyboard();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (keyboardState.isVisible) {
      Animated.timing(translateY, {
        toValue: -keyboardState.height,
        duration: keyboardState.duration,
        easing: getEasingFunction(keyboardState.easing),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 0,
        duration: keyboardState.duration,
        easing: getEasingFunction(keyboardState.easing),
        useNativeDriver: true,
      }).start();
    }
  }, [keyboardState, translateY]);

  return {
    translateY,
    keyboardHeight: keyboardState.height,
    isKeyboardVisible: keyboardState.isVisible,
    keyboardDuration: keyboardState.duration,
  };
};

// Hook for keyboard dismiss
export const useKeyboardDismiss = () => {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const dismissOnPress = () => {
    Keyboard.dismiss();
  };

  return {
    dismissKeyboard,
    dismissOnPress,
  };
};

// Hook for keyboard avoidance
export const useKeyboardAvoidance = (offset: number = 0) => {
  const keyboardState = useKeyboard();
  const paddingBottom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (keyboardState.isVisible) {
      Animated.timing(paddingBottom, {
        toValue: keyboardState.height + offset,
        duration: keyboardState.duration,
        easing: getEasingFunction(keyboardState.easing),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(paddingBottom, {
        toValue: 0,
        duration: keyboardState.duration,
        easing: getEasingFunction(keyboardState.easing),
        useNativeDriver: false,
      }).start();
    }
  }, [keyboardState, paddingBottom, offset]);

  return {
    paddingBottom,
    keyboardHeight: keyboardState.height,
    isKeyboardVisible: keyboardState.isVisible,
  };
};

// Hook for scroll view keyboard handling
export const useScrollViewKeyboard = (scrollViewRef: React.RefObject<any>) => {
  const keyboardState = useKeyboard();

  const scrollToFocusedInput = (event: any) => {
    if (!scrollViewRef.current || !keyboardState.isVisible) return;

    const { height: keyboardHeight } = keyboardState;
    
    // Get the focused input position
    const inputY = event.nativeEvent.target.offsetTop;
    
    // Scroll to make the input visible above the keyboard
    scrollViewRef.current.scrollTo({
      y: inputY - 100, // Adjust offset as needed
      animated: true,
    });
  };

  return {
    scrollToFocusedInput,
    isKeyboardVisible: keyboardState.isVisible,
    keyboardHeight: keyboardState.height,
  };
};

// Hook for form keyboard handling
export const useFormKeyboard = () => {
  const keyboardState = useKeyboard();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const onInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const onInputBlur = () => {
    setFocusedInput(null);
  };

  const isInputFocused = (inputName: string) => {
    return focusedInput === inputName;
  };

  return {
    onInputFocus,
    onInputBlur,
    isInputFocused,
    focusedInput,
    isKeyboardVisible: keyboardState.isVisible,
    keyboardHeight: keyboardState.height,
  };
};

// Hook for keyboard toolbar
export const useKeyboardToolbar = (inputRefs: React.RefObject<any>[]) => {
  const [currentInputIndex, setCurrentInputIndex] = useState<number>(-1);

  const focusNext = () => {
    if (currentInputIndex < inputRefs.length - 1) {
      const nextIndex = currentInputIndex + 1;
      inputRefs[nextIndex]?.current?.focus();
      setCurrentInputIndex(nextIndex);
    } else {
      Keyboard.dismiss();
      setCurrentInputIndex(-1);
    }
  };

  const focusPrevious = () => {
    if (currentInputIndex > 0) {
      const prevIndex = currentInputIndex - 1;
      inputRefs[prevIndex]?.current?.focus();
      setCurrentInputIndex(prevIndex);
    }
  };

  const onInputFocus = (index: number) => {
    setCurrentInputIndex(index);
  };

  const hasNext = currentInputIndex < inputRefs.length - 1;
  const hasPrevious = currentInputIndex > 0;

  return {
    focusNext,
    focusPrevious,
    onInputFocus,
    hasNext,
    hasPrevious,
    currentInputIndex,
  };
};

// Hook for keyboard status with custom callbacks
export const useKeyboardStatus = (
  callbacks?: {
    onShow?: (height: number) => void;
    onHide?: () => void;
  }
) => {
  const keyboardState = useKeyboard();

  useEffect(() => {
    if (keyboardState.isVisible && callbacks?.onShow) {
      callbacks.onShow(keyboardState.height);
    } else if (!keyboardState.isVisible && callbacks?.onHide) {
      callbacks.onHide();
    }
  }, [keyboardState.isVisible, keyboardState.height, callbacks]);

  return keyboardState;
};

// Utility function to get easing function from string
const getEasingFunction = (easing: string) => {
  switch (easing) {
    case 'easeIn':
      return require('react-native').Easing.in(require('react-native').Easing.ease);
    case 'easeOut':
      return require('react-native').Easing.out(require('react-native').Easing.ease);
    case 'easeInEaseOut':
      return require('react-native').Easing.inOut(require('react-native').Easing.ease);
    case 'linear':
      return require('react-native').Easing.linear;
    case 'keyboard':
    default:
      return require('react-native').Easing.inOut(require('react-native').Easing.ease);
  }
};

// Hook for measuring keyboard space
export const useKeyboardSpace = (minSpace: number = 0) => {
  const keyboardState = useKeyboard();

  const getKeyboardSpace = () => {
    return Math.max(keyboardState.height, minSpace);
  };

  return {
    keyboardSpace: getKeyboardSpace(),
    isKeyboardVisible: keyboardState.isVisible,
    keyboardHeight: keyboardState.height,
  };
};

// Hook for keyboard-aware modal
export const useKeyboardModal = () => {
  const keyboardState = useKeyboard();
  const modalPaddingBottom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (keyboardState.isVisible) {
      Animated.timing(modalPaddingBottom, {
        toValue: keyboardState.height,
        duration: keyboardState.duration,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(modalPaddingBottom, {
        toValue: 0,
        duration: keyboardState.duration,
        useNativeDriver: false,
      }).start();
    }
  }, [keyboardState, modalPaddingBottom]);

  return {
    modalPaddingBottom,
    isKeyboardVisible: keyboardState.isVisible,
    keyboardHeight: keyboardState.height,
  };
};