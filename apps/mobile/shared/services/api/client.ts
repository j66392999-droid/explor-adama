import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { secureStorage } from '../storage/secureStorage';
import { logger } from '../../utils/logging/logger';
import { AppConfig } from '../../../config/app.config';
import { Constants } from '../../../config/constants';
const USE_MOCK_DATA = !!((AppConfig as any).useMockData || process.env.USE_MOCK_DATA === 'true' || (typeof __DEV__ !== 'undefined' && __DEV__));
if (USE_MOCK_DATA) {
  try {
    logger.info('ApiClient: Using mock data for API responses');
  } catch {}
}
import * as mockData from '../../mocks/data';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  pagination?: {
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
}

export interface RequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryCount?: number;
  timeout?: number;
}

export class ApiClient {
  clearAuthToken() {
    // Clear any stored tokens and remove Authorization header from axios instance
    try {
      secureStorage.clearAuth();
    } catch {}
    try {
      if (this.client.defaults && this.client.defaults.headers) {
        // Remove Authorization header from default headers if present
        // headers can be a function or object; guard accordingly
        const headers: any = this.client.defaults.headers as any;
        if (headers && typeof headers === 'object') {
          // Common header containers are headers.common
          if (headers.common && headers.common.Authorization) delete headers.common.Authorization;
          if (headers.Authorization) delete headers.Authorization;
        }
      }
    } catch {}
  }
  getBaseURL(): any {
    // Return the configured baseURL from the underlying axios instance
    try {
      return (this.client && this.client.defaults && (this.client.defaults as any).baseURL) || undefined;
    } catch {
      return undefined;
    }
  }
  setBaseURL(arg0: any) {
    try {
      if (this.client && this.client.defaults) {
        (this.client.defaults as any).baseURL = arg0;
      }
    } catch {}
  }
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: AppConfig.api.baseURL,
      timeout: AppConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': Platform.OS === 'ios' ? 'iOS-1.0.0' : 'Android-1.0.0',
        'X-Device-ID': this.getDeviceId(),
      },
    });

    this.setupInterceptors();
  }

  private getDeviceId() {
    return Platform.OS + '-device-' + Math.random().toString(36).substr(2, 9);
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        const token = await secureStorage.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;

        try {
          logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        } catch {}

        return config;
      },
      (error) => Promise.reject(this.transformError(error))
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        try {
          logger.debug(`API Response: ${response.status} ${response.config.url}`, {
            data: response.data,
          });
        } catch {}
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;

        try {
          logger.error('API Response Error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            data: error.response?.data,
          });
        } catch {}

        // Token refresh logic
        if (error.response?.status === 401 && !originalRequest.retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest.retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.onRefreshSuccess(newToken);
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch {
            this.onRefreshFailure();
            await this.handleAuthFailure();
            return Promise.reject(this.transformError(error));
          }
        }

        if (!error.response) {
          const networkError: ApiError = {
            code: 'NETWORK_ERROR',
            message: Constants.errors.network,
          };
          return Promise.reject(networkError);
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = await secureStorage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(`${AppConfig.api.baseURL}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    await secureStorage.setToken(accessToken);
    if (newRefreshToken) await secureStorage.setRefreshToken(newRefreshToken);

    return accessToken;
  }

  private onRefreshSuccess(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }

  private onRefreshFailure() {
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }

  private async handleAuthFailure() {
    await secureStorage.clearAuth();
    logger.info('Authentication failed, user logged out');
  }

  private transformError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const apiError = error.response.data as any;
      return {
        code: apiError.code || 'UNKNOWN_ERROR',
        message: apiError.message || Constants.errors.unknown,
        details: apiError.details,
        status: error.response.status,
      };
    }
    if (error.request) return { code: 'NETWORK_ERROR', message: Constants.errors.network };
    return { code: 'UNKNOWN_ERROR', message: Constants.errors.unknown };
  }

  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    if (USE_MOCK_DATA) {
      return this.getMockResponse<T>(url, 'get');
    }
    const res = await this.client.get<ApiResponse<T>>(url, config);
    return res.data;
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    if (USE_MOCK_DATA) {
      return this.getMockResponse<T>(url, 'post', data);
    }
    const res = await this.client.post<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    if (USE_MOCK_DATA) {
      return this.getMockResponse<T>(url, 'put', data);
    }
    const res = await this.client.put<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    if (USE_MOCK_DATA) {
      return this.getMockResponse<T>(url, 'patch', data);
    }
    const res = await this.client.patch<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    if (USE_MOCK_DATA) {
      return this.getMockResponse<T>(url, 'delete');
    }
    const res = await this.client.delete<ApiResponse<T>>(url, config);
    return res.data;
  }

  private getMockResponse<T>(url: string, method: string, data?: any): ApiResponse<T> {
    // Ensure we are working with path-only URLs (remove baseURL if present)
    let path = url;
    try {
      const base = AppConfig.api.baseURL;
      if (typeof path === 'string' && path.startsWith(base)) {
        path = path.slice(base.length);
      }
    } catch {}
    // Map common endpoints to mock data entries
    const map: Record<string, string> = {
      '/auth/login': 'authResponse',
      '/auth/refresh': 'authResponse',
      '/auth/profile': 'user',
    };

    const key = map[path] || path.replace(/[\/-]/g, '_').replace(/^_/, '');
    const mock = (mockData as any)[key];
    if (mock) {
      // If mock is already an ApiResponse shape, return as-is; otherwise wrap
      if (mock.success !== undefined) {
        return mock as ApiResponse<T>;
      }
      return { success: true, data: mock };
    }
    return { success: false, error: 'No mock data found for ' + url };
  }
}

export const apiClient = new ApiClient();
export default ApiClient;
