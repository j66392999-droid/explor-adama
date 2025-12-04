import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import InvoiceSummary from '../components/InvoiceSummary';
import PaymentMethods from '../components/PaymentMethods';
import ChapaPayment from '../components/ChapaPayment';
import { usePayments } from '../hooks/usePayments';
import { Loading } from '../../../components/ui/Loading';
import type { Invoice } from '../types/payments.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type PaymentScreenProps = {
	route: RouteProp<{ params: { invoice: Invoice } }, 'params'>;
	navigation: any;
};

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ route, navigation }) => {
	const { invoice } = route.params;
	const { methods, loading, createPayment, currentPayment, status, getStatus } = usePayments();
	const [selectedMethod, setSelectedMethod] = useState<string | undefined>(methods?.[0]?.id);
	const { colors } = useTheme();

	useEffect(() => {
		if (!currentPayment || !status) return;
		if (status === 'SUCCESS') {
			navigation?.replace('PaymentSuccess', { paymentId: currentPayment.id });
		} else if (status === 'FAILED') {
			Alert.alert('Payment failed', 'Please try again or use another payment method.');
		}
	}, [status, currentPayment]);

	const handlePay = async () => {
		try {
			await createPayment(invoice.total, selectedMethod, invoice.currency);
		} catch (error) {
			Alert.alert('Error', 'Failed to start payment');
		}
	};

	if (loading && !methods?.length) return <Loading />;

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			<View style={styles.inner}>
				<Text variant="h2">Checkout</Text>
				<InvoiceSummary invoice={invoice} />

				<Text style={styles.sectionTitle}>Payment method</Text>
				<PaymentMethods methods={methods} value={selectedMethod} onChange={setSelectedMethod} />

				{selectedMethod === 'chapa' && (
					<ChapaPayment amount={invoice.total} currency={invoice.currency} onStart={() => handlePay()} />
				)}

				<View style={styles.actions}>
					<Button title="Pay" onPress={handlePay} />
					<Button title="Check status" onPress={() => currentPayment && getStatus(currentPayment.id)} />
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	inner: { padding: 16, gap: 12 },
	sectionTitle: { marginTop: 12, marginBottom: 8 },
	actions: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
});

export default PaymentScreen;

