import { logger } from '../shared/utils/logging/logger';

let createLogger: any = null;
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createLogger = require('redux-logger').createLogger;
}
// Use broader types in middleware to avoid adding additional @types packages
type MiddlewareAny = any;

// Custom middleware for analytics
const analyticsMiddleware: MiddlewareAny = (store: any) => (next: any) => (action: any) => {
  // Log actions to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // You can send actions to your analytics service here
    try {
      logger.debug(`Analytics: ${action.type}`, action.payload);
    } catch { /* no-op */ }
  }

  return next(action);
};

// Custom middleware for error tracking
const errorTrackingMiddleware: MiddlewareAny = (store: any) => (next: any) => (action: any) => {
  try {
    return next(action);
  } catch (error: any) {
    // Log errors to your error tracking service
    try { logger.error('Redux Middleware Error', error); } catch { try { console.error(`Redux Middleware Error: ${error?.message || error}`); } catch {} }
    throw error;
  }
};

// Custom middleware for offline queue
const offlineMiddleware: MiddlewareAny = (store: any) => (next: any) => (action: any) => {
  const result = next(action);

  // Queue actions for offline sync
  if (action.meta?.offline && !navigator.onLine) {
    const offlineQueue = store.getState().app.offlineQueue;
    // Add to offline queue logic here
    console.log('Queuing action for offline sync:', action);
  }

  return result;
};

// Development logger middleware
const loggerMiddleware = createLogger
  ? createLogger({
  collapsed: true,
  duration: true,
  timestamp: true,
  logErrors: true,
  predicate: () => process.env.NODE_ENV === 'development',
  stateTransformer: (state: any) => {
    // Transform state for logging (remove sensitive data)
    const transformed = { ...state };
    
    // Remove sensitive data from auth state
    if (transformed.auth) {
      transformed.auth = {
        ...transformed.auth,
        tokens: transformed.auth.tokens ? '[REDACTED]' : null,
      };
    }
    
    // Remove sensitive data from user state
    if (transformed.user) {
      transformed.user = {
        ...transformed.user,
        sensitiveData: '[REDACTED]',
      };
    }
    
    return transformed;
  },
  actionTransformer: (action: any) => {
    // Transform actions for logging (remove sensitive data)
    if (action.type.includes('auth') && action.payload) {
      return {
        ...action,
        payload: '[REDACTED]',
      };
    }
    return action;
  },
  })
  : null;

// Combine all middleware
export const middleware: MiddlewareAny[] = [
  errorTrackingMiddleware,
  analyticsMiddleware,
  offlineMiddleware,
  ...(process.env.NODE_ENV === 'development' && loggerMiddleware ? [loggerMiddleware] : []),
];