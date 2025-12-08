import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE, Camera } from 'react-native-maps';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { MapMarker } from '../types/discovery.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { logger } from '../../../shared/utils/logging/logger';

const { width, height } = Dimensions.get('window');

// Default Adama, Ethiopia coordinates
const DEFAULT_REGION: Region = {
  latitude: 8.5460,
  longitude: 39.2694,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Adama bounding box
const ADAMA_BOUNDS = {
  northEast: { latitude: 8.5560, longitude: 39.2794 },
  southWest: { latitude: 8.5360, longitude: 39.2594 },
};

interface CustomMapViewProps {
  markers: MapMarker[];
  initialRegion?: Region;
  onMarkerPress: (marker: MapMarker) => void;
  onRegionChange?: (region: Region) => void;
  showUserLocation?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  onLocationPress?: () => void;
  style?: any;
}

export const CustomMapView: React.FC<CustomMapViewProps> = ({
  markers,
  initialRegion,
  onMarkerPress,
  onRegionChange,
  showUserLocation = true,
  userLocation = null,
  onLocationPress,
  style,
}) => {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region>(
    initialRegion || DEFAULT_REGION
  );

  // Initialize map with proper bounds
  useEffect(() => {
    if (markers.length > 0 && mapReady) {
      fitToMarkers();
    }
  }, [markers, mapReady]);

  const fitToMarkers = () => {
    if (markers.length === 0 || !mapRef.current) return;

    const coordinates = markers.map(marker => marker.coordinate);
    
    // If only one marker, center on it
    if (coordinates.length === 1) {
      mapRef.current.animateToRegion({
        ...coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
      return;
    }

    // Calculate bounds for multiple markers
    const latitudes = coordinates.map(coord => coord.latitude);
    const longitudes = coordinates.map(coord => coord.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latitudeDelta = (maxLat - minLat) * 1.1; // Add 10% padding
    const longitudeDelta = (maxLng - minLng) * 1.1;
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
    
    setCurrentRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta,
      longitudeDelta,
    });
  };

  const handleMarkerPress = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerPress(marker);
    
    // Animate to marker with zoom
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: marker.coordinate.latitude,
        longitude: marker.coordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  const handleMapPress = () => {
    setSelectedMarker(null);
  };

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
    onRegionChange?.(region);
  };

  const getMarkerIcon = (type: 'PLACE' | 'EVENT') => {
    return type === 'PLACE' ? '🏛️' : '🎪';
  };

  const getMarkerColor = (type: 'PLACE' | 'EVENT') => {
    return type === 'PLACE' ? '#4285F4' : '#EA4335';
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
      onLocationPress?.();
    } else {
      // Fallback to default region
      mapRef.current?.animateToRegion(DEFAULT_REGION, 500);
    }
  };

  const centerOnAdama = () => {
    mapRef.current?.animateToRegion(DEFAULT_REGION, 500);
  };

  const renderMarkerInfo = () => {
    if (!selectedMarker) return null;

    return (
      <View style={[styles.markerInfo, { backgroundColor: colors.surface }]}>
        <Text style={styles.markerTitle} numberOfLines={2}>
          {selectedMarker.title}
        </Text>
        <Text style={styles.markerType}>
          {selectedMarker.type === 'PLACE' ? 'Place' : 'Event'}
        </Text>
        <Button
          title="View Details"
          size="small"
          onPress={() => onMarkerPress(selectedMarker)}
          style={styles.detailsButton}
        />
      </View>
    );
  };

  const renderMapMarkers = () => {
    return markers.map((marker) => (
      <Marker
        key={`${marker.id}-${marker.type}`}
        coordinate={marker.coordinate}
        onPress={() => handleMarkerPress(marker)}
        title={marker.title}
        description={marker.type === 'PLACE' ? 'Place' : 'Event'}
        pinColor={getMarkerColor(marker.type)}
      >
        <View style={styles.markerContainer}>
          <View style={[
            styles.markerContent,
            { backgroundColor: getMarkerColor(marker.type) },
            selectedMarker?.id === marker.id && styles.selectedMarker,
          ]}>
            <Text style={styles.markerText}>
              {getMarkerIcon(marker.type)}
            </Text>
          </View>
        </View>
      </Marker>
    ));
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentRegion}
        region={currentRegion}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={showUserLocation && !!userLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background}
        customMapStyle={[
          {
            elementType: "geometry",
            stylers: [
              {
                color: "#f5f5f5",
              },
            ],
          },
          {
            elementType: "labels.icon",
            stylers: [
              {
                visibility: "off",
              },
            ],
          },
          {
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#616161",
              },
            ],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#f5f5f5",
              },
            ],
          },
          {
            featureType: "administrative.land_parcel",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#bdbdbd",
              },
            ],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [
              {
                color: "#eeeeee",
              },
            ],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#757575",
              },
            ],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [
              {
                color: "#e5e5e5",
              },
            ],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#9e9e9e",
              },
            ],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              {
                color: "#ffffff",
              },
            ],
          },
          {
            featureType: "road.arterial",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#757575",
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [
              {
                color: "#dadada",
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#616161",
              },
            ],
          },
          {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#9e9e9e",
              },
            ],
          },
          {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [
              {
                color: "#e5e5e5",
              },
            ],
          },
          {
            featureType: "transit.station",
            elementType: "geometry",
            stylers: [
              {
                color: "#eeeeee",
              },
            ],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [
              {
                color: "#c9c9c9",
              },
            ],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#9e9e9e",
              },
            ],
          },
        ]}
      >
        {renderMapMarkers()}
        
        {/* User location marker if not using built-in */}
        {showUserLocation && userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#4CAF50"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner}>
                <Text style={styles.userMarkerText}>📍</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {renderMarkerInfo()}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={centerOnUserLocation}
        >
          <Text style={styles.controlIcon}>📍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={centerOnAdama}
        >
          <Text style={styles.controlIcon}>🏙️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={fitToMarkers}
          disabled={markers.length === 0}
        >
          <Text style={[
            styles.controlIcon,
            markers.length === 0 && { opacity: 0.3 },
          ]}>
            🔍
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.surface }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#4285F4' }]} />
          <Text style={styles.legendText}>Places</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#EA4335' }]} />
          <Text style={styles.legendText}>Events</Text>
        </View>
        {userLocation && (
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>You</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerContent: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  markerText: {
    fontSize: 20,
    color: 'white',
  },
  userMarker: {
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userMarkerText: {
    fontSize: 18,
    color: 'white',
  },
  markerInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  markerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  markerType: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  detailsButton: {
    alignSelf: 'stretch',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  controlIcon: {
    fontSize: 20,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.8,
  },
});