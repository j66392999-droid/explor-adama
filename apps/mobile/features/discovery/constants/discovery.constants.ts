// API Configuration
export const GOOGLE_PLACES_API_KEY = 'AIzaSyBZ-pljCr0xAuooBBNYwF9SuDXQKSt5lbI';
export const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Search & Filter Constants
export const DEFAULT_SEARCH_RADIUS = 5000; // 5km in meters
export const MAX_SEARCH_RADIUS = 50000; // 50km in meters
export const SEARCH_DEBOUNCE_MS = 500;

export const PRICE_RANGES = [
  { label: 'Any', value: [0, 4] },
  { label: 'Free', value: [0, 0] },
  { label: 'Budget', value: [1, 1] },
  { label: 'Moderate', value: [2, 2] },
  { label: 'Expensive', value: [3, 3] },
  { label: 'Premium', value: [4, 4] },
] as const;

export const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Distance', value: 'distance' },
  { label: 'Rating', value: 'rating' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
] as const;

export const RATING_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '3.0+', value: 3 },
  { label: '3.5+', value: 3.5 },
  { label: '4.0+', value: 4 },
  { label: '4.5+', value: 4.5 },
] as const;

// Category constants matching your Prisma schema
export const CATEGORY_KEYS = {
  RESTAURANT: 'restaurant',
  HOTEL: 'hotel',
  ATTRACTION: 'attraction',
  EVENT: 'event',
  SHOPPING: 'shopping',
  NATURE: 'nature',
  CULTURE: 'culture',
  ADVENTURE: 'adventure',
} as const;

// Map Constants
export const INITIAL_REGION = {
  latitude: 9.145, // Ethiopia coordinates
  longitude: 40.4897,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;