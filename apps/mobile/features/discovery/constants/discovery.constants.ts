// features/discovery/constants/discovery.constants.ts
import { 
  MediaType, 
  ReviewStatus, 
  PaymentProvider, 
  PaymentStatus, 
  TicketStatus, 
  InteractionType, 
  RecommendationItemType,
  PostStatus 
} from '../../../shared/types/api.types';

export const DISCOVERY_CONSTANTS = {
  // Prisma enum mappings
  MEDIA_TYPES: MediaType,
  REVIEW_STATUSES: ReviewStatus,
  PAYMENT_PROVIDERS: PaymentProvider,
  PAYMENT_STATUSES: PaymentStatus,
  TICKET_STATUSES: TicketStatus,
  INTERACTION_TYPES: InteractionType,
  RECOMMENDATION_TYPES: RecommendationItemType,
  POST_STATUSES: PostStatus,
  
  // Search constants
  SEARCH_DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_AUTOCOMPLETE_RESULTS: 5,
  MAX_SEARCH_HISTORY: 10,
  
  // Map constants
  DEFAULT_MAP_REGION: {
    latitude: 8.5460, // Adama, Ethiopia coordinates
    longitude: 39.2694,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  MAP_ZOOM_LEVELS: {
    CITY: 0.0922,
    NEIGHBORHOOD: 0.022,
    STREET: 0.005,
  },
  MAP_PADDING: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  
  // Location constants
  LOCATION_ACCURACY: {
    HIGH: 'high',
    BALANCED: 'balanced',
    LOW: 'low',
    PASSIVE: 'passive',
  },
  LOCATION_UPDATE_INTERVAL: 5000, // 5 seconds
  LOCATION_DISTANCE_INTERVAL: 10, // 10 meters
  
  // Filter constants
  DEFAULT_FILTERS: {
    priceRanges: [
      { label: 'Any', value: undefined },
      { label: '$', value: { min: 0, max: 10 } },
      { label: '$$', value: { min: 11, max: 30 } },
      { label: '$$$', value: { min: 31, max: 60 } },
      { label: '$$$$', value: { min: 61, max: 100 } },
    ],
    ratings: [1, 2, 3, 4, 5],
    distances: [1, 5, 10, 25, 50], // in km
  },
  
  // Pagination constants
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  INFINITE_SCROLL_THRESHOLD: 0.7,
  
  // Cache constants
  CACHE_DURATION: {
    SEARCH_RESULTS: 5 * 60 * 1000, // 5 minutes
    PLACE_DETAIL: 10 * 60 * 1000, // 10 minutes
    EVENT_DETAIL: 10 * 60 * 1000, // 10 minutes
    CATEGORIES: 30 * 60 * 1000, // 30 minutes
    TAGS: 30 * 60 * 1000, // 30 minutes
    FILTER_OPTIONS: 60 * 60 * 1000, // 1 hour
  },
  
  // Analytics events
  ANALYTICS_EVENTS: {
    SEARCH_PERFORMED: 'discovery_search_performed',
    FILTER_APPLIED: 'discovery_filter_applied',
    PLACE_VIEWED: 'discovery_place_viewed',
    EVENT_VIEWED: 'discovery_event_viewed',
    MAP_INTERACTION: 'discovery_map_interaction',
    CATEGORY_VIEWED: 'discovery_category_viewed',
    TAG_VIEWED: 'discovery_tag_viewed',
    REVIEW_SUBMITTED: 'discovery_review_submitted',
    FAVORITE_ADDED: 'discovery_favorite_added',
    FAVORITE_REMOVED: 'discovery_favorite_removed',
    BOOKING_CREATED: 'discovery_booking_created',
    DIRECTIONS_REQUESTED: 'discovery_directions_requested',
    SHARE_ACTION: 'discovery_share_action',
  },
  
  // Error messages
  ERROR_MESSAGES: {
    LOCATION_REQUIRED: 'Location access is required to discover nearby places and events.',
    LOCATION_PERMISSION_DENIED: 'Location permission denied. Please enable location services in settings.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    SEARCH_ERROR: 'Search failed. Please try again.',
    NO_RESULTS: 'No results found. Try different search terms or filters.',
    LOADING_ERROR: 'Failed to load data. Please try again.',
    REVIEW_SUBMISSION_ERROR: 'Failed to submit review. Please try again.',
    BOOKING_ERROR: 'Failed to create booking. Please try again.',
    FAVORITE_ERROR: 'Failed to update favorites. Please try again.',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    REVIEW_SUBMITTED: 'Review submitted successfully!',
    FAVORITE_ADDED: 'Added to favorites!',
    FAVORITE_REMOVED: 'Removed from favorites!',
    BOOKING_CREATED: 'Booking created successfully!',
  },
  
  // Validation constants
  VALIDATION: {
    REVIEW_MIN_LENGTH: 10,
    REVIEW_MAX_LENGTH: 500,
    MIN_RATING: 1,
    MAX_RATING: 5,
    MAX_BOOKING_QUANTITY: 10,
  },
  
  // UI constants
  UI: {
    CARD_ELEVATION: 3,
    MAP_CONTROL_SIZE: 50,
    MAP_CONTROL_BORDER_RADIUS: 25,
    MARKER_SIZE: 44,
    SELECTED_MARKER_SCALE: 1.2,
  },
  
  // Time constants
  TIME_FORMATS: {
    DISPLAY_DATE: 'MMM d, yyyy',
    DISPLAY_TIME: 'h:mm a',
    DISPLAY_DATETIME: 'MMM d, yyyy h:mm a',
    API_DATE: 'yyyy-MM-dd',
    API_TIME: 'HH:mm:ss',
    API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  },
  
  // Currency constants
  CURRENCY: {
    DEFAULT: 'ETB',
    SYMBOLS: {
      ETB: 'Br',
      USD: '$',
      EUR: '€',
      GBP: '£',
    },
    EXCHANGE_RATES: {
      ETB: 1,
      USD: 0.018, // Approximate exchange rate
      EUR: 0.016,
      GBP: 0.014,
    },
  },
};

// Default categories for discovery (based on your Prisma schema)
export const DEFAULT_CATEGORIES = [
  { id: 'restaurant', key: 'restaurant', name: 'Restaurants', icon: '🍽️' },
  { id: 'cafe', key: 'cafe', name: 'Cafes', icon: '☕' },
  { id: 'museum', key: 'museum', name: 'Museums', icon: '🏛️' },
  { id: 'park', key: 'park', name: 'Parks', icon: '🌳' },
  { id: 'shopping', key: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'hotel', key: 'hotel', name: 'Hotels', icon: '🏨' },
  { id: 'beach', key: 'beach', name: 'Beaches', icon: '🏖️' },
  { id: 'mountain', key: 'mountain', name: 'Mountains', icon: '⛰️' },
  { id: 'historical', key: 'historical', name: 'Historical', icon: '🏰' },
  { id: 'religious', key: 'religious', name: 'Religious', icon: '🛐' },
  { id: 'cultural', key: 'cultural', name: 'Cultural', icon: '🎭' },
  { id: 'adventure', key: 'adventure', name: 'Adventure', icon: '🧗' },
];

// Default tags for places (based on your Prisma schema)
export const DEFAULT_TAGS = [
  { id: 'popular', name: 'Popular', color: '#FF3B30' },
  { id: 'trending', name: 'Trending', color: '#FF9500' },
  { id: 'family-friendly', name: 'Family Friendly', color: '#34C759' },
  { id: 'romantic', name: 'Romantic', color: '#FF2D55' },
  { id: 'budget', name: 'Budget', color: '#5856D6' },
  { id: 'luxury', name: 'Luxury', color: '#AF52DE' },
  { id: 'pet-friendly', name: 'Pet Friendly', color: '#007AFF' },
  { id: 'accessible', name: 'Accessible', color: '#5AC8FA' },
  { id: 'vegetarian', name: 'Vegetarian', color: '#4CD964' },
  { id: 'halal', name: 'Halal', color: '#FFCC00' },
];

// Sort options for discovery
export const SORT_OPTIONS = [
  { key: 'relevance', label: 'Most Relevant', icon: '🎯' },
  { key: 'distance', label: 'Distance', icon: '📍' },
  { key: 'rating', label: 'Highest Rated', icon: '⭐' },
  { key: 'price_low', label: 'Price: Low to High', icon: '💰⬆️' },
  { key: 'price_high', label: 'Price: High to Low', icon: '💰⬇️' },
  { key: 'date', label: 'Date', icon: '📅' },
  { key: 'popularity', label: 'Popularity', icon: '🔥' },
];

// Place types for mapping (based on your Prisma schema)
export const PLACE_TYPES = {
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  MUSEUM: 'museum',
  PARK: 'park',
  SHOPPING: 'shopping',
  HOTEL: 'hotel',
  BEACH: 'beach',
  MOUNTAIN: 'mountain',
  HISTORICAL: 'historical',
  RELIGIOUS: 'religious',
  CULTURAL: 'cultural',
  ADVENTURE: 'adventure',
} as const;

export type PlaceType = typeof PLACE_TYPES[keyof typeof PLACE_TYPES];

// Event types for mapping
export const EVENT_TYPES = {
  CONCERT: 'concert',
  FESTIVAL: 'festival',
  WORKSHOP: 'workshop',
  SPORTS: 'sports',
  EXHIBITION: 'exhibition',
  CONFERENCE: 'conference',
  PARTY: 'party',
  TOUR: 'tour',
  CLASS: 'class',
  OTHER: 'other',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Amenities for places (extended from Prisma schema)
export const AMENITIES = [
  { id: 'wifi', name: 'Wi-Fi', icon: '📶' },
  { id: 'parking', name: 'Parking', icon: '🅿️' },
  { id: 'air-conditioning', name: 'Air Conditioning', icon: '❄️' },
  { id: 'wheelchair-accessible', name: 'Wheelchair Accessible', icon: '♿' },
  { id: 'outdoor-seating', name: 'Outdoor Seating', icon: '🌳' },
  { id: 'family-friendly', name: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
  { id: 'pet-friendly', name: 'Pet Friendly', icon: '🐕' },
  { id: 'alcohol-served', name: 'Alcohol Served', icon: '🍺' },
  { id: 'vegetarian-options', name: 'Vegetarian Options', icon: '🥦' },
  { id: 'vegan-options', name: 'Vegan Options', icon: '🌱' },
  { id: 'halal', name: 'Halal', icon: '☪️' },
  { id: 'takeout', name: 'Takeout', icon: '🥡' },
  { id: 'delivery', name: 'Delivery', icon: '🚚' },
  { id: 'reservations', name: 'Reservations', icon: '📞' },
  { id: 'live-music', name: 'Live Music', icon: '🎵' },
  { id: 'tv', name: 'TV', icon: '📺' },
  { id: 'smoking-area', name: 'Smoking Area', icon: '🚬' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚻' },
  { id: 'changing-table', name: 'Changing Table', icon: '👶' },
  { id: 'atm', name: 'ATM', icon: '🏧' },
];

// Ticket types for events
export const TICKET_TYPES = [
  { id: 'general', name: 'General Admission', color: '#007AFF' },
  { id: 'vip', name: 'VIP', color: '#FF9500' },
  { id: 'early-bird', name: 'Early Bird', color: '#34C759' },
  { id: 'student', name: 'Student', color: '#5856D6' },
  { id: 'senior', name: 'Senior', color: '#AF52DE' },
  { id: 'group', name: 'Group', color: '#FF2D55' },
  { id: 'family', name: 'Family', color: '#FF3B30' },
  { id: 'child', name: 'Child', color: '#5AC8FA' },
];

// Opening days constants
export const DAYS_OF_WEEK = [
  { id: 'monday', name: 'Monday', short: 'Mon' },
  { id: 'tuesday', name: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', name: 'Wednesday', short: 'Wed' },
  { id: 'thursday', name: 'Thursday', short: 'Thu' },
  { id: 'friday', name: 'Friday', short: 'Fri' },
  { id: 'saturday', name: 'Saturday', short: 'Sat' },
  { id: 'sunday', name: 'Sunday', short: 'Sun' },
];

// Social media platforms
export const SOCIAL_MEDIA_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000' },
  { id: 'telegram', name: 'Telegram', icon: '📨', color: '#26A5E4' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
  { id: 'website', name: 'Website', icon: '🌐', color: '#4285F4' },
];

// Helper functions for Prisma enums
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return '#FF9800';
    case 'CONFIRMED':
    case 'SUCCESS':
      return '#4CAF50';
    case 'CANCELLED':
    case 'FAILED':
      return '#F44336';
    case 'USED':
      return '#9C27B0';
    case 'EXPIRED':
      return '#607D8B';
    case 'INITIATED':
      return '#2196F3';
    case 'REFUNDED':
      return '#FF9800';
    default:
      return '#9E9E9E';
  }
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PENDING:
      return '#FF9800';
    case PaymentStatus.INITIATED:
      return '#2196F3';
    case PaymentStatus.SUCCESS:
      return '#4CAF50';
    case PaymentStatus.FAILED:
      return '#F44336';
    case PaymentStatus.REFUNDED:
      return '#9C27B0';
    default:
      return '#9E9E9E';
  }
};

export const getTicketStatusColor = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.PENDING:
      return '#FF9800';
    case TicketStatus.CONFIRMED:
      return '#4CAF50';
    case TicketStatus.CANCELLED:
      return '#F44336';
    case TicketStatus.USED:
      return '#9C27B0';
    case TicketStatus.EXPIRED:
      return '#607D8B';
    default:
      return '#9E9E9E';
  }
};

export const getReviewStatusColor = (status: ReviewStatus): string => {
  switch (status) {
    case ReviewStatus.PENDING:
      return '#FF9800';
    case ReviewStatus.APPROVED:
      return '#4CAF50';
    case ReviewStatus.REJECTED:
      return '#F44336';
    case ReviewStatus.HIDDEN:
      return '#607D8B';
    default:
      return '#9E9E9E';
  }
};

// Helper function to get category icon
export const getCategoryIcon = (key: string): string => {
  const iconMap: Record<string, string> = {
    restaurant: '🍽️',
    cafe: '☕',
    museum: '🏛️',
    park: '🌳',
    shopping: '🛍️',
    hotel: '🏨',
    beach: '🏖️',
    mountain: '⛰️',
    historical: '🏰',
    religious: '🛐',
    cultural: '🎭',
    adventure: '🧗',
    concert: '🎵',
    festival: '🎪',
    workshop: '🔧',
    sports: '⚽',
    exhibition: '🖼️',
    conference: '💼',
    party: '🎉',
    tour: '🚶',
    class: '📚',
  };
  
  return iconMap[key] || '📍';
};

// Helper function to format price
export const formatPrice = (price: number | null | undefined, currency: string = 'ETB'): string => {
  if (price === null || price === undefined) return 'Free';
  if (price === 0) return 'Free';
  
  const symbol = DISCOVERY_CONSTANTS.CURRENCY.SYMBOLS[currency as keyof typeof DISCOVERY_CONSTANTS.CURRENCY.SYMBOLS] || currency;
  
  // Format based on currency
  if (currency === 'ETB') {
    return `${symbol}${price.toFixed(2)}`;
  }
  
  return `${symbol}${price.toFixed(2)}`;
};

// Helper function to format distance
export const formatDistance = (distanceInKm: number | undefined): string => {
  if (distanceInKm === undefined) return 'Distance unknown';
  
  if (distanceInKm < 1) {
    const meters = Math.round(distanceInKm * 1000);
    return `${meters}m away`;
  }
  
  return `${distanceInKm.toFixed(1)}km away`;
};

// Helper function to format date
export const formatDate = (dateString: string, format: keyof typeof DISCOVERY_CONSTANTS.TIME_FORMATS = 'DISPLAY_DATE'): string => {
  try {
    const date = new Date(dateString);
    const formatString = DISCOVERY_CONSTANTS.TIME_FORMATS[format];
    
    // Simple formatting for now - you can use date-fns or moment for better formatting
    if (format === 'DISPLAY_DATE') {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } else if (format === 'DISPLAY_TIME') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (format === 'DISPLAY_DATETIME') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return date.toISOString();
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to calculate days until event
export const getDaysUntilEvent = (eventDate: string): number => {
  try {
    const event = new Date(eventDate);
    const now = new Date();
    
    // Reset time to midnight for accurate day calculation
    event.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    return -1;
  }
};

// Helper function to get availability text
export const getAvailabilityText = (available: number, total: number): string => {
  if (total === 0) return 'Unlimited';
  if (available <= 0) return 'Sold Out';
  if (available < 10) return `${available} spots left`;
  if (available < total * 0.3) return 'Limited spots';
  return 'Available';
};

// Helper function to get availability color
export const getAvailabilityColor = (available: number, total: number): string => {
  if (total === 0) return '#4CAF50'; // Unlimited - green
  if (available <= 0) return '#F44336'; // Sold out - red
  if (available < 10) return '#FF9800'; // Few spots - orange
  if (available < total * 0.3) return '#FF9800'; // Limited - orange
  return '#4CAF50'; // Available - green
};

// Helper function to get rating color
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#4CAF50'; // Excellent - green
  if (rating >= 4.0) return '#8BC34A'; // Very good - light green
  if (rating >= 3.5) return '#FFC107'; // Good - yellow
  if (rating >= 3.0) return '#FF9800'; // Average - orange
  return '#F44336'; // Poor - red
};

// Helper function to get interaction icon
export const getInteractionIcon = (type: InteractionType): string => {
  switch (type) {
    case InteractionType.VIEW:
      return '👁️';
    case InteractionType.CLICK:
      return '👆';
    case InteractionType.SAVE:
      return '💾';
    case InteractionType.BOOK:
      return '📅';
    case InteractionType.REVIEW:
      return '⭐';
    case InteractionType.SHARE:
      return '📤';
    default:
      return '🔍';
  }
};

// Helper function to get recommendation type icon
export const getRecommendationTypeIcon = (type: RecommendationItemType): string => {
  switch (type) {
    case RecommendationItemType.PLACE:
      return '🏛️';
    case RecommendationItemType.EVENT:
      return '🎪';
    case RecommendationItemType.RESTAURANT:
      return '🍽️';
    case RecommendationItemType.OTHER:
      return '📍';
    default:
      return '📍';
  }
};

// Helper function to get media type icon
export const getMediaTypeIcon = (type: MediaType): string => {
  switch (type) {
    case MediaType.IMAGE:
      return '🖼️';
    case MediaType.VIDEO:
      return '🎥';
    default:
      return '📁';
  }
};

// Export all constants and helpers
export default {
  DISCOVERY_CONSTANTS,
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS,
  SORT_OPTIONS,
  PLACE_TYPES,
  EVENT_TYPES,
  AMENITIES,
  TICKET_TYPES,
  DAYS_OF_WEEK,
  SOCIAL_MEDIA_PLATFORMS,
  
  // Helper functions
  getStatusColor,
  getPaymentStatusColor,
  getTicketStatusColor,
  getReviewStatusColor,
  getCategoryIcon,
  formatPrice,
  formatDistance,
  formatDate,
  getDaysUntilEvent,
  getAvailabilityText,
  getAvailabilityColor,
  getRatingColor,
  getInteractionIcon,
  getRecommendationTypeIcon,
  getMediaTypeIcon,
};