// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
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
}

// Common types from Prisma enums
export type UserRole =  'TOURIST';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
export type MediaType = 'IMAGE' | 'VIDEO';
export type PaymentProvider = 'CHAPA' | 'STRIPE' | 'MANUAL';
export type PaymentStatus = 'PENDING' | 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type TicketStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'USED' | 'EXPIRED';
export type InteractionType = 'VIEW' | 'CLICK' | 'SAVE' | 'BOOK' | 'REVIEW' | 'SHARE';
export type RecommendationItemType = 'PLACE' | 'EVENT' | 'RESTAURANT' | 'OTHER';
export type ChatMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED';