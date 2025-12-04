import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
interface Props {
	token: string;
	size?: number;
}

const QRCodeDisplay: React.FC<Props> = ({ token, size = 200 }) => {
	let Qr: any = null;
	try {
		// Try to require the optional dependency at runtime so builds don't crash if it's absent
		// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
		Qr = require('react-native-qrcode-svg').default;
	} catch (e) {
		Qr = null;
	}

	return (
		<View style={styles.container}>
			{Qr ? (
				<Qr size={size} value={token} />
			) : (
				<View style={{ alignItems: 'center' }}>
					<Text variant="caption">QR Token: {token}</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { alignItems: 'center', justifyContent: 'center', padding: 12 },
});

export default QRCodeDisplay;

