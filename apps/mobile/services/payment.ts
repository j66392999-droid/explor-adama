import axios from 'axios';
import { logger } from '../shared/utils/logging/logger';

const CHAPA_CONFIG = {
  baseUrl: 'https://api.chapa.co/v1',
  publicKey: process.env.EXPO_PUBLIC_CHAPA_PUBLIC_KEY,
  secretKey: process.env.EXPO_PUBLIC_CHAPA_SECRET_KEY,
};

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  txRef: string;
  callbackUrl?: string;
  returnUrl?: string;
  customization?: {
    title: string;
    description: string;
    logo: string;
  };
}

export interface PaymentResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
    tx_ref: string;
  };
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    status: 'success' | 'failed' | 'pending';
    tx_ref: string;
    currency: string;
    amount: number;
    created_at: string;
  };
}

class PaymentService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: CHAPA_CONFIG.baseUrl,
      headers: {
        Authorization: `Bearer ${CHAPA_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async initializePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.axiosInstance.post('/transaction/initialize', paymentData);
      return response.data;
    } catch (error: any) {
      try { logger.error('Payment initialization error', error); } catch { try { console.error(`Payment initialization error: ${error?.message || error}`); } catch {} }
      throw new Error('Failed to initialize payment');
    }
  }

  async verifyPayment(transactionRef: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await this.axiosInstance.get(`/transaction/verify/${transactionRef}`);
      return response.data;
    } catch (error: any) {
      try { logger.error('Payment verification error', error); } catch { try { console.error(`Payment verification error: ${error?.message || error}`); } catch {} }
      throw new Error('Failed to verify payment');
    }
  }

  async createMobilePayment(phoneNumber: string, amount: number, currency: string = 'ETB') {
    try {
      const response = await this.axiosInstance.post('/mobile/initialize', {
        phone_number: phoneNumber,
        amount,
        currency,
        tx_ref: `WIA-${Date.now()}`,
      });
      return response.data;
    } catch (error: any) {
      try { logger.error('Mobile payment error', error); } catch { try { console.error(`Mobile payment error: ${error?.message || error}`); } catch {} }
      throw new Error('Failed to create mobile payment');
    }
  }

  generateTransactionRef(prefix: string = 'WIA'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }
}

export const paymentService = new PaymentService();