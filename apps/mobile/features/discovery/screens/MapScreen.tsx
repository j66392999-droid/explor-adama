import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapViewComponent from '../components/MapView';
import { useDiscovery } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

export const MapScreen: React.FC = ({ navigation }: any) => {
	const { colors } = useTheme();
	const { places, events, isLoading, userLocation } = useDiscovery();

	const markers = [
		...places.map((p: any) => ({
			id: p.id,
			coordinate: { latitude: p.latitude, longitude: p.longitude },
			title: p.name,
			type: 'place' as const,
			data: p,
		})),
		...events
			.filter((e: any) => e.place && e.place.latitude && e.place.longitude)
			.map((e: any) => ({
				id: e.id,
				coordinate: { latitude: e.place.latitude, longitude: e.place.longitude },
				title: e.title,
				type: 'event' as const,
				data: e,
			})),
	];

	const handleMarkerPress = (marker: any) => {
		if (marker.type === 'place') navigation?.navigate('PlaceDetail', { placeId: marker.id });
		else navigation?.navigate('EventDetail', { eventId: marker.id });
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={styles.mapContainer}>
				<MapViewComponent markers={markers} onMarkerPress={handleMarkerPress} />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	mapContainer: { padding: 16 },
});

export { MapScreen };
export default MapScreen;

