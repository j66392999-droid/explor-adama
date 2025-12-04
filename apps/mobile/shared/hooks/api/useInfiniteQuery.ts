import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginatedResponse, ApiError } from '../../types/api.types';
import { logger } from '../../utils/logging/logger';
import { apiClient } from '../../services/api/client';

export interface UseInfiniteQueryOptions<TData = any> {
  getNextPageParam?: (lastPage: PaginatedResponse<TData>, allPages: TData[]) => any;
  onSuccess?: (data: TData[]) => void;
  onError?: (error: ApiError) => void;
  enabled?: boolean;
}

export interface UseInfiniteQueryResult<TData = any> {
  data: TData[];
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInfiniteQuery<TData = any>(
  queryFn: (pageParam: any) => Promise<ApiResponse<PaginatedResponse<TData>>>,
  options: UseInfiniteQueryOptions<TData> = {}
): UseInfiniteQueryResult<TData> {
  const {
    getNextPageParam = (lastPage: PaginatedResponse<TData>) => 
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    onSuccess,
    onError,
    enabled = true,
  } = options;

  const [data, setData] = useState<TData[]>([]);
  const [pageParams, setPageParams] = useState<any[]>([undefined]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchPage = useCallback(async (pageParam: any, isRefetch = false) => {
    if (!enabled) return;

    try {
      const response = await queryFn(pageParam);
      
      if (!response.success) {
        throw {
          code: response.code || 'API_ERROR',
          message: response.error || 'Request failed',
          details: response,
        } as ApiError;
      }

      const pageData = response.data as PaginatedResponse<TData>;
      const newItems = pageData.data;

      if (isRefetch) {
        setData(newItems);
      } else {
        setData(prev => [...prev, ...newItems]);
      }

      // Update next page param
      const nextPageParam = getNextPageParam(pageData, data);
      setHasNextPage(!!nextPageParam);

      if (nextPageParam && !pageParams.includes(nextPageParam)) {
        setPageParams(prev => [...prev, nextPageParam]);
      }

      setError(null);
      onSuccess?.(data);
    } catch (err: any) {
      const apiError: ApiError = {
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An error occurred',
        details: err.details,
      };

      setError(apiError);
      onError?.(apiError);
      logger.error('Infinite query failed', { error: apiError });
    }
  }, [queryFn, getNextPageParam, enabled, onSuccess, onError, data, pageParams]);

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    
    const nextPageParam = getNextPageParam(
      { data: data.slice(-1)[0], pagination: { hasNext: hasNextPage } } as any,
      data
    );

    if (nextPageParam) {
      await fetchPage(nextPageParam);
    }

    setIsFetchingNextPage(false);
  }, [hasNextPage, isFetchingNextPage, getNextPageParam, fetchPage, data]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setData([]);
    setPageParams([undefined]);
    setHasNextPage(true);
    
    await fetchPage(undefined, true);
    setIsLoading(false);
  }, [fetchPage]);

  // Initial fetch
  useEffect(() => {
    if (enabled && data.length === 0) {
      fetchPage(undefined);
    }
  }, [enabled, fetchPage, data.length]);

  return {
    data,
    error,
    isLoading: isLoading && enabled && data.length === 0,
    isError: !!error,
    isSuccess: !error && !isLoading && data.length > 0,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
}

// Hook for paginated lists
export function usePaginatedQuery<TData = any>(
  url: string,
  initialParams: any = {},
  options: UseInfiniteQueryOptions<TData> = {}
) {
  const queryFn = useCallback(async (pageParam: any) => {
    const params = {
      ...initialParams,
      page: pageParam || initialParams.page || 1,
      limit: initialParams.limit || 20,
    };

    return apiClient.get<PaginatedResponse<TData>>(url, { params });
  }, [url, initialParams]);

  return useInfiniteQuery(queryFn, options);
}

// Hook for search with infinite scroll
export function useInfiniteSearch<TData = any>(
  searchFn: (query: string, pageParam: any) => Promise<ApiResponse<PaginatedResponse<TData>>>,
  query: string,
  options: UseInfiniteQueryOptions<TData> = {}
) {
  const queryFn = useCallback(async (pageParam: any) => {
    return searchFn(query, pageParam);
  }, [searchFn, query]);

  return useInfiniteQuery(queryFn, {
    ...options,
    enabled: options.enabled !== false && query.length > 0,
  });
}