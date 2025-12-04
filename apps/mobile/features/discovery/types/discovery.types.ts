// Types that match your Prisma schema structure
export interface User {
  id: string;
  email: string;
  role: 'TOURIST' ;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string | null;
  gender: string | null;
  phone: string | null;
  country: string | null;
  avatar: string | null;
  locale: string | null;
  user: User;
}

export interface Category {
  id: string;
  key: string;
  name: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Place {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  category: Category | null;
  latitude: number;
  longitude: number;
  address: string | null;
  viewCount: number;
  bookingCount: number;
  avgRating: number | null;
  createdAt: string;
  updatedAt: string;
  images: Media[];
  reviews: Review[];
  tags: PlaceTag[];
}

export interface PlaceTag {
  id: string;
  placeId: string;
  tagId: string;
  tag: Tag;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  placeId: string | null;
  place: Place | null;
  categoryId: string | null;
  category: Category | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number | null;
  price: number | null;
  bookingCount: number;
  viewCount: number;
  avgRating: number | null;
  createdAt: string;
  updatedAt: string;
  images: Media[];
  reviews: Review[];
}

export interface Media {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  caption: string | null;
  placeId: string | null;
  eventId: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  placeId: string | null;
  eventId: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  user: User;
  place: Place | null;
  event: Event | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  subTotal: number;
  tax: number;
  fees: number;
  total: number;
  status: string;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string | null;
  user: User;
  event: Event;
  tickets: Ticket[];
}

export interface Ticket {
  id: string;
  bookingId: string | null;
  userId: string;
  eventId: string;
  qrToken: string;
  seat: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'USED' | 'EXPIRED';
  issuedAt: string;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking: Booking | null;
  user: User;
  event: Event;
}

// Frontend-specific types for discovery
export interface SearchFilters {
  category: string | null;
  priceRange: [number, number];
  rating: number;
  distance: number;
  sortBy: 'relevance' | 'distance' | 'rating' | 'price' | 'name';
  tags?: string[];
}

export interface SearchResult {
  type: 'place' | 'event';
  data: Place | Event;
  relevance: number;
  distance?: number;
}

export interface DiscoveryState {
  searchQuery: string;
  filters: SearchFilters;
  selectedCategory: Category | null;
  selectedPlace: Place | null;
  selectedEvent: Event | null;
  recentSearches: string[];
  viewedPlaces: string[];
  eventDetail: Event | null;
  getEventDetail: string ;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description?: string;
  type: 'place' | 'event';
  data: Place | Event;
}

// API Response Types
export interface PlacesResponse {
  places: Place[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}