import { Place, Event } from '../../home/types/home.types';
import { UserProfile } from '../../social/types/social.types';
import { PaymentProvider, PaymentStatus, TicketStatus } from '../../../shared/types/api.types';

export interface Booking {
  id: string;
  userId: string;
  user?: UserProfile;
  eventId: string;
  event?: Event;
  placeId?: string;
  place?: Place;
  quantity: number;
  subtotal: number;
  tax: number;
  fees: number;
  total: number;
  status: BookingStatus['type'];
  transactionId?: string;
  payment?: Payment;
  tickets: Ticket[];
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  bookingDate: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  userId: string;
  eventId: string;
  qrToken: string;
  seat?: string;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
  expiresAt?: string;
  event: Event;
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
  createdAt: string;
  updatedAt: string;
}

export interface BookingStatus {
  type: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  label: string;
  color: string;
  icon: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
  capacity?: number;
  bookedCount: number;
}

export interface DateAvailability {
  date: string;
  available: boolean;
  price?: number;
  slots: TimeSlot[];
}

export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

export interface BookingFormData {
  eventId?: string;
  placeId?: string;
  date: string;
  timeSlotId?: string;
  guests: GuestCount;
  specialRequests?: string;
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  paymentMethod?: string;
}

export interface BookingSummary {
  basePrice: number;
  serviceFee: number;
  tax: number;
  discount?: number;
  total: number;
  currency: string;
}

export interface BookingFilters {
  status?: BookingStatus['type'][];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy: 'date' | 'total' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface CancellationPolicy {
  type: 'FLEXIBLE' | 'MODERATE' | 'STRICT' | 'NON_REFUNDABLE';
  description: string;
  refundPercentage: number;
  cutoffHours: number;
}

export interface BookingConfirmation {
  bookingId: string;
  confirmationNumber: string;
  qrCodeUrl: string;
  tickets: Ticket[];
  receiptUrl?: string;
  instructions?: string[];
}

export interface BookingAnalytics {
  totalBookings: number;
  upcomingBookings: number;
  totalSpent: number;
  averageBookingValue: number;
  favoriteCategories: string[];
  bookingTrend: {
    date: string;
    count: number;
    revenue: number;
  }[];
}

export const BOOKING_STATUSES: Record<BookingStatus['type'], BookingStatus> = {
  PENDING: {
    type: 'PENDING',
    label: 'Pending',
    color: '#FF9500',
    icon: 'time',
  },
  CONFIRMED: {
    type: 'CONFIRMED',
    label: 'Confirmed',
    color: '#34C759',
    icon: 'checkmark-circle',
  },
  CANCELLED: {
    type: 'CANCELLED',
    label: 'Cancelled',
    color: '#FF3B30',
    icon: 'close-circle',
  },
  COMPLETED: {
    type: 'COMPLETED',
    label: 'Completed',
    color: '#007AFF',
    icon: 'checkmark-done',
  },
  REFUNDED: {
    type: 'REFUNDED',
    label: 'Refunded',
    color: '#AF52DE',
    icon: 'arrow-back',
  },
};

export const CANCELLATION_POLICIES: CancellationPolicy[] = [
  {
    type: 'FLEXIBLE',
    description: 'Free cancellation up to 24 hours before the event',
    refundPercentage: 100,
    cutoffHours: 24,
  },
  {
    type: 'MODERATE',
    description: 'Free cancellation up to 48 hours before the event. 50% refund after that.',
    refundPercentage: 50,
    cutoffHours: 48,
  },
  {
    type: 'STRICT',
    description: '50% refund up to 7 days before the event. No refund after that.',
    refundPercentage: 50,
    cutoffHours: 168,
  },
  {
    type: 'NON_REFUNDABLE',
    description: 'No refunds or cancellations',
    refundPercentage: 0,
    cutoffHours: 0,
  },
];