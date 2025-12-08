// features/discovery/utils/navigation.ts
import { NavigationProp } from '@react-navigation/native';

export type DiscoveryNavigationProps = {
  navigateToSearch: (query?: string) => void;
  navigateToPlaceDetail: (placeId: string) => void;
  navigateToEventDetail: (eventId: string) => void;
  navigateToMap: () => void;
  navigateToCategory: (categoryId: string, categoryName: string) => void;
  goBack: () => void;
};

export const createDiscoveryNavigation = (
  navigation: NavigationProp<any>
): DiscoveryNavigationProps => ({
  navigateToSearch: (query?: string) => {
    navigation.navigate('Search', { query });
  },
  navigateToPlaceDetail: (placeId: string) => {
    navigation.navigate('PlaceDetail', { placeId });
  },
  navigateToEventDetail: (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  },
  navigateToMap: () => {
    navigation.navigate('Map');
  },
  navigateToCategory: (categoryId: string, categoryName: string) => {
    navigation.navigate('Category', { categoryId, categoryName });
  },
  goBack: () => {
    navigation.goBack();
  },
});