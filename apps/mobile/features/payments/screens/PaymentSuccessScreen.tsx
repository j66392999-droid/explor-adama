import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { usePayments } from '../hooks/usePayments';
import { Loading } from '../../../components/ui/Loading';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

export const PaymentSuccessScreen: React.FC = ({ route, navigation }: any) => {
	const { paymentId } = route.params || {};
	const { getStatus, currentPayment, status } = usePayments();
	const [loading, setLoading] = useState(false);
	const { colors } = useTheme();

	useEffect(() => {
		if (paymentId) {
			(async () => {
				setLoading(true);
				await getStatus(paymentId);
				setLoading(false);
			})();
		}
	}, [paymentId]);

	if (loading) return <Loading />;

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			<View style={styles.inner}>
				<Text variant="h1">Payment complete!</Text>
				<Text>Payment ID: {paymentId}</Text>
				<Text>Status: {status}</Text>
				<Button title="Done" onPress={() => navigation?.navigate('Home')} />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	inner: { padding: 16, alignItems: 'center', justifyContent: 'center' },
});

export default PaymentSuccessScreen;

