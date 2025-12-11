// features/payments/hooks/usePayments.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { paymentsApi, InitPaymentRequest } from '../services/payments.api';
import { logger } from '../../../shared/utils/logging/logger';
import * as Crypto from 'expo-crypto';

export const usePayments = () => {
  const { user } = useAppSelector(state => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<any>(null);

  // Generate a unique return URL for mobile
  const generateReturnUrl = useCallback((bookingId: string): string => {
    const scheme = Platform.OS === 'ios' ? 'exploradama://' : 'exploradama://';
    return `${scheme}payment/callback/${bookingId}`;
  }, []);

  // Initialize payment
  const initializePayment = useCallback(async (
    bookingId: string,
    amount: number,
    description?: string
  ): Promise<{ checkoutUrl: string; paymentId: string }> => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    setIsProcessing(true);
    try {
      const returnUrl = generateReturnUrl(bookingId);
      
      const request: InitPaymentRequest = {
        userId: user.id,
        bookingId,
        amount,
        currency: 'ETB',
        description: description || `Payment for booking ${bookingId}`,
        returnUrl
      };

      const response = await paymentsApi.initializePayment(request);
      
      setCurrentPayment(response.payment);
      
      logger.info('Payment initialized', {
        paymentId: response.payment.id,
        checkoutUrl: response.checkoutUrl,
        bookingId
      });

      return {
        checkoutUrl: response.checkoutUrl,
        paymentId: response.payment.id
      };
    } catch (error: any) {
      logger.error('Payment initialization failed', error);
      throw new Error(error.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  }, [user, generateReturnUrl]);

  // Open payment in browser
  const openPaymentBrowser = useCallback(async (checkoutUrl: string, paymentId: string) => {
    try {
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#007AFF',
        dismissButtonStyle: 'close',
        toolbarColor: '#ffffff',
        enableBarCollapsing: true,
        showTitle: true,
      });

      // Handle browser result
      if (result.type === 'cancel') {
        throw new Error('Payment cancelled');
      }

      // Browser closed, verify payment
      return await verifyPayment(paymentId);
    } catch (error: any) {
      logger.error('Browser payment failed', error);
      throw error;
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (paymentId: string): Promise<boolean> => {
    try {
      const payment = await paymentsApi.getPaymentById(paymentId);
      
      if (payment.status === 'SUCCESS') {
        setCurrentPayment(payment);
        return true;
      }
      
      // If still pending, try to verify with Chapa
      if (payment.providerTransactionId) {
        const verification = await paymentsApi.verifyPayment(payment.providerTransactionId);
        
        if (verification.status === 'success') {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Payment verification failed', error);
      return false;
    }
  }, []);

  // Complete payment flow
  const completePayment = useCallback(async (
    bookingId: string,
    amount: number,
    description?: string
  ): Promise<boolean> => {
    try {
      // 1. Initialize payment with backend
      const { checkoutUrl, paymentId } = await initializePayment(bookingId, amount, description);
      
      // 2. Open Chapa payment page
      await openPaymentBrowser(checkoutUrl, paymentId);
      
      // 3. Verify payment
      const success = await verifyPayment(paymentId);
      
      if (success) {
        logger.info('Payment completed successfully', { paymentId, bookingId });
        return true;
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      Alert.alert('Payment Error', error.message || 'Payment failed');
      return false;
    }
  }, [initializePayment, openPaymentBrowser, verifyPayment]);

  // Setup deep linking listener
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('exploradama://payment/callback/')) {
        // Extract booking ID from URL
        const bookingId = url.replace('exploradama://payment/callback/', '');
        
        // Close browser if open
        await WebBrowser.dismissBrowser();
        
        // Find and verify payment for this booking
        try {
          const payment = await paymentsApi.getPaymentByBookingId(bookingId);
          if (payment) {
            const success = await verifyPayment(payment.id);
            if (success) {
              Alert.alert('Success', 'Payment completed successfully!');
            }
          }
        } catch (error) {
          console.error('Deep link handling error:', error);
        }
      }
    };

    // Listen for deep links
    Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    
    // Check initial URL
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, [verifyPayment]);

  return {
    // State
    currentPayment,
    isProcessing,
    
    // Actions
    initializePayment,
    completePayment,
    verifyPayment,
    openPaymentBrowser,
  };
};