import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, Button, ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';
import { getOrder } from '../utils/paymentService';

const FINAL_STATUSES = new Set(['fulfilled', 'payment_failed', 'cancelled', 'refunded']);

const BookingReturn = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { resetTrip } = useTrip();
  const resetDone = useRef(false);
  const [state, setState] = useState({ loading: true, order: null, error: '' });

  useEffect(() => {
    let active = true;
    let timer;
    let attempts = 0;

    async function load() {
      if (!orderId) {
        setState({ loading: false, order: null, error: 'The booking reference is missing.' });
        return;
      }
      try {
        const response = await getOrder(orderId);
        if (!active) return;
        const order = response?.data?.order || response?.order;
        setState({ loading: false, order, error: '' });
        if (order.status === 'fulfilled' && !resetDone.current) {
          resetDone.current = true;
          resetTrip();
        }
        attempts += 1;
        if (!FINAL_STATUSES.has(order.status) && attempts < 12) {
          timer = window.setTimeout(load, 2500);
        }
      } catch (error) {
        if (active) setState({ loading: false, order: null, error: error.message || 'Could not load booking' });
      }
    }

    load();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [orderId, resetTrip]);

  const order = state.order;
  const formatter = order ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: order.currency?.toUpperCase() || 'USD',
  }) : null;
  const isComplete = order?.status === 'fulfilled';
  const isFailed = ['payment_failed', 'cancelled'].includes(order?.status);

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/80 p-7 shadow-2xl backdrop-blur-xl">
        {state.loading && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Confirming your booking</h1>
              <p className="mt-1 text-sm text-slate-500">Waiting for Stripe’s secure confirmation…</p>
            </div>
          </div>
        )}
        {state.error && <Alert tone="error">{state.error}</Alert>}
        {order && !isComplete && !isFailed && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600" />
            <h1 className="mt-4 text-xl font-semibold text-slate-900">Payment is processing</h1>
            <p className="mt-2 text-sm text-slate-500">Reference {order.reference}. This page updates automatically.</p>
          </div>
        )}
        {isFailed && (
          <div className="space-y-5">
            <Alert tone="error">The payment was not completed. You have not been charged for a confirmed booking.</Alert>
            <Button as={Link} to="/cart" variant="secondary" fullWidth>Return to cart</Button>
          </div>
        )}
        {isComplete && (
          <>
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-teal-600" />
              <h1 className="mt-3 text-2xl font-bold text-slate-900">Booking confirmed</h1>
              <p className="mt-1 text-sm text-slate-500">Reference {order.reference}</p>
            </div>
            <div className="mt-6 space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between rounded-xl border border-slate-200 bg-white/70 p-3 text-sm">
                  <span className="font-medium text-slate-800">{item.title}</span>
                  <span className="text-slate-600">{formatter.format(item.lineTotalCents / 100)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
              <span className="text-slate-500">Total paid</span>
              <span className="font-bold text-teal-700">{formatter.format(order.totalCents / 100)}</span>
            </div>
            <Button as={Link} to={`/itineraries/${order.itineraryId}`} variant="accent" size="lg" fullWidth className="mt-6">
              View itinerary
            </Button>
          </>
        )}
      </section>
    </ImmersivePage>
  );
};

export default BookingReturn;
