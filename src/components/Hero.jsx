import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import HeroDiscoveryCard from './HeroDiscoveryCard';
import useAuth from '../hooks/useAuth';

const Hero = ({ rotationDate = new Date() }) => {
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

          <HeroDiscoveryCard rotationDate={rotationDate} />
        </div>
      </div>
    </header>
  );
};

export default Hero;
