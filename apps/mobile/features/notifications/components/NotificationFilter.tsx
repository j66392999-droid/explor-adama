// features/notifications/components/NotificationFilter.tsx
import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { NotificationFilter } from '../types/notifications.types';
import * as Haptics from 'expo-haptics';

interface NotificationFilterProps {
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  unreadCounts: Record<NotificationFilter, number>;
}

export const NotificationFilterBar: React.FC<NotificationFilterProps> = ({
  activeFilter,
  onFilterChange,
  unreadCounts,
}) => {
  const { colors } = useTheme();

  const FILTERS: Array<{ key: NotificationFilter; label: string; icon: string }> = [
    { key: 'all', label: 'All', icon: 'notifications' },
    { key: 'mentions', label: 'Mentions', icon: 'at' },
    { key: 'likes', label: 'Likes', icon: 'heart' },
    { key: 'replies', label: 'Replies', icon: 'chatbubble' },
    { key: 'follows', label: 'Follows', icon: 'person-add' },
    { key: 'bookings', label: 'Bookings', icon: 'calendar' },
    { key: 'payments', label: 'Payments', icon: 'card' },
    { key: 'events', label: 'Events', icon: 'ticket' },
    { key: 'unread', label: 'Unread', icon: 'ellipse' },
  ];

  const handleFilterPress = (filter: NotificationFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFilterChange(filter);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          const unreadCount = unreadCounts[filter.key];

          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                isActive && [styles.activeFilter, { backgroundColor: colors.primary }],
              ]}
              onPress={() => handleFilterPress(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
              
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  activeFilter: {
    paddingHorizontal: 16,
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});