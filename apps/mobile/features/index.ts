// Auth Feature
export * from "./auth/hooks/useAuth"
export * from "./auth/hooks/useSession"
export * from "./auth/screens/LoginScreen"
export * from "./auth/screens/RegisterScreen"
export * from "./auth/screens/ForgotPasswordScreen"
export * from "./auth/screens/VerificationScreen"
export * from "./auth/services/auth.api"
export * from "./auth/types/auth.types"
export * from "./auth/store/auth.selectors"

// Home Feature
export * from "./home/hooks/useHome"
export * from "./home/screens/HomeScreen"
export * from "./home/services/home.api"
export * from "./home/types/home.types"

// Discovery Feature
export * from "./discovery/hooks/useDiscovery"
export * from "./discovery/screens/SearchScreen"
export * from "./discovery/screens/CategoryScreen"
export * from "./discovery/screens/PlaceDetailScreen"
export * from "./discovery/screens/EventDetailScreen"
export * from "./discovery/screens/MapScreen"
export * from "./discovery/services/discovery.api"
// Explicitly re-export to avoid naming conflicts
export { Booking as DiscoveryBooking, Ticket as DiscoveryTicket, /* other exports */ } from "./discovery/types/discovery.types"

// Booking Feature
export * from "./booking/hooks/useBooking"
export * from "./booking/screens/BookingScreen"
export * from "./booking/screens/BookingConfirmationScreen"
export * from "./booking/screens/BookingHistoryScreen"
// Explicitly re-export to avoid naming conflicts
export { Booking as BookingBooking, Ticket as BookingTicket, /* other exports */ } from "./booking/types/booking.types"
export * from "./booking/types/booking.types"

// Favorites Feature
export * from "./favorites/hooks/useFavorites"
export * from "./favorites/screens/FavoritesScreen"
export * from "./favorites/screens/CollectionsScreen"
export * from "./favorites/services/favorites.api"
export * from "./favorites/types/favorites.types"

// Social Feature
export * from "./social/hooks/useSocial"
export * from "./social/screens/BlogFeedScreen"
export * from "./social/screens/CreatePostScreen"
export * from "./social/services/social.api"
export * from "./social/types/social.types"

// Profile Feature
export * from "./profile/hooks/useProfile"
export * from "./profile/screens/ProfileScreen"
export * from "./profile/screens/EditProfileScreen"
export * from "./profile/screens/SettingsScreen"
export * from "./profile/services/profile.api"
export * from "./profile/types/profile.types"

// Notifications Feature
export * from "./notifications/hooks/useNotifications"
export * from "./notifications/screens/NotificationsScreen"
export * from "./notifications/services/notifications.api"
export * from "./notifications/types/notifications.types"

// Reviews Feature
export * from "./reviews/hooks/useReviews"
export * from "./reviews/screens/ReviewScreen"
export * from "./reviews/screens/WriteReviewScreen"
export * from "./reviews/services/reviews.api"
export * from "./reviews/types/reviews.types"

// Payments Feature
export * from "./payments/hooks/usePayments"
export * from "./payments/screens/PaymentScreen"
export * from "./payments/screens/PaymentSuccessScreen"
export * from "./payments/services/payments.api"
// Skip re-exporting payment types here to avoid naming collisions with other features (e.g. booking types)

// Tickets Feature
export * from "./tickets/hooks/useTickets"
export * from "./tickets/screens/TicketsScreen"
export * from "./tickets/screens/QRScannerScreen"
export * from "./tickets/screens/TicketDetailScreen"
export * from "./tickets/services/tickets.api"
// Avoid re-exporting tickets types to prevent conflicts (Ticket type collides with other features)

// Chatbot Feature
export * from "./chatbot/hooks/useChatbot"
export * from "./chatbot/screens/ChatScreen"
export * from "./chatbot/services/chatbot.api"
export * from "./chatbot/types/chatbot.types"
