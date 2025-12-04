import type { Payment, PaymentMethod, PaymentStatus } from '../types/payments.types';

// Simple in-memory simulation for payments
let paymentStore: Record<string, Payment> = {};
const paymentMethodsStore: PaymentMethod[] = [
  { id: 'stripe', name: 'Credit & Debit Card (Stripe)', provider: 'stripe', icon: 'credit-card' },
  { id: 'chapa', name: 'Chapa', provider: 'chapa', icon: 'wallet' },
  { id: 'mobile_money', name: 'Mobile Money', provider: 'mobile_money', icon: 'phone' },
];

const randomId = () => String(Date.now() + Math.floor(Math.random() * 1000));

export const listPaymentMethods = async (): Promise<PaymentMethod[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(paymentMethodsStore), 120));
};

export const createPayment = async (amount: number, currency = 'USD', methodId?: string, metadata?: any): Promise<Payment> => {
  const id = randomId();
  const payment: Payment = {
    id,
    amount,
    currency,
    methodId,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    metadata,
  };
  paymentStore[id] = payment;

  // Simulate async processing and eventually mark success
  setTimeout(() => {
    if (paymentStore[id]) paymentStore[id].status = Math.random() > 0.1 ? 'SUCCESS' : 'FAILED';
  }, 1200);

  return new Promise((resolve) => setTimeout(() => resolve(payment), 150));
};

export const getPaymentStatus = async (id: string): Promise<PaymentStatus | null> => {
  const p = paymentStore[id];
  return new Promise((resolve) => setTimeout(() => resolve(p?.status ?? null), 100));
};

export const refundPayment = async (id: string): Promise<boolean> => {
  if (!paymentStore[id]) return false;
  paymentStore[id].status = 'CANCELLED';
  return new Promise((resolve) => setTimeout(() => resolve(true), 180));
};

export default { listPaymentMethods, createPayment, getPaymentStatus, refundPayment };
