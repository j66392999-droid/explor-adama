// features/tickets/services/tickets.api.ts
import { apiClient } from '../../../shared/services/api/client';
import { Ticket, ValidationResult } from '../types/tickets.types';

export const ticketsApi = {
  /**
   * GET /api/tickets/:id - Get ticket details
   */
  async getTicket(id: string): Promise<Ticket> {
    const res = await apiClient.get<Ticket>(`/tickets/${id}`);
    return res.data!;
  },

  /**
   * GET /api/tickets/:id/qr - Get QR code image
   */
  async getTicketQrCode(id: string): Promise<string> {
    const res = await apiClient.get(`/tickets/${id}/qr`, {
      responseType: 'blob', // For binary image data
    });
    return res.data;
  },

  /**
   * POST /api/tickets/validate - Validate ticket QR code
   */
  async validateTicket(qrToken: string): Promise<ValidationResult> {
    const res = await apiClient.post<ValidationResult>('/tickets/validate', {
      qrToken,
    });
    return res.data!;
  },

  /**
   * GET /api/users/:userId/tickets - Get user's tickets
   */
  async getUserTickets(userId: string): Promise<Ticket[]> {
    const res = await apiClient.get<Ticket[]>(`/users/${userId}/tickets`);
    return res.data!;
  },

  /**
   * GET /api/bookings/:bookingId/tickets - Get tickets for a booking
   */
  async getBookingTickets(bookingId: string): Promise<Ticket[]> {
    const res = await apiClient.get<Ticket[]>(`/bookings/${bookingId}/tickets`);
    return res.data!;
  },

  /**
   * PATCH /api/tickets/:id/use - Mark ticket as used
   */
  async markAsUsed(id: string): Promise<Ticket> {
    const res = await apiClient.patch<Ticket>(`/tickets/${id}/use`);
    return res.data!;
  },
};