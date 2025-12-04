import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { PlaceCard } from '../components/PlaceCard';
import { EventCard } from '../components/EventCard';
import { useDiscovery } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type CategoryScreenProps = {
  route: RouteProp<{ params: { categoryId: string; categoryName: string } }, 'params'>;
  navigation: any;
};

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  route,
  navigation,
}) => {
  const { categoryId, categoryName } = route.params;
  const { colors } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'places' | 'events'>('places');
  
  const {
    categoryData,
    isLoading,
    error,
    getCategoryData,
  } = useDiscovery();

  useEffect(() => {
    getCategoryData(categoryId);
  }, [categoryId]);

  const data = activeTab === 'places' 
    ? categoryData?.places || []
    : categoryData?.events || [];

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'places') {
      return (
        <PlaceCard
          place={item}
          onPress={() => navigation.navigate('PlaceDetail', { placeId: item.id })}
          style={styles.card}
        />
      );
    } else {
      return (
        <EventCard
          event={item}
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
          style={styles.card}
        />
      );
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load category data"
        onRetry={() => getCategoryData(categoryId)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1">{categoryName}</Text>
        <Text style={styles.subtitle}>
          Discover amazing {categoryName.toLowerCase()} around you
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'places' && [styles.activeTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('places')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'places' && styles.activeTabText,
            ]}
          >
            Places ({categoryData?.places?.length || 0})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'events' && [styles.activeTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('events')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'events' && styles.activeTabText,
            ]}
          >
            Events ({categoryData?.events?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
              <Image
                source={require('../../../../assets/images/illustrations/search.png')}
              style={styles.emptyIllustration}
            />
            <Text variant="h3" style={styles.emptyTitle}>
              No {activeTab} found
            </Text>
            <Text style={styles.emptyText}>
              There are no {activeTab} in this category yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default CategoryScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  activeTab: {},
  tabText: {
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});