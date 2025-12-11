import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../shared/hooks/state/useAppSelector';
import { useRouter } from 'expo-router';
import useFallbackNavigation from '../../shared/hooks/navigation/useFallbackNavigation';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabs } from '../../shared/hooks/ui/useBottomTabs';

const TopProfileButton: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  // Call hooks unconditionally (avoid early returns before hooks)
  const bottomTabsCtx = useBottomTabs();
  const nav = useFallbackNavigation();

  // Hide the floating profile button when already on the profile screen
  const path = (router as any).pathname || (router as any).asPath || '';
  if (typeof path === 'string' && path.includes('profile')) return null;

  // Read bottom-tabs animated value and drive top button hide/show
  const av = bottomTabsCtx?.animatedValue ?? new Animated.Value(0);
  const translateY: any = av.interpolate ? av.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) : 0;
  const opacity: any = av.interpolate ? av.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) : 1;

  return (
    <Animated.View pointerEvents="box-none" style={[styles.container, { top: insets.top || 12, transform: [{ translateY }], opacity }]}> 
      <TouchableOpacity
        onPress={() => nav?.navigate('Profile')}
        style={styles.button}
        activeOpacity={0.8}
      >
        {user?.profile?.avatar ? (
          <Image source={{ uri: user.profile.avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="person" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    zIndex: 50,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});

export default TopProfileButton;
