export type TicketStatus = 'PENDING' | 'CONFIRMED' | 'USED' | 'CANCELLED' | 'EXPIRED';

export interface Ticket {
	id: string;
	eventId: string;
	placeId: string;
	userId: string;
	qrToken: string;
	seat?: string | null;
	status: TicketStatus;
	issuedAt: string;
	expiresAt?: string | null;
}

export interface TicketSummary {
	id: string;
	title: string;
	date: string;
	tickets: Ticket[];
}

export default Ticket;

