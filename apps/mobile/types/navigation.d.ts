// types/navigation.d.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Centralized app navigation param list
export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: undefined;

  // Main
  Home: undefined;
  Favorites: undefined;
  Blog: undefined;
  Activity: undefined;

  // Discovery
  Search: { query?: string };
  PlaceDetail: { placeId: string };
  EventDetail: { eventId: string };

  // Booking
  Booking: { placeId?: string; eventId?: string };
  BookingConfirmation: { bookingId: string };
  BookingDetail: { bookingId: string };
  BookingHistory: undefined;

  // Payment
  Payment: {
    bookingId: string;
    amount: number;
    eventTitle?: string;
    bookingDetails?: any;
  };
  PaymentSuccess: {
    bookingId: string;
    amount?: number;
    eventTitle?: string;
    txRef?: string;
  };

  // Profile & Social
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  AccountSettings: undefined;
  ActiveSessions: undefined;
  Verification: undefined;
  ChangePassword: undefined;
  Language: undefined;
  Currency: undefined;
  BlockedAccounts: undefined;
  DownloadData: undefined;
  HelpCenter: undefined;
  ReportProblem: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  UserProfile: { userId: string };
  PostDetail: { postId: string; focusComments?: boolean };
  // Chat
  Chat: undefined;
  ChatSettings: undefined;
  SessionHistory: undefined

  // Misc
  QRScanner: undefined;
  Notifications: undefined;
  FilterModal: undefined;
  CreateCollection: undefined;

    // Ticket screens
  Tickets: undefined;
  TicketDetail: { ticketId: string };
  EventDetail: { eventId: string };

  //QR Scanner
  QRScanner: undefined;

  // Notifications
  Activity: undefined; 
  NotificationSettings: undefined;
  PostDetail: { postId: string };
  NewPost: undefined;

};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;