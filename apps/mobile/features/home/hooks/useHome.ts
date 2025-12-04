import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/state/useAppSelector';
import { homeApi } from '../services/home.api';
import { HomeData, Place, Event, Recommendation } from '../types/home.types';
import { PaginatedResponse } from '../../../shared/types/api.types';
import { logger } from '../../../shared/utils/logging/logger';
import { setLoading, setError } from '../../../store/slices/app/app.slice';

export const useHome = () => {
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector(state => state.app);
  
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  // Load home data
  const loadHomeData = useCallback(async (isRefresh = false) => {
    if (!isConnected) {
      setLocalError('No internet connection');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      if (!isRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setLocalError(null);

      const data = await homeApi.getHomeData();
      setHomeData(data);
      
      logger.info('Home data loaded successfully', {
        featuredPlaces: data.featuredPlaces?.length || 0,
        trendingEvents: data.trendingEvents?.length || 0,
        recommendations: data.personalizedRecommendations?.length || 0,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load home data';
      setLocalError(errorMessage);
      logger.error('Failed to load home data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isConnected]);

  // Load recommendations with pagination
  const loadRecommendations = useCallback(async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Recommendation>> => {
    if (!isConnected) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    try {
      const response = await homeApi.getRecommendations(page, limit);
      
      // Update homeData with new recommendations
      setHomeData(prev => prev ? {
        ...prev,
        personalizedRecommendations: response.data,
      } : null);

      logger.debug('Recommendations loaded', {
        count: response.data.length,
        page: response.pagination.page,
        total: response.pagination.total,
      });

      return response;
    } catch (err: any) {
      logger.error('Failed to load recommendations', err);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }, [isConnected]);

  // Load trending events with pagination
  const loadTrendingEvents = useCallback(async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Event>> => {
    if (!isConnected) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    try {
      const response = await homeApi.getTrendingEvents(page, limit);
      
      setHomeData(prev => prev ? {
        ...prev,
        trendingEvents: response.data,
      } : null);

      logger.debug('Trending events loaded', {
        count: response.data.length,
        page: response.pagination.page,
        total: response.pagination.total,
      });

      return response;
    } catch (err: any) {
      logger.error('Failed to load trending events', err);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }, [isConnected]);

  // Load featured places with pagination
  const loadFeaturedPlaces = useCallback(async (
    page: number = 1,
    limit: number = 15
  ): Promise<PaginatedResponse<Place>> => {
    if (!isConnected) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    try {
      const response = await homeApi.getFeaturedPlaces(page, limit);
      
      setHomeData(prev => prev ? {
        ...prev,
        featuredPlaces: response.data,
      } : null);

      logger.debug('Featured places loaded', {
        count: response.data.length,
        page: response.pagination.page,
        total: response.pagination.total,
      });

      return response;
    } catch (err: any) {
      logger.error('Failed to load featured places', err);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }, [isConnected]);

  // Load all recommendations (auto-paginates)
  const loadAllRecommendations = useCallback(async (): Promise<Recommendation[]> => {
    if (!isConnected) {
      return [];
    }

    try {
      const recommendations = await homeApi.getAllRecommendations();
      
      setHomeData(prev => prev ? {
        ...prev,
        personalizedRecommendations: recommendations,
      } : null);

      logger.debug('All recommendations loaded', {
        count: recommendations.length,
      });

      return recommendations;
    } catch (err: any) {
      logger.error('Failed to load all recommendations', err);
      return [];
    }
  }, [isConnected]);

  // Load all trending events (auto-paginates)
  const loadAllTrendingEvents = useCallback(async (): Promise<Event[]> => {
    if (!isConnected) {
      return [];
    }

    try {
      const trendingEvents = await homeApi.getAllTrendingEvents();
      
      setHomeData(prev => prev ? {
        ...prev,
        trendingEvents,
      } : null);

      logger.debug('All trending events loaded', {
        count: trendingEvents.length,
      });

      return trendingEvents;
    } catch (err: any) {
      logger.error('Failed to load all trending events', err);
      return [];
    }
  }, [isConnected]);

  // Load all featured places (auto-paginates)
  const loadAllFeaturedPlaces = useCallback(async (): Promise<Place[]> => {
    if (!isConnected) {
      return [];
    }

    try {
      const featuredPlaces = await homeApi.getAllFeaturedPlaces();
      
      setHomeData(prev => prev ? {
        ...prev,
        featuredPlaces,
      } : null);

      logger.debug('All featured places loaded', {
        count: featuredPlaces.length,
      });

      return featuredPlaces;
    } catch (err: any) {
      logger.error('Failed to load all featured places', err);
      return [];
    }
  }, [isConnected]);

  // Record user interaction for ML recommendations
  const recordInteraction = useCallback(async (
    itemId: string,
    itemType: 'PLACE' | 'EVENT',
    interactionType: 'VIEW' | 'CLICK' | 'SAVE' | 'BOOK'
  ): Promise<void> => {
    if (!isConnected) return;

    try {
      await homeApi.recordInteraction({
        itemId,
        itemType,
        type: interactionType,
        context: {
          timestamp: Date.now(),
          location: 'home_screen',
        },
      });

      logger.debug('Interaction recorded', {
        itemId,
        itemType,
        interactionType,
      });
    } catch (err: any) {
      logger.warn('Failed to record interaction', err);
    }
  }, [isConnected]);

  // Refresh all data
  const refreshData = useCallback(async (): Promise<void> => {
    await loadHomeData(true);
  }, [loadHomeData]);

  // Retry loading data
  const retry = useCallback((): void => {
    loadHomeData();
  }, [loadHomeData]);

  // Initialize home data
  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Update global loading state
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  // Update global error state
  useEffect(() => {
    dispatch(setError(error));
  }, [error, dispatch]);

  // Helper function to filter recommendations by type
  const getRecommendationsByType = useCallback((type: string): Recommendation[] => {
    if (!homeData?.personalizedRecommendations) {
      return [];
    }
    return homeData.personalizedRecommendations.filter(rec => rec.type === type);
  }, [homeData]);

  // Helper function to get top recommendations
  const getTopRecommendations = useCallback((limit: number): Recommendation[] => {
    if (!homeData?.personalizedRecommendations) {
      return [];
    }
    return homeData.personalizedRecommendations
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }, [homeData]);

  return {
    // Data
    homeData,
    featuredPlaces: homeData?.featuredPlaces || [],
    trendingEvents: homeData?.trendingEvents || [],
    personalizedRecommendations: homeData?.personalizedRecommendations || [],
    categories: homeData?.categories || [],

    // Loading states
    isLoading,
    isRefreshing,
    error,

    // Actions
    loadHomeData,
    loadRecommendations,
    loadTrendingEvents,
    loadFeaturedPlaces,
    recordInteraction,
    refreshData,
    // Backwards compatibility: `refetch` is commonly used across hooks
    refetch: refreshData,
    retry,

    // Helper functions for recommendations
    getRecommendationsByType,
    getTopRecommendations,

    // Derived states
    hasData: !!homeData,
    isEmpty: !isLoading && !error && !homeData,
  };
};

// Hook for home screen analytics
export const useHomeAnalytics = () => {
  const recordScreenView = useCallback((): void => {
    logger.info('Home screen viewed', {
      timestamp: Date.now(),
      screen: 'home',
    });
  }, []);

  const recordCategoryView = useCallback((category: string): void => {
    logger.info('Category viewed', {
      category,
      screen: 'home',
    });
  }, []);

  const recordPlaceView = useCallback((placeId: string, placeName: string): void => {
    logger.info('Place viewed from home', {
      placeId,
      placeName,
      screen: 'home',
    });
  }, []);

  const recordEventView = useCallback((eventId: string, eventTitle: string): void => {
    logger.info('Event viewed from home', {
      eventId,
      eventTitle,
      screen: 'home',
    });
  }, []);

  const recordRecommendationClick = useCallback((recommendationId: string, recommendationType: string): void => {
    logger.info('Recommendation clicked', {
      recommendationId,
      recommendationType,
      screen: 'home',
    });
  }, []);

  return {
    recordScreenView,
    recordCategoryView,
    recordPlaceView,
    recordEventView,
    recordRecommendationClick,
  };
};

// Hook for home search
export const useHomeSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{
    places: Place[];
    events: Event[];
    recommendations: Recommendation[];
  }>({ places: [], events: [], recommendations: [] });
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const search = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults({ places: [], events: [], recommendations: [] });
      return;
    }

    setIsSearching(true);
    try {
      // This would call your search API
      // For now, we'll simulate search results
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulated search results
      const results = {
        places: [],
        events: [],
        recommendations: [],
      };
      
      setSearchResults(results);
    } catch (error) {
      logger.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback((): void => {
    setSearchQuery('');
    setSearchResults({ places: [], events: [], recommendations: [] });
  }, []);

  // Filter recommendations from search results
  const getFilteredRecommendations = useCallback((type?: string): Recommendation[] => {
    if (type) {
      return searchResults.recommendations.filter(rec => rec.type === type);
    }
    return searchResults.recommendations;
  }, [searchResults.recommendations]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    search,
    clearSearch,
    getFilteredRecommendations,
  };
};

// Hook for managing recommendations specifically
export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadRecommendations = useCallback(async (): Promise<Recommendation[]> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockRecommendations: Recommendation[] = [];
      setRecommendations(mockRecommendations);
      return mockRecommendations;
    } catch (error) {
      logger.error('Failed to load recommendations', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissRecommendation = useCallback((recommendationId: string): void => {
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    logger.debug('Recommendation dismissed', { recommendationId });
  }, []);

  const saveRecommendation = useCallback((recommendationId: string): void => {
    logger.debug('Recommendation saved', { recommendationId });
    // Here you would typically call an API to save the recommendation for the user
  }, []);

  const shareRecommendation = useCallback((recommendation: Recommendation): void => {
    logger.debug('Recommendation shared', { 
      recommendationId: recommendation.id,
      type: recommendation.type 
    });
    // Here you would implement the sharing functionality
  }, []);

  return {
    recommendations,
    isLoading,
    loadRecommendations,
    dismissRecommendation,
    saveRecommendation,
    shareRecommendation,
  };
};