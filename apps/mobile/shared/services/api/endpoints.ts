// Base endpoints
export const BASE_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  USERS: '/api/v1/users',
  PLACES: '/api/v1/places',
  EVENTS: '/api/v1/events',
  BOOKINGS: '/api/v1/bookings',
  PAYMENTS: '/api/v1/payments',
  TICKETS: '/api/v1/tickets',
  REVIEWS: '/api/v1/reviews',
  BLOGS: '/api/v1/blogs',
  NOTIFICATIONS: '/api/v1/notifications',
  FAVORITES: '/api/v1/favorites',
} as const;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_ENDPOINTS.AUTH}/login`,
  REGISTER: `${BASE_ENDPOINTS.AUTH}/register`,
  LOGOUT: `${BASE_ENDPOINTS.AUTH}/logout`,
  REFRESH_TOKEN: `${BASE_ENDPOINTS.AUTH}/refresh`,
  FORGOT_PASSWORD: `${BASE_ENDPOINTS.AUTH}/forgot-password`,
  RESET_PASSWORD: `${BASE_ENDPOINTS.AUTH}/reset-password`,
  VERIFY_EMAIL: `${BASE_ENDPOINTS.AUTH}/verify-email`,
  VERIFY_PHONE: `${BASE_ENDPOINTS.AUTH}/verify-phone`,
  SOCIAL_LOGIN: `${BASE_ENDPOINTS.AUTH}/social`,
} as const;

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${BASE_ENDPOINTS.USERS}/profile`,
  UPDATE_PROFILE: `${BASE_ENDPOINTS.USERS}/profile`,
  CHANGE_PASSWORD: `${BASE_ENDPOINTS.USERS}/change-password`,
  UPLOAD_AVATAR: `${BASE_ENDPOINTS.USERS}/avatar`,
  DELETE_ACCOUNT: `${BASE_ENDPOINTS.USERS}/account`,
} as const;

// Places endpoints
export const PLACE_ENDPOINTS = {
  GET_ALL: BASE_ENDPOINTS.PLACES,
  GET_BY_ID: (id: string) => `${BASE_ENDPOINTS.PLACES}/${id}`,
  SEARCH: `${BASE_ENDPOINTS.PLACES}/search`,
  BY_CATEGORY: (category: string) => `${BASE_ENDPOINTS.PLACES}/category/${category}`,
  NEARBY: `${BASE_ENDPOINTS.PLACES}/nearby`,
  POPULAR: `${BASE_ENDPOINTS.PLACES}/popular`,
  RECOMMENDED: `${BASE_ENDPOINTS.PLACES}/recommended`,
} as const;

// Events endpoints
export const EVENT_ENDPOINTS = {
  GET_ALL: BASE_ENDPOINTS.EVENTS,
  GET_BY_ID: (id: string) => `${BASE_ENDPOINTS.EVENTS}/${id}`,
  SEARCH: `${BASE_ENDPOINTS.EVENTS}/search`,
  BY_CATEGORY: (category: string) => `${BASE_ENDPOINTS.EVENTS}/category/${category}`,
  UPCOMING: `${BASE_ENDPOINTS.EVENTS}/upcoming`,
  POPULAR: `${BASE_ENDPOINTS.EVENTS}/popular`,
} as const;

// Booking endpoints
export const BOOKING_ENDPOINTS = {
  CREATE: BASE_ENDPOINTS.BOOKINGS,
  GET_ALL: BASE_ENDPOINTS.BOOKINGS,
  GET_BY_ID: (id: string) => `${BASE_ENDPOINTS.BOOKINGS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.BOOKINGS}/${id}`,
  CANCEL: (id: string) => `${BASE_ENDPOINTS.BOOKINGS}/${id}/cancel`,
  USER_BOOKINGS: `${BASE_ENDPOINTS.BOOKINGS}/user`,
} as const;

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  INITIATE: `${BASE_ENDPOINTS.PAYMENTS}/initiate`,
  VERIFY: `${BASE_ENDPOINTS.PAYMENTS}/verify`,
  METHODS: `${BASE_ENDPOINTS.PAYMENTS}/methods`,
  HISTORY: `${BASE_ENDPOINTS.PAYMENTS}/history`,
  CHAPA_WEBHOOK: `${BASE_ENDPOINTS.PAYMENTS}/chapa/webhook`,
} as const;

// Ticket endpoints
export const TICKET_ENDPOINTS = {
  GET_ALL: BASE_ENDPOINTS.TICKETS,
  GET_BY_ID: (id: string) => `${BASE_ENDPOINTS.TICKETS}/${id}`,
  DOWNLOAD: (id: string) => `${BASE_ENDPOINTS.TICKETS}/${id}/download`,
  VALIDATE: (id: string) => `${BASE_ENDPOINTS.TICKETS}/${id}/validate`,
  USER_TICKETS: `${BASE_ENDPOINTS.TICKETS}/user`,
} as const;

// Review endpoints
export const REVIEW_ENDPOINTS = {
  CREATE: BASE_ENDPOINTS.REVIEWS,
  GET_ALL: (placeId: string) => `${BASE_ENDPOINTS.REVIEWS}/place/${placeId}`,
  GET_BY_ID: (id: string) => `${BASE_ENDPOINTS.REVIEWS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.REVIEWS}/${id}`,
  DELETE: (id: string) => `${BASE_ENDPOINTS.REVIEWS}/${id}`,
  USER_REVIEWS: `${BASE_ENDPOINTS.REVIEWS}/user`,
} as const;

// Blog endpoints
export const BLOG_ENDPOINTS = {
  GET_ALL: BASE_ENDPOINTS.BLOGS,
  GET_BY_ID: (id: string) => `${BASE_ENDPOINTS.BLOGS}/${id}`,
  CREATE: BASE_ENDPOINTS.BLOGS,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.BLOGS}/${id}`,
  DELETE: (id: string) => `${BASE_ENDPOINTS.BLOGS}/${id}`,
  USER_BLOGS: `${BASE_ENDPOINTS.BLOGS}/user`,
  LIKE: (id: string) => `${BASE_ENDPOINTS.BLOGS}/${id}/like`,
  COMMENT: (id: string) => `${BASE_ENDPOINTS.BLOGS}/${id}/comments`,
} as const;

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: BASE_ENDPOINTS.NOTIFICATIONS,
  MARK_READ: (id: string) => `${BASE_ENDPOINTS.NOTIFICATIONS}/${id}/read`,
  MARK_ALL_READ: `${BASE_ENDPOINTS.NOTIFICATIONS}/read-all`,
  UNREAD_COUNT: `${BASE_ENDPOINTS.NOTIFICATIONS}/unread-count`,
  SETTINGS: `${BASE_ENDPOINTS.NOTIFICATIONS}/settings`,
} as const;

// Favorite endpoints
export const FAVORITE_ENDPOINTS = {
  GET_ALL: BASE_ENDPOINTS.FAVORITES,
  ADD: BASE_ENDPOINTS.FAVORITES,
  REMOVE: (id: string) => `${BASE_ENDPOINTS.FAVORITES}/${id}`,
  CHECK: (placeId: string) => `${BASE_ENDPOINTS.FAVORITES}/check/${placeId}`,
  COLLECTIONS: `${BASE_ENDPOINTS.FAVORITES}/collections`,
  CREATE_COLLECTION: `${BASE_ENDPOINTS.FAVORITES}/collections`,
  UPDATE_COLLECTION: (id: string) => `${BASE_ENDPOINTS.FAVORITES}/collections/${id}`,
  DELETE_COLLECTION: (id: string) => `${BASE_ENDPOINTS.FAVORITES}/collections/${id}`,
} as const;

// File upload endpoints
export const UPLOAD_ENDPOINTS = {
  SINGLE: '/upload/single',
  MULTIPLE: '/upload/multiple',
  DELETE: (filename: string) => `/upload/${filename}`,
} as const;

// Helper function to build URL with query parameters
export const buildUrl = (
  endpoint: string,
  params?: Record<string, any>
): string => {
  if (!params) return endpoint;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};