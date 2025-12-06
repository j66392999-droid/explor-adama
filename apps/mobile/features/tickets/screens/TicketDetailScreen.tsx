import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import QRCodeDisplay from '../components/QRCodeDisplay';
import TicketActions from '../components/TicketActions';
import useTickets from '../hooks/useTickets';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useHideOnScroll } from '../../../shared/hooks/ui/useBottomTabs';

export const TicketDetailScreen: React.FC = ({ route, navigation }: any) => {
	const { ticketId } = route.params || {};
	const { colors } = useTheme();
	const { get, loading, markUsed } = useTickets();
	const [ticket, setTicket] = React.useState<any | null>(null);
	const { onScroll, scrollEventThrottle } = useHideOnScroll();

	useEffect(() => {
		if (ticketId) {
			(async () => {
				const t = await get(ticketId);
				setTicket(t);
			})();
		}
	}, [ticketId]);

	if (loading && !ticket) return <Loading />;

	if (!ticket) return <ErrorState message="Ticket not found" />;

	return (
		    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			    <ScrollView style={styles.scrollView} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>
				<Text variant="h1">Ticket #{ticket.id}</Text>
				<Text>Event: {ticket.eventId}</Text>
				<Text>Status: {ticket.status}</Text>
				<QRCodeDisplay token={ticket.qrToken} />
				<TicketActions ticket={ticket} onMarkUsed={markUsed} />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({ container: { flex: 1 }, scrollView: { padding: 16 } });

export default TicketDetailScreen;

