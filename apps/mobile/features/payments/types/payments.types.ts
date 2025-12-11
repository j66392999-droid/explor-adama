// features/payments/types/payments.types.ts
export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  provider: 'CHAPA' | 'STRIPE' | 'MANUAL';
  providerTransactionId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret?: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ChapaVerifyResponse {
  status: string;
  message?: string;
  data?: any;
}