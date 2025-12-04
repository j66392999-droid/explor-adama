export type PaymentProvider = 'stripe' | 'chapa' | 'paypal' | 'mobile_money' | 'card' | string;

export interface PaymentMethod {
	id: string;
	name: string;
	provider: PaymentProvider;
	details?: Record<string, any>;
	icon?: string;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Payment {
	id: string;
	amount: number;
	currency?: string;
	methodId?: string;
	status: PaymentStatus;
	createdAt: string;
	metadata?: Record<string, any>;
}

export interface InvoiceItem {
	id: string;
	title: string;
	price: number;
	quantity?: number;
}

export interface Invoice {
	id: string;
	items: InvoiceItem[];
	total: number;
	currency?: string;
}

export default Payment;

