/**
 * General helper functions and utilities
 */

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Deep clone an object or array
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(target: T, source: U): T & U {
  const output = { ...target } as T & U;

  const keys = Object.keys(source) as Array<keyof U>;
  for (const key of keys) {
    const sVal = source[key];
    const tVal = (target as any)[key];

    if (
      sVal &&
      typeof sVal === 'object' &&
      !Array.isArray(sVal) &&
      tVal &&
      typeof tVal === 'object' &&
      !Array.isArray(tVal)
    ) {
      (output as any)[key as string] = deepMerge(tVal, sVal);
    } else {
      (output as any)[key as string] = sVal;
    }
  }

  return output;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;

  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      inThrottle = true;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      lastResult = func.apply(this, args) as ReturnType<T>;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult as ReturnType<T>;
  };
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate a random number within range
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get unique values from array
 */
export function getUniqueValues<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const keyValue = String(item[key]);
    groups[keyValue] = groups[keyValue] || [];
    groups[keyValue].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by multiple criteria
 */
export function filterBy<T>(
  array: T[],
  filters: Partial<Record<keyof T, any>>
): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(item[key as keyof T]);
      }
      return item[key as keyof T] === value;
    });
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * Flatten nested array
 */
export function flattenArray<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, []);
}

/**
 * Pick specific properties from object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omit specific properties from object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Check if object has all specified keys
 */
export function hasAllKeys<T>(obj: any, keys: (keyof T)[]): obj is T {
  return keys.every(key => key in obj);
}

/**
 * Check if object has any of specified keys
 */
export function hasAnyKey<T>(obj: any, keys: (keyof T)[]): boolean {
  return keys.some(key => key in obj);
}

/**
 * Safe parse JSON with error handling
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Safe stringify JSON with error handling
 */
export function safeJsonStringify(obj: any, defaultValue: string = ''): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error);
    return defaultValue;
  }
}

/**
 * Convert object to query string
 */
export function toQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, String(item)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  return queryParams.toString();
}

/**
 * Convert query string to object
 */
export function fromQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Sleep/pause execution
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    maxDelay = 10000,
    factor = 2,
  } = options;

  let lastError: Error;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retries) {
        await sleep(currentDelay);
        currentDelay = Math.min(currentDelay * factor, maxDelay);
      }
    }
  }

  throw lastError!;
}

/**
 * Memoize a function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * Measure execution time
 */
export function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  return {
    result,
    time: end - start,
  };
}

/**
 * Create a promise that can be resolved/rejected externally
 */
export function createDeferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => {};
  let reject: (reason?: any) => void = () => {};
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return { promise, resolve, reject };
}

/**
 * Type guard for error objects
 */
export function isError(error: any): error is Error {
  return error instanceof Error;
}

/**
 * Type guard for promise
 */
export function isPromise<T>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function';
}

export default {
  isEmpty,
  deepClone,
  deepMerge,
  debounce,
  throttle,
  generateRandomString,
  randomNumber,
  getUniqueValues,
  groupBy,
  sortBy,
  filterBy,
  chunkArray,
  flattenArray,
  pick,
  omit,
  hasAllKeys,
  hasAnyKey,
  safeJsonParse,
  safeJsonStringify,
  toQueryString,
  fromQueryString,
  sleep,
  retry,
  memoize,
  measureTime,
  createDeferred,
  isError,
  isPromise,
};