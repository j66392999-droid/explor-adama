import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import type { PaymentMethod } from '../types/payments.types';

interface Props {
  methods: PaymentMethod[];
  value?: string;
  onChange?: (id: string) => void;
}

const PaymentMethods: React.FC<Props> = ({ methods = [], value, onChange }) => {
  const [selected, setSelected] = useState(value || (methods[0]?.id ?? ''));

  const handlePress = (id: string) => {
    setSelected(id);
    onChange?.(id);
  };

  return (
    <View style={styles.container}>
      {methods.map((m) => (
        <TouchableOpacity key={m.id} style={[styles.method, selected === m.id && styles.selected]} onPress={() => handlePress(m.id)}>
          <Text style={styles.methodText}>{m.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  method: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  selected: { borderColor: '#007AFF' },
  methodText: { fontSize: 14 },
});

export default PaymentMethods;
