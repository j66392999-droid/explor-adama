export const API_CONFIG = {
 baseURL:'http://192.168.8.129:3000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
    },
    SERVICES: {
      CATEGORIES: '/services/categories',
      FEATURED: '/services/featured',
      NEARBY: '/services/nearby',
      SEARCH: '/services/search',
    },
    BLOG: {
      POSTS: '/blog/posts',
      CREATE_POST: '/blog/posts',
      LIKE_POST: '/blog/posts/:id/like',
      COMMENTS: '/blog/posts/:id/comments',
    },
    ORDERS: {
      CREATE: '/orders',
      LIST: '/orders',
      DETAIL: '/orders/:id',
      TRACK: '/orders/:id/track',
    },
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_ITEMS: 'cart_items',
};