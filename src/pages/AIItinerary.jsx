import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';

// TODO: Replace with real data from GET /api/v1/itineraries/:id/generated
const SAMPLE_ITINERARY = [
  {
    day: 1,
    items: [
      { id: 'ev-2', name: 'Fushimi Inari Sunrise Hike', time: '5:30 AM', price: 0, reason: 'Beat the crowds, incredible photos' },
      { id: 'ev-1', name: 'Nishiki Market Food Walk', time: '10:00 AM', price: 45, reason: 'Perfect post-hike energy refuel' },
      { id: 'ev-3', name: 'Traditional Tea Ceremony', time: '2:00 PM', price: 35, reason: 'Wind down with something cultural' },
    ],
  },
  {
    day: 2,
    items: [
      { id: 'ev-6', name: 'Arashiyama Bamboo Grove', time: '8:00 AM', price: 0, reason: 'Peaceful morning, low crowds early' },
      { id: 'ev-5', name: 'Sake Tasting Experience', time: '4:00 PM', price: 55, reason: 'Chill afternoon vibes' },
      { id: 'ev-4', name: 'Gion District Night Walk', time: '7:00 PM', price: 28, reason: 'Beautiful at night, great for solo wandering' },
    ],
  },
];

const AIItinerary = () => {
  const navigate = useNavigate();
  const { destination, cart, addToCart, removeFromCart, isInCart } = useTrip();

  const toggle = (item) => isInCart(item.id) ? removeFromCart(item.id) : addToCart(item);

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div className="w-full max-w-md relative bg-white/70 border border-white/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
        {cart.length > 0 && (
          <button
            onClick={() => navigate('/cart')}
            className="absolute -top-2 right-4 z-10 bg-teal-500 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-teal-500/30"
          >
            {cart.length} booked
          </button>
        )}

        <button
          onClick={() => navigate('/ai-preferences')}
          className="text-xs text-slate-500 bg-slate-100/60 border border-slate-200 rounded-lg px-3.5 py-1.5 mb-6 hover:bg-slate-100 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Your {destination?.name?.split(',')[0] || ''} Itinerary
        </h1>
        <p className="text-slate-500 text-sm mb-6">AI-curated based on your vibe. Tap to add to bookings.</p>

        {SAMPLE_ITINERARY.map(day => (
          <div key={day.day} className="mb-6">
            <h4 className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-2.5">Day {day.day}</h4>
            {day.items.map(item => {
              const added = isInCart(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggle(item)}
                  className={`rounded-2xl p-4 mb-2 cursor-pointer border transition-all ${
                    added
                      ? 'bg-indigo-50/60 border-indigo-300/40'
                      : 'bg-white/40 border-slate-200/60 hover:bg-white/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-slate-900">{item.name}</h4>
                    <span className={`text-xs font-bold ${item.price === 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                      {item.price === 0 ? 'Free' : `$${item.price}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.time} · {item.reason}</p>
                  {added && <p className="text-xs text-indigo-600 font-semibold mt-2">✓ Added to bookings</p>}
                </div>
              );
            })}
          </div>
        ))}

        <button
          onClick={() => navigate('/explore')}
          className="w-full mt-2 py-3 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-slate-50/50 transition-colors"
        >
          Want to swap something? Browse all experiences →
        </button>
      </div>
    </ImmersivePage>
  );
};

export default AIItinerary;
