import type { Ticket, TicketStatus, TicketSummary } from '../types/tickets.types';

// In-memory ticket store for prototyping
let ticketsStore: Record<string, Ticket> = {};

const randomId = () => String(Date.now() + Math.floor(Math.random() * 10000));

export const listTickets = async (userId?: string): Promise<Ticket[]> => {
  const items = Object.values(ticketsStore)
    .filter((t) => (userId ? t.userId === userId : true))
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  return new Promise((resolve) => setTimeout(() => resolve(items), 100));
};

export const createTicket = async (eventId: string, userId: string, quantity = 1): Promise<Ticket[]> => {
  const createdAt = new Date().toISOString();
  const tickets: Ticket[] = [];
  for (let i = 0; i < quantity; i++) {
    const id = randomId();
    const t: Ticket = {
      id,
      eventId,
      userId,
      qrToken: `QR:${id}`,
      status: 'CONFIRMED',
      issuedAt: createdAt,
    };
    ticketsStore[id] = t;
    tickets.push(t);
  }
  return new Promise((resolve) => setTimeout(() => resolve(tickets), 150));
};

export const getTicket = async (id: string): Promise<Ticket | null> => {
  const t = ticketsStore[id] || null;
  return new Promise((resolve) => setTimeout(() => resolve(t), 80));
};

export const useTicketQrToken = (id: string): string | null => {
  return ticketsStore[id]?.qrToken ?? null;
};

export const markTicketUsed = async (id: string): Promise<boolean> => {
  const t = ticketsStore[id];
  if (!t) return false;
  t.status = 'USED';
  return new Promise((resolve) => setTimeout(() => resolve(true), 80));
};

export default { listTickets, createTicket, getTicket, markTicketUsed };
