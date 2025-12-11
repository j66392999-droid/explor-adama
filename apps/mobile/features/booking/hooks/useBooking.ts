import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/state/useAppSelector';
import { bookingApi } from '../services/booking.api';
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
  GuestCount,
  BookingStatus,
  BOOKING_STATUSES,
} from '../types/booking.types';
import { PaginatedResponse } from '../../../shared/types/api.types';
import { logger } from '../../../shared/utils/logging/logger';
import { setLoading, setError } from '../../../store/slices/app/app.slice';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

export const useBooking = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isConnected } = useAppSelector(state => state.app);

  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingPagination, setBookingPagination] = useState({
    page: 1,
    hasNext: true,
    isLoading: false,
  });
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);

  // Filters
  const [filters, setFilters] = useState<BookingFilters>({
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Load bookings
  const loadBookings = useCallback(async (
    page = 1,
    limit = 20,
    customFilters?: BookingFilters
  ): Promise<PaginatedResponse<Booking>> => {
    if (!isConnected || !user) {
      return emptyPage<Booking>(page, limit);
    }

    try {
      setBookingPagination(prev => ({ ...prev, isLoading: true }));
      const activeFilters = customFilters || filters;
      const response = await bookingApi.getBookings(page, limit, activeFilters);

      if (page === 1) {
        setBookings(response.data);
      } else {
        setBookings(prev => [...prev, ...response.data]);
      }

      setBookingPagination({
        page: response.pagination.page,
        hasNext: response.pagination.hasNext,
        isLoading: false,
      });

      logger.debug('Bookings loaded', {
        count: response.data.length,
        page: response.pagination.page,
        total: response.pagination.total,
      });

      return response;
    } catch (error: any) {
      logger.error('Failed to load bookings', error);
      setBookingPagination(prev => ({ ...prev, isLoading: false }));
      return emptyPage<Booking>(page, limit);
    }
  }, [user, isConnected, filters]);

  const refreshBookings = useCallback(async (customFilters?: BookingFilters): Promise<void> => {
    await loadBookings(1, 20, customFilters);
  }, [loadBookings]);

  const loadMoreBookings = useCallback(async (): Promise<void> => {
    if (!bookingPagination.hasNext || bookingPagination.isLoading) return;
    
    const nextPage = bookingPagination.page + 1;
    await loadBookings(nextPage);
  }, [bookingPagination, loadBookings]);

  // Update filters
  const updateFilters = useCallback(async (newFilters: Partial<BookingFilters>): Promise<void> => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await refreshBookings(updatedFilters);
  }, [filters, refreshBookings]);

  // Load single booking
  const loadBooking = useCallback(async (bookingId: string): Promise<Booking | null> => {
    if (!isConnected) return null;

    try {
      dispatch(setLoading(true));
      const booking = await bookingApi.getBooking(bookingId);
      setCurrentBooking(booking);
      return booking;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load booking';
      dispatch(setError(errorMessage));
      logger.error('Failed to load booking', error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [isConnected, dispatch]);

  // Create booking
  const createBooking = useCallback(async (data: BookingFormData): Promise<BookingConfirmation | null> => {
    if (!user) return null;

    try {
      dispatch(setLoading(true));
      const confirmation = await bookingApi.createBooking(data);
      
      // Refresh bookings list
      await refreshBookings();
      
      // Load upcoming bookings
      await loadUpcomingBookings();
      
      logger.info('Booking created', { bookingId: confirmation.bookingId });
      return confirmation;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create booking';
      dispatch(setError(errorMessage));
      logger.error('Failed to create booking', error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, refreshBookings]);

  // Update booking
  const updateBooking = useCallback(async (
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<Booking | null> => {
    try {
      const booking = await bookingApi.updateBooking(bookingId, updates);
      
      // Update in bookings list
      setBookings(prev => prev.map(b => b.id === bookingId ? booking : b));
      
      // Update current booking if it's the same
      if (currentBooking?.id === bookingId) {
        setCurrentBooking(booking);
      }

      logger.info('Booking updated', { bookingId });
      return booking;
    } catch (error: any) {
      logger.error('Failed to update booking', error);
      return null;
    }
  }, [currentBooking]);

  // Cancel booking
  const cancelBooking = useCallback(async (
    bookingId: string,
    reason?: string
  ): Promise<Booking | null> => {
    try {
      const booking = await bookingApi.cancelBooking(bookingId, reason);
      
      // Update in bookings list
      setBookings(prev => prev.map(b => b.id === bookingId ? booking : b));
      
      // Update current booking if it's the same
      if (currentBooking?.id === bookingId) {
        setCurrentBooking(booking);
      }

      logger.info('Booking cancelled', { bookingId, reason });
      return booking;
    } catch (error: any) {
      logger.error('Failed to cancel booking', error);
      return null;
    }
  }, [currentBooking]);

  // Request refund
  const requestRefund = useCallback(async (
    bookingId: string,
    reason: string
  ): Promise<{ success: boolean; message: string } | null> => {
    try {
      const result = await bookingApi.requestRefund(bookingId, reason);
      logger.info('Refund requested', { bookingId, reason, success: result.success });
      return result;
    } catch (error: any) {
      logger.error('Failed to request refund', error);
      return null;
    }
  }, []);

  // Check availability
  const checkAvailability = useCallback(async (
    eventId?: string,
    placeId?: string,
    date?: string
  ): Promise<DateAvailability[]> => {
    if (!isConnected) return [];

    try {
      const availabilityData = await bookingApi.checkAvailability(eventId, placeId, date);
      setAvailability(availabilityData);
      return availabilityData;
    } catch (error: any) {
      logger.error('Failed to check availability', error);
      return [];
    }
  }, [isConnected]);

  // Get time slots
  const getTimeSlots = useCallback(async (
    eventId: string,
    date: string
  ): Promise<TimeSlot[]> => {
    if (!isConnected) return [];

    try {
      const slots = await bookingApi.getTimeSlots(eventId, date);
      setTimeSlots(slots);
      return slots;
    } catch (error: any) {
      logger.error('Failed to get time slots', error);
      return [];
    }
  }, [isConnected]);

  // Load tickets
  const loadTickets = useCallback(async (bookingId: string): Promise<Ticket[]> => {
    if (!isConnected) return [];

    try {
      const ticketData = await bookingApi.getTickets(bookingId);
      setTickets(ticketData);
      return ticketData;
    } catch (error: any) {
      logger.error('Failed to load tickets', error);
      return [];
    }
  }, [isConnected]);

  // Validate ticket
  const validateTicket = useCallback(async (ticketId: string): Promise<{
    valid: boolean;
    message?: string;
  } | null> => {
    try {
      const result = await bookingApi.validateTicket(ticketId);
      logger.debug('Ticket validated', { ticketId, valid: result.valid });
      return result;
    } catch (error: any) {
      logger.error('Failed to validate ticket', error);
      return null;
    }
  }, []);

  // Mark ticket as used
  const markTicketAsUsed = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    try {
      const ticket = await bookingApi.markTicketAsUsed(ticketId);
      
      // Update in tickets list
      setTickets(prev => prev.map(t => t.id === ticketId ? ticket : t));
      
      logger.info('Ticket marked as used', { ticketId });
      return ticket;
    } catch (error: any) {
      logger.error('Failed to mark ticket as used', error);
      return null;
    }
  }, []);

  // Calculate price
  const calculatePrice = useCallback(async (data: {
    eventId?: string;
    placeId?: string;
    date: string;
    timeSlotId?: string;
    guests: GuestCount;
  }): Promise<BookingSummary | null> => {
    try {
      const summary = await bookingApi.calculatePrice(data);
      setBookingSummary(summary);
      return summary;
    } catch (error: any) {
      logger.error('Failed to calculate price', error);
      return null;
    }
  }, []);

  // Load payments
  const loadPayments = useCallback(async (page = 1): Promise<Payment[]> => {
    if (!isConnected) return [];

    try {
      const response = await bookingApi.getPayments(page, 20);
      if (page === 1) {
        setPayments(response.data);
      } else {
        setPayments(prev => [...prev, ...response.data]);
      }
      return response.data;
    } catch (error: any) {
      logger.error('Failed to load payments', error);
      return [];
    }
  }, [isConnected]);

  // Create payment intent
  const createPaymentIntent = useCallback(async (
    bookingId: string,
    paymentMethod?: string
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  } | null> => {
    try {
      const intent = await bookingApi.createPaymentIntent(bookingId, paymentMethod);
      logger.debug('Payment intent created', { bookingId, paymentIntentId: intent.paymentIntentId });
      return intent;
    } catch (error: any) {
      logger.error('Failed to create payment intent', error);
      return null;
    }
  }, []);

  // Confirm payment
  const confirmPayment = useCallback(async (paymentIntentId: string): Promise<Payment | null> => {
    try {
      const payment = await bookingApi.confirmPayment(paymentIntentId);
      
      // Add to payments list
      setPayments(prev => [payment, ...prev]);
      
      logger.info('Payment confirmed', { paymentIntentId });
      return payment;
    } catch (error: any) {
      logger.error('Failed to confirm payment', error);
      return null;
    }
  }, []);

  // Load upcoming bookings
  const loadUpcomingBookings = useCallback(async (): Promise<Booking[]> => {
    if (!isConnected || !user) return [];

    try {
      const upcoming = await bookingApi.getUpcomingBookings();
      setUpcomingBookings(upcoming);
      return upcoming;
    } catch (error: any) {
      logger.error('Failed to load upcoming bookings', error);
      return [];
    }
  }, [user, isConnected]);

  // Load analytics
  const loadAnalytics = useCallback(async (): Promise<BookingAnalytics | null> => {
    if (!isConnected || !user) return null;

    try {
      const analytics = await bookingApi.getBookingAnalytics();
      setBookingAnalytics(analytics);
      return analytics;
    } catch (error: any) {
      logger.error('Failed to load booking analytics', error);
      return null;
    }
  }, [user, isConnected]);

  // Add to calendar
  const addToCalendar = useCallback(async (booking: Booking): Promise<boolean> => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Calendar permission not granted');
      }

      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendar = calendars.find(c => (c as any).allowsModifications) || calendars[0];
      if (!defaultCalendar || !defaultCalendar.id) {
        throw new Error('No available calendar to create event');
      }

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Booking: ${booking.event?.title || booking.place?.name}`,
        startDate: new Date(booking.bookingDate),
        endDate: new Date(booking.bookingDate),
        timeZone: 'UTC',
        notes: `Booking ID: ${booking.id}\nStatus: ${booking.status}`,
        location: booking.event?.place?.address || booking.place?.address,
      });

      logger.info('Booking added to calendar', { bookingId: booking.id, eventId });
      return true;
    } catch (error: any) {
      logger.error('Failed to add booking to calendar', error);
      return false;
    }
  }, []);

  // Set reminder
  const setReminder = useCallback(async (
    bookingId: string,
    hoursBefore: number
  ): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      await bookingApi.setReminder(bookingId, hoursBefore);
      
      // Schedule local notification
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const triggerDate = new Date(booking.bookingDate);
        triggerDate.setHours(triggerDate.getHours() - hoursBefore);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Upcoming Booking',
            body: `Your booking for ${booking.event?.title || booking.place?.name} starts in ${hoursBefore} hours`,
            data: { bookingId },
          },
          // `scheduleNotificationAsync` expects a NotificationTriggerInput; use a safe cast here
          trigger: ( { date: triggerDate } as unknown ) as Notifications.NotificationTriggerInput,
        });
      }

      logger.info('Reminder set', { bookingId, hoursBefore });
      return true;
    } catch (error: any) {
      logger.error('Failed to set reminder', error);
      return false;
    }
  }, [bookings]);

  // Initialize
  const initializeBooking = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      await Promise.all([
        refreshBookings(),
        loadUpcomingBookings(),
        loadAnalytics(),
      ]);
    } catch (error: any) {
      logger.error('Failed to initialize booking feature', error);
    }
  }, [user, refreshBookings, loadUpcomingBookings, loadAnalytics]);

  // Get booking status
  const getBookingStatus = useCallback((statusType: BookingStatus['type']) => {
    return BOOKING_STATUSES[statusType] || BOOKING_STATUSES.PENDING;
  }, []);

  // Filter bookings by status
  const filterBookingsByStatus = useCallback((statusType: BookingStatus['type']): Booking[] => {
    return bookings.filter(booking => booking.status === statusType);
  }, [bookings]);

  // Get total spent
  const getTotalSpent = useCallback((): number => {
    return bookings.reduce((total, booking) => total + booking.total, 0);
  }, [bookings]);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializeBooking();
    }
  }, [user, initializeBooking]);

  return {
    // Data
    bookings,
    currentBooking,
    upcomingBookings,
    tickets,
    payments,
    availability,
    timeSlots,
    bookingSummary,
    bookingAnalytics,
    bookingPagination,
    filters,

    // Actions
    loadBookings,
    refreshBookings,
    loadMoreBookings,
    updateFilters,
    loadBooking,
    createBooking,
    updateBooking,
    cancelBooking,
    requestRefund,
    checkAvailability,
    getTimeSlots,
    loadTickets,
    validateTicket,
    markTicketAsUsed,
    calculatePrice,
    loadPayments,
    createPaymentIntent,
    confirmPayment,
    loadUpcomingBookings,
    loadAnalytics,
    addToCalendar,
    setReminder,

    // Helpers
    getBookingStatus,
    filterBookingsByStatus,
    getTotalSpent,
    initializeBooking,

    // Derived states
    hasBookings: bookings.length > 0,
    hasUpcomingBookings: upcomingBookings.length > 0,
    isLoading: bookingPagination.isLoading,
  };
};

// Hook for booking analytics
export const useBookingAnalytics = () => {
  const recordBookingView = useCallback((bookingId: string, bookingType: string): void => {
    logger.info('Booking viewed', {
      bookingId,
      bookingType,
      timestamp: Date.now(),
    });
  }, []);

  const recordBookingAction = useCallback((
    bookingId: string,
    action: 'create' | 'update' | 'cancel' | 'refund'
  ): void => {
    logger.info(`Booking ${action}`, {
      bookingId,
      action,
      timestamp: Date.now(),
    });
  }, []);

  const recordPayment = useCallback((bookingId: string, amount: number, currency: string): void => {
    logger.info('Payment recorded', {
      bookingId,
      amount,
      currency,
      timestamp: Date.now(),
    });
  }, []);

  return {
    recordBookingView,
    recordBookingAction,
    recordPayment,
  };
};

function emptyPage<T>(page: number, limit: number): PaginatedResponse<Booking> | PromiseLike<PaginatedResponse<Booking>> {
  throw new Error('Function not implemented.');
}
