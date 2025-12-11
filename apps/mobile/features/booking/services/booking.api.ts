import { apiClient } from '../../../shared/services/api/client';
import { PaginatedResponse } from '../../../shared/types/api.types';
import {
  Booking,
  Ticket,
  Payment,
  BookingFormData,
  BookingSummary,
  DateAvailability,
  TimeSlot,
  BookingFilters,
  BookingConfirmation,
  BookingAnalytics,
} from '../types/booking.types';

const emptyPage = <T>(page = 1, limit = 10): PaginatedResponse<T> => ({
  data: [],
  pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
});

export const bookingApi = {
  // Bookings
  async getBookings(
    page = 1,
    limit = 20,
    filters?: BookingFilters
  ): Promise<PaginatedResponse<Booking>> {
    const params: any = { page, limit, ...filters };
    const res = await apiClient.get<PaginatedResponse<Booking>>('/bookings', { params });
    return res.data ?? emptyPage<Booking>(page, limit);
  },

  async getBooking(bookingId: string): Promise<Booking> {
    const res = await apiClient.get<Booking>(`/bookings/${bookingId}`);
    return res.data!;
  },

  async createBooking(data: BookingFormData): Promise<BookingConfirmation> {
    const res = await apiClient.post<BookingConfirmation>('/bookings', data);
    return res.data!;
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    const res = await apiClient.patch<Booking>(`/bookings/${bookingId}`, updates);
    return res.data!;
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const res = await apiClient.post<Booking>(`/bookings/${bookingId}/cancel`, { reason });
    return res.data!;
  },

  async requestRefund(bookingId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/bookings/${bookingId}/refund`,
      { reason }
    );
    return res.data!;
  },

  // Availability
  async checkAvailability(
    eventId?: string,
    placeId?: string,
    date?: string
  ): Promise<DateAvailability[]> {
    const params: any = {};
    if (eventId) params.eventId = eventId;
    if (placeId) params.placeId = placeId;
    if (date) params.date = date;

    const res = await apiClient.get<DateAvailability[]>('/bookings/availability', { params });
    return res.data ?? [];
  },

  async getTimeSlots(eventId: string, date: string): Promise<TimeSlot[]> {
    const res = await apiClient.get<TimeSlot[]>(`/events/${eventId}/timeslots`, {
      params: { date },
    });
    return res.data ?? [];
  },

  // Tickets
  async getTickets(bookingId: string): Promise<Ticket[]> {
    const res = await apiClient.get<Ticket[]>(`/bookings/${bookingId}/tickets`);
    return res.data ?? [];
  },

  async validateTicket(ticketId: string): Promise<{ valid: boolean; message?: string }> {
    const res = await apiClient.get<{ valid: boolean; message?: string }>(
      `/tickets/${ticketId}/validate`
    );
    return res.data!;
  },

  async markTicketAsUsed(ticketId: string): Promise<Ticket> {
    const res = await apiClient.patch<Ticket>(`/tickets/${ticketId}/use`);
    return res.data!;
  },

  // Payments
  async getPayments(page = 1, limit = 20): Promise<PaginatedResponse<Payment>> {
    const res = await apiClient.get<PaginatedResponse<Payment>>('/payments', {
      params: { page, limit },
    });
    return res.data ?? emptyPage<Payment>(page, limit);
  },

  async createPaymentIntent(bookingId: string, paymentMethod?: string): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  }> {
    const res = await apiClient.post<{
      clientSecret: string;
      paymentIntentId: string;
      amount: number;
      currency: string;
    }>(`/bookings/${bookingId}/payment-intent`, { paymentMethod });
    return res.data!;
  },

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const res = await apiClient.post<Payment>(`/payments/${paymentIntentId}/confirm`);
    return res.data!;
  },

  async getPaymentMethods(): Promise<string[]> {
    const res = await apiClient.get<string[]>('/payments/methods');
    return res.data ?? [];
  },

  // Summary & Calculations
  async calculatePrice(data: {
    eventId?: string;
    placeId?: string;
    date: string;
    timeSlotId?: string;
    guests: { adults: number; children: number; infants: number };
  }): Promise<BookingSummary> {
    const res = await apiClient.post<BookingSummary>('/bookings/calculate-price', data);
    return res.data!;
  },

  // Analytics
  async getBookingAnalytics(): Promise<BookingAnalytics> {
    const res = await apiClient.get<BookingAnalytics>('/bookings/analytics');
    return res.data!;
  },

  async getUpcomingBookings(): Promise<Booking[]> {
    const res = await apiClient.get<Booking[]>('/bookings/upcoming');
    return res.data ?? [];
  },

  // Calendar
  async getBookingCalendar(year: number, month: number): Promise<{
    date: string;
    hasBookings: boolean;
    bookingCount: number;
  }[]> {
    const res = await apiClient.get<{
      date: string;
      hasBookings: boolean;
      bookingCount: number;
    }[]>('/bookings/calendar', { params: { year, month } });
    return res.data ?? [];
  },

  // Reminders
  async setReminder(bookingId: string, hoursBefore: number): Promise<void> {
    await apiClient.post(`/bookings/${bookingId}/reminders`, { hoursBefore });
  },

  async getReminders(): Promise<{ bookingId: string; reminderTime: string; hoursBefore: number }[]> {
    const res = await apiClient.get<{ bookingId: string; reminderTime: string; hoursBefore: number }[]>(
      '/bookings/reminders'
    );
    return res.data ?? [];
  },
};