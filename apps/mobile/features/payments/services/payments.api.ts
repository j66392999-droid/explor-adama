// features/payments/services/payments.api.ts - CONNECTS TO YOUR BACKEND
import { apiClient } from '../../../shared/services/api/client';
import {
  Payment,
  PaymentIntent,
  ChapaVerifyResponse
} from '../types/payments.types';

export interface InitPaymentRequest {
  userId: string;
  bookingId: string;
  amount: number;
  currency?: string;
  description?: string;
  returnUrl?: string;
}

export interface InitPaymentResponse {
  payment: Payment;
  providerData: any;
  checkoutUrl: string;
}

export const paymentsApi = {
  /**
   * Initialize payment with your backend
   * Calls: POST /api/payments/init
   */
  async initializePayment(data: InitPaymentRequest): Promise<InitPaymentResponse> {
    const res = await apiClient.post<InitPaymentResponse>('/payments/init', data);
    return res.data!;
  },

  /**
   * Verify payment using your backend
   * Calls: GET /api/payments/verify/:ref
   */
  async verifyPayment(ref: string): Promise<ChapaVerifyResponse> {
    const res = await apiClient.get<ChapaVerifyResponse>(`/payments/verify/${ref}`);
    return res.data!;
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const res = await apiClient.get<Payment>(`/payments/${paymentId}`);
    return res.data!;
  },

  /**
   * Get payment by booking ID
   */
  async getPaymentByBookingId(bookingId: string): Promise<Payment> {
    const res = await apiClient.get<Payment>(`/payments/booking/${bookingId}`);
    return res.data!;
  },

  /**
   * Get user payment history
   */
  async getUserPayments(userId: string, page = 1, limit = 20): Promise<Payment[]> {
    const res = await apiClient.get<Payment[]>(`/payments/user/${userId}`, {
      params: { page, limit }
    });
    return res.data!;
  },

  /**
   * Create payment intent (if you need client-side token)
   */
  async createPaymentIntent(bookingId: string, amount: number): Promise<PaymentIntent> {
    const res = await apiClient.post<PaymentIntent>('/payments/create-intent', {
      bookingId,
      amount,
      currency: 'ETB'
    });
    return res.data!;
  }
};