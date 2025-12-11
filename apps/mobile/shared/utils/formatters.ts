/**
 * Shared formatting utilities for consistent data display
 */

// ============================================
// Date & Time Formatters
// ============================================

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

/**
 * Format a date string to a readable date
 */
export function formatDate(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };

  if (format === 'short') {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date string with time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a time string (for events)
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get day of week from date string
 */
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
  });
}

// ============================================
// Number Formatters
// ============================================

/**
 * Format number with compact notation (e.g., 1.2K, 3.5M)
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  if (num < 1000000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }

  return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string = 'ETB',
  locale: string = 'en-ET'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format rating with stars
 */
export function formatRating(rating: number, maxRating: number = 5): string {
  const roundedRating = Math.round(rating * 10) / 10;
  return `${roundedRating.toFixed(1)}/${maxRating}`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// String Formatters
// ============================================

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitleCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the number looks like a valid phone number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  // Return original if doesn't match expected format
  return phoneNumber;
}

/**
 * Format social media username
 */
export function formatUsername(username: string): string {
  if (!username.startsWith('@')) {
    return `@${username}`;
  }
  return username;
}

// ============================================
// Location Formatters
// ============================================

/**
 * Format distance in meters to readable format
 */
export function formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'metric') {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  } else {
    const feet = meters * 3.28084;
    if (feet < 5280) {
      return `${Math.round(feet)}ft`;
    }
    return `${(feet / 5280).toFixed(1)}mi`;
  }
}

/**
 * Format coordinates to readable location
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lonDir}`;
}

/**
 * Format address with line breaks
 */
export function formatAddress(
  street?: string,
  city?: string,
  state?: string,
  country?: string,
  postalCode?: string
): string {
  const parts = [street, city, state, postalCode, country].filter(Boolean);
  return parts.join(', ');
}

// ============================================
// Data Structure Formatters
// ============================================

/**
 * Format tags array
 */
export function formatTags(tags: string[]): string[] {
  return tags.map(tag => {
    // Remove special characters and convert to lowercase
    const cleaned = tag.replace(/[^\w\s]/g, '').toLowerCase();
    // Capitalize first letter of each word
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });
}

/**
 * Format categories for display
 */
export function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format array to comma-separated string
 */
export function formatArrayToString(arr: any[], maxItems: number = 3): string {
  if (arr.length === 0) {
    return '';
  }
  
  if (arr.length <= maxItems) {
    return arr.join(', ');
  }
  
  return arr.slice(0, maxItems).join(', ') + ` +${arr.length - maxItems} more`;
}

// ============================================
// Time & Date Utilities (compatibility)
// ============================================

/**
 * @deprecated Use formatRelativeTime instead
 * Format distance to now (backwards compatibility)
 */
export function formatDistanceToNow(dateString: string): string {
  return formatRelativeTime(dateString);
}

/**
 * Format date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = start.getMonth() === end.getMonth();
  const sameDay = start.getDate() === end.getDate();

  if (sameDay) {
    // Same day, show date and time range
    return `${formatDate(startDate, 'medium')}, ${formatTime(startDate)} - ${formatTime(endDate)}`;
  }

  if (sameMonth && sameYear) {
    // Same month, show date range within month
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${start.getFullYear()}`;
  }

  if (sameYear) {
    // Same year, show month and day range
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  // Different years
  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// ============================================
// Validation & Sanitization
// ============================================

/**
 * Validate and format email address
 */
export function formatEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    throw new Error('Invalid email format');
  }
  
  return trimmed;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique identifier
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function for expensive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============================================
// Export all formatters
// ============================================

export default {
  // Date & Time
  formatRelativeTime,
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  getDayOfWeek,
  formatDateRange,
  
  // Number
  formatCompactNumber,
  formatCurrency,
  formatPercentage,
  formatRating,
  formatFileSize,
  
  // String
  truncateText,
  capitalizeWords,
  snakeToTitleCase,
  camelToTitleCase,
  getInitials,
  formatPhoneNumber,
  formatUsername,
  
  // Location
  formatDistance,
  formatCoordinates,
  formatAddress,
  
  // Data Structures
  formatTags,
  formatCategory,
  formatArrayToString,
  
  // Validation
  formatEmail,
  sanitizeInput,
  
  // Utilities
  generateId,
  debounce,
  throttle,
  
  // Compatibility
  formatDistanceToNow,
};