import { useState, useCallback } from 'react';
import { ApiResponse, ApiError } from '../../types/api.types';
import { logger } from '../../utils/logging/logger';
import { apiClient } from '../../services/api/client';

export interface UseApiMutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: ApiError | null, variables: TVariables) => void;
}

export interface UseApiMutationResult<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<void>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: UseApiMutationOptions<TData, TVariables> = {}
): UseApiMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData>();
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (variables: TVariables): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(variables);
      
      if (!response.success) {
        throw {
          code: response.code || 'API_ERROR',
          message: response.error || 'Mutation failed',
          details: response,
        } as ApiError;
      }

      const resultData = response.data as TData;
      
      setData(resultData);
      setError(null);
      
      options.onSuccess?.(resultData, variables);
      options.onSettled?.(resultData, null, variables);
    } catch (err: any) {
      const apiError: ApiError = {
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An error occurred',
        details: err.details,
      };

      setError(apiError);
      options.onError?.(apiError, variables);
      options.onSettled?.(undefined, apiError, variables);
      
      logger.error('API mutation failed', { error: apiError, variables });
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    return new Promise((resolve, reject) => {
      mutate(variables)
        .then(() => {
          if (data !== undefined) {
            resolve(data);
          } else {
            reject(new Error('No data available'));
          }
        })
        .catch(reject);
    });
  }, [mutate, data]);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !error && !isLoading && data !== undefined,
    reset,
  };
}

// Pre-defined mutation hooks for common operations

export function useCreateMutation<TData = any, TVariables = any>(
  url: string,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  const mutationFn = useCallback((variables: TVariables) => {
    return apiClient.post<TData>(url, variables);
  }, [url]);

  return useApiMutation(mutationFn, options);
}

export function useUpdateMutation<TData = any, TVariables = any>(
  url: string,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  const mutationFn = useCallback((variables: TVariables) => {
    return apiClient.put<TData>(url, variables);
  }, [url]);

  return useApiMutation(mutationFn, options);
}

export function usePatchMutation<TData = any, TVariables = any>(
  url: string,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  const mutationFn = useCallback((variables: TVariables) => {
    return apiClient.patch<TData>(url, variables);
  }, [url]);

  return useApiMutation(mutationFn, options);
}

export function useDeleteMutation<TData = any>(
  url: string,
  options?: UseApiMutationOptions<TData, void>
) {
  const mutationFn = useCallback(() => {
    return apiClient.delete<TData>(url);
  }, [url]);

  return useApiMutation(mutationFn, options);
}

// Optimistic updates helper
export function useOptimisticMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  optimisticUpdate: (variables: TVariables) => void,
  rollbackUpdate: (variables: TVariables) => void,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  const [isOptimistic, setIsOptimistic] = useState(false);

  const mutate = useCallback(async (variables: TVariables) => {
    // Apply optimistic update
    optimisticUpdate(variables);
    setIsOptimistic(true);

    try {
      const response = await mutationFn(variables);
      
      if (!response.success) {
        throw new Error('Mutation failed');
      }

      setIsOptimistic(false);
      options?.onSuccess?.(response.data as TData, variables);
      return response.data as TData;
    } catch (error) {
      // Rollback on error
      rollbackUpdate(variables);
      setIsOptimistic(false);
      options?.onError?.(error as ApiError, variables);
      throw error;
    }
  }, [mutationFn, optimisticUpdate, rollbackUpdate, options]);

  return {
    mutate,
    isOptimistic,
  };
}