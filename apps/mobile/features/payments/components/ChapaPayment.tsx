import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

interface Props {
  amount: number;
  currency?: string;
  onStart?: () => void;
}

const ChapaPayment: React.FC<Props> = ({ amount, currency = 'USD', onStart }) => {
  const handleStart = () => {
    // Placeholder: integrate with a real Chapa SDK or redirect to a web checkout
    onStart?.();
  };

  return (
    <View style={styles.container}>
      <Button title={`Pay ${amount.toFixed(2)} ${currency} with Chapa`} onPress={handleStart} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { marginTop: 12 } });

export default ChapaPayment;
