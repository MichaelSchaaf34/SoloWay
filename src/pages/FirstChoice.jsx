import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';

const SAMPLE_DESTINATIONS = [
  { id: 'kyoto', name: 'Kyoto, Japan', emoji: '🏯', vibe: 'Temples & Tea' },
  { id: 'lisbon', name: 'Lisbon, Portugal', emoji: '🌊', vibe: 'Sun & Soul' },
  { id: 'medellin', name: 'Medellín, Colombia', emoji: '🌺', vibe: 'Mountains & Music' },
  { id: 'florence', name: 'Florence, Italy', emoji: '🎨', vibe: 'Art & Aperitivo' },
  { id: 'bangkok', name: 'Bangkok, Thailand', emoji: '🛕', vibe: 'Street Food & Temples' },
  { id: 'cape-town', name: 'Cape Town, South Africa', emoji: '🦁', vibe: 'Nature & Culture' },
  { id: 'barcelona', name: 'Barcelona, Spain', emoji: '🌇', vibe: 'Beach & Architecture' },
  { id: 'reykjavik', name: 'Reykjavík, Iceland', emoji: '🌋', vibe: 'Fire & Ice' },
  { id: 'bali', name: 'Bali, Indonesia', emoji: '🌴', vibe: 'Surf & Serenity' },
  { id: 'marrakech', name: 'Marrakech, Morocco', emoji: '🕌', vibe: 'Souks & Spice' },
  { id: 'new-york', name: 'New York, USA', emoji: '🗽', vibe: 'City That Never Sleeps' },
  { id: 'paris', name: 'Paris, France', emoji: '🥐', vibe: 'Cafés & Culture' },
  { id: 'buenos-aires', name: 'Buenos Aires, Argentina', emoji: '💃', vibe: 'Tango & Steak' },
  { id: 'seoul', name: 'Seoul, South Korea', emoji: '🎶', vibe: 'K-Culture & Street Food' },
  { id: 'prague', name: 'Prague, Czech Republic', emoji: '🏰', vibe: 'Castles & Beer' },
];

const FirstChoice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { destination, setDestination, dates, setDates, setPath } = useTrip();
  const [step, setStep] = useState(location.state?.step || (destination ? 'choose-path' : 'destination'));
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SAMPLE_DESTINATIONS
    .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const canContinue = !!destination;

  const dateDisplay = dates.start && dates.end
    ? `${new Date(dates.start + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(dates.end + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : '';

  const handleAI = () => {
    setPath('ai');
    navigate('/ai-preferences');
  };

  const handleManual = () => {
    setPath('manual');
    navigate('/explore');
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      {/* STEP 1: Destination & Dates */}
      {step === 'destination' && (
        <div className="w-full max-w-md bg-white/70 border border-white/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-xs tracking-[3px] text-slate-400 font-medium uppercase mb-3">SoloWay</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Where to next{user?.displayName ? `, ${user.displayName}` : ''}?
          </h1>
          <p className="text-slate-500 text-sm mb-7">Pick a destination and we'll handle the rest.</p>

          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 mb-4 outline-none focus:border-teal-500/40 transition-colors"
          />

          <div className="space-y-2.5 mb-6 min-h-[220px]">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
                No destinations match "{searchQuery}" — try something else
              </div>
            ) : (
              filtered.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setDestination(d); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3.5 rounded-2xl px-4 py-4 text-left transition-all duration-200 border ${
                    destination?.id === d.id
                      ? 'bg-teal-50/60 border-teal-400/40'
                      : 'bg-white/40 border-slate-200/60 hover:bg-white/60'
                  }`}
                >
                  <span className="text-3xl">{d.emoji}</span>
                  <div>
                    <div className="font-semibold text-[15px] text-slate-900">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.vibe}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white/40 border border-slate-200/60 rounded-xl px-4 py-3">
              <label className="text-xs text-slate-400 block mb-1">From</label>
              <input
                type="date"
                value={dates.start}
                onChange={e => setDates(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent text-slate-900 text-sm outline-none w-full"
              />
            </div>
            <div className="bg-white/40 border border-slate-200/60 rounded-xl px-4 py-3">
              <label className="text-xs text-slate-400 block mb-1">To</label>
              <input
                type="date"
                value={dates.end}
                min={dates.start || undefined}
                onChange={e => setDates(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent text-slate-900 text-sm outline-none w-full"
              />
            </div>
          </div>

          <button
            onClick={() => canContinue && setStep('choose-path')}
            disabled={!canContinue}
            className={`w-full py-4 rounded-xl font-semibold text-[15px] transition-all duration-300 ${
              canContinue
                ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25'
                : 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2: Choose Your Path */}
      {step === 'choose-path' && (
        <div className="w-full max-w-2xl bg-white/70 border border-white/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setStep('destination')}
            className="text-xs text-slate-500 bg-slate-100/60 border border-slate-200 rounded-lg px-3.5 py-1.5 mb-6 hover:bg-slate-100 transition-colors"
          >
            ← Back
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            {destination?.emoji} {destination?.name}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {dateDisplay ? `${dateDisplay} · ` : ''}How do you want to plan?
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            {/* AI Path */}
            <div
              onClick={handleAI}
              className="flex-1 relative overflow-hidden rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-indigo-300/40 bg-indigo-50/40"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-indigo-300/20 blur-xl" />
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Plan it for me</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tell us your vibe and we'll build your perfect itinerary with AI-powered recommendations.
              </p>
              <span className="inline-block mt-3.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide bg-indigo-100 text-indigo-600">
                SMART ITINERARY
              </span>
            </div>

            {/* Manual Path */}
            <div
              onClick={handleManual}
              className="flex-1 relative overflow-hidden rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-teal-300/40 bg-teal-50/40"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-teal-300/20 blur-xl" />
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">I'll explore</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Browse events, restaurants, tours, and experiences. Build your own trip your way.
              </p>
              <span className="inline-block mt-3.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide bg-teal-100 text-teal-600">
                FULL CONTROL
              </span>
            </div>
          </div>
        </div>
      )}
    </ImmersivePage>
  );
};

export default FirstChoice;
