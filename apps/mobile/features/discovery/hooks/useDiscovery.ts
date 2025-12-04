import { useState, useCallback, useMemo } from 'react';
import { discoveryApi } from '../services/discovery.api';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {  useApiMutation } from '../../../shared/hooks/api/useApiMutation';
import { useApiQuery } from '../../../shared/hooks/api/useApiQuery';
import { useLocation } from '../../../shared/hooks/device/useLocation';
import { useDebounce } from '../../../shared/hooks/device/useDebounce';

// Types
import type {
  Place,
  Event,
  Category,
  SearchFilters,
  SearchResult,
  PlacesResponse,
  EventsResponse,
  CategoriesResponse,
} from '../types/discovery.types';

// Constants
import {
  DEFAULT_SEARCH_RADIUS,
  SEARCH_DEBOUNCE_MS,
  API_BASE_URL,
} from '../constants/discovery.constants';

export const useDiscovery = () => {
  const dispatch = useAppDispatch();
  const { location, calculateDistance } = useLocation();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: null,
    priceRange: [0, 4],
    rating: 0,
    distance: DEFAULT_SEARCH_RADIUS,
    sortBy: 'relevance',
  });
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryData, setCategoryData] = useState<any | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [placeDetail, setPlaceDetail] = useState<Place | null>(null);
  const [eventDetail, setEventDetail] = useState<Event | null>(null);

  // Debounced search query for API calls
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  // API Queries - Updated to match your backend API structure
  const {
    data: placesData,
    isLoading: isLoadingPlaces,
    error: placesError,
    refetch: refetchPlaces,
  } = useApiQuery<PlacesResponse>(
    ['places', location, filters, debouncedSearchQuery],
    `${API_BASE_URL}/places`,
    {
      coordinates: location ? `${location.latitude},${location.longitude}` : undefined,
      radius: filters.distance,
      category: filters.category,
      search: debouncedSearchQuery || undefined,
      minRating: filters.rating > 0 ? filters.rating : undefined,
      sortBy: filters.sortBy,
      page: 1,
      limit: 20,
    },
    {
      enabled: !!location,
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useApiQuery<EventsResponse>(
    ['events', location, filters, debouncedSearchQuery],
    `${API_BASE_URL}/events`,
    {
      coordinates: location ? `${location.latitude},${location.longitude}` : undefined,
      radius: filters.distance,
      category: filters.category,
      search: debouncedSearchQuery || undefined,
      sortBy: filters.sortBy,
      page: 1,
      limit: 20,
    },
    {
      enabled: !!location,
      staleTime: 2 * 60 * 1000,
    }
  );

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useApiQuery<CategoriesResponse>(
    ['categories'],
    `${API_BASE_URL}/categories`,
    undefined,
    {
      staleTime: 60 * 60 * 1000,
    }
  );

  const {
    data: trendingData,
    isLoading: isLoadingTrending,
    error: trendingError,
  } = useApiQuery<PlacesResponse>(
    ['trending', location],
    `${API_BASE_URL}/places/trending`,
    {
      coordinates: location ? `${location.latitude},${location.longitude}` : undefined,
      limit: 10,
    },
    {
      enabled: !!location,
    }
  );

  // API Mutations
  const recordInteractionMutation = useApiMutation(async (variables) => {
    const response = await fetch(`${API_BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
    });
    const data = await response.json();
    return data;
  });

  // Memoized computed values
  const places = useMemo(() => placesData?.places || [], [placesData]);
  const events = useMemo(() => eventsData?.events || [], [eventsData]);
  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData]);
  const trendingPlaces = useMemo(() => trendingData?.places || [], [trendingData]);

  // Calculate distances for places and events
  const placesWithDistance = useMemo(() => {
    if (!location) return places;
    
    return places.map((place: { latitude: any; longitude: any; }) => ({
      ...place,
      distance: calculateDistance?.({
        latitude: place.latitude,
        longitude: place.longitude,
      }) || 0,
    }));
  }, [places, location, calculateDistance]);

  const eventsWithDistance = useMemo(() => {
    if (!location) return events;
    
    return events.map((event: Event) => {
      if (!event.place || event.place.latitude == null || event.place.longitude == null) return event;
      
      return {
        ...event,
        distance: calculateDistance?.({
          latitude: event.place.latitude,
          longitude: event.place.longitude,
        }) || 0,
      };
    });
  }, [events, location, calculateDistance]);

  // Derived search results combining places and events
  const searchResults = useMemo(() => ({
    places: placesWithDistance,
    events: eventsWithDistance,
  }), [placesWithDistance, eventsWithDistance]);

  const isLoading = useMemo(
    () => isLoadingPlaces || isLoadingEvents || isLoadingCategories || isLoadingTrending,
    [isLoadingPlaces, isLoadingEvents, isLoadingCategories, isLoadingTrending]
  );

  const error = useMemo(
    () => placesError || eventsError || categoriesError || trendingError,
    [placesError, eventsError, categoriesError, trendingError]
  );

  // Actions
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const searchPlacesAndEvents = useCallback(async (query: string, newFilters?: Partial<SearchFilters>) => {
    if (newFilters) setFilters(prev => ({ ...prev, ...newFilters }));
    setSearchQuery(query);
    await Promise.all([refetchPlaces(), refetchEvents()]);
  }, [refetchEvents, refetchPlaces]);

  const clearResults = useCallback(() => {
    setSearchQuery('');
    refetchPlaces();
    refetchEvents();
  }, [refetchEvents, refetchPlaces]);

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleCategorySelect = useCallback((category: Category | null) => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, category: category?.id || null }));
  }, []);

  const getCategoryData = useCallback(async (categoryId: string) => {
    try {
      const data = await discoveryApi.getCategoryById(categoryId);
      setCategoryData(data);
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const handlePlaceSelect = useCallback(async (place: Place) => {
    setSelectedPlace(place);
    
    // Record view interaction for recommendations
    try {
      await recordInteractionMutation.mutateAsync({
        itemId: place.id,
        itemType: 'PLACE',
        type: 'VIEW',
        context: {
          source: 'discovery',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.warn('Failed to record interaction:', error);
    }
  }, [recordInteractionMutation]);

  const getPlaceDetail = useCallback(async (id: string) => {
    try {
      const place = await discoveryApi.getPlaceById(id);
      setPlaceDetail(place);
      return place;
    } catch (err) {
      throw err;
    }
  }, []);

  const handleEventSelect = useCallback(async (event: Event) => {
    setSelectedEvent(event);
    
    // Record view interaction for recommendations
    try {
      await recordInteractionMutation.mutateAsync({
        itemId: event.id,
        itemType: 'EVENT',
        type: 'VIEW',
        context: {
          source: 'discovery',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.warn('Failed to record interaction:', error);
    }
  }, [recordInteractionMutation]);

  const getEventDetail = useCallback(async (id: string) => {
    try {
      const event = await discoveryApi.getEventById(id);
      setEventDetail(event);
      return event;
    } catch (err) {
      throw err;
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      category: null,
      priceRange: [0, 4],
      rating: 0,
      distance: DEFAULT_SEARCH_RADIUS,
      sortBy: 'relevance',
    });
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchPlaces(),
      refetchEvents(),
    ]);
  }, [refetchPlaces, refetchEvents]);

  return {
    // State
    searchQuery,
    filters,
    selectedCategory,
    selectedPlace,
    selectedEvent,
    
    // Data
    places: placesWithDistance,
    events: eventsWithDistance,
    categories,
    trendingPlaces,
    categoryData,
    searchResults,
    
    // Loading states
    isLoading,
    isLoadingPlaces,
    isLoadingEvents,
    isLoadingCategories,
    isLoadingTrending,
    
    // Errors
    error,
    placesError,
    eventsError,
    categoriesError,
    trendingError,
    
    // Location
    userLocation: location,
    
    // Actions
    handleSearch,
    handleFilterChange,
    handleCategorySelect,
    handlePlaceSelect,
    handleEventSelect,
    getCategoryData,
    handleClearFilters,
    handleRefresh,
    searchPlacesAndEvents,
    clearResults,
    // Details
    placeDetail,
    getPlaceDetail,
    eventDetail,
    getEventDetail,
    
    // Mutations
    recordInteractionMutation,
  };
};

export type UseDiscoveryReturn = ReturnType<typeof useDiscovery>;