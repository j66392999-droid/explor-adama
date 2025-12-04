export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

export interface UploadFileParams {
  file: {
    uri: string;
    type: string;
    name: string;
  };
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface DownloadFileParams {
  url: string;
  onProgress?: (progress: number) => void;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: any;
  data?: any;
  timeout?: number;
  retry?: boolean;
  retryCount?: number;
  signal?: AbortSignal;
}

export interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface ApiStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

export interface EndpointConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  requiresAuth: boolean;
  cacheable: boolean;
  retryable: boolean;
  timeout: number;
}

export interface ApiHealth {
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  services: {
    database: boolean;
    cache: boolean;
    storage: boolean;
  };
}