import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { CustomMapView } from '../components/MapView';
import { SearchBar } from '../components/SearchBar';
import { useDiscovery } from '../hooks/useDiscovery';
import { useDiscoveryAnalytics } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import * as Location from 'expo-location';
import { logger } from '../../../shared/utils/logging/logger';
import { Button } from '../../../components/ui/Button';
import { RootStackParamList } from '../../../types/navigation';

type MapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>;
type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

export const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();
  const { colors } = useTheme();
  
  const { 
    nearbyPlaces, 
    nearbyEvents, 
    isLoading, 
    fetchNearbyItems, 
    userLocation: discoveryLocation,
    hasLocationPermission 
  } = useDiscovery();
  
  const { recordScreenView, recordMapInteraction } = useDiscoveryAnalytics();
  
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);

  useEffect(() => {
    recordScreenView('map');
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchNearbyItems();
    }
  }, [currentLocation]);

  useEffect(() => {
    // Combine places and events into map markers
    const markers = [
      ...nearbyPlaces.map(place => ({
        id: place.id,
        type: 'PLACE' as const,
        title: place.name,
        coordinate: {
          latitude: place.latitude,
          longitude: place.longitude,
        },
        data: place,
      })),
      ...nearbyEvents.map(event => ({
        id: event.id,
        type: 'EVENT' as const,
        title: event.title,
        coordinate: event.place ? {
          latitude: event.place.latitude,
          longitude: event.place.longitude,
        } : {
          latitude: 8.5460,
          longitude: 39.2694,
        },
        data: event,
      })),
    ];
    
    setMapMarkers(markers);
  }, [nearbyPlaces, nearbyEvents]);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show nearby places and events.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              if (Platform.OS === 'ios') {
                // iOS specific settings open
                // You might need to use Linking.openURL('app-settings:')
              } else {
                // Android specific settings open
                // You might need to use IntentLauncher
              }
            }},
          ]
        );
        setLocationLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Fix: Store accuracy as number | null
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      
      // Set initial map region
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      
      logger.info('Location obtained', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
    } catch (error) {
      logger.error('Failed to get location', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Using default location instead.'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const updateLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      
      recordMapInteraction('update_location');
      
    } catch (error) {
      logger.error('Failed to update location', error);
    }
  };

  const handleMarkerPress = (marker: any) => {
    setSelectedItem(marker);
    recordMapInteraction('marker_press', {
      itemId: marker.id,
      itemType: marker.type,
    });
  };

  const handleItemSelect = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'PLACE') {
      navigation.navigate('PlaceDetail', { placeId: selectedItem.id });
    } else {
      navigation.navigate('EventDetail', { eventId: selectedItem.id });
    }
  };

  const handleSearch = (query: string) => {
    navigation.navigate('Search', { query });
  };

  const handleRegionChange = (region: any) => {
    setMapRegion(region);
    recordMapInteraction('region_change', { region });
  };

  if (locationLoading) {
    return <Loading message="Getting your location..." />;
  }

  if (!currentLocation && !locationLoading) {
    return (
      <EmptyState
        title="Location Required"
        message="Please enable location services to use the map"
        icon="📍"
        action={{
          label: 'Enable Location',
          onPress: requestLocationPermission,
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text variant="body" style={styles.headerTitle}>Explore Map</Text>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={updateLocation}
        >
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search on map..."
          showAutoComplete={false}
          autoFocus={false}
        />
      </View>

      {/* Map */}
      <CustomMapView
        markers={mapMarkers}
        initialRegion={mapRegion}
        onMarkerPress={handleMarkerPress}
        onRegionChange={handleRegionChange}
        showUserLocation={true}
        userLocation={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: currentLocation.accuracy ?? undefined, // Convert null to undefined for CustomMapView
        } : undefined}
        onLocationPress={updateLocation}
        style={styles.map}
      />

      {/* Selected Item Info */}
      {selectedItem && (
        <View style={[styles.selectedInfo, { backgroundColor: colors.surface }]}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedTitle} numberOfLines={1}>
              {selectedItem.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedItem(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedType}>
            {selectedItem.type === 'PLACE' ? 'Place' : 'Event'}
          </Text>
          <Button
            title="View Details"
            onPress={handleItemSelect}
            size="small"
            style={styles.detailsButton}
          />
        </View>
      )}

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏛️</Text>
          <Text style={styles.statCount}>{nearbyPlaces.length}</Text>
          <Text style={styles.statLabel}>Places</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🎪</Text>
          <Text style={styles.statCount}>{nearbyEvents.length}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Search', {})}
        >
          <Text style={styles.statIcon}>🔍</Text>
          <Text style={styles.statCount}>All</Text>
          <Text style={styles.statLabel}>Search</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontWeight: '700',
  },
  locationButton: {
    padding: 8,
  },
  locationButtonText: {
    fontSize: 20,
  },
  searchContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  map: {
    flex: 1,
  },
  selectedInfo: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  closeButton: {
    fontSize: 20,
    opacity: 0.7,
  },
  selectedType: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  detailsButton: {
    alignSelf: 'stretch',
  },
  statsBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
});