export interface FavoriteItem {
	id: string;
	title: string;
	type?: string; // e.g., 'post' | 'service' | 'place'
	thumbnail?: string | null;
	createdAt?: string;
}

export interface Collection {
	id: string;
	name: string;
	description?: string;
	items: FavoriteItem[];
	createdAt?: string;
}

export interface ToggleResult {
	id: string;
	favorite: boolean;
}

export type FavoriteType = 'post' | 'service' | 'place' | string;

export default FavoriteItem;

