import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';
import { getLiveDestinations } from '../utils/liveDestinations';

const ONBOARDING_DESTINATIONS = getLiveDestinations();

const FirstChoice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { destination, setDestination, dates, setDates, setPath } = useTrip();
  const [step, setStep] = useState(location.state?.step || (destination ? 'choose-path' : 'destination'));
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ONBOARDING_DESTINATIONS
    .filter(d => `${d.name}, ${d.country}`.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, searchQuery.trim() ? 8 : 6);

  const canContinue = !!destination;

  // Same destination shape DestinationDetail stores in TripContext.
  const openDestination = d => {
    setDestination({ id: d.id, name: `${d.name}, ${d.country}`, vibe: d.vibe });
    navigate(`/destinations/${d.id}`);
  };

  const dateDisplay = dates.start && dates.end
    ? `${new Date(dates.start + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(dates.end + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : '';

  const [aiToast, setAiToast] = useState(false);

  const handleAI = () => {
    setAiToast(true);
    setTimeout(() => setAiToast(false), 2500);
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
          <p className="text-slate-500 text-sm mb-7">Pick a city to see live experiences and events happening there.</p>

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
                  onClick={() => openDestination(d)}
                  className="w-full flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left transition-all duration-150 border-2 bg-white/40 border-transparent hover:bg-white/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <img
                    src={d.image?.replace('w=1200', 'w=160')}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    style={{ objectPosition: d.imagePosition }}
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] text-slate-900">{d.name}, {d.country}</div>
                    <div className="text-xs text-slate-500 truncate">{d.vibe} · {d.highlights?.[0]}</div>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
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

          {canContinue && (
            <button
              onClick={() => setStep('choose-path')}
              className="w-full py-4 rounded-xl font-semibold text-[15px] transition-all duration-300 bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 mb-2"
            >
              Continue with {destination.name} →
            </button>
          )}

          <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-200/60">
            <Link
              to={user?.isAdmin ? '/admin' : '/'}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              {user?.isAdmin ? 'Skip for now — open admin portal' : 'Skip for now'}
            </Link>
            {!user?.isAdmin && (
              <Link
                to="/admin"
                className="text-xs text-teal-600/80 hover:text-teal-700 transition-colors"
              >
                Admin portal →
              </Link>
            )}
          </div>
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
            {destination?.name}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {dateDisplay ? `${dateDisplay} · ` : ''}How do you want to plan?
          </p>

          {aiToast && (
            <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-700 font-medium animate-pulse">
              AI itineraries are coming soon — explore manually for now!
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            {/* AI Path — Coming Soon */}
            <div
              onClick={handleAI}
              className="flex-1 relative overflow-hidden rounded-2xl p-7 cursor-pointer transition-all duration-200 border border-slate-200/60 bg-slate-50/40 opacity-75"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-slate-300/20 blur-xl" />
              <div className="absolute top-3 right-3 bg-indigo-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                Coming Soon
              </div>
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Plan it for me</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tell us your vibe and we'll build your perfect itinerary with AI-powered recommendations.
              </p>
              <span className="inline-block mt-3.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide bg-indigo-100 text-indigo-400">
                SMART ITINERARY
              </span>
            </div>

            {/* Manual Path */}
            <div
              onClick={handleManual}
              className="flex-1 relative overflow-hidden rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2 border-teal-300/40 bg-teal-50/40 shadow-lg shadow-teal-500/5"
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
