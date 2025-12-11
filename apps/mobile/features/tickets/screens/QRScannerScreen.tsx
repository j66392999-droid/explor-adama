// features/tickets/screens/QRScannerScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { useTickets } from '../hooks/useTickets';
import * as Haptics from 'expo-haptics';

type QRScannerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QRScanner'>;

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<QRScannerScreenNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [hasScanned, setHasScanned] = useState(false);

  const { validateTicket } = useTickets();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (hasScanned || isProcessing) return;
    
    setHasScanned(true);
    setIsScanning(false);
    setIsProcessing(true);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      // Extract QR token from scanned data
      const qrToken = extractTokenFromQRData(data);
      
      if (!qrToken) {
        Alert.alert('Invalid QR Code', 'Please scan a valid ticket QR code.');
        resetScanner();
        return;
      }
      
      // Validate ticket with backend
      const result = await validateTicket(qrToken);
      
      if (result.valid) {
        showValidationSuccess(result);
      } else {
        showValidationError(result.message);
      }
    } catch (error: any) {
      showValidationError(error.message || 'Validation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTokenFromQRData = (data: string): string | null => {
    // Try different patterns for extracting token
    const patterns = [
      /token[=:]([a-zA-Z0-9\-_]+)/i, // token=abc123
      /ticket[=:]([a-zA-Z0-9\-_]+)/i, // ticket=abc123
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, // UUID
    ];
    
    for (const pattern of patterns) {
      const match = data.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    // If no pattern matches, assume the whole data is the token
    return data.length > 5 ? data : null;
  };

  const showValidationSuccess = (result: any) => {
    Alert.alert(
      '✅ Ticket Validated Successfully!',
      `Ticket ID: ${result.ticketId?.slice(-12) || 'N/A'}\nEvent: ${result.eventId?.slice(-8) || 'N/A'}`,
      [
        {
          text: 'View Ticket',
          onPress: () => {
            if (result.ticketId) {
              navigation.navigate('TicketDetail', { ticketId: result.ticketId });
            } else {
              resetScanner();
            }
          },
        },
        {
          text: 'Scan Another',
          onPress: resetScanner,
        },
      ]
    );
  };

  const showValidationError = (message: string) => {
    Alert.alert(
      '❌ Validation Failed',
      message,
      [
        {
          text: 'Try Again',
          onPress: resetScanner,
          style: 'default',
        },
        {
          text: 'Cancel',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]
    );
  };

  const resetScanner = () => {
    setHasScanned(false);
    setIsScanning(true);
    setIsProcessing(false);
  };

  const toggleFlash = () => {
    setFlashMode(prev => prev === 'off' ? 'on' : 'off');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Button
        title="Back"
        variant="ghost"
        onPress={() => navigation.goBack()}
        leftIcon={<Ionicons name={"arrow-back" as React.ComponentProps<typeof Ionicons>['name']} size={20} />}
        style={styles.backButton}
      />
      
      <Text style={styles.headerTitle}>Scan QR Code</Text>
      
      <TouchableOpacity onPress={toggleFlash}>
        <Ionicons
          name={(flashMode === 'on' ? 'flash' : 'flash-off') as React.ComponentProps<typeof Ionicons>['name']}
          size={24}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );

  const renderCamera = () => {
    if (!permission) {
      return <Loading message="Requesting camera permission..." />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Ionicons name={"camera-off" as React.ComponentProps<typeof Ionicons>['name']} size={64} color={colors.text} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes. Please enable camera permissions in your device settings.
          </Text>
          <Button
            title="Enable Camera"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
          enableTorch={flashMode === 'on'}
        />
        
        {/* Scanner overlay */}
        <View style={styles.overlay}>
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          
          <Text style={styles.scannerText}>
            Position QR code within frame
          </Text>
          
          <View style={styles.scannerHint}>
            <Ionicons name={"scan" as React.ComponentProps<typeof Ionicons>['name']} size={20} color="white" />
            <Text style={styles.scannerHintText}>
              Move closer for better scanning
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderProcessing = () => (
    <View style={styles.processingOverlay}>
      <ActivityIndicator size="large" color="white" />
      <Text style={styles.processingText}>Validating ticket...</Text>
    </View>
  );

  const renderInstructions = () => (
    <View style={styles.instructions}>
      <Text style={styles.instructionsTitle}>How to Scan:</Text>
      <Text style={styles.instruction}>1. Hold device steady over QR code</Text>
      <Text style={styles.instruction}>2. Ensure good lighting</Text>
      <Text style={styles.instruction}>3. Keep code within frame</Text>
      <Text style={styles.instruction}>4. Wait for validation result</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
      {renderHeader()}
      
      {renderCamera()}
      
      {isProcessing && renderProcessing()}
      
      <View style={styles.bottomContainer}>
        <Button
          title="Enter Code Manually"
          variant="outline"
          onPress={() => {
            Alert.prompt(
              'Enter Ticket Code',
              'Enter the ticket QR code manually:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Validate',
                  onPress: async (code?: string | undefined) => {
                    if (code) {
                      await handleBarcodeScanned({ data: code });
                    }
                  },
                },
              ],
              'plain-text'
            );
          }}
          leftIcon={<Ionicons name={"keypad" as React.ComponentProps<typeof Ionicons>['name']} size={20} />}
          style={styles.manualButton}
        />
        
        {renderInstructions()}
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#34C759',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#34C759',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#34C759',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#34C759',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    marginTop: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  scannerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  scannerHintText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'black',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    width: '100%',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  manualButton: {
    marginBottom: 20,
  },
  instructions: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    marginLeft: 8,
  },
});