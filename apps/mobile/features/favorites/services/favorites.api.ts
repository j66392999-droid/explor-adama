import { apiClient } from '../../../shared/services/api/client';
import { 
  Favorite, 
  Collection, 
  CreateCollectionInput, 
  AddToCollectionInput,
  UpdateCollectionInput,
  PaginatedFavoritesResponse,
  PaginatedCollectionsResponse, 
  CollectionItem
} from '../types/favorites.types';

export const favoritesApi = {
  // Favorites
  async getFavorites(page = 1, limit = 20): Promise<PaginatedFavoritesResponse> {
    const response = await apiClient.get<PaginatedFavoritesResponse>('/favorites', {
      params: { page, limit },
    });
    return response.data || {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  },

  async addFavorite(itemId: string, itemType: 'PLACE' | 'EVENT'): Promise<Favorite> {
    const response = await apiClient.post<Favorite>('/favorites', { itemId, itemType });
    if (!response.data) {
      throw new Error('Failed to add to favorites');
    }
    return response.data;
  },

  async removeFavorite(favoriteId: string): Promise<void> {
    await apiClient.delete(`/favorites/${favoriteId}`);
  },

  async checkFavorite(itemId: string, itemType: 'PLACE' | 'EVENT'): Promise<boolean> {
    const response = await apiClient.get<{ isFavorite: boolean }>('/favorites/check', {
      params: { itemId, itemType },
    });
    return response.data?.isFavorite || false;
  },

  // Collections
  async getCollections(page = 1, limit = 20): Promise<PaginatedCollectionsResponse> {
    const response = await apiClient.get<PaginatedCollectionsResponse>('/collections', {
      params: { page, limit },
    });
    return response.data || {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  },

  async getCollection(collectionId: string): Promise<Collection> {
    const response = await apiClient.get<Collection>(`/collections/${collectionId}`);
    if (!response.data) {
      throw new Error('Collection not found');
    }
    return response.data;
  },

  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    const response = await apiClient.post<Collection>('/collections', data);
    if (!response.data) {
      throw new Error('Failed to create collection');
    }
    return response.data;
  },

  async updateCollection(collectionId: string, data: UpdateCollectionInput): Promise<Collection> {
    const response = await apiClient.put<Collection>(`/collections/${collectionId}`, data);
    if (!response.data) {
      throw new Error('Failed to update collection');
    }
    return response.data;
  },

  async deleteCollection(collectionId: string): Promise<void> {
    await apiClient.delete(`/collections/${collectionId}`);
  },

  async addToCollection(data: AddToCollectionInput): Promise<CollectionItem> {
    const response = await apiClient.post<CollectionItem>('/collections/items', data);
    if (!response.data) {
      throw new Error('Failed to add item to collection');
    }
    return response.data;
  },

  async removeFromCollection(collectionItemId: string): Promise<void> {
    await apiClient.delete(`/collections/items/${collectionItemId}`);
  },

  async getCollectionItems(collectionId: string, page = 1, limit = 20): Promise<PaginatedFavoritesResponse> {
    const response = await apiClient.get<PaginatedFavoritesResponse>(`/collections/${collectionId}/items`, {
      params: { page, limit },
    });
    return response.data || {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  },

  // Bulk operations
  async moveToCollection(favoriteIds: string[], collectionId: string): Promise<void> {
    await apiClient.post('/favorites/move', { favoriteIds, collectionId });
  },

  async copyToCollection(favoriteIds: string[], collectionId: string): Promise<void> {
    await apiClient.post('/favorites/copy', { favoriteIds, collectionId });
  },
};

export default favoritesApi;