import React from 'react';
import { View, FlatList, StyleSheet, Button } from 'react-native';
import { useFavorites } from '../hooks/useFavorites';
import { useHideOnScroll } from '../../../shared/hooks/ui/useBottomTabs';
import { CollectionCard } from '../components/CollectionCard';

const CollectionsScreen: React.FC = ({ navigation }: any) => {
	const { collections } = useFavorites();

	const { onScroll, scrollEventThrottle } = useHideOnScroll();

	return (
		<View style={styles.container}>
			<Button title="Create Collection" onPress={() => navigation?.navigate('CreateCollection')} />
			<FlatList
				data={collections}
				keyExtractor={(c) => c.id}
				renderItem={({ item }) => <CollectionCard collection={item} onPress={() => navigation?.navigate('CollectionDetail', { collectionId: item.id })} />}
				onScroll={onScroll}
				scrollEventThrottle={scrollEventThrottle}
			/>
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

