import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Shield, Users } from 'lucide-react';
import ItineraryItem from './ItineraryItem';
import useHeroDiscovery, { formatDiscoveryPrice } from '../hooks/useHeroDiscovery';

function TimelineSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="relative pl-7 pb-6 last:pb-0 border-l-2 border-slate-200 dark:border-slate-700">
          <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-2" />
          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      ))}
    </>
  );
}

const HeroDiscoveryCard = ({ rotationDate }) => {
  const { destination, experiences, mood, setMood, loading, isLive } = useHeroDiscovery(rotationDate);

  if (!destination) return null;

  const destinationPath = `/destinations/${destination.id}`;
  const destinationLabel = `${destination.name}, ${destination.country}`;

  return (
    <div className="flex-1 w-full max-w-md lg:max-w-xl relative">
      <div className="absolute -top-12 -right-12 w-72 h-72 bg-teal-200/50 dark:bg-teal-900/30 rounded-full filter blur-3xl opacity-70 dark:opacity-40 animate-blob pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-full filter blur-3xl opacity-70 dark:opacity-40 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="relative bg-white/75 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[28px] border border-white/70 dark:border-slate-700/60 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] overflow-hidden">
        <div className="flex items-center gap-1.5 px-5 pt-4 pb-3 border-b border-slate-200/60 dark:border-slate-700/50">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
            soloway.app / explore / {destination.id}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400 mb-1">
                Discover today
              </div>
              <Link
                to={destinationPath}
                className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {destinationLabel}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {destination.vibe} vibe · {isLive ? 'Live experiences' : 'Curated picks'}
              </p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80">
              <button
                type="button"
                className={`p-2 rounded-lg transition-all ${mood === 'chill' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}
                onClick={() => setMood('chill')}
                aria-label="Chill mood"
                aria-pressed={mood === 'chill'}
              >
                <Coffee className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`p-2 rounded-lg transition-all ${mood === 'adventure' ? 'bg-white dark:bg-slate-700 shadow-sm text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
                onClick={() => setMood('adventure')}
                aria-label="Adventure mood"
                aria-pressed={mood === 'adventure'}
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-white/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                Today · {mood === 'chill' ? 'Slow & Steady' : 'Full Exploration'}
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-100 dark:border-emerald-800/60">
                <Shield className="w-3 h-3" /> Safe area
              </span>
            </div>

            {loading ? (
              <TimelineSkeleton />
            ) : (
              experiences.map(experience => (
                <ItineraryItem
                  key={experience.id}
                  time={experience.time}
                  title={experience.title}
                  type={experience.type}
                  mood={mood}
                  to={destinationPath}
                  price={formatDiscoveryPrice(experience.priceCents, experience.currency)}
                />
              ))
            )}

            <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-900/20 dark:to-sky-900/20 border border-indigo-100/80 dark:border-indigo-800/40">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-indigo-600/80 dark:text-indigo-300/80">
                    SoloWay Radar
                  </p>
                  <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate">
                    {destination.nearby} solo travelers exploring
                  </p>
                </div>
                <Link
                  to={destinationPath}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Explore {destination.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDiscoveryCard;
