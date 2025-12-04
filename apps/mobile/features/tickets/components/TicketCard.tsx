import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import type { Ticket } from '../types/tickets.types';

interface Props {
	ticket: Ticket;
	onPress?: (ticket: Ticket) => void;
}

const TicketCard: React.FC<Props> = ({ ticket, onPress }) => {
	return (
		<TouchableOpacity style={styles.card} onPress={() => onPress?.(ticket)}>
			<View style={styles.row}>
				<Text variant="body">Ticket #{ticket.id}</Text>
				<Text variant="caption">Status: {ticket.status}</Text>
			</View>
			<View style={styles.row}>
				<Text variant="caption">Issued: {new Date(ticket.issuedAt).toLocaleString()}</Text>
				{ticket.seat && <Text variant="caption">Seat: {ticket.seat}</Text>}
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 12, backgroundColor: '#fff' },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default TicketCard;

