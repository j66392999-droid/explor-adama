import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Collection, FavoriteItem } from '../types/favorites.types';

interface Props {
	visible: boolean;
	onClose: () => void;
	collections: Collection[];
	item: FavoriteItem;
	onToggleItem: (collectionId: string, item: FavoriteItem, included: boolean) => void | Promise<void>;
}

const SaveToListSheet: React.FC<Props> = ({ visible, onClose, collections, item, onToggleItem }) => {
	const renderItem = ({ item: collection }: { item: Collection }) => {
		const included = collection.items.some((i) => i.id === item.id);

		return (
			<View style={styles.row}>
				<Text style={styles.name}>{collection.name}</Text>
				<TouchableOpacity onPress={() => onToggleItem(collection.id, item, included)}>
					<Text style={[styles.action, included ? styles.included : undefined]}>{included ? 'Remove' : 'Add'}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.sheet}>
					<Text style={styles.title}>Save to list</Text>
					<FlatList data={collections} renderItem={renderItem} keyExtractor={(c) => c.id} />
					<TouchableOpacity style={styles.closeBtn} onPress={onClose}>
						<Text style={styles.closeText}>Done</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	sheet: {
		backgroundColor: '#fff',
		padding: 16,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		maxHeight: '70%',
	},
	title: {
		fontWeight: 'bold',
		fontSize: 18,
		marginBottom: 12,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
	},
	name: {},
	action: {
		color: '#007AFF',
	},
	included: {
		color: '#FF3B30',
	},
	closeBtn: {
		marginTop: 12,
		alignSelf: 'flex-end',
		padding: 8,
	},
	closeText: {
		color: '#007AFF',
		fontWeight: 'bold',
	},
});

export default SaveToListSheet;

