// shared/utils/paymentUtils.ts - NEW FILE
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';

/**
 * Generate a unique transaction reference
 */
export const generateTransactionRef = (prefix = 'EXPL'): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Format amount for Chapa (smallest unit)
 */
export const formatAmountForChapa = (amount: number, currency: string): number => {
  // Chapa expects amount in the smallest currency unit
  // For ETB, it's cents (but 1 ETB = 100 cents)
  // For most currencies, multiply by 100
  const multiplier = currency === 'ETB' ? 100 : 100;
  return Math.round(amount * multiplier);
};

/**
 * Validate payment data
 */
export const validatePaymentData = (data: {
  amount: number;
  currency: string;
  email: string;
  phone: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!data.currency || !['ETB', 'USD'].includes(data.currency)) {
    errors.push('Currency must be ETB or USD');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.phone || data.phone.replace(/\D/g, '').length < 9) {
    errors.push('Valid phone number is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate HMAC signature for webhook verification
 */
export const generateWebhookSignature = (
  payload: string,
  secret: string
): string => {
  return CryptoJS.HmacSHA256(payload, secret).toString(CryptoJS.enc.Hex);
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const computedSignature = generateWebhookSignature(payload, secret);
  return computedSignature === signature;
};

/**
 * Mask sensitive payment data for logging
 */
export const maskPaymentData = (data: any): any => {
  const masked = { ...data };
  
  if (masked.card_number) {
    masked.card_number = `****${masked.card_number.slice(-4)}`;
  }
  
  if (masked.cvv) {
    masked.cvv = '***';
  }
  
  if (masked.phone) {
    masked.phone = masked.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }
  
  if (masked.email) {
    const [name, domain] = masked.email.split('@');
    if (name.length > 2) {
      masked.email = `${name[0]}${'*'.repeat(name.length - 2)}${name.slice(-1)}@${domain}`;
    }
  }
  
  return masked;
};

/**
 * Generate payment expiration time (24 hours from now)
 */
export const generatePaymentExpiry = (hours = 24): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};

/**
 * Calculate payment fees
 */
export const calculatePaymentFees = (
  amount: number,
  provider: 'CHAPA' | 'STRIPE' | 'TELEBIRR'
): { amount: number; fee: number; total: number } => {
  let feePercentage = 0.025; // 2.5% default
  
  switch (provider) {
    case 'CHAPA':
      feePercentage = 0.025; // 2.5%
      break;
    case 'STRIPE':
      feePercentage = 0.029 + 0.3 / amount; // 2.9% + 30 cents
      break;
    case 'TELEBIRR':
      feePercentage = 0.015; // 1.5%
      break;
  }
  
  const fee = amount * feePercentage;
  const total = amount + fee;
  
  return {
    amount,
    fee: parseFloat(fee.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};