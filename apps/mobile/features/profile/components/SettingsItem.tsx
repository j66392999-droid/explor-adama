import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';

interface Props {
	title: string;
	subtitle?: string;
	onPress?: () => void;
}

export const SettingsItem: React.FC<Props> = ({ title, subtitle, onPress }) => (
	<TouchableOpacity onPress={onPress} style={styles.container}>
		<View style={styles.content}>
			<Text variant="body" style={styles.title}>{title}</Text>
			{subtitle ? <Text variant="caption" style={styles.subtitle}>{subtitle}</Text> : null}
		</View>
	</TouchableOpacity>
);

const styles = StyleSheet.create({
	container: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
	content: { flex: 1 },
	title: { fontWeight: '600' },
	subtitle: { opacity: 0.7 },
});

export default SettingsItem;

