import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { Button } from '../../../components/ui/Button';

// Placeholder scanner screen. If you have an actual QR library like 'react-native-camera', replace this with it.
const QRScannerScreen: React.FC = ({ navigation }: any) => {
	const { colors } = useTheme();

	const handleSimulateScan = () => {
		// Simulate scanning a ticket QR and navigating to the result
		const sampleTicketId = '1234567890';
		navigation?.navigate('TicketDetail', { ticketId: sampleTicketId });
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			<View style={styles.inner}>
				<Text>Scanner Placeholder</Text>
				<Button title="Simulate Scan" onPress={handleSimulateScan} />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({ container: { flex: 1 }, inner: { flex: 1, alignItems: 'center', justifyContent: 'center' } });

export default QRScannerScreen;

