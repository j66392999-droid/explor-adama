import React from 'react';
import { logger, LogUtils } from './logger';
import { Platform } from 'react-native';

// Error types
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError extends Error {
  category: ErrorCategory;
  code: string;
  userMessage?: string;
  context?: any;
  isOperational?: boolean;
  originalError?: any;
}

export interface ErrorHandlingStrategy {
  shouldHandle(error: any): boolean;
  handle(error: any): void;
  getCategory(error: any): ErrorCategory;
  getUserMessage(error: any): string;
}

// Base error class
export class BaseError extends Error implements AppError {
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly userMessage: string;
  public readonly context?: any;
  public readonly isOperational: boolean;
  public readonly originalError?: any;

  constructor(
    message: string,
    category: ErrorCategory,
    code: string,
    options: {
      userMessage?: string;
      context?: any;
      isOperational?: boolean;
      originalError?: any;
    } = {}
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.category = category;
    this.code = code;
    this.userMessage = options.userMessage || message;
    this.context = options.context;
    this.isOperational = options.isOperational ?? true;
    this.originalError = options.originalError;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Specific error types
export class NetworkError extends BaseError {
  constructor(message: string, code: string = 'NETWORK_ERROR', options?: any) {
    super(message, ErrorCategory.NETWORK, code, options);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', options?: any) {
    super(message, ErrorCategory.VALIDATION, code, options);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string, code: string = 'AUTHENTICATION_ERROR', options?: any) {
    super(message, ErrorCategory.AUTHENTICATION, code, options);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string, code: string = 'AUTHORIZATION_ERROR', options?: any) {
    super(message, ErrorCategory.AUTHORIZATION, code, options);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string, code: string = 'NOT_FOUND_ERROR', options?: any) {
    super(message, ErrorCategory.NOT_FOUND, code, options);
  }
}

export class ServerError extends BaseError {
  constructor(message: string, code: string = 'SERVER_ERROR', options?: any) {
    super(message, ErrorCategory.SERVER, code, options);
  }
}

// Error handler configuration
export interface ErrorHandlerConfig {
  enableGlobalHandling: boolean;
  logErrors: boolean;
  showUserMessages: boolean;
  reportToServer: boolean;
  maxContextDepth: number;
}

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableGlobalHandling: true,
  logErrors: true,
  showUserMessages: true,
  reportToServer: !__DEV__,
  maxContextDepth: 3,
};

// Main error handler class
export class ErrorHandler {
  private strategies: ErrorHandlingStrategy[] = [];
  private config: ErrorHandlerConfig;
  private isInitialized = false;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.strategies.push(
      new NetworkErrorStrategy(),
      new ValidationErrorStrategy(),
      new AuthenticationErrorStrategy(),
      new AuthorizationErrorStrategy(),
      new NotFoundErrorStrategy(),
      new ServerErrorStrategy(),
      new UnknownErrorStrategy()
    );
  }

  // Initialize global error handling
  initialize(): void {
    if (this.isInitialized) return;

    if (this.config.enableGlobalHandling) {
      this.setupGlobalErrorHandling();
    }

    this.isInitialized = true;
    logger.info('Error handler initialized');
  }

  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    if (typeof global !== 'undefined') {
      // Declare ErrorUtils on global for TypeScript
      const globalWithErrorUtils = global as typeof global & {
        ErrorUtils?: {
          getGlobalHandler?: () => (error: any, isFatal?: boolean) => void;
          setGlobalHandler?: (handler: (error: any, isFatal?: boolean) => void) => void;
        };
      };
      const originalHandler = globalWithErrorUtils.ErrorUtils?.getGlobalHandler?.();
      
      if (originalHandler && globalWithErrorUtils.ErrorUtils?.setGlobalHandler) {
        globalWithErrorUtils.ErrorUtils.setGlobalHandler((error, isFatal) => {
          this.handleError(error, isFatal);
          originalHandler(error, isFatal);
        });
      }
    }

    // Handle promise rejections
    if (typeof Promise !== 'undefined') {
      const originalPromiseRejectionTracker = (Promise as any).__STABLE_ERROR_APPENDIX__;
      
      (Promise as any).__STABLE_ERROR_APPENDIX__ = (
        reason: any,
        promise: Promise<any>
      ) => {
        this.handleError(reason, false);
        if (originalPromiseRejectionTracker) {
          originalPromiseRejectionTracker(reason, promise);
        }
      };
    }
  }

  // Handle an error
  handleError(error: any, isFatal: boolean = false): void {
    const normalizedError = this.normalizeError(error);
    const strategy = this.findStrategy(normalizedError);

    if (this.config.logErrors) {
      this.logError(normalizedError, isFatal);
    }

    if (this.config.showUserMessages) {
      this.showUserMessage(normalizedError, strategy);
    }

    if (this.config.reportToServer) {
      this.reportToServer(normalizedError, isFatal);
    }

    strategy.handle(normalizedError);
  }

  // Normalize different error types to AppError
  private normalizeError(error: any): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new BaseError(
        error.message,
        ErrorCategory.UNKNOWN,
        'UNKNOWN_ERROR',
        {
          originalError: error,
          context: { stack: error.stack },
        }
      );
    }

    if (typeof error === 'string') {
      return new BaseError(
        error,
        ErrorCategory.UNKNOWN,
        'UNKNOWN_ERROR',
        { originalError: error }
      );
    }

    return new BaseError(
      'An unknown error occurred',
      ErrorCategory.UNKNOWN,
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }

  private isAppError(error: any): error is AppError {
    return error && error.category && error.code;
  }

  private findStrategy(error: AppError): ErrorHandlingStrategy {
    return this.strategies.find(strategy => 
      strategy.shouldHandle(error)
    ) || this.strategies[this.strategies.length - 1]; // Default to unknown error strategy
  }

  private logError(error: AppError, isFatal: boolean): void {
    const logContext = {
      category: error.category,
      code: error.code,
      isFatal,
      isOperational: error.isOperational,
      context: this.sanitizeContext(error.context),
      stack: error.stack,
      originalError: error.originalError,
    };

    if (isFatal) {
      logger.error(`Fatal Error: ${error.message}`, logContext, 'ErrorHandler');
    } else {
      logger.error(`Error: ${error.message}`, logContext, 'ErrorHandler');
    }
  }

  private sanitizeContext(context: any, depth: number = 0): any {
    if (depth >= this.config.maxContextDepth) {
      return '[Max depth reached]';
    }

    if (context === null || context === undefined) {
      return context;
    }

    if (typeof context !== 'object') {
      return context;
    }

    if (Array.isArray(context)) {
      return context.map(item => this.sanitizeContext(item, depth + 1));
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(context)) {
      // Skip sensitive data
      if (this.isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      sanitized[key] = this.sanitizeContext(value, depth + 1);
    }

    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'credit',
      'card',
      'ssn',
      'phone',
      'email',
    ];

    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
  }

  private showUserMessage(error: AppError, strategy: ErrorHandlingStrategy): void {
    const userMessage = strategy.getUserMessage(error);
    
    // In a real app, you'd show this using a toast or alert
    console.log(`User Message: ${userMessage}`);
    
    // Example with a toast:
    // Toast.show({
    //   type: 'error',
    //   text1: 'Error',
    //   text2: userMessage,
    // });
  }

  private reportToServer(error: AppError, isFatal: boolean): void {
    // In a real app, you'd send this to your error reporting service
    const report = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: '1.0.0', // App version
      error: {
        message: error.message,
        category: error.category,
        code: error.code,
        stack: error.stack,
        isFatal,
      },
      context: this.sanitizeContext(error.context),
    };

    // Send to your error reporting endpoint
    // fetch('https://your-error-reporting-service.com/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report),
    // });
    
    logger.debug('Error reported to server', report, 'ErrorReporting');
  }

  // Create custom error
  createError(
    message: string,
    category: ErrorCategory,
    code: string,
    options?: any
  ): AppError {
    return new BaseError(message, category, code, options);
  }

  // Register custom strategy
  registerStrategy(strategy: ErrorHandlingStrategy): void {
    this.strategies.unshift(strategy); // Add to beginning for priority
  }

  // Set user context for errors
  setUserContext(userId?: string, email?: string): void {
    logger.setUserInfo({ userId, email });
  }
}

// Error handling strategies
class NetworkErrorStrategy implements ErrorHandlingStrategy {
  shouldHandle(error: any): boolean {
    return error.category === ErrorCategory.NETWORK;
  }

  handle(error: AppError): void {
    // Handle network errors - maybe trigger retry logic
    logger.warn('Handling network error', error, 'NetworkErrorStrategy');
  }

  getCategory(error: any): ErrorCategory {
    return ErrorCategory.NETWORK;
  }

  getUserMessage(error: AppError): string {
    return 'Network connection issue. Please check your internet connection and try again.';
  }
}

class ValidationErrorStrategy implements ErrorHandlingStrategy {
  shouldHandle(error: any): boolean {
    return error.category === ErrorCategory.VALIDATION;
  }

  handle(error: AppError): void {
    // Validation errors are usually handled by forms
    logger.debug('Handling validation error', error, 'ValidationErrorStrategy');
  }

  getCategory(error: any): ErrorCategory {
    return ErrorCategory.VALIDATION;
  }

  getUserMessage(error: AppError): string {
    return error.userMessage || 'Please check your input and try again.';
  }
}

class AuthenticationErrorStrategy implements ErrorHandlingStrategy {
  shouldHandle(error: any): boolean {
    return error.category === ErrorCategory.AUTHENTICATION;
  }

  handle(error: AppError): void {
    // Redirect to login or refresh token
    logger.warn('Handling authentication error', error, 'AuthErrorStrategy');
    
    // Example: Trigger logout
    // store.dispatch(logout());
  }

  getCategory(error: any): ErrorCategory {
    return ErrorCategory.AUTHENTICATION;
  }

  getUserMessage(error: AppError): string {
    return 'Your session has expired. Please log in again.';
  }
}

class AuthorizationErrorStrategy implements ErrorHandlingStrategy {
  shouldHandle(error: any): boolean {
    return error.category === ErrorCategory.AUTHORIZATION;
  }

  handle(error: AppError): void {
    // Handle unauthorized access
    logger.warn('Handling authorization error', error, 'AuthErrorStrategy');
  }

  getCategory(error: any): ErrorCategory {
    return ErrorCategory.AUTHORIZATION;
  }

  getUserMessage(error: AppError): string {
    return 'You do not have permission to perform this action.';
  }
}

class NotFoundErrorStrategy implements ErrorHandlingStrategy {
  shouldHandle(error: any): boolean {
    return error.category === ErrorCategory.NOT_FOUND;
  }

  handle(error: AppError): void {
    // Handle not found resources
    logger.debug('Handling not found error', error, 'NotFoundErrorStrategy');
  }

  getCategory(error: any): ErrorCategory {
    return ErrorCategory.NOT_FOUND;
  }

  getUserMessage(error: AppError): string {
    return 'The requested resource was not found.';
  }
}

class ServerErrorStrategy implements ErrorHandlingStrategy {
  shouldHandle(error: any): boolean {
    return error.category === ErrorCategory.SERVER;
  }

  handle(error: AppError): void {
    // Handle server errors - maybe show maintenance message
    logger.error('Handling server error', error, 'ServerErrorStrategy');
  }

  getCategory(error: any): ErrorCategory {
    return ErrorCategory.SERVER;
  }

  getUserMessage(error: AppError): string {
    return 'Server error occurred. Please try again later.';
  }
}

class UnknownErrorStrategy implements ErrorHandlingStrategy {
  shouldHandle(error: any): boolean {
    return true; // Default handler
  }

  handle(error: AppError): void {
    // Handle unknown errors
    logger.error('Handling unknown error', error, 'UnknownErrorStrategy');
  }

  getCategory(error: any): ErrorCategory {
    return ErrorCategory.UNKNOWN;
  }

  getUserMessage(error: AppError): string {
    return 'An unexpected error occurred. Please try again.';
  }
}

// Create and export default error handler instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error handling patterns
export const ErrorUtils = {
  // Wrap async functions with error handling
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: string = 'AsyncOperation'
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        errorHandler.handleError(error);
        throw error;
      }
    };
  },

  // Create validation error
  validationError: (message: string, context?: any) => {
    return new ValidationError(message, 'VALIDATION_ERROR', { context });
  },

  // Create network error
  networkError: (message: string = 'Network error occurred') => {
    return new NetworkError(message, 'NETWORK_ERROR');
  },

  // Create authentication error
  authenticationError: (message: string = 'Authentication failed') => {
    return new AuthenticationError(message, 'AUTHENTICATION_ERROR');
  },

  // Check if error is operational (non-fatal)
  isOperationalError: (error: any): boolean => {
    return error?.isOperational === true;
  },

  // Check if error should be reported to user
  shouldShowToUser: (error: any): boolean => {
    const category = error?.category;
    return [
      ErrorCategory.VALIDATION,
      ErrorCategory.AUTHENTICATION,
      ErrorCategory.AUTHORIZATION,
      ErrorCategory.NETWORK,
    ].includes(category);
  },

  // Extract user-friendly message from error
  getUserMessage: (error: any): string => {
    if (error?.userMessage) {
      return error.userMessage;
    }

    if (error?.message) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  },
};

// React hook for error handling in components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: any) => {
    errorHandler.handleError(error);
  }, []);

  const createError = React.useCallback((
    message: string,
    category: ErrorCategory,
    code: string,
    options?: any
  ) => {
    return errorHandler.createError(message, category, code, options);
  }, []);

  return {
    handleError,
    createError,
    errorHandler,
  };
};

// Initialize error handler when module loads
errorHandler.initialize();