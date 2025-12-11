// features/tickets/screens/TicketsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { TicketCard } from '../components/TicketCard';
import { useTickets } from '../hooks/useTickets';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { TICKET_STATUSES } from '../types/tickets.types';
import * as Haptics from 'expo-haptics';

type TicketsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tickets'>;

export const TicketsScreen: React.FC = () => {
  const navigation = useNavigation<TicketsScreenNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    tickets,
    upcomingTickets,
    confirmedTickets,
    usedTickets,
    isLoading,
    loadUserTickets,
  } = useTickets();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'used'>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserTickets();
    setRefreshing(false);
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  const handleTicketPress = (ticketId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TicketDetail', { ticketId });
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  const handleAddTicket = () => {
    Alert.alert('Add Ticket', 'Tickets are automatically added when you complete bookings.');
  };

  const getFilteredTickets = () => {
    switch (activeFilter) {
      case 'upcoming':
        return upcomingTickets;
      case 'used':
        return usedTickets;
      default:
        return tickets;
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
      
      <Text style={styles.headerTitle}>My Tickets</Text>
      
      <TouchableOpacity onPress={handleScanQR}>
        <Ionicons name="qr-code" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{tickets.length}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{upcomingTickets.length}</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </View>
      
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{usedTickets.length}</Text>
        <Text style={styles.statLabel}>Used</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'upcoming', 'used'] as const).map((filter) => (
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
      title="No tickets yet"
      message="Book events to get tickets. Your tickets will appear here after booking."
      icon="🎟️"
      action={{
        label: 'Browse Events',
        onPress: () => navigation.navigate('Home'),
      }}
    />
  );

  const renderTickets = () => {
    const filteredTickets = getFilteredTickets();
    
    if (filteredTickets.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.ticketsList}>
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onPress={() => handleTicketPress(ticket.id)}
          />
        ))}
      </View>
    );
  };

  if (isLoading && tickets.length === 0) {
    return <Loading message="Loading your tickets..." />;
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
        {renderTickets()}
      </ScrollView>
      
      {/* Scan QR FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleScanQR}
      >
        <Ionicons name="qr-code" size={24} color="white" />
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
  ticketsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
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