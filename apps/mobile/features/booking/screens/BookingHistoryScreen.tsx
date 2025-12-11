import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { BookingCard } from '../components/BookingCard';
import { useBooking } from '../hooks/useBooking';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { formatDate } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

type BookingHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingHistory'>;

export const BookingHistoryScreen: React.FC = () => {
  const navigation = useNavigation<BookingHistoryScreenNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    bookings,
    upcomingBookings,
    bookingPagination,
    refreshBookings,
    loadMoreBookings,
    filterBookingsByStatus,
    getTotalSpent,
    isLoading,
  } = useBooking();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBookings();
    setRefreshing(false);
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
    setShowFilters(false);
  };

  const handleBookingPress = (bookingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('BookingDetail', { bookingId });
  };

  const handleCreateBooking = () => {
    navigation.navigate('Booking', {});
  };

  const getFilteredBookings = () => {
    switch (activeFilter) {
      case 'upcoming':
        return upcomingBookings;
      case 'past':
        return bookings.filter(b => new Date(b.bookingDate) < new Date());
      case 'cancelled':
        return filterBookingsByStatus('CANCELLED');
      default:
        return bookings;
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
      
      <Text style={styles.headerTitle}>My Bookings</Text>
      
      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Ionicons name="filter" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{bookings.length}</Text>
        <Text style={styles.statLabel}>Total Bookings</Text>
      </View>
      
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{upcomingBookings.length}</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </View>
      
      <View style={styles.stat}>
        <Text style={styles.statNumber}>
          ETB {getTotalSpent().toLocaleString()}
        </Text>
        <Text style={styles.statLabel}>Total Spent</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'upcoming', 'past', 'cancelled'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && [
                styles.activeFilter,
                { backgroundColor: colors.primary },
              ],
            ]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No bookings yet"
      message="Start exploring amazing experiences and make your first booking!"
      icon="🎟️"
      action={{
        label: 'Explore Events',
        onPress: handleCreateBooking,
      }}
    />
  );

  const renderBookings = () => {
    const filteredBookings = getFilteredBookings();
    
    if (filteredBookings.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.bookingsList}>
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onPress={() => handleBookingPress(booking.id)}
          />
        ))}
        
        {bookingPagination.hasNext && (
          <Button
            title="Load More"
            variant="outline"
            onPress={loadMoreBookings}
            loading={bookingPagination.isLoading}
            style={styles.loadMoreButton}
          />
        )}
      </View>
    );
  };

  if (isLoading && bookings.length === 0) {
    return <Loading message="Loading your bookings..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {renderStats()}
        {renderFilters()}
        {renderBookings()}
      </ScrollView>
      
      {/* Create Booking FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreateBooking}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  activeFilter: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  activeFilterText: {
    color: 'white',
    opacity: 1,
    fontWeight: '600',
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  loadMoreButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});