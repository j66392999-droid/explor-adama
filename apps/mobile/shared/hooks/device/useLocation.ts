// shared/hooks/device/useLocation.ts
import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';
import { logger } from '../../utils/logging/logger';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;  
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

//Create a type that matches what Expo Location returns
interface ExpoLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied');
        setPermissionGranted(false);
        return false;
      }

      setPermissionGranted(true);
      
      // Get initial location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Fix: Handle null values for accuracy
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy ?? undefined, // Convert null to undefined
        altitude: currentLocation.coords.altitude ?? undefined, // Convert null to undefined
        heading: currentLocation.coords.heading ?? undefined,   // Convert null to undefined
        speed: currentLocation.coords.speed ?? undefined,       // Convert null to undefined
        timestamp: currentLocation.timestamp,
      });

      logger.info('Location permission granted and location obtained');
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to get location';
      setError(errorMsg);
      logger.error('Location permission request failed', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!permissionGranted) {
      const hasPermission = await requestPermission();
      if (!hasPermission) return null;
    }

    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy ?? undefined, // Convert null to undefined
        altitude: currentLocation.coords.altitude ?? undefined, // Convert null to undefined
        heading: currentLocation.coords.heading ?? undefined,   // Convert null to undefined
        speed: currentLocation.coords.speed ?? undefined,       // Convert null to undefined
        timestamp: currentLocation.timestamp,
      };

      setLocation(locationData);
      return locationData;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to get current location';
      setError(errorMsg);
      logger.error('Failed to get current location', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [permissionGranted, requestPermission]);

  const watchLocation = useCallback((callback: (location: LocationData) => void) => {
    if (!permissionGranted) return null;

    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 10, // minimum change in meters
        timeInterval: 5000, // minimum change in milliseconds
      },
      (newLocation) => {
        const locationData: LocationData = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          accuracy: newLocation.coords.accuracy ?? undefined, // Convert null to undefined
          altitude: newLocation.coords.altitude ?? undefined, // Convert null to undefined
          heading: newLocation.coords.heading ?? undefined,   // Convert null to undefined
          speed: newLocation.coords.speed ?? undefined,       // Convert null to undefined
          timestamp: newLocation.timestamp,
        };

        setLocation(locationData);
        callback(locationData);
      }
    );

    return subscription;
  }, [permissionGranted]);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = useCallback(
    async (latitude: number, longitude: number): Promise<string | null> => {
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (address.length > 0) {
          const addr = address[0];
          const parts = [
            addr.name,
            addr.street,
            addr.city,
            addr.region,
            addr.country,
          ].filter(Boolean);
          return parts.join(', ');
        }

        return null;
      } catch (err) {
        logger.error('Reverse geocoding failed', err);
        return null;
      }
    },
    []
  );

  // Get coordinates from address (geocoding)
  const getCoordinatesFromAddress = useCallback(
    async (address: string): Promise<LocationData | null> => {
      try {
        const coordinates = await Location.geocodeAsync(address);

        if (coordinates.length > 0) {
          return {
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
          };
        }

        return null;
      } catch (err) {
        logger.error('Geocoding failed', err);
        return null;
      }
    },
    []
  );

  // Initialize location on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    location,
    error,
    loading,
    permissionGranted,
    requestPermission,
    getCurrentLocation,
    watchLocation,
    calculateDistance,
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
  };
};