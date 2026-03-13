import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍜' },
  { id: 'culture', label: 'Culture & History', icon: '⛩️' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { id: 'outdoors', label: 'Outdoors', icon: '🌿' },
  { id: 'tours', label: 'Tours & Walks', icon: '🗺️' },
  { id: 'wellness', label: 'Wellness', icon: '🧘' },
];

// TODO: Replace with real API call → GET /api/v1/experiences?destination=...&category=...
const SAMPLE_EVENTS = [
  { id: 'ev-1', name: 'Nishiki Market Food Walk', price: 45, time: '10:00 AM', rating: 4.8, reviews: 312, cat: 'food' },
  { id: 'ev-2', name: 'Fushimi Inari Sunrise Hike', price: 0, time: '5:30 AM', rating: 4.9, reviews: 891, cat: 'outdoors' },
  { id: 'ev-3', name: 'Traditional Tea Ceremony', price: 35, time: '2:00 PM', rating: 4.7, reviews: 156, cat: 'culture' },
  { id: 'ev-4', name: 'Gion District Night Walk', price: 28, time: '7:00 PM', rating: 4.6, reviews: 203, cat: 'tours' },
  { id: 'ev-5', name: 'Sake Tasting Experience', price: 55, time: '4:00 PM', rating: 4.8, reviews: 178, cat: 'food' },
  { id: 'ev-6', name: 'Arashiyama Bamboo Grove', price: 0, time: '8:00 AM', rating: 4.5, reviews: 1024, cat: 'outdoors' },
];

const Explore = () => {
  const navigate = useNavigate();
  const { destination, dates, cart, addToCart, removeFromCart, isInCart } = useTrip();
  const [selectedCat, setSelectedCat] = useState(null);

  const events = selectedCat ? SAMPLE_EVENTS.filter(e => e.cat === selectedCat) : SAMPLE_EVENTS;

  const dateDisplay = dates.start && dates.end
    ? `${new Date(dates.start + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(dates.end + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : '';

  const toggle = (event) => isInCart(event.id) ? removeFromCart(event.id) : addToCart(event);

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div className="w-full max-w-md relative bg-white/70 border border-white/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
        {cart.length > 0 && (
          <button
            onClick={() => navigate('/cart')}
            className="absolute -top-3 right-4 z-10 bg-teal-500 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/30"
          >
            {cart.length} booked
          </button>
        )}

        <button
          onClick={() => navigate('/start', { state: { step: 'choose-path' } })}
          className="text-xs text-slate-500 bg-slate-100/60 border border-slate-200 rounded-lg px-3.5 py-1.5 mb-6 hover:bg-slate-100 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Explore {destination?.name?.split(',')[0] || 'experiences'}
        </h1>
        <p className="text-slate-500 text-sm mb-5">
          {dateDisplay} · Browse and book what catches your eye.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setSelectedCat(null)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-medium border transition-all ${
              !selectedCat
                ? 'bg-teal-500/15 border-teal-500/30 text-teal-600'
                : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium border transition-all ${
                selectedCat === cat.id
                  ? 'bg-teal-500/15 border-teal-500/30 text-teal-600'
                  : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {events.map(event => {
            const added = isInCart(event.id);
            return (
              <div
                key={event.id}
                className={`rounded-2xl p-4 border transition-all ${
                  added
                    ? 'bg-teal-50/60 border-teal-300/40'
                    : 'bg-white/40 border-slate-200/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-slate-900">{event.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {event.time} · ⭐ {event.rating} ({event.reviews})
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <span className={`text-sm font-bold ${event.price === 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </span>
                    <button
                      onClick={() => toggle(event)}
                      className={`block mt-1.5 px-3.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        added
                          ? 'bg-rose-100 text-rose-500 hover:bg-rose-200'
                          : 'bg-teal-500 text-white hover:bg-teal-400'
                      }`}
                    >
                      {added ? 'Remove' : 'Book'}
                    </button>
                  </div>
                </div>
                {added && <p className="text-xs text-teal-600 font-semibold mt-2">✓ Added to bookings</p>}
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">No experiences found in this category yet.</div>
        )}

        {cart.length > 0 && (
          <button
            onClick={() => navigate('/cart')}
            className="w-full mt-6 py-4 rounded-xl font-semibold text-[15px] bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 transition-all"
          >
            View {cart.length} {cart.length === 1 ? 'booking' : 'bookings'} →
          </button>
        )}
      </div>
    </ImmersivePage>
  );
};

export default Explore;
