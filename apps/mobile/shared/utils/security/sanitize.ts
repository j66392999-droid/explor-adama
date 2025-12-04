import DOMPurify from 'dompurify';
import xss from 'xss';

// Sanitization configuration
const SANITIZE_CONFIG = {
  // HTML sanitization options
  HTML: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
  
  // XSS options
  XSS: {
    whiteList: {
      a: ['href', 'title', 'target', 'rel'],
      span: ['class'],
      p: ['class'],
      br: [],
      strong: [],
      em: [],
      i: [],
      b: [],
      ul: [],
      ol: [],
      li: [],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  },
  
  // Input validation patterns
  PATTERNS: {
    EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    PHONE: /^\+?[\d\s\-()]{10,}$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
    NUMERIC: /^[0-9]+$/,
    DECIMAL: /^[0-9]+(\.[0-9]+)?$/,
    NAME: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    USERNAME: /^[a-zA-Z0-9_.-]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },
} as const;

// Sanitization utility class
class SanitizationService {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHTML(html: string, options?: any): string {
    try {
      // Use DOMPurify for HTML sanitization
      if (typeof DOMPurify !== 'undefined') {
        const r = DOMPurify.sanitize(html, {
          ...SANITIZE_CONFIG.HTML,
          ...options,
        });
        return typeof r === 'string' ? r : String(r);
      }
      
      // Fallback to xss library
      return xss(html, {
        ...SANITIZE_CONFIG.XSS,
        ...options,
      });
    } catch (error) {
      console.error('HTML sanitization failed:', error);
      return ''; // Return empty string on failure
    }
  }
  
  /**
   * Sanitize plain text by removing dangerous characters
   */
  sanitizeText(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#x60;');
  }
  
  /**
   * Sanitize URL
   */
  sanitizeURL(url: string): string {
    try {
      // Remove dangerous protocols
      const cleaned = url.replace(/(javascript|vbscript|data):/gi, '');
      
      // Validate URL format
      if (!SANITIZE_CONFIG.PATTERNS.URL.test(cleaned)) {
        return '';
      }
      
      return cleaned;
    } catch (error) {
      console.error('URL sanitization failed:', error);
      return '';
    }
  }
  
  /**
   * Sanitize email address
   */
  sanitizeEmail(email: string): string {
    const trimmed = email.trim().toLowerCase();
    
    if (!SANITIZE_CONFIG.PATTERNS.EMAIL.test(trimmed)) {
      throw new Error('Invalid email format');
    }
    
    return trimmed;
  }
  
  /**
   * Sanitize phone number
   */
  sanitizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (!SANITIZE_CONFIG.PATTERNS.PHONE.test(cleaned)) {
      throw new Error('Invalid phone number format');
    }
    
    return cleaned;
  }
  
  /**
   * Validate and sanitize input against pattern
   */
  validatePattern(input: string, pattern: RegExp, fieldName: string = 'Input'): string {
    const trimmed = input.trim();
    
    if (!pattern.test(trimmed)) {
      throw new Error(`Invalid ${fieldName} format`);
    }
    
    return trimmed;
  }
  
  /**
   * Sanitize object properties recursively
   */
  sanitizeObject<T extends Record<string, any>>(obj: T, depth: number = 5): T {
    if (depth <= 0) {
      return obj;
    }
    
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizePrimitive(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth - 1)) as unknown as T;
    }
    
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      sanitized[this.sanitizeText(key)] = this.sanitizeObject(value, depth - 1);
    }
    
    return sanitized as T;
  }
  
  /**
   * Sanitize primitive values
   */
  private sanitizePrimitive(value: any): any {
    if (typeof value === 'string') {
      return this.sanitizeText(value);
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    
    return null;
  }
  
  /**
   * Remove null and undefined values from object
   */
  removeEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nested = this.removeEmptyValues(value);
          if (Object.keys(nested).length > 0) {
            (cleaned as any)[key] = nested;
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            (cleaned as any)[key] = value;
          }
        } else {
          (cleaned as any)[key] = value;
        }
      }
    }
    
    return cleaned;
  }
  
  /**
   * Truncate string to specified length
   */
  truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - suffix.length) + suffix;
  }
  
  /**
   * Escape regex special characters
   */
  escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Normalize string (trim, lowercase, remove extra spaces)
   */
  normalizeString(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
  
  /**
   * Validate and sanitize file name
   */
  sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 255);
  }
  
  /**
   * Sanitize SQL query parameters (basic protection)
   */
  sanitizeSQLParam(param: string): string {
    return param
      .replace(/'/g, "''")
      .replace(/--/g, '')
      .replace(/;/g, '')
      .replace(/\/*/g, '');
  }
}

// Create singleton instance
export const sanitizationService = new SanitizationService();

// Utility functions
export const SanitizeUtils = {
  // Quick sanitization functions
  html: (content: string): string => sanitizationService.sanitizeHTML(content),
  text: (content: string): string => sanitizationService.sanitizeText(content),
  url: (url: string): string => sanitizationService.sanitizeURL(url),
  email: (email: string): string => sanitizationService.sanitizeEmail(email),
  phone: (phone: string): string => sanitizationService.sanitizePhone(phone),
  
  // Validation functions
  isEmail: (email: string): boolean => {
    try {
      sanitizationService.sanitizeEmail(email);
      return true;
    } catch {
      return false;
    }
  },
  
  isPhone: (phone: string): boolean => {
    try {
      sanitizationService.sanitizePhone(phone);
      return true;
    } catch {
      return false;
    }
  },
  
  isURL: (url: string): boolean => SANITIZE_CONFIG.PATTERNS.URL.test(url),
  isNumeric: (input: string): boolean => SANITIZE_CONFIG.PATTERNS.NUMERIC.test(input),
  isAlphanumeric: (input: string): boolean => SANITIZE_CONFIG.PATTERNS.ALPHANUMERIC.test(input),
  
  // Object sanitization
  object: <T extends Record<string, any>>(obj: T): T => sanitizationService.sanitizeObject(obj),
  removeEmpty: <T extends Record<string, any>>(obj: T): Partial<T> => 
    sanitizationService.removeEmptyValues(obj),
};

// Type definitions
export type SanitizationServiceType = InstanceType<typeof SanitizationService>;
export type SanitizeConfig = typeof SANITIZE_CONFIG;

export default sanitizationService;