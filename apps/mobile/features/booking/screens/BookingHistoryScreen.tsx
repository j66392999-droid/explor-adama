import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useBooking } from '../hooks/useBooking';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { useHideOnScroll } from '../../../shared/hooks/ui/useBottomTabs';

export const BookingHistoryScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  
  const {
    bookings,
    isLoading,
    error,
    getBookings,
  } = useBooking();

  const { onScroll, scrollEventThrottle } = useHideOnScroll();

  useEffect(() => {
    getBookings();
  }, []);

  const filteredBookings = bookings?.filter(booking => {
    const eventDate = new Date(booking.event.date);
    const now = new Date();
    
    switch (activeFilter) {
      case 'upcoming':
        return eventDate >= now;
      case 'past':
        return eventDate < now;
      default:
        return true;
    }
  }) || [];

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.bookingCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
    >
      <View style={styles.bookingHeader}>
        <Text variant="small" numberOfLines={2}>
          {item.event.title}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {new Date(item.event.date).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Tickets</Text>
          <Text style={styles.detailValue}>
            {item.quantity} {item.quantity === 1 ? 'ticket' : 'tickets'}
          </Text>
        </View>
        
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.detailValue}>
            ${item.total.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.bookingId}>
          Booking ID: {item.id.slice(0, 8).toUpperCase()}
        </Text>
        
        <Button
          title="View Details"
          size="small"
          variant="outline"
          onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
        />
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load bookings"
        onRetry={getBookings}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'all' && [styles.activeFilterTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === 'all' && styles.activeFilterTabText,
            ]}
          >
            All ({bookings?.length || 0})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'upcoming' && [styles.activeFilterTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === 'upcoming' && styles.activeFilterTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'past' && [styles.activeFilterTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveFilter('past')}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === 'past' && styles.activeFilterTabText,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          message={
            activeFilter === 'all' 
              ? "You haven't made any bookings yet"
              : `No ${activeFilter} bookings found`
          }
          icon="calendar"
          action={
            activeFilter === 'all' ? {
              label: 'Explore Events',
              onPress: () => navigation.navigate('Home'),
            } : undefined
          }
        />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
  },
  activeFilterTab: {},
  filterTabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterTabText: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bookingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    opacity: 0.7,
    fontSize: 14,
  },
  detailValue: {
    fontWeight: '500',
    fontSize: 14,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 12,
    opacity: 0.5,
  },
});