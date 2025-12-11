/**
 * Validation utilities for form inputs and data
 */

// ============================================
// Basic Validators
// ============================================

/**
 * Check if value is required (not empty)
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }

  return true;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic international phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate that date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

/**
 * Validate that date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

// ============================================
// Number Validators
// ============================================

/**
 * Validate number is within range
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return value > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return value >= 0;
}

/**
 * Validate integer
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

// ============================================
// String Validators
// ============================================

/**
 * Validate string length
 */
export function isStringLengthValid(
  value: string,
  min: number = 0,
  max: number = Infinity
): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Validate name (first/last name)
 */
export function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
  return nameRegex.test(name);
}

// ============================================
// Array Validators
// ============================================

/**
 * Validate array is not empty
 */
export function isArrayNotEmpty<T>(array: T[]): boolean {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Validate array length
 */
export function isArrayLengthValid<T>(
  array: T[],
  min: number = 0,
  max: number = Infinity
): boolean {
  return Array.isArray(array) && array.length >= min && array.length <= max;
}

/**
 * Validate all array items match predicate
 */
export function isArrayValid<T>(
  array: T[],
  validator: (item: T) => boolean
): boolean {
  return Array.isArray(array) && array.every(validator);
}

// ============================================
// Object Validators
// ============================================

/**
 * Validate object has required properties
 */
export function hasRequiredProperties<T>(
  obj: any,
  requiredProps: (keyof T)[]
): obj is T {
  return requiredProps.every(prop => prop in obj);
}

/**
 * Validate object properties match schema
 */
export function matchesSchema<T>(
  obj: any,
  schema: Record<keyof T, (value: any) => boolean>
): obj is T {
  const keys = Object.keys(schema) as Array<keyof T>;
  return keys.every((key) => {
    const validator = schema[key] as (value: any) => boolean;
    return validator(obj[key]);
  });
}

// ============================================
// Credit Card Validators
// ============================================

/**
 * Validate credit card number using Luhn algorithm
 */
export function isValidCreditCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Validate CVV
 */
export function isValidCVV(cvv: string, cardType?: string): boolean {
  const cleaned = cvv.replace(/\D/g, '');
  
  if (cardType === 'amex') {
    return cleaned.length === 4;
  }
  
  return cleaned.length === 3;
}

/**
 * Validate expiration date
 */
export function isValidExpirationDate(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  return true;
}

// ============================================
// File Validators
// ============================================

/**
 * Validate file type
 */
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return allowedTypes.includes(`.${extension}`);
}

/**
 * Validate file size
 */
export function isValidFileSize(fileSize: number, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

// ============================================
// Location Validators
// ============================================

/**
 * Validate latitude
 */
export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Validate longitude
 */
export function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

// ============================================
// Business Logic Validators
// ============================================

/**
 * Validate booking quantity
 */
export function isValidBookingQuantity(
  quantity: number,
  available: number,
  min: number = 1
): boolean {
  return quantity >= min && quantity <= available;
}

/**
 * Validate age (must be at least minAge years old)
 */
export function isValidAge(birthDate: string, minAge: number = 18): boolean {
  const birth = new Date(birthDate);
  const now = new Date();
  
  const age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
}

// ============================================
// Validation Composers
// ============================================

/**
 * Create a validation chain
 */
export function createValidator<T>() {
  const validators: ((value: T) => string | null)[] = [];

  const chain = {
    required(message: string = 'This field is required') {
      validators.push((value: T) => {
        if (!isRequired(value)) {
          return message;
        }
        return null;
      });
      return chain;
    },

    email(message: string = 'Please enter a valid email address') {
      validators.push((value: T) => {
        if (typeof value === 'string' && !isValidEmail(value)) {
          return message;
        }
        return null;
      });
      return chain;
    },

    minLength(min: number, message: string = `Must be at least ${min} characters`) {
      validators.push((value: T) => {
        if (typeof value === 'string' && !isStringLengthValid(value, min)) {
          return message;
        }
        return null;
      });
      return chain;
    },

    maxLength(max: number, message: string = `Must be at most ${max} characters`) {
      validators.push((value: T) => {
        if (typeof value === 'string' && !isStringLengthValid(value, 0, max)) {
          return message;
        }
        return null;
      });
      return chain;
    },

    pattern(regex: RegExp, message: string = 'Invalid format') {
      validators.push((value: T) => {
        if (typeof value === 'string' && !regex.test(value)) {
          return message;
        }
        return null;
      });
      return chain;
    },

    custom(validator: (value: T) => string | null) {
      validators.push(validator);
      return chain;
    },

    validate(value: T): string[] {
      const errors: string[] = [];
      
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors.push(error);
        }
      }
      
      return errors;
    },
  };

  return chain;
}

/**
 * Create validation schema for forms
 */
export function createValidationSchema<T extends Record<string, any>>(
  schema: Record<keyof T, ReturnType<typeof createValidator<any>>>
) {
  return {
    validate(values: T): Record<keyof T, string[]> {
      const errors: Record<keyof T, string[]> = {} as any;

      const keys = Object.keys(schema) as Array<keyof T>;
      for (const field of keys) {
        const validator = schema[field] as ReturnType<typeof createValidator<any>>;
        const fieldErrors = validator.validate(values[field]);
        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors;
        }
      }

      return errors;
    },

    isValid(values: T): boolean {
      const errors = this.validate(values);
      return Object.values(errors).every(errorArray => errorArray.length === 0);
    },
  };
}

// ============================================
// Export all validators
// ============================================

export default {
  // Basic
  isRequired,
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  isValidUrl,
  isValidDate,
  isFutureDate,
  isPastDate,
  
  // Number
  isNumberInRange,
  isPositiveNumber,
  isNonNegativeNumber,
  isInteger,
  
  // String
  isStringLengthValid,
  isValidUsername,
  isValidName,
  
  // Array
  isArrayNotEmpty,
  isArrayLengthValid,
  isArrayValid,
  
  // Object
  hasRequiredProperties,
  matchesSchema,
  
  // Credit Card
  isValidCreditCardNumber,
  isValidCVV,
  isValidExpirationDate,
  
  // File
  isValidFileType,
  isValidFileSize,
  
  // Location
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  
  // Business Logic
  isValidBookingQuantity,
  isValidAge,
  
  // Composers
  createValidator,
  createValidationSchema,
};