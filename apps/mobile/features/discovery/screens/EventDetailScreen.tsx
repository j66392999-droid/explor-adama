import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useDiscovery } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type EventDetailScreenProps = {
	route: RouteProp<{ params: { eventId: string } }, 'params'>;
	navigation: any;
};

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route, navigation }) => {
	const { eventId } = route.params;
	const { colors } = useTheme();
	const { eventDetail, isLoading, error, getEventDetail } = useDiscovery();

	useEffect(() => {
		if (eventId) getEventDetail(eventId);
	}, [eventId]);

	if (isLoading) return <Loading />;

	if (error || !eventDetail) {
		return <ErrorState message="Failed to load event details" onRetry={() => getEventDetail(eventId)} />;
	}

	const handleBook = () => {
		navigation.navigate('Booking', { eventId: eventDetail.id, eventTitle: eventDetail.title });
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{eventDetail.images?.[0] ? (
					<Image source={{ uri: eventDetail.images[0].url }} style={styles.image} />
				) : (
					<View style={[styles.image, styles.placeholder]}><Text>No image</Text></View>
				)}

				<View style={styles.content}>
					<Text variant="h1">{eventDetail.title}</Text>
					<Text style={styles.meta}>{new Date(eventDetail.date).toLocaleString()}</Text>
					{eventDetail.place && <Text style={styles.place}>{eventDetail.place.name}</Text>}

					{eventDetail.description && (
						<View style={styles.section}>
							<Text variant="h3">About</Text>
							<Text>{eventDetail.description}</Text>
						</View>
					)}

					<View style={styles.actions}>
						<Button title="Book Ticket" onPress={handleBook} fullWidth />
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollView: { flex: 1 },
	image: { width: '100%', height: 240 },
	placeholder: { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
	content: { padding: 20 },
	meta: { marginTop: 6, color: '#666' },
	place: { marginTop: 4, color: '#333' },
	section: { marginTop: 16 },
	actions: { marginTop: 20 },
});

export { EventDetailScreen };
export default EventDetailScreen;

