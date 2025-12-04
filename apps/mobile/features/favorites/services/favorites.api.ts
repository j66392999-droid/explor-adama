import { FavoriteItem, Collection } from '../types/favorites.types';

// In-memory store for simulation
let favoriteStore: Record<string, FavoriteItem> = {};
let collectionsStore: Collection[] = [
	{ id: 'col-1', name: 'Saved', description: 'Saved items', items: [], createdAt: new Date().toISOString() },
];

export const fetchFavorites = async (): Promise<FavoriteItem[]> => {
	return new Promise((resolve) => setTimeout(() => resolve(Object.values(favoriteStore)), 200));
};

export const fetchCollections = async (): Promise<Collection[]> => {
	return new Promise((resolve) => setTimeout(() => resolve(collectionsStore), 200));
};

export const toggleFavorite = async (item: FavoriteItem): Promise<{ id: string; favorite: boolean }> => {
	const exists = !!favoriteStore[item.id];
	if (exists) {
		delete favoriteStore[item.id];
	} else {
		favoriteStore[item.id] = item;
	}
	return new Promise((resolve) => setTimeout(() => resolve({ id: item.id, favorite: !exists }), 200));
};

export const createCollection = async (name: string, description?: string): Promise<Collection> => {
	const collection: Collection = {
		id: `col-${Date.now()}`,
		name,
		description,
		items: [],
		createdAt: new Date().toISOString(),
	};
	collectionsStore.push(collection);
	return new Promise((resolve) => setTimeout(() => resolve(collection), 200));
};

export const addItemToCollection = async (collectionId: string, item: FavoriteItem): Promise<void> => {
	const col = collectionsStore.find((c) => c.id === collectionId);
	if (col) {
		col.items.push(item);
	}
	return new Promise((resolve) => setTimeout(() => resolve(), 200));
};

export const removeItemFromCollection = async (collectionId: string, itemId: string): Promise<void> => {
	const col = collectionsStore.find((c) => c.id === collectionId);
	if (col) {
		col.items = col.items.filter((i) => i.id !== itemId);
	}
	return new Promise((resolve) => setTimeout(() => resolve(), 200));
};

export default {
	fetchFavorites,
	fetchCollections,
	toggleFavorite,
	createCollection,
	addItemToCollection,
	removeItemFromCollection,
};

