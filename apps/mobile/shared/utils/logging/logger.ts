import React from 'react';
import { Platform } from 'react-native';

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  stack?: string;
  deviceInfo?: DeviceInfo;
  userInfo?: UserInfo;
}

// Device information
export interface DeviceInfo {
  platform: string;
  osVersion: string;
  appVersion: string;
  buildNumber: string;
  deviceModel?: string;
  deviceId?: string;
}

// User information
export interface UserInfo {
  userId?: string;
  email?: string;
  role?: string;
}

// Logger configuration
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableFileLogging: boolean;
  enableRemoteLogging: boolean;
  maxFileSize: number; // in bytes
  maxFileCount: number;
  remoteEndpoint?: string;
  context: string;
  captureDeviceInfo: boolean;
  captureUserInfo: boolean;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
  enableConsole: true,
  enableFileLogging: false, // Would need additional setup for file logging
  enableRemoteLogging: false,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFileCount: 5,
  context: 'App',
  captureDeviceInfo: true,
  captureUserInfo: true,
};

// Log transport interface
interface LogTransport {
  log(entry: LogEntry): void;
  shouldLog(level: LogLevel): boolean;
}

// Helper: safe stringify with circular ref handling
const safeStringify = (value: any): string => {
  try {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    // If it's an Error-like object, include message & stack
    if (value instanceof Error) {
      return `${value.message}${value.stack ? `\n${value.stack}` : ''}`;
    }

    const seen = new WeakSet();
    return JSON.stringify(
      value,
      (_key, val) => {
        if (val && typeof val === 'object') {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }
        if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
        if (typeof val === 'symbol') return val.toString();
        return val;
      },
      2
    );
  } catch {
    try {
      return String(value);
    } catch {
      return '[unserializable]';
    }
  }
};

// Compose a single message string safely
const composeMessage = (entry: LogEntry): string => {
  try {
    const prefix = `[${entry.timestamp}] ${LogLevel[entry.level]}: ${entry.context ? `[${entry.context}]` : ''}`;
    let composed = `${prefix} ${entry.message}`;
    if (entry.data !== undefined && entry.data !== null) {
      const d = safeStringify(entry.data);
      if (d) composed += ` ${d}`;
    }
    if (entry.stack) {
      composed += ` ${entry.stack}`;
    }
    return composed;
  } catch {
    return `${LogLevel[entry.level]}: ${entry.message}`;
  }
};

// Console transport
class ConsoleTransport implements LogTransport {
  constructor(private config: LoggerConfig) {}

  shouldLog(level: LogLevel): boolean {
    // Log if level severity is <= configured minLevel
    return level <= this.config.minLevel;
  }

  log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const out = composeMessage(entry);

    try {
      switch (entry.level) {
        case LogLevel.ERROR:
          if (typeof console.error === 'function') console.error(out);
          else console.log(out);
          break;
        case LogLevel.WARN:
          if (typeof console.warn === 'function') console.warn(out);
          else console.log(out);
          break;
        case LogLevel.INFO:
          if (typeof console.info === 'function') console.info(out);
          else console.log(out);
          break;
        case LogLevel.DEBUG:
          if (typeof console.debug === 'function') console.debug(out);
          else console.log(out);
          break;
        case LogLevel.VERBOSE:
          console.log(out);
          break;
        default:
          console.log(out);
      }
    } catch {
      // Ultimate fallback — swallow any console exceptions
      try { console.log(out); } catch { /* ignore */ }
    }
  }
}

// Remote transport (for sending logs to server)
class RemoteTransport implements LogTransport {
  private queue: LogEntry[] = [];
  private isSending = false;
  private readonly BATCH_SIZE = 10;
  private readonly MAX_QUEUE_SIZE = 100;

  constructor(private config: LoggerConfig) {}

  shouldLog(level: LogLevel): boolean {
    // Only log remotely if enabled and the level meets threshold
    return !!this.config.enableRemoteLogging && level <= this.config.minLevel;
  }

  log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    this.queue.push(entry);

    // Limit queue size
    if (this.queue.length > this.MAX_QUEUE_SIZE) {
      this.queue = this.queue.slice(-this.MAX_QUEUE_SIZE);
    }

    // Send if we have enough entries or it's an error
    if (this.queue.length >= this.BATCH_SIZE || entry.level === LogLevel.ERROR) {
      void this.sendBatch();
    }
  }

  private async sendBatch(): Promise<void> {
    if (this.isSending || this.queue.length === 0) return;

    this.isSending = true;
    const batch = this.queue.splice(0, this.BATCH_SIZE);

    try {
      if (this.config.remoteEndpoint) {
        // Non-blocking fire-and-forget; don't crash the app on failure
        try {
          await fetch(this.config.remoteEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logs: batch }),
          });
        } catch (err) {
          console.warn('Remote log send failed', err);
          this.queue.unshift(...batch);
        }
      } else {
        // Remote endpoint not configured — just debug-log locally
        console.log(`[RemoteLog] Would send ${batch.length} entries (remoteEndpoint not configured)`);
      }
    } catch (error) {
      console.warn('Failed to send logs remotely:', error);
      this.queue.unshift(...batch);
    } finally {
      this.isSending = false;
    }
  }

  flush(): void {
    if (this.queue.length > 0) {
      void this.sendBatch();
    }
  }
}

// Main logger class
export class Logger {
  private transports: LogTransport[] = [];
  private config: LoggerConfig;
  private deviceInfo?: DeviceInfo;
  private userInfo?: UserInfo;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeTransports();
    void this.initializeDeviceInfo();
  }

  private initializeTransports(): void {
    this.transports = [];
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport(this.config));
    }

    if (this.config.enableRemoteLogging) {
      this.transports.push(new RemoteTransport(this.config));
    }
  }

  private async initializeDeviceInfo(): Promise<void> {
    if (!this.config.captureDeviceInfo) return;
    try {
      this.deviceInfo = {
        platform: Platform.OS,
        osVersion: typeof Platform.Version === 'string' ? Platform.Version : String(Platform.Version),
        appVersion: '1.0.0',
        buildNumber: '1',
      };
    } catch (error) {
      // Don't throw — logging must be resilient
      console.warn('Failed to initialize device info:', error);
    }
  }

  setUserInfo(userInfo: UserInfo): void {
    this.userInfo = userInfo;
  }

  clearUserInfo(): void {
    this.userInfo = undefined;
  }

  setConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeTransports();
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || this.config.context,
      data,
      deviceInfo: this.config.captureDeviceInfo ? this.deviceInfo : undefined,
      userInfo: this.config.captureUserInfo ? this.userInfo : undefined,
      // stack will be set below only when available
    };

    // If the provided data contains an Error or stack, use that (do not create new Error())
    try {
      if (data instanceof Error) {
        entry.stack = data.stack ?? data.message ?? '';
      } else if (data && typeof data === 'object' && typeof (data as any).stack === 'string') {
        entry.stack = (data as any).stack;
      } else {
        // leave stack undefined unless caller provided one
      }
    } catch {
      entry.stack = undefined;
    }

    return entry;
  }

  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    try {
      const entry = this.createLogEntry(level, message, data, context);
      this.transports.forEach((transport) => {
        try {
          if (transport.shouldLog(level)) {
            transport.log(entry);
          }
        } catch {
          // Protect logging from throwing
        }
      });
    } catch {
      // If logger itself fails, avoid crash
      try { console.log(`[LoggerFailure] ${message}`); } catch { /* ignore */ }
    }
  }

  // Public logging methods
  error(message: string, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  verbose(message: string, data?: any, context?: string): void {
    this.log(LogLevel.VERBOSE, message, data, context);
  }

  // Method to log API requests
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API ${method.toUpperCase()} ${url}`, data, 'API');
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `API ${method.toUpperCase()} ${url} - ${status}`, data, 'API');
  }

  // Method to log navigation
  navigation(routeName: string, params?: any): void {
    this.debug(`Navigated to ${routeName}`, params, 'Navigation');
  }

  // Method to log user actions
  userAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data, 'UserAction');
  }

  // Method to log performance metrics
  performance(operation: string, duration: number, data?: any): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, data, 'Performance');
  }

  // Method to log network status changes
  networkStatus(isConnected: boolean, connectionType?: string): void {
    this.info(`Network ${isConnected ? 'connected' : 'disconnected'}`, { connectionType }, 'Network');
  }

  // Flush any pending logs (useful for remote logging)
  flush(): void {
    this.transports.forEach((transport) => {
      if (transport instanceof RemoteTransport) {
        transport.flush();
      }
    });
  }

  // Create a child logger with a specific context
  createChildLogger(context: string): Logger {
    const childLogger = new Logger({
      ...this.config,
      context: `${this.config.context}.${context}`,
    });

    childLogger.deviceInfo = this.deviceInfo;
    childLogger.userInfo = this.userInfo;

    return childLogger;
  }
}

// Create and export default logger instance
export const logger = new Logger();

// Utility functions for common logging patterns
export const LogUtils = {
  // Log API errors
  apiError: (error: any, context?: string) => {
    const errorMessage = error?.message || 'Unknown API error';
    const errorCode = error?.code || 'UNKNOWN';
    logger.error(`API Error (${errorCode}): ${errorMessage}`, error, context);
  },

  // Log authentication events
  authEvent: (event: string, data?: any) => {
    logger.info(`Auth: ${event}`, data, 'Authentication');
  },

  // Log payment events
  paymentEvent: (event: string, data?: any) => {
    logger.info(`Payment: ${event}`, data, 'Payment');
  },

  // Log booking events
  bookingEvent: (event: string, data?: any) => {
    logger.info(`Booking: ${event}`, data, 'Booking');
  },

  // Log feature usage
  featureUsage: (feature: string, action: string, data?: any) => {
    logger.info(`Feature: ${feature} - ${action}`, data, 'FeatureUsage');
  },

  // Log errors with additional context
  errorWithContext: (error: Error, context: string, additionalData?: any) => {
    logger.error(error.message, {
      stack: error.stack,
      ...additionalData,
    }, context);
  },

  // Log startup performance
  startupTime: (phase: string, duration: number) => {
    logger.performance(`Startup - ${phase}`, duration);
  },
};

// Hook for using logger in React components
export const useLogger = (context?: string) => {
  const contextLogger = React.useMemo(() => {
    return context ? logger.createChildLogger(context) : logger;
  }, [context]);

  return contextLogger;
};

// Higher-order function for logging async operations
export const withLogging = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string,
  context?: string
) => {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();

    try {
      logger.debug(`Starting: ${operationName}`, { args }, context);
      const result = await fn(...args);
      const duration = Date.now() - startTime;

      logger.debug(
        `Completed: ${operationName}`,
        {
          duration,
          // avoid logging huge results directly
          result: typeof result === 'object' ? '[object]' : result,
        },
        context
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(
        `Failed: ${operationName}`,
        {
          duration,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
          args,
        },
        context
      );

      throw error;
    }
  };
};

// Error boundary logger
export const logErrorBoundary = (error: Error, errorInfo: React.ErrorInfo) => {
  logger.error(
    'Error Boundary Caught Error',
    {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    },
    'ErrorBoundary'
  );
};
