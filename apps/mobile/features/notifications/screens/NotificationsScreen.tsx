// features/notifications/screens/NotificationsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
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
import { NotificationCard } from '../components/NotificationCard';
import { NotificationFilterBar } from '../components/NotificationFilter';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import * as Haptics from 'expo-haptics';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Activity'>;

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    timeline,
    unreadCounts,
    activeFilter,
    isLoading,
    hasUnread,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    filterNotifications,
    loadNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(activeFilter, 1, 20);
    setRefreshing(false);
  };

  const handleNotificationPress = useCallback((notificationId: string) => {
    if (isSelecting) {
      // Toggle selection
      setSelectedNotifications(prev =>
        prev.includes(notificationId)
          ? prev.filter(id => id !== notificationId)
          : [...prev, notificationId]
      );
    } else {
      // Mark as read and navigate
      markAsRead(notificationId);
      
      // Find notification to get target
      const notification = timeline.find(n => n.id === notificationId);
      if (notification?.target) {
        // Navigate based on target type
        switch (notification.target.type) {
          case 'tweet':
          case 'reply':
            navigation.navigate('PostDetail', { postId: notification.target.id });
            break;
          case 'event':
            navigation.navigate('EventDetail', { eventId: notification.target.id });
            break;
          case 'booking':
            navigation.navigate('BookingDetail', { bookingId: notification.target.id });
            break;
          default:
            // Show notification details
            Alert.alert(notification.content);
        }
      }
    }
  }, [isSelecting, timeline, markAsRead, navigation]);

  const handleProfilePress = useCallback((userId: string) => {
    navigation.navigate('Profile', { userId });
  }, [navigation]);

  const handleContentPress = useCallback((targetId: string, targetType: string) => {
    // Navigate to content
    switch (targetType) {
      case 'tweet':
      case 'reply':
        navigation.navigate('PostDetail', { postId: targetId });
        break;
      case 'event':
        navigation.navigate('EventDetail', { eventId: targetId });
        break;
      case 'booking':
        navigation.navigate('BookingDetail', { bookingId: targetId });
        break;
    }
  }, [navigation]);

  const handleLongPress = useCallback((notificationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSelecting(true);
    setSelectedNotifications([notificationId]);
  }, []);

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: markAllAsRead,
        },
      ]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) return;

    Alert.alert(
      'Delete Notifications',
      `Delete ${selectedNotifications.length} notification${selectedNotifications.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedNotifications) {
              await deleteNotification(id);
            }
            setSelectedNotifications([]);
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  const handleCancelSelection = () => {
    setSelectedNotifications([]);
    setIsSelecting(false);
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerLeft}>
        {isSelecting ? (
          <Button
            title="Cancel"
            variant="ghost"
            onPress={handleCancelSelection}
            style={styles.headerButton}
          />
        ) : (
          <Button
            title="Settings"
            variant="ghost"
            onPress={() => navigation.navigate('NotificationSettings')}
            leftIcon={<Ionicons name="settings" size={20} />}
            style={styles.headerButton}
          />
        )}
      </View>
      
      <Text style={styles.headerTitle}>Notifications</Text>
      
      <View style={styles.headerRight}>
        {isSelecting ? (
          <TouchableOpacity onPress={handleDeleteSelected}>
            <Ionicons name="trash" size={24} color={colors.error} />
          </TouchableOpacity>
        ) : hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsSelecting(true)}>
            <Ionicons name="checkbox" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderNotificationItem = ({ item }: { item: any }) => (
    <NotificationCard
      notification={item}
      onPress={() => handleNotificationPress(item.id)}
      onLongPress={() => handleLongPress(item.id)}
      onProfilePress={handleProfilePress}
      onContentPress={handleContentPress}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No notifications yet"
      message="When you get notifications, they'll show up here."
      icon="🔔"
      action={
        activeFilter !== 'all'
          ? {
              label: 'View All Notifications',
              onPress: () => filterNotifications('all'),
            }
          : undefined
      }
    />
  );

  const renderSelectionBar = () => {
    if (!isSelecting) return null;

    return (
      <View style={[styles.selectionBar, { backgroundColor: colors.primary }]}>
        <Text style={styles.selectionText}>
          {selectedNotifications.length} selected
        </Text>
        <TouchableOpacity onPress={handleDeleteSelected}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && timeline.length === 0) {
    return <Loading message="Loading notifications..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <NotificationFilterBar
        activeFilter={activeFilter}
        onFilterChange={filterNotifications}
        unreadCounts={unreadCounts}
      />
      
      {renderSelectionBar()}
      
      <FlatList
        data={timeline}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
      />
      
      {/* Floating Action Button */}
      {!isSelecting && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('NewPost')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    width: 80,
  },
  headerButton: {
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  listContent: {
    paddingBottom: 80,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    elevation: 8,
  },
});