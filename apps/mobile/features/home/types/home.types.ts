import { RecommendationItemType, InteractionType } from '../../../shared/types/api.types';

export interface Place {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  latitude: number;
  longitude: number;
  address?: string;
  images: Media[];
  viewCount: number;
  bookingCount: number;
  avgRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  placeId?: string;
  place?: Place;
  categoryId?: string;
  category?: Category;
  date: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  price?: number;
  images: Media[];
  bookingCount: number;
  viewCount: number;
  avgRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  key: string;
  name: string;
  createdAt: string;
}

export interface Media {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  caption?: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  userId?: string;
  itemId: string;
  itemType: RecommendationItemType;
  score: number;
  reason?: string;
  modelVersion?: string;
  metadata?: any;
  item?: Place | Event;
  createdAt: string;
  updatedAt: string;
  type: InteractionType;
}

export interface HomeData {
  featuredPlaces: Place[];
  trendingEvents: Event[];
  personalizedRecommendations: Recommendation[];
  categories: Category[];
}