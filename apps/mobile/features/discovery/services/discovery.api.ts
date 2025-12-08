import { apiClient } from '../../../shared/services/api/client';
import { PaginatedResponse } from '../../../shared/types/api.types';
import {
  Place,
  Event,
  PlaceDetail,
  EventDetail,
  SearchParams,
  DiscoveryResponse,
  LocationSearchParams,
  AutoCompleteResult,
  ReviewInput,
  BookingInput,
  EnrichedPlace,
  EnrichedEvent,
  Recommendation,
  Interaction,
  Favorite,
  PaginatedDiscoveryResponse,
  DiscoveryFilter,
  Review,
  Booking,
  Category,
  Tag,
  MapMarker,
} from '../types/discovery.types';

const emptyPage = <T>(page = 1, limit = 10): PaginatedResponse<T> => ({
  data: [] as T[],
  pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
});

export const discoveryApi = {
  // Search functionality
  async search(params: SearchParams): Promise<DiscoveryResponse> {
    const response = await apiClient.post<DiscoveryResponse>('/discovery/search', params);
    return response.data || { places: [], events: [], categories: [], totalPlaces: 0, totalEvents: 0 };
  },

  async searchPaginated(params: SearchParams): Promise<PaginatedDiscoveryResponse> {
    const response = await apiClient.post<PaginatedDiscoveryResponse>('/discovery/search/paginated', params);
    return response.data || {
      data: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  async autoComplete(query: string, limit = 5): Promise<AutoCompleteResult[]> {
    const response = await apiClient.get<AutoCompleteResult[]>('/discovery/autocomplete', {
      params: { q: query, limit },
    });
    return response.data || [];
  },

  // Location-based searches
  async getNearbyPlaces(params: LocationSearchParams): Promise<EnrichedPlace[]> {
    const response = await apiClient.get<EnrichedPlace[]>('/discovery/nearby/places', { params });
    return response.data || [];
  },

  async getNearbyEvents(params: LocationSearchParams): Promise<EnrichedEvent[]> {
    const response = await apiClient.get<EnrichedEvent[]>('/discovery/nearby/events', { params });
    return response.data || [];
  },

  // Detail views
  async getPlaceDetail(placeId: string): Promise<PlaceDetail> {
    const response = await apiClient.get<PlaceDetail>(`/places/${placeId}`);
    if (!response.data) {
      throw new Error('Place not found');
    }
    return response.data;
  },

  async getEventDetail(eventId: string): Promise<EventDetail> {
    const response = await apiClient.get<EventDetail>(`/events/${eventId}`);
    if (!response.data) {
      throw new Error('Event not found');
    }
    return response.data;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data || [];
  },

  async getCategoryItems(categoryId: string, page = 1, limit = 20): Promise<PaginatedResponse<Place | Event>> {
    const response = await apiClient.get<PaginatedResponse<Place | Event>>(`/categories/${categoryId}/items`, {
      params: { page, limit },
    });
    return response.data || emptyPage(page, limit);
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>('/tags');
    return response.data || [];
  },

  async getTagItems(tagId: string, page = 1, limit = 20): Promise<PaginatedResponse<Place>> {
    const response = await apiClient.get<PaginatedResponse<Place>>(`/tags/${tagId}/places`, {
      params: { page, limit },
    });
    return response.data || emptyPage<Place>(page, limit);
  },

  // Map functionality
  async getMapMarkers(bounds: {
    northEast: { latitude: number; longitude: number };
    southWest: { latitude: number; longitude: number };
  }): Promise<MapMarker[]> {
    const response = await apiClient.post<MapMarker[]>('/discovery/map/markers', bounds);
    return response.data || [];
  },

  // Filters
  async getFilterOptions(): Promise<{
    categories: Category[];
    tags: Tag[];
    priceRanges: { min: number; max: number }[];
    ratings: number[];
  }> {
    const response = await apiClient.get<{
      categories: Category[];
      tags: Tag[];
      priceRanges: { min: number; max: number }[];
      ratings: number[];
    }>('/discovery/filters/options');
    return response.data || { categories: [], tags: [], priceRanges: [], ratings: [] };
  },

  // Popular/trending
  async getPopularPlaces(limit = 10): Promise<Place[]> {
    const response = await apiClient.get<Place[]>('/discovery/popular/places', { params: { limit } });
    return response.data || [];
  },

  async getPopularEvents(limit = 10): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/discovery/popular/events', { params: { limit } });
    return response.data || [];
  },

  // Similar items
  async getSimilarPlaces(placeId: string, limit = 5): Promise<Place[]> {
    const response = await apiClient.get<Place[]>(`/places/${placeId}/similar`, { params: { limit } });
    return response.data || [];
  },

  async getSimilarEvents(eventId: string, limit = 5): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(`/events/${eventId}/similar`, { params: { limit } });
    return response.data || [];
  },

  // Record views and interactions
  async recordInteraction(data: {
    itemId: string;
    itemType: 'PLACE' | 'EVENT';
    type: 'VIEW' | 'CLICK' | 'SAVE' | 'BOOK' | 'REVIEW' | 'SHARE';
    context?: any;
  }): Promise<void> {
    await apiClient.post('/interactions', data);
  },

  async recordPlaceView(placeId: string): Promise<void> {
    await this.recordInteraction({
      itemId: placeId,
      itemType: 'PLACE',
      type: 'VIEW',
    });
  },

  async recordEventView(eventId: string): Promise<void> {
    await this.recordInteraction({
      itemId: eventId,
      itemType: 'EVENT',
      type: 'VIEW',
    });
  },

  async recordSearch(query: string, filters?: DiscoveryFilter): Promise<void> {
    await apiClient.post('/discovery/search/history', { query, filters });
  },

  // Reviews
  async submitReview(review: ReviewInput): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', review);
    if (!response.data) {
      throw new Error('Failed to submit review');
    }
    return response.data;
  },

  async getPlaceReviews(placeId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<PaginatedResponse<Review>>(`/places/${placeId}/reviews`, {
      params: { page, limit },
    });
    return response.data || emptyPage<Review>(page, limit);
  },

  async getEventReviews(eventId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<PaginatedResponse<Review>>(`/events/${eventId}/reviews`, {
      params: { page, limit },
    });
    return response.data || emptyPage<Review>(page, limit);
  },

  // Bookings
  async createBooking(booking: BookingInput): Promise<Booking> {
    const response = await apiClient.post<Booking>('/bookings', booking);
    if (!response.data) {
      throw new Error('Failed to create booking');
    }
    return response.data;
  },

  async getEventAvailability(eventId: string): Promise<{ available: number; total: number }> {
    const response = await apiClient.get<{ available: number; total: number }>(`/events/${eventId}/availability`);
    return response.data || { available: 0, total: 0 };
  },

  // Recommendations
  async getRecommendations(limit = 10): Promise<Recommendation[]> {
    const response = await apiClient.get<Recommendation[]>('/recommendations', { params: { limit } });
    return response.data || [];
  },

  // Favorites
  async getFavorites(page = 1, limit = 20): Promise<PaginatedResponse<Favorite>> {
    const response = await apiClient.get<PaginatedResponse<Favorite>>('/favorites', { params: { page, limit } });
    return response.data || emptyPage<Favorite>(page, limit);
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

  // User preferences
  async getSearchHistory(limit = 20): Promise<string[]> {
    const response = await apiClient.get<string[]>('/discovery/search/history', { params: { limit } });
    return response.data || [];
  },

  async clearSearchHistory(): Promise<void> {
    await apiClient.delete('/discovery/search/history');
  },

  // Utility methods
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    const response = await apiClient.get<{ latitude: number; longitude: number }>('/discovery/geocode', {
      params: { address },
    });
    if (!response.data) {
      throw new Error('Geocoding failed');
    }
    return response.data;
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    const response = await apiClient.get<string>('/discovery/reverse-geocode', {
      params: { latitude, longitude },
    });
    return response.data || 'Unknown location';
  },

  // Analytics
  async getDiscoveryStats(): Promise<{
    totalPlaces: number;
    totalEvents: number;
    totalCategories: number;
    popularTags: Tag[];
  }> {
    const response = await apiClient.get<{
      totalPlaces: number;
      totalEvents: number;
      totalCategories: number;
      popularTags: Tag[];
    }>('/discovery/stats');
    return response.data || { totalPlaces: 0, totalEvents: 0, totalCategories: 0, popularTags: [] };
  },
};

export default discoveryApi;