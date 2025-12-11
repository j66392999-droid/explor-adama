// features/tickets/hooks/useTickets.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { ticketsApi } from '../services/tickets.api';
import { Ticket, ValidationResult } from '../types/tickets.types';
import { logger } from '../../../shared/utils/logging/logger';

export const useTickets = () => {
  const { user } = useAppSelector(state => state.auth);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's tickets
  const loadUserTickets = useCallback(async (): Promise<Ticket[]> => {
    if (!user) return [];

    try {
      setIsLoading(true);
      const userTickets = await ticketsApi.getUserTickets(user.id);
      setTickets(userTickets);
      return userTickets;
    } catch (error: any) {
      logger.error('Failed to load tickets', error);
      Alert.alert('Error', 'Failed to load tickets');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load ticket by ID
  const loadTicket = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    try {
      setIsLoading(true);
      const ticket = await ticketsApi.getTicket(ticketId);
      setCurrentTicket(ticket);
      return ticket;
    } catch (error: any) {
      logger.error('Failed to load ticket', error);
      Alert.alert('Error', 'Ticket not found');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load tickets for a booking
  const loadBookingTickets = useCallback(async (bookingId: string): Promise<Ticket[]> => {
    try {
      setIsLoading(true);
      const bookingTickets = await ticketsApi.getBookingTickets(bookingId);
      return bookingTickets;
    } catch (error: any) {
      logger.error('Failed to load booking tickets', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate ticket by QR code
  const validateTicket = useCallback(async (qrToken: string): Promise<ValidationResult> => {
    try {
      const result = await ticketsApi.validateTicket(qrToken);
      
      if (result.valid) {
        logger.info('Ticket validated', {
          ticketId: result.ticketId,
          eventId: result.eventId,
        });
      }
      
      return result;
    } catch (error: any) {
      logger.error('Ticket validation failed', error);
      return {
        valid: false,
        message: 'Validation failed. Please try again.',
      };
    }
  }, []);

  // Mark ticket as used
  const markTicketAsUsed = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    try {
      const ticket = await ticketsApi.markAsUsed(ticketId);
      
      // Update in tickets list
      setTickets(prev => prev.map(t => t.id === ticketId ? ticket : t));
      
      // Update current ticket if it's the same
      if (currentTicket?.id === ticketId) {
        setCurrentTicket(ticket);
      }
      
      logger.info('Ticket marked as used', { ticketId });
      return ticket;
    } catch (error: any) {
      logger.error('Failed to mark ticket as used', error);
      Alert.alert('Error', 'Failed to update ticket status');
      return null;
    }
  }, [currentTicket]);

  // Filter tickets by status
  const filterTicketsByStatus = useCallback((status: string): Ticket[] => {
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  // Get upcoming tickets
  const getUpcomingTickets = useCallback((): Ticket[] => {
    const now = new Date();
    return tickets.filter(ticket => {
      if (ticket.status !== 'CONFIRMED') return false;
      if (!ticket.event?.date) return true;
      
      const eventDate = new Date(ticket.event.date);
      return eventDate > now;
    });
  }, [tickets]);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      loadUserTickets();
    }
  }, [user, loadUserTickets]);

  return {
    // State
    tickets,
    currentTicket,
    isLoading,
    
    // Actions
    loadUserTickets,
    loadTicket,
    loadBookingTickets,
    validateTicket,
    markTicketAsUsed,
    filterTicketsByStatus,
    getUpcomingTickets,
    
    // Derived state
    hasTickets: tickets.length > 0,
    upcomingTickets: getUpcomingTickets(),
    confirmedTickets: filterTicketsByStatus('CONFIRMED'),
    usedTickets: filterTicketsByStatus('USED'),
  };
};