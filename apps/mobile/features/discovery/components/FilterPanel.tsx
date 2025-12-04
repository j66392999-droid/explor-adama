import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { CheckboxGroup } from '../../../components/ui/Checkbox';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface Props {
  visible?: boolean;
  filters: any;
  onApply?: (filters: any) => void;
  onClose?: () => void;
  onChange?: (filters: any) => void;
  style?: any;
}

export const FilterPanel: React.FC<Props> = ({ visible = false, filters, onApply, onClose, onChange, style }) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Minimal placeholder: you should extend this to match design */}
      <TouchableOpacity onPress={() => onChange?.({ ...filters, priceRange: [0, 4] })}>
        <Text>Reset Filters</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onApply?.(filters)}>
        <Text>Apply</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onClose?.()}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
  },
});
