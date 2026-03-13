import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, CreditCard, Loader2, Lock } from 'lucide-react';
import { ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';
import { createItinerary, addItineraryItem } from '../utils/itineraryService';

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'SW-';
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

const BookingCart = () => {
  const navigate = useNavigate();
  const { destination, dates, cart, removeFromCart, cartTotal, path, resetTrip } = useTrip();
  const [step, setStep] = useState('cart');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const confirmationRef = useRef(null);
  const createdItineraryId = useRef(null);
  const [bookedItems, setBookedItems] = useState([]);
  const [bookedTotal, setBookedTotal] = useState(0);
  const [bookedDestination, setBookedDestination] = useState('');

  const goBack = () => navigate(path === 'ai' ? '/ai-itinerary' : '/explore');

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleCheckout = () => setStep('payment');

  const parseTo24h = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const handlePay = async () => {
    const itemsSnapshot = [...cart];
    const totalSnapshot = cartTotal;
    const destSnapshot = destination?.name || 'your trip';
    const ref = generateRef();

    setBookedItems(itemsSnapshot);
    setBookedTotal(totalSnapshot);
    setBookedDestination(destSnapshot);
    confirmationRef.current = ref;
    setStep('processing');

    const today = new Date().toISOString().slice(0, 10);
    const tripStart = dates?.start || today;
    const tripEnd = dates?.end || tripStart;

    try {
      const res = await createItinerary({
        title: `Trip to ${destSnapshot}`,
        destination: destSnapshot,
        startDate: tripStart,
        endDate: tripEnd,
        mood: 'balanced',
        isPublic: false,
      });
      const itinerary = res?.data?.itinerary || res?.itinerary || res;
      const itineraryId = itinerary?.id;
      createdItineraryId.current = itineraryId || null;

      if (itineraryId) {
        const categoryMap = { food: 'food', culture: 'culture', nightlife: 'nightlife', outdoors: 'activity', tours: 'activity', wellness: 'relax' };
        await Promise.all(
          itemsSnapshot.map(item =>
            addItineraryItem(itineraryId, {
              title: item.name,
              scheduledDate: tripStart,
              startTime: parseTo24h(item.time) || undefined,
              category: categoryMap[item.cat] || 'other',
            }).catch(() => {})
          )
        );
      }
    } catch {
      createdItineraryId.current = null;
    }

    resetTrip();
    setStep('confirmation');
  };

  const payDisabled = !cardName.trim() || cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 5 || cardCvc.length < 3;

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      {/* ── CART ── */}
      {step === 'cart' && (
        <div className="w-full max-w-md bg-white/70 border border-white/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
          <button
            onClick={goBack}
            className="text-xs text-slate-500 bg-slate-100/60 border border-slate-200 rounded-lg px-3.5 py-1.5 mb-6 hover:bg-slate-100 transition-colors"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Your bookings</h1>
          <p className="text-slate-500 text-sm mb-6">
            {cart.length} {cart.length === 1 ? 'experience' : 'experiences'} in {destination?.name || 'your trip'}
          </p>

          {cart.length === 0 && (
            <div className="text-center py-10 text-slate-400">Nothing here yet. Go explore!</div>
          )}

          {cart.length > 0 && (
            <>
              <div className="space-y-2">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/40 border border-slate-200/60 rounded-2xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.time}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${item.price === 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                        {item.price === 0 ? 'Free' : `$${item.price}`}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-rose-100 text-rose-500 rounded-lg px-2.5 py-1 text-xs hover:bg-rose-200 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 mt-5 pt-5 flex justify-between items-center">
                <span className="text-slate-500 text-sm">Total</span>
                <span className="text-xl font-bold text-teal-600">${cartTotal}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-5 py-4 rounded-xl font-semibold text-[15px] bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 transition-all"
              >
                Checkout →
              </button>
            </>
          )}

          <button
            onClick={goBack}
            className="w-full mt-3 py-3.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-slate-50/50 transition-colors"
          >
            ← Keep exploring
          </button>
        </div>
      )}

      {/* ── PAYMENT FORM ── */}
      {step === 'payment' && (
        <div className="w-full max-w-md bg-white/70 border border-white/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setStep('cart')}
            className="text-xs text-slate-500 bg-slate-100/60 border border-slate-200 rounded-lg px-3.5 py-1.5 mb-6 hover:bg-slate-100 transition-colors"
          >
            ← Back to cart
          </button>

          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Payment</h1>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} · ${cartTotal}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Name on card</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 outline-none focus:border-teal-500/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Card number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                inputMode="numeric"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono placeholder-slate-400 outline-none focus:border-teal-500/40 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Expiry</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  inputMode="numeric"
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono placeholder-slate-400 outline-none focus:border-teal-500/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">CVC</label>
                <input
                  type="text"
                  value={cardCvc}
                  onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono placeholder-slate-400 outline-none focus:border-teal-500/40 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={payDisabled}
            className={`w-full mt-6 py-4 rounded-xl font-semibold text-[15px] transition-all duration-300 ${
              payDisabled
                ? 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25'
            }`}
          >
            Pay ${cartTotal}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400 text-xs">
            <Lock className="w-3 h-3" />
            <span>Demo mode — no real charges</span>
          </div>
        </div>
      )}

      {/* ── PROCESSING ── */}
      {step === 'processing' && (
        <div className="w-full max-w-md bg-white/70 border border-white/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center py-16 gap-5">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">Processing your booking...</h2>
              <p className="text-slate-500 text-sm mt-1">This will just take a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRMATION ── */}
      {step === 'confirmation' && (
        <div className="w-full max-w-md bg-white/70 border border-white/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Booking confirmed!</h1>
            <p className="text-slate-500 text-sm">
              Your experiences in {bookedDestination} are all set
            </p>
            <div className="mt-3 inline-block bg-slate-100 rounded-lg px-3 py-1.5">
              <span className="text-xs text-slate-500">Reference: </span>
              <span className="text-xs font-mono font-semibold text-slate-700">{confirmationRef.current}</span>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {bookedItems.map(item => (
              <div
                key={item.id}
                className="bg-white/40 border border-slate-200/60 rounded-2xl p-4 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.time}</div>
                </div>
                <span className={`font-bold text-sm ${item.price === 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                  {item.price === 0 ? 'Free' : `$${item.price}`}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-between items-center mb-6">
            <span className="text-slate-500 text-sm">Total paid</span>
            <span className="text-xl font-bold text-teal-600">${bookedTotal}</span>
          </div>

          <button
            onClick={() => navigate(
              createdItineraryId.current
                ? `/itineraries/${createdItineraryId.current}`
                : '/itineraries'
            )}
            className="w-full py-4 rounded-xl font-semibold text-[15px] bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 transition-all"
          >
            View my itinerary
          </button>

          <Link
            to="/"
            className="block w-full mt-3 py-3.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-slate-50/50 transition-colors text-center"
          >
            Back to home
          </Link>
        </div>
      )}
    </ImmersivePage>
  );
};

export default BookingCart;
