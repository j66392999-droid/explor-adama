import { useState, useCallback } from 'react';
import { discoveryApi } from '../../discovery/services/discovery.api';
import { useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { bookingApi } from '../services/booking.api';
import {
  Booking,
  BookingFormData,
  BookingValidationResult,
  CreateBookingRequest,
  TimeSlot,
  AvailabilityResponse,
  UseBookingReturn,
} from '../types/booking.types';

export const useBooking = (): UseBookingReturn => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: any) => {
    const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
    setError(errorMessage);
    return errorMessage;
  }, []);

  const createBooking = useCallback(async (data: CreateBookingRequest): Promise<Booking> => {
    if (!user) {
      throw new Error('You must be logged in to create a booking');
    }

    setIsLoading(true);
    clearError();

    try {
      const response = await bookingApi.createBooking(data);
      const newBooking = response.booking;
      
      // Update local state
      setBookings(prev => [newBooking, ...prev]);
      setCurrentBooking(newBooking);
      
      return newBooking;
    } catch (err: any) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, clearError, handleError]);

  const getBooking = useCallback(async (id: string): Promise<Booking> => {
    setIsLoading(true);
    clearError();

    try {
      const booking = await bookingApi.getBooking(id);
      setCurrentBooking(booking);
      return booking;
    } catch (err: any) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  const getBookings = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<Booking[]> => {
    if (!user) {
      throw new Error('You must be logged in to view bookings');
    }

    setIsLoading(true);
    clearError();

    try {
      const response = await bookingApi.getBookings(params);
      setBookings(response.bookings);
      return response.bookings;
    } catch (err: any) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, clearError, handleError]);

  const cancelBooking = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    clearError();

    try {
      await bookingApi.cancelBooking(id);
      
      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === id ? { ...booking, status: 'CANCELLED' } : booking
      ));
      
      if (currentBooking?.id === id) {
        setCurrentBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      }
    } catch (err: any) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentBooking, clearError, handleError]);

  const updateBooking = useCallback(async (id: string, updates: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    clearError();

    try {
      const updatedBooking = await bookingApi.updateBooking(id, updates);
      
      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === id ? updatedBooking : booking
      ));
      
      if (currentBooking?.id === id) {
        setCurrentBooking(updatedBooking);
      }
      
      return updatedBooking;
    } catch (err: any) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentBooking, clearError, handleError]);

  const checkAvailability = useCallback(async (
    eventId: string, 
    date: string, 
    timeSlot?: string
  ): Promise<AvailabilityResponse> => {
    setIsLoading(true);
    clearError();

    try {
      const availability = await bookingApi.checkAvailability(eventId, date, timeSlot);
      return availability;
    } catch (err: any) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  const getTimeSlots = useCallback(async (eventId: string, date: string): Promise<TimeSlot[]> => {
    setIsLoading(true);
    clearError();

    try {
      const response = await bookingApi.getTimeSlots(eventId, date);
      return response.timeSlots;
    } catch (err: any) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  const getEventDetail = useCallback(async (eventId: string) => {
    try {
      const ev = await discoveryApi.getEventById(eventId);
      return ev as unknown as any;
    } catch (err) {
      const errorMessage = handleError(err);
      throw new Error(errorMessage);
    }
  }, [handleError]);

  // Helper function to calculate booking summary
  const calculateSummary = useCallback((event: any, quantity: number) => {
    const basePrice = event.price || 0;
    const subTotal = basePrice * quantity;
    const tax = subTotal * 0.15; // 15% tax
    const fees = 2.5 * quantity; // Service fee per ticket
    const total = subTotal + tax + fees;

    return {
      subTotal,
      tax,
      fees,
      total,
    };
  }, []);

  // Helper function to validate booking data
  const validateBooking = useCallback((data: BookingFormData, event: any): BookingValidationResult => {
    const errors: Record<string, string> = {};
    if (!data.quantity || data.quantity < 1) {
      errors.quantity = 'Please select at least 1 ticket';
    }

    if (event?.capacity && data.quantity > event.capacity) {
      errors.quantity = `Only ${event.capacity} tickets available`;
    }

    if (!data.date) {
      errors.date = 'Please select a date';
    }

    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.date && selectedDate < today) {
      errors.date = 'Please select a future date';
    }

    const isValid = Object.keys(errors).length === 0;

    const result = {
      isValid,
      errors,
    } as const;

    return result;
  }, []);

  return {
    // State
    bookings,
    currentBooking,
    isLoading,
    error,
    
    // Actions
    createBooking,
    getBooking,
    getBookings,
    cancelBooking,
    updateBooking,
    checkAvailability,
    getTimeSlots,
    
    // Booking detail alias
    bookingDetail: currentBooking,
    getBookingDetail: async (id: string) => { await getBooking(id); },

    // Helper functions
    calculateSummary,
    validateBooking,
    getEventDetail,
  };
};