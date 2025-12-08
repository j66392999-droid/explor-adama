// types/navigation.d.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define your root navigation params
export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: undefined;
  
  // Main Tabs
  Home: undefined;
  Favorites: undefined;
  Blog: undefined;
  Activity: undefined;
  Chat: undefined;
  
  // Profile screens
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  
  // Discovery screens
  Search: { query?: string };
  PlaceDetail: { placeId: string };
  EventDetail: { eventId: string };
  Map: undefined;
  Category: { categoryId: string; categoryName: string };
  
  // Booking screens
  Booking: { placeId?: string; eventId?: string };
  BookingConfirmation: { bookingId: string };
  Tickets: undefined;
  TicketDetail: { ticketId: string };
  
  // Review screens
  WriteReview: { placeId?: string; eventId?: string };
  MyReviews: undefined;
  
  // Payment screens
  Payment: { bookingId: string };
  PaymentSuccess: { paymentId: string };
  
  // Modal screens
  FilterModal: undefined;
  CreateCollection: undefined;
};

// Type for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Helper type for screen props
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;