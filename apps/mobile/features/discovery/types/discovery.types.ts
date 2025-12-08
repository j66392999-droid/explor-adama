import { MediaType, ReviewStatus, InteractionType, RecommendationItemType } from '../../../shared/types/api.types';
import { PaginatedResponse } from '../../../shared/types/api.types';

// Core types matching Prisma schema
export interface Place {
  id: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  images: Media[];
  reviews?: Review[];
  viewCount: number;
  bookingCount: number;
  avgRating?: number | null;
  createdAt: string;
  updatedAt: string;
  tags?: PlaceTag[];
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  placeId?: string | null;
  place?: Place | null;
  categoryId?: string | null;
  category?: Category | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  capacity?: number | null;
  price?: number | null;
  images: Media[];
  bookingCount: number;
  viewCount: number;
  avgRating?: number | null;
  createdAt: string;
  updatedAt: string;
  tickets: Ticket[];
  bookings: Booking[];
}

export interface Category {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  places?: Place[];
  events?: Event[];
}

export interface Media {
  id: string;
  url: string;
  type: MediaType;
  caption?: string | null;
  placeId?: string | null;
  eventId?: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  items: PlaceTag[];
}

export interface PlaceTag {
  id: string;
  placeId: string;
  tagId: string;
  place: Place;
  tag: Tag;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  placeId?: string | null;
  eventId?: string | null;
  status: ReviewStatus;
  user: User;
  place?: Place | null;
  event?: Event | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  profile?: Profile | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name?: string | null;
  gender?: string | null;
  phone?: string | null;
  country?: string | null;
  avatar?: string | null;
  locale?: string | null;
  user: User;
}

export interface Ticket {
  id: string;
  bookingId?: string | null;
  userId: string;
  eventId: string;
  placeId?: string;

  qrToken: string;
  seat?: string | null;
  status: string;
  issuedAt: string;
  usedAt?: string | null;
  expiresAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  placeId?: string;
  quantity: number;
  subTotal: number;
  tax: number;
  fees: number;
  total: number;
  status: string;
  transactionId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  user: User;
  event: Event;
  tickets: Ticket[];
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  bookingId?: string | null;
  paymentId?: string | null;
  number: string;
  amount: number;
  currency: string;
  issuedAt: string;
}

// Discovery-specific types
export interface DiscoveryFilter {
  categoryIds?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  distance?: number; // in km
  dateRange?: { start: Date; end: Date };
  tags?: string[];
}

export interface SearchResult {
  places: Place[];
  events: Event[];
  total: number;
}

export interface MapMarker {
  id: string;
  type: 'PLACE' | 'EVENT';
  title: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  data: Place | Event;
}

export interface DiscoveryState {
  searchQuery: string;
  filters: DiscoveryFilter;
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  searchResults: SearchResult;
  nearbyPlaces: Place[];
  nearbyEvents: Event[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

export interface PlaceDetail extends Place {
  openingHours?: OpeningHour[];
  contactInfo?: ContactInfo;
  amenities?: string[];
  reviews: Review[];
  similarPlaces?: Place[];
}

export interface EventDetail extends Event {
  organizer?: Organizer;
  tickets: Ticket[];
  attendees?: Attendee[];
  similarEvents?: Event[];
  bookings: Booking[];
}

export interface OpeningHour {
  day: string;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: SocialMedia[];
}

export interface SocialMedia {
  platform: string;
  url: string;
}

export interface Organizer {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  rating?: number;
  contactEmail?: string;
}

export interface Attendee {
  id: string;
  name: string;
  avatar?: string;
}

// API Response types
export interface DiscoveryResponse {
  places: Place[];
  events: Event[];
  categories: Category[];
  totalPlaces: number;
  totalEvents: number;
}

export interface LocationSearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in meters
  limit?: number;
  categories?: string[];
  tags?: string[];
}

export interface SearchParams {
  query?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  filters?: DiscoveryFilter;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'price' | 'date';
  page?: number;
  limit?: number;
}

export interface AutoCompleteResult {
  id: string;
  name: string;
  type: 'PLACE' | 'EVENT' | 'CATEGORY' | 'TAG';
  data: any | null;
}

// Extended types for enriched data
export interface EnrichedPlace extends Place {
  distance?: number; // in km
  openingHours?: OpeningHour[];
  isOpenNow?: boolean;
  popularTimes?: PopularTime[];
}

export interface EnrichedEvent extends Event {
  distance?: number; // in km
  availability?: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT';
  daysUntil?: number;
  organizer?: Organizer;
  tags?: string[];
}

export interface PopularTime {
  hour: number;
  busyness: number; // 0-100
  visitors: number;
}

// Recommendation types
export interface Recommendation {
  id: string;
  userId?: string | null;
  itemId: string;
  itemType: RecommendationItemType;
  score: number;
  reason?: string | null;
  modelVersion?: string | null;
  metadata?: any;
  createdAt: string;
  item?: Place | Event;
}

// Interaction types for ML
export interface Interaction {
  id: string;
  userId?: string | null;
  itemId: string;
  itemType: RecommendationItemType;
  type: InteractionType;
  context?: any;
  createdAt: string;
}

// Favorite types
export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: RecommendationItemType;
  createdAt: string;
  item?: Place | Event;
}

// Review submission
export interface ReviewInput {
  rating: number;
  comment?: string;
  placeId?: string;
  eventId?: string;
}

// Booking creation
export interface BookingInput {
  eventId: string;
  quantity: number;
  ticketType?: string;
}

// API Response types
export interface PaginatedDiscoveryResponse {
  data: (Place | Event)[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}