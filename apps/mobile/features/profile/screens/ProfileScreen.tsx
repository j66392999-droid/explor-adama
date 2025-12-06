import React, { useRef } from 'react';
import { Animated, Text, Image, StyleSheet, Button, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  navigation?: any;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = {
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/96',
    bio: 'Explorer and adventurer',
  };

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_HEIGHT = 160;
  const SHRINK_DISTANCE = 80;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, SHRINK_DISTANCE],
    outputRange: [0, -SHRINK_DISTANCE / 2],
    extrapolate: 'clamp',
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, SHRINK_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const nameScale = scrollY.interpolate({
    inputRange: [0, SHRINK_DISTANCE],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  return (
    <Animated.ScrollView
      contentContainerStyle={[styles.container, { paddingTop: HEADER_HEIGHT }]}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
    >
      <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }], paddingTop: insets.top || 16 }]} pointerEvents="none">
        <Animated.Image
          source={{ uri: user.avatar }}
          style={[styles.avatar, { transform: [{ scale: avatarScale }], borderRadius: 48 } ]}
        />
        <Animated.Text style={[styles.name, { transform: [{ scale: nameScale }] }]}>{user.name}</Animated.Text>
        <Animated.Text style={[styles.bio, { opacity: 0.9 }]}>{user.bio}</Animated.Text>
      </Animated.View>

      <Animated.View style={styles.content}>
        <View style={styles.actions}>
          <Button title="Edit profile" onPress={() => navigation?.navigate('EditProfile')} />
          <Button title="Settings" onPress={() => navigation?.navigate('Settings')} />
        </View>
        {/* additional profile content placeholder */}
      </Animated.View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  bio: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actions: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export { ProfileScreen };
export default ProfileScreen;
