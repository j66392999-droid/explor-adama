import { ApiConfig, RequestConfig, Response as ApiHttpResponse, ErrorResponse } from './types/common.types';
import { ApiResponse } from '../../types/api.types';

export abstract class BaseApi {
  protected config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  protected async request<T = any>(
    url: string,
    method: string,
    config: RequestConfig = {}
  ): Promise<ApiHttpResponse<T>> {
    const {
      headers = {},
      params,
      data,
      timeout = this.config.timeout,
      signal,
    } = config;

    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...headers,
      },
      signal,
    };

    if (data) {
      requestConfig.body = JSON.stringify(data);
    }

    // Build URL with query parameters
    const fullUrl = this.buildUrl(url, params);
    
    try {
      const response = await fetch(fullUrl, requestConfig);
      
      if (!response.ok) {
        throw await this.handleError(response);
      }

      const responseData = await response.json();

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(response),
        config,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  protected buildUrl(url: string, params?: any): string {
    const baseUrl = this.config.baseURL.replace(/\/$/, '');
    const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;

    if (!params) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  protected async handleError(response: globalThis.Response): Promise<ErrorResponse> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const error: ErrorResponse = {
      code: `HTTP_${response.status}`,
      message: errorData.message || 'An error occurred',
      details: errorData,
      status: response.status,
    };

    return error;
  }

  protected extractHeaders(response: globalThis.Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  protected async withRetry<T>(
    request: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      if (this.shouldRetry(error) && retryCount < this.config.retries) {
        await this.delay(this.getRetryDelay(retryCount));
        return this.withRetry(request, retryCount + 1);
      }
      throw error;
    }
  }

  protected shouldRetry(error: any): boolean {
    if (!error.status) return false;
    
    // Retry on server errors and rate limits
    return error.status >= 500 || error.status === 429;
  }

  protected getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, etc.
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected transformResponse<T>(response: ApiHttpResponse<ApiResponse<T>>): ApiResponse<T> {
    return response.data;
  }

  // HTTP method shortcuts
  protected async get<T = any>(url: string, config?: RequestConfig): Promise<ApiHttpResponse<ApiResponse<T>>> {
    return this.request<ApiResponse<T>>(url, 'GET', config);
  }

  protected async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiHttpResponse<ApiResponse<T>>> {
    return this.request<ApiResponse<T>>(url, 'POST', { ...config, data });
  }

  protected async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiHttpResponse<ApiResponse<T>>> {
    return this.request<ApiResponse<T>>(url, 'PUT', { ...config, data });
  }

  protected async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiHttpResponse<ApiResponse<T>>> {
    return this.request<ApiResponse<T>>(url, 'PATCH', { ...config, data });
  }

  protected async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiHttpResponse<ApiResponse<T>>> {
    return this.request<ApiResponse<T>>(url, 'DELETE', config);
  }
}