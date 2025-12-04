import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse, ApiError, UseApiOptions, UseApiResult } from '../../types/api.types';
import { apiClient } from '../../services/api/client';
import { logger } from '../../utils/logging/logger';
import { storage } from '../../services/storage/asyncStorage';
import { SearchFilters } from '@/features/discovery/types/discovery.types';
import { GeoLocation as Location } from '../device/useLocation';

export function useApiQuery<T = any>(
p0: (string | Location | SearchFilters | null)[], key: string | string[], p1?: { coordinates?: string; radius?: number; category?: string | null; search?: string; minRating?: number; sortBy?: "rating" | "distance" | "relevance" | "price" | 'name'; page?: number; limit?: number; }, p2?: { enabled?: boolean; staleTime?: number; }, fetcher?: () => Promise<ApiResponse<T>>, options: UseApiOptions<T> = {}): UseApiResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    onSettled,
    select,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const cacheKey = (Array.isArray(key) ? key.join('-') : key) as any;
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled) return;

    if (!isRetry) {
      setIsLoading(true);
    }
    setIsFetching(true);
    setError(null);

    // Check cache first
    if (staleTime > 0) {
      try {
        const cached = await storage.getCachedData<T>(cacheKey as any);
        if (cached) {
          setData(cached);
          setIsLoading(false);
          setIsFetching(false);
          onSuccess?.(cached);
          onSettled?.(cached, null);
          return;
        }
      } catch (cacheError) {
        logger.warn('Cache read failed', cacheError);
      }
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      if (!fetcher) {
        throw {
          code: 'NO_FETCHER',
          message: 'No fetcher function provided',
          details: null,
        } as ApiError;
      }
      const response = await fetcher();
      
      if (!response.success) {
        throw {
          code: response.code || 'API_ERROR',
          message: response.error || 'Request failed',
          details: response,
        } as ApiError;
      }

      let resultData = response.data as T;
      
      // Apply selector if provided
      if (select) {
        resultData = select(resultData);
      }

      setData(resultData);
      setError(null);
      retryCountRef.current = 0;

      // Cache the data
      if (cacheTime > 0) {
        await storage.setCachedData(cacheKey as any, resultData, cacheTime);
      }

      onSuccess?.(resultData);
      onSettled?.(resultData, null);
    } catch (err: any) {
      const apiError: ApiError = {
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An error occurred',
        details: err.details,
      };

      setError(apiError);
      onError?.(apiError);
      onSettled?.(undefined, apiError);

      // Handle retries
      if (retry && retryCountRef.current < (typeof retry === 'boolean' ? 3 : retry)) {
        retryCountRef.current++;
        logger.warn(`Retrying request (${retryCountRef.current})`, { key: cacheKey });
        
        setTimeout(() => {
          fetchData(true);
        }, retryDelay);
        return;
      }

      logger.error('API query failed', { key: cacheKey, error: apiError });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [
    key,
    fetcher,
    enabled,
    select,
    staleTime,
    cacheTime,
    retry,
    retryDelay,
    onSuccess,
    onError,
    onSettled,
  ]);

  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    fetchData();
  }, [fetchData]);

  // Cancel request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch data when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return {
    data,
    error,
    isLoading: isLoading && enabled,
    isError: !!error,
    isSuccess: !error && !isLoading && data !== undefined,
    refetch,
  };
}

// Hook for GET requests
export function useApiGet<T = any>(
  url: string,
  params?: any,
  options?: UseApiOptions<T>
) {
  return useApiQuery(
    [url, JSON.stringify(params)],
    url,
    undefined,
    undefined,
    () => apiClient.get<T>(url, { params }),
    options
  );
}

// Hook for POST requests
export function useApiPost<T = any>(
  url: string,
  data?: any,
  options?: UseApiOptions<T>
) {
  return useApiQuery(
    [url, 'POST', JSON.stringify(data)],
    url,
    undefined,
    undefined,
    () => apiClient.post<T>(url, data),
    options
  );
}

// Hook for PUT requests
export function useApiPut<T = any>(
  url: string,
  data?: any,
  options?: UseApiOptions<T>
) {
  return useApiQuery(
    [url, 'PUT', JSON.stringify(data)],
    url,
    undefined,
    undefined,
    () => apiClient.put<T>(url, data),
    options
  );
}

// Hook for PATCH requests
export function useApiPatch<T = any>(
  url: string,
  data?: any,
  options?: UseApiOptions<T>
) {
  return useApiQuery(
    [url, 'PATCH', JSON.stringify(data)],
    url,
    undefined,
    undefined,
    () => apiClient.patch<T>(url, data),
    options
  );
}

// Hook for DELETE requests
export function useApiDelete<T = any>(
  url: string,
  options?: UseApiOptions<T>
) {
  return useApiQuery(
    [url, 'DELETE'],
    url,
    undefined,
    undefined,
    () => apiClient.delete<T>(url),
    options
  );
}