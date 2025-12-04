import { useCallback, useEffect, useState, useRef } from 'react';
import { listPaymentMethods, createPayment as apiCreatePayment, getPaymentStatus, refundPayment } from '../services/payments.api';
import type { Payment, PaymentMethod, PaymentStatus } from '../types/payments.types';

export const usePayments = () => {
	const [methods, setMethods] = useState<PaymentMethod[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
	const [status, setStatus] = useState<PaymentStatus | null>(null);
	const pollingRef = useRef<number | null>(null);

	const loadMethods = useCallback(async () => {
		setLoading(true);
		const m = await listPaymentMethods();
		setMethods(m);
		setLoading(false);
		return m;
	}, []);

	useEffect(() => {
		loadMethods();
		return () => {
			if (pollingRef.current) clearInterval(pollingRef.current);
		};
	}, []);

	const createPayment = useCallback(async (amount: number, methodId?: string, currency = 'USD') => {
		setLoading(true);
		try {
			const p = await apiCreatePayment(amount, currency, methodId);
			setCurrentPayment(p);
			setStatus(p.status);

			// start polling until success or failed
			if (pollingRef.current) clearInterval(pollingRef.current);
			pollingRef.current = setInterval(async () => {
				const s = await getPaymentStatus(p.id);
				setStatus(s as PaymentStatus | null);
				if (s !== 'PENDING') {
					if (pollingRef.current) clearInterval(pollingRef.current as any);
				}
			}, 800) as unknown as number;

			return p;
		} finally {
			setLoading(false);
		}
	}, []);

	const getStatus = useCallback(async (id: string) => {
		const s = await getPaymentStatus(id);
		setStatus(s as PaymentStatus | null);
		return s;
	}, []);

	const doRefund = useCallback(async (id: string) => {
		setLoading(true);
		try {
			const ok = await refundPayment(id);
			if (ok) {
				setCurrentPayment((prev) => (prev && prev.id === id ? { ...prev, status: 'CANCELLED' } : prev));
			}
			return ok;
		} finally {
			setLoading(false);
		}
	}, []);

	return { methods, loading, currentPayment, status, loadMethods, createPayment, getStatus, doRefund };
};

export default usePayments;

