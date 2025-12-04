import React from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';

interface Props {
	markers: any[];
	onMarkerPress?: (marker: any) => void;
}

// Basic map view placeholder — displays markers in a list and invokes onMarkerPress when tapped.
// If `react-native-maps` is available in your project, swap out rendering for a real MapView.
export const MapView: React.FC<Props> = ({ markers = [], onMarkerPress }) => {
	const renderItem = ({ item }: { item: any }) => (
		<TouchableOpacity style={styles.markerRow} onPress={() => onMarkerPress?.(item)}>
			<Text style={styles.markerTitle}>{item.title}</Text>
			<Text style={styles.markerCoords}>{`${item.coordinate.latitude.toFixed(4)}, ${item.coordinate.longitude.toFixed(4)}`}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{markers.length === 0 ? (
				<Text style={styles.placeholderText}>No markers to show</Text>
			) : (
				<FlatList data={markers} renderItem={renderItem} keyExtractor={(m) => m.id} />
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 220,
		borderRadius: 12,
		backgroundColor: '#EAEAEA',
		alignItems: 'stretch',
		justifyContent: 'flex-start',
		padding: 8,
	},
	placeholderText: {
		textAlign: 'center',
		color: '#888',
	},
	markerRow: {
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
	},
	markerTitle: {
		fontWeight: '600',
	},
	markerCoords: {
		fontSize: 12,
		color: '#777',
	},
});

export default MapView;

