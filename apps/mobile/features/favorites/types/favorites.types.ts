import { Place, Event } from '../../discovery/types/discovery.types';
import { RecommendationItemType } from '../../../shared/types/api.types';

export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: RecommendationItemType;
  createdAt: string;
  item?: Place | Event;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  coverImage?: string;
  items: CollectionItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  itemId: string;
  itemType: RecommendationItemType;
  addedAt: string;
  item?: Place | Event;
}

export interface FavoritesState {
  favorites: Favorite[];
  collections: Collection[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  selectedCollection: Collection | null;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  isPrivate: boolean;
  coverImage?: string;
}

export interface AddToCollectionInput {
  collectionId: string;
  itemId: string;
  itemType: RecommendationItemType;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  coverImage?: string;
}

export interface PaginatedFavoritesResponse {
  data: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedCollectionsResponse {
  data: Collection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}