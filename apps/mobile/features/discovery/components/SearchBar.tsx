import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  style?: any;
}

export const SearchBar: React.FC<Props> = ({ value, onChangeText, onSubmit, placeholder = 'Search', style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leftIcon={
          <Image
            source={require('../../../../assets/images/icons/search.png')}
            style={{ width: 20, height: 20 }}
          />
        }
        onSubmitEditing={onSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
