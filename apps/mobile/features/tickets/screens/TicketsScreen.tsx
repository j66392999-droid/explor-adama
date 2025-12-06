import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import TicketCard from '../components/TicketCard';
import { useTickets } from '../hooks/useTickets';
import { Loading } from '../../../components/ui/Loading';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useHideOnScroll } from '../../../shared/hooks/ui/useBottomTabs';

export const TicketsScreen: React.FC = ({ navigation }: any) => {
	const { tickets, loading } = useTickets();
	const { colors } = useTheme();
	const { onScroll, scrollEventThrottle } = useHideOnScroll();

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			{loading ? (
				<Loading />
			) : (
						<FlatList
							data={tickets}
							keyExtractor={(t) => t.id}
							renderItem={({ item }) => (
								<TicketCard ticket={item} onPress={(t) => navigation?.navigate('TicketDetail', { ticketId: t.id })} />
							)}
							onScroll={onScroll}
							scrollEventThrottle={scrollEventThrottle}
						/>
					)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export default TicketsScreen;

