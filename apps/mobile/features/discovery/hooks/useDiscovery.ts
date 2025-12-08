import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { logger } from '../../../shared/utils/logging/logger';
import { discoveryApi } from '../services/discovery.api';
import {
  Place,
  Event,
  PlaceDetail,
  EventDetail,
  DiscoveryFilter,
  SearchParams,
  SearchResult,
  DiscoveryState,
  EnrichedPlace,
  EnrichedEvent,
  ReviewInput,
  BookingInput,
} from '../types/discovery.types';
import { useLocation } from '../../../shared/hooks/device/useLocation';

export const useDiscovery = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { location: userLocation, requestPermission } = useLocation();

  const [state, setState] = useState<DiscoveryState>({
    searchQuery: '',
    filters: {},
    currentLocation: userLocation,
    searchResults: { places: [], events: [], total: 0 },
    nearbyPlaces: [],
    nearbyEvents: [],
    selectedCategory: null,
    isLoading: false,
    error: null,
  });

  // Request location permission on mount
  useEffect(() => {
    requestPermission();
  }, []);

  // Update location when it changes
  useEffect(() => {
    if (userLocation) {
      setState((prev) => ({ ...prev, currentLocation: userLocation }));
      if (state.searchQuery === '') {
        fetchNearbyItems();
      }
    }
  }, [userLocation]);

  const fetchNearbyItems = useCallback(async () => {
    if (!userLocation) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const [places, events] = await Promise.all([
        discoveryApi.getNearbyPlaces({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 5000,
          limit: 20,
        }),
        discoveryApi.getNearbyEvents({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10000,
          limit: 10,
        }),
      ]);

      setState((prev) => ({
        ...prev,
        nearbyPlaces: places,
        nearbyEvents: events,
        isLoading: false,
      }));

      logger.debug('Nearby items fetched', {
        placesCount: places.length,
        eventsCount: events.length,
      });
    } catch (error: any) {
      logger.error('Failed to fetch nearby items', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load nearby items',
        isLoading: false,
      }));
    }
  }, [userLocation]);

  const search = useCallback(
    async (params: SearchParams) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const results = await discoveryApi.search({
          ...params,
          location: state.currentLocation
            ? {
                latitude: state.currentLocation.latitude,
                longitude: state.currentLocation.longitude,
                radius: 50000,
              }
            : undefined,
        });

        // Record search if it's a user search
        if (params.query && user) {
          await discoveryApi.recordSearch(params.query, params.filters);
        }

        setState((prev) => ({
          ...prev,
          searchQuery: params.query || '',
          filters: params.filters || {},
          searchResults: {
            places: results.places,
            events: results.events,
            total: results.totalPlaces + results.totalEvents,
          },
          isLoading: false,
        }));

        logger.info('Discovery search performed', {
          query: params.query,
          filters: params.filters,
          resultsCount: results.totalPlaces + results.totalEvents,
        });
      } catch (error: any) {
        logger.error('Discovery search failed', error);
        setState((prev) => ({
          ...prev,
          error: error.message || 'Search failed',
          isLoading: false,
        }));
      }
    },
    [state.currentLocation, user]
  );

  const clearSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchQuery: '',
      searchResults: { places: [], events: [], total: 0 },
      selectedCategory: null,
    }));
  }, []);

  const applyFilters = useCallback(
    async (filters: DiscoveryFilter) => {
      await search({
        query: state.searchQuery,
        filters,
        location: state.currentLocation
          ? {
              latitude: state.currentLocation.latitude,
              longitude: state.currentLocation.longitude,
            }
          : undefined,
      });
    },
    [state.searchQuery, state.currentLocation, search]
  );

  const getPlaceDetail = useCallback(
    async (placeId: string): Promise<PlaceDetail> => {
      try {
        const place = await discoveryApi.getPlaceDetail(placeId);
        
        // Record view interaction
        if (user) {
          await discoveryApi.recordInteraction({
            itemId: placeId,
            itemType: 'PLACE',
            type: 'VIEW',
            context: { source: 'discovery' },
          });
        }
        
        logger.debug('Place detail loaded', { placeId });
        return place;
      } catch (error: any) {
        logger.error('Failed to load place detail', error);
        throw error;
      }
    },
    [user]
  );

  const getEventDetail = useCallback(
    async (eventId: string): Promise<EventDetail> => {
      try {
        const event = await discoveryApi.getEventDetail(eventId);
        
        // Record view interaction
        if (user) {
          await discoveryApi.recordInteraction({
            itemId: eventId,
            itemType: 'EVENT',
            type: 'VIEW',
            context: { source: 'discovery' },
          });
        }
        
        logger.debug('Event detail loaded', { eventId });
        return event;
      } catch (error: any) {
        logger.error('Failed to load event detail', error);
        throw error;
      }
    },
    [user]
  );

  const getCategoryItems = useCallback(
    async (categoryId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        
        const response = await discoveryApi.getCategoryItems(categoryId);
        
        // Find category from results
        let selectedCategory = null;
        const allItems = [...response.data];
        
        for (const item of allItems) {
          if ('category' in item && item.category?.id === categoryId) {
            selectedCategory = item.category;
            break;
          }
        }

        setState((prev) => ({
          ...prev,
          selectedCategory,
          searchResults: {
            places: response.data.filter((item): item is Place => 'name' in item),
            events: response.data.filter((item): item is Event => 'title' in item),
            total: response.data.length,
          },
          isLoading: false,
        }));

        logger.debug('Category items loaded', {
          categoryId,
          itemsCount: response.data.length,
        });
      } catch (error: any) {
        logger.error('Failed to load category items', error);
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to load category items',
          isLoading: false,
        }));
      }
    },
    []
  );

  const submitReview = useCallback(
    async (review: ReviewInput): Promise<void> => {
      try {
        if (!user) {
          throw new Error('You must be logged in to submit a review');
        }

        await discoveryApi.submitReview(review);
        
        // Record interaction for ML
        if (review.placeId) {
          await discoveryApi.recordInteraction({
            itemId: review.placeId,
            itemType: 'PLACE',
            type: 'REVIEW',
            context: { rating: review.rating },
          });
        } else if (review.eventId) {
          await discoveryApi.recordInteraction({
            itemId: review.eventId,
            itemType: 'EVENT',
            type: 'REVIEW',
            context: { rating: review.rating },
          });
        }

        logger.info('Review submitted successfully', { review });
      } catch (error: any) {
        logger.error('Failed to submit review', error);
        throw error;
      }
    },
    [user]
  );

  const createBooking = useCallback(
    async (booking: BookingInput): Promise<any> => {
      try {
        if (!user) {
          throw new Error('You must be logged in to create a booking');
        }

        const result = await discoveryApi.createBooking(booking);
        
        // Record booking interaction for ML
        await discoveryApi.recordInteraction({
          itemId: booking.eventId,
          itemType: 'EVENT',
          type: 'BOOK',
          context: { quantity: booking.quantity },
        });

        logger.info('Booking created successfully', { bookingId: result.id });
        return result;
      } catch (error: any) {
        logger.error('Failed to create booking', error);
        throw error;
      }
    },
    [user]
  );

  const getEventAvailability = useCallback(
    async (eventId: string): Promise<{ available: number; total: number }> => {
      try {
        return await discoveryApi.getEventAvailability(eventId);
      } catch (error) {
        logger.error('Failed to get event availability', error);
        return { available: 0, total: 0 };
      }
    },
    []
  );

  const autoComplete = useCallback(async (query: string): Promise<any[]> => {
    if (query.length < 2) return [];
    
    try {
      const results = await discoveryApi.autoComplete(query);
      return results;
    } catch (error) {
      logger.error('Auto-complete failed', error);
      return [];
    }
  }, []);

  const refresh = useCallback(async () => {
    if (state.searchQuery) {
      await search({
        query: state.searchQuery,
        filters: state.filters,
      });
    } else {
      await fetchNearbyItems();
    }
  }, [state.searchQuery, state.filters, search, fetchNearbyItems]);

  const retry = useCallback(() => {
    if (state.searchQuery) {
      search({
        query: state.searchQuery,
        filters: state.filters,
      });
    } else {
      fetchNearbyItems();
    }
  }, [state.searchQuery, state.filters, search, fetchNearbyItems]);

  // Get filter options
  const getFilterOptions = useCallback(async () => {
    try {
      return await discoveryApi.getFilterOptions();
    } catch (error) {
      logger.error('Failed to get filter options', error);
      return { categories: [], tags: [], priceRanges: [], ratings: [] };
    }
  }, []);

  // Get recommendations
  const getRecommendations = useCallback(async (limit = 10) => {
    try {
      return await discoveryApi.getRecommendations(limit);
    } catch (error) {
      logger.error('Failed to get recommendations', error);
      return [];
    }
  }, []);

  // Get discovery statistics
  const getDiscoveryStats = useCallback(async () => {
    try {
      return await discoveryApi.getDiscoveryStats();
    } catch (error) {
      logger.error('Failed to get discovery stats', error);
      return { totalPlaces: 0, totalEvents: 0, totalCategories: 0, popularTags: [] };
    }
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    search,
    clearSearch,
    applyFilters,
    getPlaceDetail,
    getEventDetail,
    getCategoryItems,
    submitReview,
    createBooking,
    getEventAvailability,
    autoComplete,
    refresh,
    retry,
    fetchNearbyItems,
    getFilterOptions,
    getRecommendations,
    getDiscoveryStats,
    
    // Derived state
    hasResults: state.searchResults.total > 0,
    hasNearbyItems: state.nearbyPlaces.length > 0 || state.nearbyEvents.length > 0,
    isLoadingNearby: state.isLoading && !state.searchQuery,
    
    // User location
    userLocation: state.currentLocation,
    hasLocationPermission: !!userLocation,
    
    // User info
    isAuthenticated: !!user,
    currentUser: user,
  };
};

export const useDiscoveryAnalytics = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const recordScreenView = useCallback((screen: string) => {
    logger.info('Discovery screen viewed', {
      screen,
      userId: user?.id,
      timestamp: Date.now(),
    });
  }, [user]);

  const recordFilterApply = useCallback((filters: any) => {
    logger.info('Filters applied', {
      filters,
      userId: user?.id,
      timestamp: Date.now(),
    });
  }, [user]);

  const recordItemClick = useCallback((itemId: string, itemType: 'PLACE' | 'EVENT', source: string) => {
    logger.info('Item clicked in discovery', {
      itemId,
      itemType,
      source,
      userId: user?.id,
      timestamp: Date.now(),
    });
    
    // Record interaction for ML
    if (user) {
      discoveryApi.recordInteraction({
        itemId,
        itemType,
        type: 'CLICK',
        context: { source },
      }).catch(error => {
        logger.error('Failed to record interaction', error);
      });
    }
  }, [user]);

  const recordMapInteraction = useCallback((action: string, data?: any) => {
    logger.info('Map interaction', {
      action,
      data,
      userId: user?.id,
      timestamp: Date.now(),
    });
  }, [user]);

  const recordFavoriteToggle = useCallback((itemId: string, itemType: 'PLACE' | 'EVENT', isFavorite: boolean) => {
    logger.info('Favorite toggled', {
      itemId,
      itemType,
      isFavorite,
      userId: user?.id,
      timestamp: Date.now(),
    });
    
    // Record save interaction for ML
    if (user && isFavorite) {
      discoveryApi.recordInteraction({
        itemId,
        itemType,
        type: 'SAVE',
      }).catch(error => {
        logger.error('Failed to record save interaction', error);
      });
    }
  }, [user]);

  return {
    recordScreenView,
    recordFilterApply,
    recordItemClick,
    recordMapInteraction,
    recordFavoriteToggle,
  };
};