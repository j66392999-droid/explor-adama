// Base API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
  timestamp?: string;
}

// Common types from Prisma enums
export type UserRole = 'ADMIN' | 'TOURIST' | 'RESIDENT';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
export type MediaType = 'IMAGE' | 'VIDEO';
export type PaymentProvider = 'CHAPA' | 'STRIPE' | 'MANUAL';
export type PaymentStatus = 'PENDING' | 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type TicketStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'USED' | 'EXPIRED';
export type InteractionType = 'VIEW' | 'CLICK' | 'SAVE' | 'BOOK' | 'REVIEW' | 'SHARE';
export type RecommendationItemType = 'PLACE' | 'EVENT' | 'RESTAURANT' | 'OTHER';
export type ChatMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Common entity interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  label: string;
  value: string;
  field: string;
  order: 'asc' | 'desc';
}

// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinates: Coordinates;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

// File upload types
export interface FileUpload {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export interface UploadResponse {
  url: string;
  key: string;
  type: string;
  size: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  read: boolean;
  createdAt: string;
}

// Analytics events
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
}

// Form types
export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    required?: string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    validate?: (value: any) => string | boolean;
  };
  defaultValue?: T;
}

// API configuration types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: any;
  timeout?: number;
  retry?: boolean;
  retryCount?: number;
}

// Cache types
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size in bytes
}

export interface CachedData<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

// Error boundary types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Feature flag types
export interface FeatureFlags {
  [key: string]: boolean;
}

// Theme types
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    body: any;
    caption: any;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API endpoint types
export interface EndpointConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  requiresAuth?: boolean;
  cacheable?: boolean;
  retryable?: boolean;
}

// Response transformer types
export type ResponseTransformer<T = any, R = any> = (data: T) => R;

// API hook types
export interface UseApiOptions<T = any> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (data: T | undefined, error: ApiError | null) => void;
  select?: (data: any) => T;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
}

export interface UseApiResult<T = any> {
  data: T | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
}

// Pagination hook types
export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsePaginationResult extends PaginationState {
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setTotal: (total: number) => void;
}

// Infinite scroll types
export interface InfiniteScrollOptions {
  pageSize?: number;
  getNextPageParam?: (lastPage: any, allPages: any[]) => any;
}

export interface InfiniteScrollResult<T = any> {
  data: T[];
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}