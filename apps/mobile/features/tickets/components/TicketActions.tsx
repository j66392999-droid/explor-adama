import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import type { Ticket } from '../types/tickets.types';

interface Props {
	ticket: Ticket;
	onMarkUsed?: (id: string) => Promise<boolean> | void;
}

const TicketActions: React.FC<Props> = ({ ticket, onMarkUsed }) => {
	return (
		<View style={styles.container}>
			{ticket.status !== 'USED' && (
				<Button title="Mark used" onPress={() => onMarkUsed?.(ticket.id)} />
			)}
		</View>
	);
};

const styles = StyleSheet.create({ container: { marginTop: 12 } });

export default TicketActions;

