import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, CalendarDays, MapPin, Search } from 'lucide-react';
import { getLiveDestinations } from '../../utils/liveDestinations';

const DATE_OPTIONS = ['Anytime', 'This weekend', 'Next week', 'Next month'];
const TRIP_TYPES = ['Any duration', 'Weekend', 'A few days', 'Week+'];

/** Visual-only search pill matching the mock (no TripContext / navigation). */
const PreviewSearchBar = () => {
  const destinations = useMemo(() => getLiveDestinations(), []);
  const [query, setQuery] = useState('');
  const [datesLabel, setDatesLabel] = useState('Anytime');
  const [tripType, setTripType] = useState('Any duration');
  const [open, setOpen] = useState(null);
  const rootRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? destinations.filter(
          d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
        )
      : destinations;
    return list.slice(0, 6);
  }, [destinations, query]);

  useEffect(() => {
    const onDown = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <form
      ref={rootRef}
      onSubmit={event => event.preventDefault()}
      className="flex max-w-[780px] flex-col rounded-[28px] border border-slate-100 bg-white p-2 shadow-[0_18px_45px_-20px_rgba(20,24,43,0.35)] sm:flex-row sm:items-center sm:rounded-full"
      aria-label="Search destinations"
    >
      <div className="relative flex min-w-0 flex-1 items-center gap-3 rounded-full px-4 py-2 hover:bg-slate-50 sm:px-5">
        <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-semibold text-[var(--pv-ink)]">Where to?</p>
          <input
            type="text"
            value={query}
            placeholder="Search cities or places"
            autoComplete="off"
            onFocus={() => setOpen('where')}
            onChange={event => {
              setQuery(event.target.value);
              setOpen('where');
            }}
            className="w-full bg-transparent text-[13.5px] text-slate-600 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        {open === 'where' && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-40 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 shadow-xl sm:w-80">
            {suggestions.map(destination => (
              <li key={destination.id}>
                <button
                  type="button"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    setQuery(`${destination.name}, ${destination.country}`);
                    setOpen(null);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                >
                  <MapPin className="h-4 w-4 text-[var(--pv-accent)]" />
                  <span>
                    <span className="block text-sm font-semibold text-[var(--pv-ink)]">
                      {destination.name}
                    </span>
                    <span className="block text-xs text-slate-500">{destination.country}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mx-2 hidden h-9 w-px bg-slate-100 sm:block" />

      <div className="relative flex min-w-0 flex-1 items-center gap-3 rounded-full px-4 py-2 hover:bg-slate-50 sm:px-5">
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
        <button
          type="button"
          onClick={() => setOpen(open === 'dates' ? null : 'dates')}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-[11.5px] font-semibold text-[var(--pv-ink)]">Dates</p>
          <p className="text-[13.5px] text-slate-500">{datesLabel}</p>
        </button>
        {open === 'dates' && (
          <div className="absolute left-0 top-[calc(100%+0.75rem)] z-40 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
            {DATE_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setDatesLabel(option);
                  setOpen(null);
                }}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-2 hidden h-9 w-px bg-slate-100 sm:block" />

      <div className="relative flex min-w-0 flex-1 items-center gap-3 rounded-full px-4 py-2 hover:bg-slate-50 sm:px-5">
        <Briefcase className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
        <button
          type="button"
          onClick={() => setOpen(open === 'trip' ? null : 'trip')}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-[11.5px] font-semibold text-[var(--pv-ink)]">Trip type</p>
          <p className="text-[13.5px] text-slate-500">{tripType}</p>
        </button>
        {open === 'trip' && (
          <div className="absolute left-0 top-[calc(100%+0.75rem)] z-40 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl sm:left-auto sm:right-0">
            {TRIP_TYPES.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTripType(option);
                  setOpen(null);
                }}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="m-1 flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-[var(--pv-ink)] text-white transition-colors hover:bg-[#1f2440] sm:self-center"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
};

export default PreviewSearchBar;
