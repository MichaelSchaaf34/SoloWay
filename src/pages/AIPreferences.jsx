import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImmersivePage } from '../components';
import { useTrip } from '../context/TripContext';

const VIBES = [
  { id: 'chill', label: 'Chill', icon: '☁️' },
  { id: 'adventure', label: 'Adventure', icon: '⚡' },
  { id: 'social', label: 'Social', icon: '👥' },
  { id: 'cultural', label: 'Cultural', icon: '📖' },
];

const AIPreferences = () => {
  const navigate = useNavigate();
  const { preferences, togglePreference } = useTrip();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // TODO: POST /api/v1/itineraries/generate with destination, dates, preferences
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    navigate('/ai-itinerary');
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div className="w-full max-w-md relative bg-white/70 border border-white/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 rounded-3xl backdrop-blur-sm">
            <div className="w-12 h-12 border-[3px] border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-indigo-600 mt-5 text-sm font-medium">Crafting your itinerary...</p>
          </div>
        )}

        <button
          onClick={() => navigate('/start', { state: { step: 'choose-path' } })}
          className="text-xs text-slate-500 bg-slate-100/60 border border-slate-200 rounded-lg px-3.5 py-1.5 mb-6 hover:bg-slate-100 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">What's your vibe?</h1>
        <p className="text-slate-500 text-sm mb-7">Pick one or more. We'll tailor everything to match.</p>

        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {VIBES.map(v => (
            <button
              key={v.id}
              onClick={() => togglePreference(v.id)}
              className={`rounded-2xl p-5 text-center transition-all duration-200 border ${
                preferences.includes(v.id)
                  ? 'bg-indigo-50/60 border-indigo-400/40'
                  : 'bg-white/40 border-slate-200/60 hover:bg-white/60'
              }`}
            >
              <div className="text-2xl mb-2">{v.icon}</div>
              <div className="font-semibold text-sm text-slate-900">{v.label}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={preferences.length === 0}
          className={`w-full py-4 rounded-xl font-semibold text-[15px] transition-all duration-300 ${
            preferences.length > 0
              ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
          }`}
        >
          Build my itinerary ✨
        </button>
      </div>
    </ImmersivePage>
  );
};

export default AIPreferences;
