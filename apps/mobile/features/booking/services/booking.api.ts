import { apiClient } from '../../../shared/services/api/client';
import { ApiResponse } from '../../../shared/types/api.types';
import {
  Booking,
  CreateBookingRequest,
  CreateBookingResponse,
  BookingsResponse,
  TimeSlotsResponse,
  AvailabilityResponse,
} from '../types/booking.types';

export const bookingApi = {
  // Create a new booking
  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await apiClient.post<CreateBookingResponse>(
      '/bookings',
      data
    );
    return response.data as CreateBookingResponse;
  },

  // Get booking by ID
  getBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(
      `/bookings/${id}`
    );
    return response.data as Booking;
  },

  // Get user's bookings
  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<BookingsResponse> => {
    const response = await apiClient.get<BookingsResponse>(
      '/bookings',
      { params }
    );
    return response.data as BookingsResponse;
  },

  // Cancel a booking
  cancelBooking: async (id: string): Promise<void> => {
    await apiClient.patch(`/bookings/${id}/cancel`);
  },

  // Update booking
  updateBooking: async (id: string, updates: Partial<Booking>): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(
      `/bookings/${id}`,
      updates
    );
    return response.data as Booking;
  },

  // Check availability
  checkAvailability: async (
    eventId: string, 
    date: string, 
    timeSlot?: string
  ): Promise<AvailabilityResponse> => {
    const response = await apiClient.get<AvailabilityResponse>(
      `/bookings/availability`,
      { 
        params: { 
          eventId, 
          date, 
          timeSlot 
        } 
      }
    );
    return response.data as AvailabilityResponse;
  },

  // Get available time slots
  getTimeSlots: async (eventId: string, date: string): Promise<TimeSlotsResponse> => {
    const response = await apiClient.get<TimeSlotsResponse>(
      `/bookings/time-slots`,
      { 
        params: { 
          eventId, 
          date 
        } 
      }
    );
    return response.data as TimeSlotsResponse;
  },

  // Get booking summary
  getBookingSummary: async (data: {
    eventId: string;
    quantity: number;
    date: string;
    timeSlot?: string;
  }): Promise<any> => {
    const response = await apiClient.post<any>(
      '/bookings/summary',
      data
    );
    return response.data as Booking;
  },

  // Confirm booking payment
  confirmPayment: async (bookingId: string, paymentData: any): Promise<Booking> => {
    const response = await apiClient.post<Booking>(
      `/bookings/${bookingId}/confirm-payment`,
      paymentData
    );
    return response.data as Booking;
  },

  // Send booking confirmation
  sendConfirmation: async (bookingId: string): Promise<void> => {
    await apiClient.post(`/bookings/${bookingId}/send-confirmation`);
  },

  // Get booking statistics
  getStats: async (): Promise<{
    totalBookings: number;
    upcomingBookings: number;
    pastBookings: number;
    totalSpent: number;
  }> => {
    const response = await apiClient.get<any>(
      '/bookings/stats'
    );
    return response.data;
  },
};