import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import type { Invoice } from '../types/payments.types';

interface Props {
  invoice: Invoice;
}

const InvoiceSummary: React.FC<Props> = ({ invoice }) => {
  return (
    <View style={styles.container}>
      {invoice.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text>{item.title} x {item.quantity || 1}</Text>
          <Text>{item.price.toFixed(2)}</Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text variant="h3">Total</Text>
        <Text variant="h3">{invoice.total.toFixed(2)} {invoice.currency || 'USD'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, borderWidth: 1, borderRadius: 8, borderColor: '#eee', backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee', marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
});

export default InvoiceSummary;
