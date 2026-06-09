import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Shield, Users, ArrowRight, Play } from 'lucide-react';
import ItineraryItem from './ItineraryItem';
import useAuth from '../hooks/useAuth';

const Hero = () => {
  const [tripMood, setTripMood] = useState('chill');
  const { isAuthenticated } = useAuth();

  return (
    <header className="relative z-10 pt-32 pb-24 lg:pt-44 lg:pb-36">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur mb-7 fade-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-teal-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-[0.14em] uppercase">Web Beta Open</span>
            </div>

            <h1 className="text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold text-slate-900 dark:text-white mb-6 leading-[1.02]">
              Travel Solo,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 dark:from-teal-400 dark:via-sky-400 dark:to-indigo-400">
                Not Alone.
              </span>
            </h1>

            <p className="text-pretty text-[17px] lg:text-lg text-slate-600 dark:text-slate-300 mb-9 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The intelligent companion for the modern solo explorer. Curated itineraries,
              real-time safety checks, and a community that keeps its distance until you say otherwise.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to={isAuthenticated ? '/start' : '/auth'}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-[15px] hover:bg-slate-800 transition-all shadow-[0_8px_24px_-6px_rgba(15,23,42,0.4)] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Start your journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-semibold text-[15px] border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 transition-all backdrop-blur">
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch demo
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-2 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Free forever plan
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> No ads
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Privacy first
              </span>
            </div>
          </div>

          {/* Right Visual: The "App" Interface preview */}
          <div className="flex-1 w-full max-w-md lg:max-w-xl relative">
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-teal-200/50 dark:bg-teal-900/30 rounded-full filter blur-3xl opacity-70 dark:opacity-40 animate-blob pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-full filter blur-3xl opacity-70 dark:opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>

            <div className="relative bg-white/75 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[28px] border border-white/70 dark:border-slate-700/60 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-5 pt-4 pb-3 border-b border-slate-200/60 dark:border-slate-700/50">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">soloway.app / trip / kyoto</span>
              </div>

              <div className="p-5 sm:p-6">
                {/* Destination header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400 mb-1">Current trip</div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Kyoto, Japan</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">Oct 12 – Oct 19 · Solo</p>
                  </div>
                  <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80">
                    <button
                      className={`p-2 rounded-lg transition-all ${tripMood === 'chill' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}
                      onClick={() => setTripMood('chill')}
                      aria-label="Chill mood"
                    >
                      <Coffee className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition-all ${tripMood === 'adventure' ? 'bg-white dark:bg-slate-700 shadow-sm text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}
                      onClick={() => setTripMood('adventure')}
                      aria-label="Adventure mood"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Itinerary */}
                <div className="rounded-2xl p-5 bg-white/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                      Today · {tripMood === 'chill' ? 'Slow & Steady' : 'Full Exploration'}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-100 dark:border-emerald-800/60">
                      <Shield className="w-3 h-3" /> Safe area
                    </span>
                  </div>

                  {tripMood === 'chill' ? (
                    <>
                      <ItineraryItem time="09:00 AM" title="Coffee at Weekenders" type="relax" mood={tripMood} />
                      <ItineraryItem time="11:30 AM" title="Stroll Philosopher's Path" type="relax" mood={tripMood} />
                      <ItineraryItem time="02:00 PM" title="Reading at Kamo River" type="relax" mood={tripMood} />
                    </>
                  ) : (
                    <>
                      <ItineraryItem time="08:00 AM" title="Hike Fushimi Inari" type="active" mood={tripMood} />
                      <ItineraryItem time="12:30 PM" title="Street Food Market" type="food" mood={tripMood} />
                      <ItineraryItem time="04:00 PM" title="Gion Geisha District Tour" type="active" mood={tripMood} />
                    </>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-700/60">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-900/20 dark:to-sky-900/20 border border-indigo-100/80 dark:border-indigo-800/40">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-indigo-600/80 dark:text-indigo-300/80">SoloWay Radar</p>
                        <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate">2 other travelers nearby</p>
                      </div>
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
