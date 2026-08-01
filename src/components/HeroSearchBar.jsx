import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { getLiveDestinations } from '../utils/liveDestinations';

/**
 * Visual prototype of an Airbnb-style Where + When bar.
 * Local UI state only — no TripContext / navigation / API yet.
 */
const HeroSearchBar = () => {
  const destinations = useMemo(() => getLiveDestinations(), []);
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const rootRef = useRef(null);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? destinations.filter(
          destination =>
            destination.name.toLowerCase().includes(normalized) ||
            destination.country.toLowerCase().includes(normalized)
        )
      : destinations;
    return list.slice(0, 6);
  }, [destinations, query]);

  useEffect(() => {
    const onPointerDown = event => {
      if (!rootRef.current?.contains(event.target)) {
        setSuggestionsOpen(false);
        setActiveSegment(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const pickDestination = destination => {
    setQuery(`${destination.name}, ${destination.country}`);
    setSuggestionsOpen(false);
    setActiveSegment('when');
  };

  return (
    <div className="relative z-20 -mt-6 px-6 pb-2 lg:-mt-10 lg:pb-4">
      <form
        ref={rootRef}
        onSubmit={event => event.preventDefault()}
        className="mx-auto flex max-w-3xl flex-col overflow-visible rounded-[28px] border border-white/70 bg-white/95 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95 sm:flex-row sm:items-stretch"
        aria-label="Search destinations by place and dates"
      >
        <div
          className={`relative flex min-w-0 flex-1 flex-col justify-center rounded-[28px] px-5 py-3.5 transition-colors sm:rounded-none sm:rounded-l-[28px] ${
            activeSegment === 'where' ? 'bg-slate-50 dark:bg-slate-800/80' : ''
          }`}
        >
          <label htmlFor="hero-search-where" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Where
          </label>
          <div className="mt-1 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-500" aria-hidden="true" />
            <input
              id="hero-search-where"
              type="text"
              value={query}
              placeholder="Search destinations"
              autoComplete="off"
              onFocus={() => {
                setActiveSegment('where');
                setSuggestionsOpen(true);
              }}
              onChange={event => {
                setQuery(event.target.value);
                setSuggestionsOpen(true);
                setActiveSegment('where');
              }}
              className="w-full bg-transparent text-[15px] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          {suggestionsOpen && suggestions.length > 0 && (
            <ul
              className="absolute left-3 right-3 top-[calc(100%+0.4rem)] z-30 overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:left-0 sm:right-auto sm:w-[22rem]"
              role="listbox"
            >
              {suggestions.map(destination => (
                <li key={destination.id}>
                  <button
                    type="button"
                    role="option"
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => pickDestination(destination)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-teal-50 dark:hover:bg-teal-950/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {destination.name}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {destination.country}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mx-5 h-px bg-slate-200 dark:bg-slate-700 sm:mx-0 sm:my-3 sm:h-auto sm:w-px" aria-hidden="true" />

        <div
          className={`flex min-w-0 flex-[1.15] flex-col justify-center px-5 py-3.5 transition-colors ${
            activeSegment === 'when' ? 'bg-slate-50 dark:bg-slate-800/80' : ''
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            When
          </span>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="hero-search-start"
              type="date"
              value={startDate}
              aria-label="Arrive"
              onFocus={() => setActiveSegment('when')}
              onChange={event => setStartDate(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-slate-900 focus:outline-none dark:text-white dark:[color-scheme:dark]"
            />
            <span className="text-xs text-slate-400">→</span>
            <input
              id="hero-search-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              aria-label="Depart"
              onFocus={() => setActiveSegment('when')}
              onChange={event => setEndDate(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-slate-900 focus:outline-none dark:text-white dark:[color-scheme:dark]"
            />
          </div>
        </div>

        <div className="flex items-center px-3 pb-3 sm:pb-0 sm:pr-3">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:w-auto sm:px-4"
            aria-label="Search destinations"
          >
            <Search className="h-4 w-4" />
            <span className="sm:hidden">Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroSearchBar;
