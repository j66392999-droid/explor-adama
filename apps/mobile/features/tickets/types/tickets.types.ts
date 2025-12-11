// features/tickets/types/tickets.types.ts
export interface Ticket {
  id: string;
  bookingId: string;
  userId: string;
  eventId: string;
  qrToken: string;
  qrCode?: string; // Base64 QR code image
  seat?: string;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  event?: Event;
  booking?: Booking;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  place?: {
    name: string;
    address?: string;
  };
  images?: Array<{
    url: string;
    type: string;
  }>;
}

export interface Booking {
  id: string;
  status: string;
  quantity: number;
  total: number;
  createdAt: string;
}

export type TicketStatus = 'PENDING' | 'CONFIRMED' | 'USED' | 'EXPIRED' | 'CANCELLED';

export const TICKET_STATUSES: Record<TicketStatus, {
  label: string;
  color: string;
  icon: string;
}> = {
  PENDING: {
    label: 'Pending',
    color: '#FF9500',
    icon: 'time',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: '#34C759',
    icon: 'checkmark-circle',
  },
  USED: {
    label: 'Used',
    color: '#007AFF',
    icon: 'checkmark-done',
  },
  EXPIRED: {
    label: 'Expired',
    color: '#8E8E93',
    icon: 'time-outline',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#FF3B30',
    icon: 'close-circle',
  },
};

export interface ValidationResult {
  valid: boolean;
  message: string;
  ticketId?: string;
  eventId?: string;
  userId?: string;
}