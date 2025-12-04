import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { logger } from '../../utils/logging/logger';
import * as ExpoLocation from 'expo-location';

// Types
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface UseLocationReturn {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
  hasPermission: boolean;
  getAddressFromCoordinates: () => Promise<string | null>;
  calculateDistance: (target: GeoLocation) => number;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (err: any) {
      try { logger.error('Permission request error', err); } catch { try { console.error(`Permission request error: ${err?.message || err}`); } catch {} }
      return false;
    }
  };

  const checkPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err: any) {
      try { logger.error('Permission check error', err); } catch { try { console.error(`Permission check error: ${err?.message || err}`); } catch {} }
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<GeoLocation | null> => {
    try {
      const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Highest });

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: (pos.coords.accuracy ?? undefined) as number | undefined,
        altitude: (pos.coords.altitude ?? undefined) as number | undefined,
        altitudeAccuracy: (pos.coords.altitudeAccuracy ?? undefined) as number | undefined,
        heading: (pos.coords.heading ?? undefined) as number | undefined,
        speed: (pos.coords.speed ?? undefined) as number | undefined,
      } as GeoLocation;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to get location';
      setError(errorMessage);
      return null;
    }
  };

  const getLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check existing permissions
      const hasExistingPermission = await checkPermissions();
      
      if (!hasExistingPermission) {
        const granted = await requestPermissions();
        setHasPermission(granted);
        
        if (!granted) {
          setError('Location permission denied');
          setLoading(false);
          return;
        }
      } else {
        setHasPermission(true);
      }

      // Get current location
      const currentLocation = await getCurrentLocation();
      
      if (currentLocation) {
        setLocation(currentLocation);
        setError(null);
      } else {
        setError('Failed to get current location');
      }
      
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Get address from coordinates using Google Maps Geocoding API
  const getAddressFromCoordinates = async (coords: GeoLocation): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=AIzaSyBZ-pljCr0xAuooBBNYwF9SuDXQKSt5lbI`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return null;
    } catch (err: any) {
      try { logger.error('Geocoding error', err); } catch { try { console.error(`Geocoding error: ${err?.message || err}`); } catch {} }
      return null;
    }
  };

  // Calculate distance between two coordinates in meters
  const calculateDistance = (coord1: GeoLocation, coord2: GeoLocation): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    error,
    loading,
    hasPermission,
    refresh: getLocation,
    // Additional utilities
    getAddressFromCoordinates: location ? () => getAddressFromCoordinates(location) : async () => null,
    calculateDistance: (target: GeoLocation) => (location ? calculateDistance(location, target) : 0),
  };
};

export default useLocation;