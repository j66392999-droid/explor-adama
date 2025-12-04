import { useCallback, useEffect, useState } from 'react';
import { listTickets, createTicket as apiCreateTicket, getTicket, markTicketUsed } from '../services/tickets.api';
import type { Ticket } from '../types/tickets.types';

export const useTickets = (userId?: string) => {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		const t = await listTickets(userId);
		setTickets(t);
		setLoading(false);
		return t;
	}, [userId]);

	useEffect(() => {
		load();
	}, [load]);

	const createTicket = useCallback(async (eventId: string, userId: string, quantity = 1) => {
		setLoading(true);
		const created = await apiCreateTicket(eventId, userId, quantity);
		setTickets((prev) => [...created, ...prev]);
		setLoading(false);
		return created;
	}, []);

	const get = useCallback(async (id: string) => {
		return await getTicket(id);
	}, []);

	const markUsed = useCallback(async (id: string) => {
		const ok = await markTicketUsed(id);
		if (ok) setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'USED' } : t)));
		return ok;
	}, []);

	return { tickets, loading, load, createTicket, get, markUsed };
};

export default useTickets;

