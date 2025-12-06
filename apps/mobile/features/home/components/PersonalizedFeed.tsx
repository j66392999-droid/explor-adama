import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { RecommendationCard } from './RecommendationCard';
import { Recommendation } from '../types/home.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

export type FeedAction = Recommendation | { itemType: 'EXPLORE' | 'OTHER'; item?: Recommendation['item'] };

interface PersonalizedFeedProps {
  recommendations: Recommendation[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onRetry?: () => void;
  onItemPress: (item: FeedAction) => void;
  style?: any;
}

export const PersonalizedFeed: React.FC<PersonalizedFeedProps> = ({
  recommendations,
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
  onRetry,
  onItemPress,
  style,
}) => {
  const { colors } = useTheme();

  if (isLoading && recommendations.length === 0) return <Loading message="Loading recommendations..." />;

  if (error && recommendations.length === 0)
    return <ErrorState message={error} onRetry={onRetry} style={style} />;

  if (recommendations.length === 0)
    return (
      <EmptyState
        title="No recommendations yet"
        message="Explore more places and events to get personalized recommendations"
        icon="🎯"
        action={{ label: 'Explore Now', onPress: () => onItemPress({ itemType: 'EXPLORE' }) }}
      />
    );

  return (
    <View style={[{ padding: 8 }, style]}>
      {recommendations.map((item) => (
        <RecommendationCard
          key={item.id}
          recommendation={item}
          onPress={() => onItemPress(item as FeedAction)}
        />
      ))}
    </View>
  );
};

export default PersonalizedFeed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

