// features/tickets/components/QRCodeDisplay.tsx
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { Text } from '../../../components/ui/Typography/Text';
import { Ionicons } from '@expo/vector-icons';

interface QRCodeDisplayProps {
  ticketId?: string;
  qrToken?: string;
  qrCode?: string; // Base64 image
  size?: number;
  showLabel?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  ticketId,
  qrToken,
  qrCode,
  size = 200,
  showLabel = true,
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  const [qrImage, setQrImage] = React.useState<string | null>(qrCode || null);

  // In a real app, you would fetch the QR code from your backend
  // For now, we'll use a mock or show placeholder

  React.useEffect(() => {
    if (qrCode) {
      setQrImage(qrCode);
    } else if (qrToken) {
      // Generate simple QR pattern or fetch from backend
      generateMockQR();
    }
  }, [qrCode, qrToken]);

  const generateMockQR = async () => {
    // In real app, fetch from /api/tickets/:id/qr endpoint
    // For now, create a simple pattern
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create a simple mock QR code (in real app, use backend endpoint)
      setQrImage(`data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
          <rect width="100%" height="100%" fill="white"/>
          <rect x="20%" y="20%" width="60%" height="60%" fill="black"/>
          <rect x="30%" y="30%" width="40%" height="40%" fill="white"/>
          <text x="50%" y="85%" text-anchor="middle" font-family="Arial" font-size="12" fill="black">${qrToken?.slice(-8) || 'TICKET'}</text>
        </svg>
      `)}`);
      setIsLoading(false);
    }, 500);
  };

  const handleQRError = () => {
    Alert.alert('QR Code Error', 'Unable to load QR code. Please try again.');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating QR code...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.qrContainer, { width: size, height: size }]}>
        {qrImage ? (
          <Image
            source={{ uri: qrImage }}
            style={[styles.qrImage, { width: size, height: size }]}
            onError={handleQRError}
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size }]}>
            <Ionicons name="qr-code-outline" size={size * 0.4} color={colors.textSecondary} />
            <Text style={styles.placeholderText}>
              QR Code {qrToken ? 'Available' : 'Not Generated'}
            </Text>
          </View>
        )}
        
        {/* Security overlay */}
        <View style={styles.securityOverlay}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
        </View>
      </View>
      
      {showLabel && (
        <View style={styles.info}>
          <Text style={styles.infoTitle}>Your Ticket QR Code</Text>
          <Text style={styles.infoText}>
            Present this code at the entrance for scanning
          </Text>
          {qrToken && (
            <Text style={styles.tokenText}>
              Token: {qrToken.slice(0, 8)}...{qrToken.slice(-8)}
            </Text>
          )}
          {ticketId && (
            <Text style={styles.idText}>
              Ticket ID: {ticketId.slice(-12)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  qrContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrImage: {
    borderRadius: 12,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e9ecef',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  securityOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 4,
    borderRadius: 6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.6,
  },
  info: {
    marginTop: 16,
    alignItems: 'center',
    maxWidth: 300,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  tokenText: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  idText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});