import React from 'react';
import { View, FlatList, StyleSheet, Button } from 'react-native';
import useFavorites from '../hooks/useFavorites';
import CollectionCard from '../components/CollectionCard';

const CollectionsScreen: React.FC = ({ navigation }: any) => {
	const { collections } = useFavorites();

	return (
		<View style={styles.container}>
			<Button title="Create Collection" onPress={() => navigation?.navigate('CreateCollection')} />
			<FlatList data={collections} keyExtractor={(c) => c.id} renderItem={({ item }) => <CollectionCard collection={item} onPress={() => navigation?.navigate('CollectionDetail', { collectionId: item.id })} />} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
});

export { CollectionsScreen };
export default CollectionsScreen;

