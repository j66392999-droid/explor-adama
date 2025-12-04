import React from 'react';
import {
  TypedUseSelectorHook,
  useSelector,
  useStore,
} from 'react-redux';
import useAppDispatch from './useAppDispatch';
export { default as useAppDispatch } from './useAppDispatch';
import type { RootState, AppDispatch, AppStore } from '../../../store';

// Typed versions of the standard Redux hooks

/**
 * Typed version of useDispatch hook
 * @returns The typed dispatch function
 * 
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(someAction());
 */

/**
 * Typed version of useSelector hook
 * 
 * @example
 * const user = useAppSelector(state => state.auth.user);
 * const isLoading = useAppSelector(state => state.auth.isLoading);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Typed version of useStore hook
 * @returns The typed Redux store
 * 
 * @example
 * const store = useAppStore();
 * const state = store.getState();
 */
export const useAppStore = (): AppStore => useStore() as unknown as AppStore;

// Enhanced selector hooks with additional functionality

/**
 * Hook for selecting data with loading and error states
 * 
 * @param selector - Function to select data from state
 * @param options - Configuration options
 * @returns Object containing data, loading, and error states
 * 
 * @example
 * const { data: user, isLoading, error } = useAppSelectorWithStatus(
 *   state => state.auth.user,
 *   { selectorName: 'user' }
 * );
 */
export function useAppSelectorWithStatus<T>(
  selector: (state: RootState) => T,
  options?: {
    selectorName?: string;
    showLoading?: boolean;
  }
) {
  const data = useAppSelector(selector);
  const isLoading = useAppSelector(state => state.app.isLoading);
  const error = useAppSelector(state => state.app.error);

  return {
    data,
    isLoading: options?.showLoading ? isLoading : false,
    error,
    isSuccess: !isLoading && !error,
    isEmpty: data === null || data === undefined || (Array.isArray(data) && data.length === 0),
  };
}

/**
 * Hook for selecting paginated data with common pagination states
 * 
 * @param selector - Function to select paginated data from state
 * @returns Object containing data and pagination information
 * 
 * @example
 * const { data, pagination, hasMore, isLoading } = useAppSelectorPaginated(
 *   state => state.places.list
 * );
 */
export function useAppSelectorPaginated<T>(
  selector: (state: RootState) => {
    data: T[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
) {
  const { data, pagination } = useAppSelector(selector);
  const isLoading = useAppSelector(state => state.app.isLoading);

  const hasMore = pagination 
    ? pagination.page < pagination.totalPages 
    : false;

  const currentPage = pagination?.page || 1;
  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  return {
    data,
    pagination,
    isLoading,
    hasMore,
    currentPage,
    totalItems,
    totalPages,
    isEmpty: !data || data.length === 0,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}

/**
 * Hook for selecting data with memoization and deep equality check
 * 
 * @param selector - Function to select data from state
 * @param equalityFn - Custom equality function (defaults to shallow equal)
 * @returns The selected data
 * 
 * @example
 * const user = useAppSelectorMemoized(state => state.auth.user);
 */
export function useAppSelectorMemoized<T>(
  selector: (state: RootState) => T,
  equalityFn?: (left: T, right: T) => boolean
) {
  return useAppSelector(selector, equalityFn);
}

/**
 * Hook for selecting multiple pieces of state in one call
 * 
 * @param selectors - Object with selector functions
 * @returns Object with selected state values
 * 
 * @example
 * const { user, settings, notifications } = useAppSelectorMultiple({
 *   user: state => state.auth.user,
 *   settings: state => state.user.settings,
 *   notifications: state => state.notifications.list,
 * });
 */
export function useAppSelectorMultiple<T extends Record<string, (state: RootState) => any>>(
  selectors: T
): { [K in keyof T]: ReturnType<T[K]> } {
  const result = {} as { [K in keyof T]: ReturnType<T[K]> };
  
  for (const key in selectors) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    result[key] = useAppSelector(selectors[key]);
  }
  
  return result;
}

/**
 * Hook for selecting state with transformation
 * 
 * @param selector - Function to select data from state
 * @param transform - Function to transform the selected data
 * @returns The transformed data
 * 
 * @example
 * const fullName = useAppSelectorTransformed(
 *   state => state.auth.user,
 *   user => user ? `${user.firstName} ${user.lastName}` : ''
 * );
 */
export function useAppSelectorTransformed<T, R>(
  selector: (state: RootState) => T,
  transform: (data: T) => R
): R {
  const data = useAppSelector(selector);
  return transform(data);
}

/**
 * Hook for selecting state with dependency array (similar to useMemo)
 * 
 * @param selector - Function to select data from state
 * @param deps - Dependency array for memoization
 * @returns The selected data
 * 
 * @example
 * const filteredPlaces = useAppSelectorWithDeps(
 *   state => state.places.list.filter(p => p.category === category),
 *   [category]
 * );
 */
export function useAppSelectorWithDeps<T>(
  selector: (state: RootState) => T,
  deps: any[]
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedSelector = React.useCallback(selector, deps);
  return useAppSelector(memoizedSelector);
}

/**
 * Hook for selecting state with conditional execution
 * 
 * @param selector - Function to select data from state
 * @param condition - Condition to determine if selector should be executed
 * @returns The selected data or undefined
 * 
 * @example
 * const userProfile = useAppSelectorConditional(
 *   state => state.user.profile,
 *   !!userId
 * );
 */
export function useAppSelectorConditional<T>(
  selector: (state: RootState) => T,
  condition: boolean
): T | undefined {
  return useAppSelector(state => condition ? selector(state) : undefined);
}

/**
 * Hook for selecting state with debouncing
 * 
 * @param selector - Function to select data from state
 * @param delay - Debounce delay in milliseconds
 * @returns The debounced selected data
 * 
 * @example
 * const searchResults = useAppSelectorDebounced(
 *   state => state.search.results,
 *   300
 * );
 */
export function useAppSelectorDebounced<T>(
  selector: (state: RootState) => T,
  delay: number
): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(() => {
    const store = useAppStore();
    return selector(store.getState());
  });

  const value = useAppSelector(selector);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for selecting state with previous value tracking
 * 
 * @param selector - Function to select data from state
 * @returns Object with current and previous values
 * 
 * @example
 * const { current: currentUser, previous: previousUser } = useAppSelectorWithPrevious(
 *   state => state.auth.user
 * );
 */
export function useAppSelectorWithPrevious<T>(
  selector: (state: RootState) => T
): { current: T; previous: T | undefined } {
  const value = useAppSelector(selector);
  const ref = React.useRef<T | undefined>(undefined);

  React.useEffect(() => {
    ref.current = value;
  });

  return {
    current: value,
    previous: ref.current,
  };
}

/**
 * Hook for selecting state and comparing with previous value
 * 
 * @param selector - Function to select data from state
 * @param compareFn - Function to compare current and previous values
 * @returns Whether the value has changed based on the compare function
 * 
 * @example
 * const hasUserChanged = useAppSelectorCompare(
 *   state => state.auth.user,
 *   (prev, curr) => prev?.id !== curr?.id
 * );
 */
export function useAppSelectorCompare<T>(
  selector: (state: RootState) => T,
  compareFn: (previous: T | undefined, current: T) => boolean
): boolean {
  const value = useAppSelector(selector);
  const previousValue = React.useRef<T | undefined>(undefined);
  const hasChanged = React.useRef(false);

  hasChanged.current = compareFn(previousValue.current, value);
  previousValue.current = value;

  return hasChanged.current;
}

// Specialized hooks for common state patterns

/**
 * Hook for selecting authentication state
 * 
 * @returns Authentication state and helper methods
 * 
 * @example
 * const { isAuthenticated, user, isLoading, hasRole } = useAppSelectorAuth();
 */
export function useAppSelectorAuth() {
  const user = useAppSelector(state => state.auth.user);
  const isLoading = useAppSelector(state => state.auth.isLoading);
  const error = useAppSelector(state => state.auth.error);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const hasRole = React.useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  const hasPermission = React.useCallback((permission: string) => {
    // Implement permission logic based on user role
    switch (user?.role) {
      case 'ADMIN':
        return true;
      case 'RESIDENT':
        return ['read', 'write', 'review'].includes(permission);
      case 'TOURIST':
        return ['read', 'review'].includes(permission);
      default:
        return false;
    }
  }, [user]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin: hasRole('ADMIN'),
    isTourist: hasRole('TOURIST'),
    isResident: hasRole('RESIDENT'),
  };
}

/**
 * Hook for selecting UI/theme state
 * 
 * @returns UI state and theme information
 * 
 * @example
 * const { theme, language, isDarkMode } = useAppSelectorUI();
 */
export function useAppSelectorUI() {
  const theme = useAppSelector(state => state.app.theme);
  const language = useAppSelector(state => state.app.language);
  const isDarkMode = useAppSelector(state => state.app.isDarkMode);

  return {
    theme,
    language,
    isDarkMode,
    isRTL: language === 'ar', // Example for RTL languages
  };
}

/**
 * Hook for selecting network state
 * 
 * @returns Network connectivity information
 * 
 * @example
 * const { isConnected, connectionType } = useAppSelectorNetwork();
 */
export function useAppSelectorNetwork() {
  const isConnected = useAppSelector(state => state.app.isConnected);
  const connectionType = useAppSelector(state => state.app.connectionType);

  return {
    isConnected,
    connectionType,
    isOffline: !isConnected,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
  };
}

/**
 * Hook for selecting feature flags
 * 
 * @param feature - Feature flag name or array of names
 * @returns Feature flag values
 * 
 * @example
 * const isChatEnabled = useAppSelectorFeatureFlag('chat');
 * const { chat, payments, social } = useAppSelectorFeatureFlag(['chat', 'payments', 'social']);
 */
export function useAppSelectorFeatureFlag<T extends string | string[]>(
  feature: T
): T extends string ? boolean : Record<string, boolean> {
  const featureFlags = useAppSelector(state => state.app.featureFlags);

  if (typeof feature === 'string') {
    return (featureFlags[feature] || false) as any;
  }

  const result: Record<string, boolean> = {};
  feature.forEach(flag => {
    result[flag] = featureFlags[flag] || false;
  });

  return result as any;
}

/**
 * Hook for selecting and filtering lists with search and sort
 * 
 * @param selector - Function to select the list from state
 * @param options - Search and sort options
 * @returns Filtered and sorted list
 * 
 * @example
 * const filteredPlaces = useAppSelectorList(
 *   state => state.places.list,
 *   {
 *     searchTerm: 'restaurant',
 *     sortBy: 'name',
 *     filters: { category: 'food' }
 *   }
 * );
 */
export function useAppSelectorList<T>(
  selector: (state: RootState) => T[],
  options?: {
    searchTerm?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
    limit?: number;
  }
) {
  const list = useAppSelector(selector);

  const filteredList = React.useMemo(() => {
    let result = [...list];

    // Apply search
    if (options?.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      result = result.filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          result = result.filter(item => (item as any)[key] === value);
        }
      });
    }

    // Apply sorting
    if (options?.sortBy) {
      result.sort((a, b) => {
        const aValue = (a as any)[options.sortBy!];
        const bValue = (b as any)[options.sortBy!];
        
        if (aValue < bValue) return options.sortDirection === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortDirection === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply limit
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }, [list, options]);

  return filteredList;
}

// Custom hook creators for reusable selector patterns

/**
 * Creates a custom hook for selecting specific entity by ID
 * 
 * @param entitySelector - Selector for the entities object
 * @returns Hook to select entity by ID
 * 
 * @example
 * const useSelectPlace = createEntitySelector(state => state.places.entities);
 * const place = useSelectPlace('place-123');
 */
export function createEntitySelector<T>(
  entitySelector: (state: RootState) => Record<string, T>
) {
  return (id: string): T | undefined => {
    const entities = useAppSelector(entitySelector);
    return entities[id];
  };
}

/**
 * Creates a custom hook for selecting data with loading state from specific slice
 * 
 * @param dataSelector - Selector for the data
 * @param loadingSelector - Selector for loading state
 * @param errorSelector - Selector for error state
 * @returns Hook with data, loading, and error states
 * 
 * @example
 * const useUserProfile = createDataSelector(
 *   state => state.user.profile,
 *   state => state.user.isLoading,
 *   state => state.user.error
 * );
 * const { data: profile, isLoading, error } = useUserProfile();
 */
export function createDataSelector<T>(
  dataSelector: (state: RootState) => T,
  loadingSelector: (state: RootState) => boolean,
  errorSelector: (state: RootState) => string | null
) {
  return () => {
    const data = useAppSelector(dataSelector);
    const isLoading = useAppSelector(loadingSelector);
    const error = useAppSelector(errorSelector);

    return {
      data,
      isLoading,
      error,
      isSuccess: !isLoading && !error,
      hasData: data !== null && data !== undefined,
    };
  };
}

// Default export for convenience (other hooks are already exported via `export` keyword)
export default useAppSelector;