import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Collection } from '../types/favorites.types';

interface Props {
	collection: Collection;
	onPress?: (id: string) => void;
}

const CollectionCard: React.FC<Props> = ({ collection, onPress }) => {
	return (
		<TouchableOpacity style={styles.card} onPress={() => onPress?.(collection.id)}>
			<View style={styles.content}>
				<Text style={styles.name}>{collection.name}</Text>
				<Text style={styles.meta}>{collection.items.length} items</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		backgroundColor: '#fff',
	},
	content: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	name: {
		fontWeight: 'bold',
	},
	meta: {
		color: '#888',
	},
});

export default CollectionCard;

