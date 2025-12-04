import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';

interface Props {
  navigation?: any;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = {
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/96',
    bio: 'Explorer and adventurer',
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.bio}>{user.bio}</Text>
      <View style={styles.actions}>
        <Button title="Edit profile" onPress={() => navigation?.navigate('EditProfile')} />
        <Button title="Settings" onPress={() => navigation?.navigate('Settings')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
