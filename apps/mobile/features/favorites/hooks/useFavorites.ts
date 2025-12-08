import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { logger } from '../../../shared/utils/logging/logger';
import { favoritesApi } from '../services/favorites.api';
import { 
  Favorite, 
  Collection, 
  CreateCollectionInput, 
  AddToCollectionInput,
  UpdateCollectionInput,
  FavoritesState 
} from '../types/favorites.types';

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [state, setState] = useState<FavoritesState>({
    favorites: [],
    collections: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    selectedCollection: null,
  });

  // Load favorites
  const loadFavorites = useCallback(async (isRefresh = false) => {
    if (!user) return;

    try {
      if (!isRefresh) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      } else {
        setState(prev => ({ ...prev, isRefreshing: true, error: null }));
      }

      const response = await favoritesApi.getFavorites();
      
      setState(prev => ({
        ...prev,
        favorites: response.data,
        isLoading: false,
        isRefreshing: false,
      }));

      logger.debug('Favorites loaded', { count: response.data.length });
    } catch (error: any) {
      logger.error('Failed to load favorites', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load favorites',
        isLoading: false,
        isRefreshing: false,
      }));
    }
  }, [user]);

  // Load collections
  const loadCollections = useCallback(async () => {
    if (!user) return;

    try {
      const response = await favoritesApi.getCollections();
      
      setState(prev => ({
        ...prev,
        collections: response.data,
      }));

      logger.debug('Collections loaded', { count: response.data.length });
    } catch (error: any) {
      logger.error('Failed to load collections', error);
    }
  }, [user]);

  // Add to favorites
  const addToFavorites = useCallback(async (itemId: string, itemType: 'PLACE' | 'EVENT'): Promise<Favorite> => {
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    try {
      const favorite = await favoritesApi.addFavorite(itemId, itemType);
      
      // Update local state
      setState(prev => ({
        ...prev,
        favorites: [...prev.favorites, favorite],
      }));

      logger.info('Added to favorites', { itemId, itemType });
      return favorite;
    } catch (error: any) {
      logger.error('Failed to add to favorites', error);
      throw error;
    }
  }, [user]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (itemId: string, itemType: 'PLACE' | 'EVENT'): Promise<void> => {
    if (!user) return;

    try {
      // Find the favorite ID
      const favorite = state.favorites.find(
        f => f.itemId === itemId && f.itemType === itemType
      );

      if (favorite) {
        await favoritesApi.removeFavorite(favorite.id);
        
        // Update local state
        setState(prev => ({
          ...prev,
          favorites: prev.favorites.filter(f => f.id !== favorite.id),
        }));

        logger.info('Removed from favorites', { itemId, itemType });
      }
    } catch (error: any) {
      logger.error('Failed to remove from favorites', error);
      throw error;
    }
  }, [user, state.favorites]);

  // Check if item is favorited
  const isFavorite = useCallback((itemId: string, itemType: 'PLACE' | 'EVENT'): boolean => {
    return state.favorites.some(
      favorite => favorite.itemId === itemId && favorite.itemType === itemType
    );
  }, [state.favorites]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (itemId: string, itemType: 'PLACE' | 'EVENT'): Promise<void> => {
    if (isFavorite(itemId, itemType)) {
      await removeFromFavorites(itemId, itemType);
    } else {
      await addToFavorites(itemId, itemType);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Create collection
  const createCollection = useCallback(async (data: CreateCollectionInput): Promise<Collection> => {
    if (!user) {
      throw new Error('You must be logged in to create collections');
    }

    try {
      const collection = await favoritesApi.createCollection(data);
      
      setState(prev => ({
        ...prev,
        collections: [...prev.collections, collection],
      }));

      logger.info('Collection created', { collectionId: collection.id });
      return collection;
    } catch (error: any) {
      logger.error('Failed to create collection', error);
      throw error;
    }
  }, [user]);

  // Add item to collection
  const addToCollection = useCallback(async (data: AddToCollectionInput): Promise<void> => {
    if (!user) return;

    try {
      await favoritesApi.addToCollection(data);
      
      // Update the collection in state
      setState(prev => {
        const updatedCollections = prev.collections.map(collection => {
          if (collection.id === data.collectionId) {
            return {
              ...collection,
              itemCount: collection.itemCount + 1,
            };
          }
          return collection;
        });

        return { ...prev, collections: updatedCollections };
      });

      logger.info('Added to collection', data);
    } catch (error: any) {
      logger.error('Failed to add to collection', error);
      throw error;
    }
  }, [user]);

  // Update collection
  const updateCollection = useCallback(async (collectionId: string, data: UpdateCollectionInput): Promise<Collection> => {
    if (!user) {
      throw new Error('You must be logged in to update collections');
    }

    try {
      const updated = await favoritesApi.updateCollection(collectionId, data);

      setState(prev => ({
        ...prev,
        collections: prev.collections.map(c => (c.id === updated.id ? updated : c)),
        selectedCollection: prev.selectedCollection?.id === updated.id ? updated : prev.selectedCollection,
      }));

      logger.info('Collection updated', { collectionId: updated.id });
      return updated;
    } catch (error: any) {
      logger.error('Failed to update collection', error);
      throw error;
    }
  }, [user]);

  // Select collection
  const selectCollection = useCallback(async (collectionId: string) => {
    try {
      const collection = await favoritesApi.getCollection(collectionId);
      setState(prev => ({ ...prev, selectedCollection: collection }));
    } catch (error: any) {
      logger.error('Failed to load collection', error);
      throw error;
    }
  }, []);

  // Clear selected collection
  const clearSelectedCollection = useCallback(() => {
    setState(prev => ({ ...prev, selectedCollection: null }));
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([loadFavorites(true), loadCollections()]);
  }, [loadFavorites, loadCollections]);

  // Initialize
  useEffect(() => {
    if (user) {
      loadFavorites();
      loadCollections();
    }
  }, [user, loadFavorites, loadCollections]);

  return {
    // State
    ...state,
    
    // Actions
    loadFavorites,
    loadCollections,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    createCollection,
    addToCollection,
    updateCollection,
    selectCollection,
    clearSelectedCollection,
    refresh,
    
    // Derived state
    hasFavorites: state.favorites.length > 0,
    hasCollections: state.collections.length > 0,
    favoritesCount: state.favorites.length,
    collectionsCount: state.collections.length,
  };
};

export const useFavoritesAnalytics = () => {
  const recordFavoriteAction = useCallback((action: 'add' | 'remove', itemType: string, itemId: string) => {
    logger.info('Favorite action recorded', {
      action,
      itemType,
      itemId,
      timestamp: Date.now(),
    });
  }, []);

  const recordCollectionAction = useCallback((action: 'create' | 'update' | 'delete', collectionId: string) => {
    logger.info('Collection action recorded', {
      action,
      collectionId,
      timestamp: Date.now(),
    });
  }, []);

  return {
    recordFavoriteAction,
    recordCollectionAction,
  };
};