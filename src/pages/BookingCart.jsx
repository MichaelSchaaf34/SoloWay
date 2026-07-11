import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { Alert, Button, ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';
import { createCheckout } from '../utils/paymentService';

function makeIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

const BookingCart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    destination,
    dates,
    cart,
    removeFromCart,
    cartTotalCents,
    path,
  } = useTrip();
  const idempotencyKey = useRef(makeIdempotencyKey());
  const [status, setStatus] = useState({ loading: false, error: '' });

  const goBack = () => navigate(path === 'ai' ? '/ai-itinerary' : '/explore');
  const currency = cart[0]?.currency?.toUpperCase() || 'USD';
  const formatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }), [currency]);

  const handleCheckout = async () => {
    if (!cart.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const tripStartDate = dates?.start || today;
    const tripEndDate = dates?.end || tripStartDate;
    setStatus({ loading: true, error: '' });

    try {
      const response = await createCheckout({
        idempotencyKey: idempotencyKey.current,
        destination: destination?.name || 'SoloWay trip',
        tripStartDate,
        tripEndDate,
        items: cart.map(item => ({
          experienceId: item.id,
          scheduledDate: tripStartDate,
        })),
      });
      const data = response?.data || response;
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      navigate(`/booking/return?order_id=${data.order.id}`, { replace: true });
    } catch (error) {
      idempotencyKey.current = makeIdempotencyKey();
      setStatus({ loading: false, error: error.message || 'Could not start secure checkout' });
    }
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/70 p-7 shadow-2xl backdrop-blur-xl">
        <button
          onClick={goBack}
          className="mb-6 rounded-lg border border-slate-200 bg-slate-100/60 px-3.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-100"
        >
          ← Back
        </button>

        <div className="mb-1 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Your bookings</h1>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          {cart.length} {cart.length === 1 ? 'experience' : 'experiences'} with one provider
        </p>

        {searchParams.get('checkout') === 'cancelled' && (
          <Alert tone="info" className="mb-4">Checkout was cancelled. Your cart is still here.</Alert>
        )}
        {status.error && <Alert tone="error" className="mb-4">{status.error}</Alert>}

        {cart.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            Nothing here yet. <Link to="/explore" className="text-teal-700">Explore experiences</Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/40 p-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {item.scheduledTime?.slice(0, 5) || 'Flexible time'} · {item.providerName}
                    </div>
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <span className="font-bold text-amber-600">{formatter.format(item.priceCents / 100)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-200"
                      aria-label={`Remove ${item.title}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-xl font-bold text-teal-600">{formatter.format(cartTotalCents / 100)}</span>
            </div>

            <Button
              type="button"
              variant="accent"
              size="lg"
              fullWidth
              className="mt-5"
              loading={status.loading}
              onClick={handleCheckout}
            >
              Continue to secure payment
            </Button>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Lock className="h-3 w-3" />
              <span>Payment details are collected and secured by Stripe</span>
            </div>
          </>
        )}
      </div>
    </ImmersivePage>
  );
};

export default BookingCart;
