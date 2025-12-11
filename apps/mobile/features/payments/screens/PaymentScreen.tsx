// features/payments/screens/PaymentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { usePayments } from '../hooks/usePayments';
import { RootStackParamList } from '../../../types/navigation';
import { formatCurrency } from '../../../shared/utils/formatters';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const { bookingId, amount, eventTitle } = route.params as any;
  const { completePayment, isProcessing } = usePayments();
  
  const [selectedMethod, setSelectedMethod] = useState<'chapa'>('chapa');

  const handlePayment = async () => {
    try {
      const success = await completePayment(
        bookingId,
        amount,
        `Payment for ${eventTitle || 'booking'}`
      );

      if (success) {
        navigation.navigate('PaymentSuccess', {
          bookingId,
          amount,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Button
        title="Back"
        variant="ghost"
        onPress={() => navigation.goBack()}
        leftIcon={<Ionicons name="arrow-back" size={20} />}
        style={styles.backButton}
      />
      
      <Text style={styles.headerTitle}>Complete Payment</Text>
      
      <View style={styles.headerRight} />
    </View>
  );

  const renderPaymentDetails = () => (
    <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
      <Text style={styles.detailsTitle}>Payment Summary</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Amount:</Text>
        <Text style={styles.detailValue}>
          {formatCurrency(amount, 'ETB')}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Booking ID:</Text>
        <Text style={styles.detailValue}>{bookingId.slice(-8)}</Text>
      </View>
      
      {eventTitle && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Event:</Text>
          <Text style={styles.detailValue}>{eventTitle}</Text>
        </View>
      )}
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={styles.methodsCard}>
      <Text style={styles.methodsTitle}>Select Payment Method</Text>
      
      <TouchableOpacity
        style={[
          styles.methodButton,
          selectedMethod === 'chapa' && [
            styles.selectedMethod,
            { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }
          ],
        ]}
        onPress={() => setSelectedMethod('chapa')}
      >
        <Ionicons 
          name="card" 
          size={24} 
          color={selectedMethod === 'chapa' ? colors.primary : colors.text}
        />
        <View style={styles.methodInfo}>
          <Text style={[
            styles.methodName,
            selectedMethod === 'chapa' && { color: colors.primary, fontWeight: '600' }
          ]}>
            Chapa Payment
          </Text>
          <Text style={styles.methodDescription}>
            Pay with card, mobile banking, or Telebirr
          </Text>
        </View>
        
        {selectedMethod === 'chapa' && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSecurityInfo = () => (
    <View style={[styles.securityCard, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
      <View style={styles.securityRow}>
        <Ionicons name="shield-checkmark" size={20} color="#34C759" />
        <Text style={styles.securityText}>
          Secure payment processed by Chapa
        </Text>
      </View>
      
      <View style={styles.securityRow}>
        <Ionicons name="lock-closed" size={20} color="#34C759" />
        <Text style={styles.securityText}>
          Your payment information is encrypted
        </Text>
      </View>
      
      <View style={styles.securityRow}>
        <Ionicons name="arrow-redo" size={20} color="#34C759" />
        <Text style={styles.securityText}>
          You'll be redirected to Chapa's secure page
        </Text>
      </View>
    </View>
  );

  if (isProcessing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <Loading message="Processing payment..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderPaymentDetails()}
        {renderPaymentMethod()}
        {renderSecurityInfo()}
        
        {/* Payment Button */}
        <View style={styles.paymentButtonContainer}>
          <Button
            title={`Pay ${formatCurrency(amount, 'ETB')}`}
            onPress={handlePayment}
            loading={isProcessing}
            style={styles.payButton}
            leftIcon={<Ionicons name="lock-closed" size={20} color="white" />}
          />
          
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </View>
        
        {/* Payment Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instruction}>1. Click "Pay" button above</Text>
          <Text style={styles.instruction}>2. You'll be redirected to Chapa's secure page</Text>
          <Text style={styles.instruction}>3. Complete payment using your preferred method</Text>
          <Text style={styles.instruction}>4. Return to app automatically after payment</Text>
          <Text style={styles.instruction}>5. Your booking will be confirmed instantly</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 80,
  },
  detailsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  methodsCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  selectedMethod: {
    borderWidth: 2,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  securityCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  paymentButtonContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  payButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
  instructions: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 6,
    marginLeft: 8,
  },
});