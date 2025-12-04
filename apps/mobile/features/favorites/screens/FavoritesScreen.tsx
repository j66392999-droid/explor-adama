import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import useFavorites from '../hooks/useFavorites';
import FavoriteButton from '../components/FavoriteButton';
import SaveToListSheet from '../components/SaveToListSheet';
import { FavoriteItem } from '../types/favorites.types';

const FavoritesScreen: React.FC = () => {
	const { favorites, collections, isLoading, toggle, addToCollection, removeFromCollection } = useFavorites();
	const [sheetVisible, setSheetVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<FavoriteItem | null>(null);

	const handleToggle = (item: FavoriteItem) => {
		toggle(item);
	};

	const handleOpenSheet = (item: FavoriteItem) => {
		setSelectedItem(item);
		setSheetVisible(true);
	};

	const handleToggleItemInCollection = async (collectionId: string, item: FavoriteItem, included: boolean) => {
		if (included) {
			await removeFromCollection(collectionId, item.id);
		} else {
			await addToCollection(collectionId, item);
		}
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={favorites}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.row}>
						<TouchableOpacity style={styles.item} onPress={() => handleOpenSheet(item)}>
							<Text style={styles.title}>{item.title}</Text>
						</TouchableOpacity>
						<FavoriteButton isFavorite onToggle={() => handleToggle(item)} />
					</View>
				)}
				refreshing={isLoading}
				onRefresh={() => {}}
			/>
			{selectedItem && (
				<SaveToListSheet
					visible={sheetVisible}
					onClose={() => setSheetVisible(false)}
					collections={collections}
					item={selectedItem}
					onToggleItem={handleToggleItemInCollection}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
	item: {
		flex: 1,
		marginRight: 12,
	},
	title: {
		fontSize: 16,
	},
});

export { FavoritesScreen };
export default FavoritesScreen;

