import { Event, Place } from '../../home/types/home.types';
import { PaymentStatus, TicketStatus } from '../../../shared/types/api.types';

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  event: Event;
  quantity: number;
  subTotal: number;
  tax: number;
  fees: number;
  total: number;
  status: BookingStatus;
  transactionId?: string;
  payment?: Payment;
  tickets: Ticket[];
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  bookingId?: string;
  userId: string;
  eventId: string;
  event: Event;
  qrToken: string;
  seat?: string;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  provider: PaymentProvider;
  providerTransactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: any;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  eventId: string;
  quantity: number;
  date: string;
  timeSlot?: string;
  specialRequests?: string;
  guestInfo?: GuestInfo[];
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
  capacity?: number;
  bookedCount?: number;
}

export interface BookingSummary {
  subTotal: number;
  tax: number;
  fees: number;
  total: number;
  discount?: number;
}

export interface CreateBookingRequest {
  eventId: string;
  quantity: number;
  date: string;
  timeSlot?: string;
  specialRequests?: string;
  guestInfo?: GuestInfo[];
  paymentMethod?: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  paymentIntent?: any;
}

// Enums
export type BookingStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'REFUNDED';

export type PaymentProvider = 
  | 'CHAPA'
  | 'STRIPE'
  | 'MANUAL'
  | 'CASH';

export type TicketType = 
  | 'STANDARD'
  | 'VIP'
  | 'PREMIUM'
  | 'GROUP';

// API Response Types
export interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TimeSlotsResponse {
  timeSlots: TimeSlot[];
  date: string;
  eventId: string;
}

export interface AvailabilityResponse {
  available: boolean;
  availableSpots: number;
  date: string;
  timeSlot?: string;
  eventId: string;
}

// Validation Types
export interface BookingValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  availability?: AvailabilityResponse;
}

// Hook Return Types
export interface UseBookingReturn {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  bookingDetail: Booking | null;
  createBooking: (data: CreateBookingRequest) => Promise<Booking>;
  getBooking: (id: string) => Promise<Booking>;
  getBookings: () => Promise<Booking[]>;
  cancelBooking: (id: string) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<Booking>;
  checkAvailability: (eventId: string, date: string, timeSlot?: string) => Promise<AvailabilityResponse>;
  getTimeSlots: (eventId: string, date: string) => Promise<TimeSlot[]>;
  validateBooking: (data: BookingFormData, event: Event) => BookingValidationResult;
  calculateSummary: (event: Event, quantity: number) => BookingSummary;
  getBookingDetail: (id: string) => Promise<void>;
  getEventDetail: (eventId: string) => Promise<Event>;
}