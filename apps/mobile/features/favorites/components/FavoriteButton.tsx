import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';


interface Props {
  isFavorite: boolean;
  onToggle: () => void | Promise<void>;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loading?: boolean; // backward compat
}

export const FavoriteButton: React.FC<Props> = ({ isFavorite, onToggle, size = 'small', isLoading = false, loading }) => {
  return (
    <TouchableOpacity onPress={() => onToggle()} style={styles.button}>
      <Text>{isFavorite ? '★' : '☆'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});

export default FavoriteButton;
