import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Literal hex, not var(--sw-accent): Tailwind cannot apply an opacity
// modifier to a var() color, so `bg-[var(--sw-accent)]/10` emits nothing.
const RANGE_BG = 'bg-[#6C70F2]/10 dark:bg-[#6C70F2]/25';

const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const firstOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1);
const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);
const daysInMonth = date => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const sameDay = (a, b) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const sameMonth = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const monthLabel = date =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const fullLabel = date =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

/** Short label for the search bar segment, e.g. "Mar 3 – Mar 9". */
export const formatDateRange = (start, end) => {
  if (!start) return 'Anytime';
  const short = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return end ? `${short(start)} – ${short(end)}` : short(start);
};

/**
 * Range date picker for the hero search bar. Keyboard driven via roving
 * tabindex: arrows move by day/week, PageUp/PageDown by month, Enter selects.
 */
const HomeDatePicker = ({ start, end, onChange, onClose }) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() => firstOfMonth(start || today));
  const [focusedDate, setFocusedDate] = useState(() => start || today);
  const [hovered, setHovered] = useState(null);
  const gridRef = useRef(null);
  const shouldFocusRef = useRef(false);

  // Keep focus on the active day cell while arrow-keying through the grid.
  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    gridRef.current?.querySelector('[data-focused="true"]')?.focus();
  }, [focusedDate]);

  const canGoBack = !sameMonth(viewMonth, today) && viewMonth > today;

  const cells = useMemo(() => {
    const lead = viewMonth.getDay();
    const total = daysInMonth(viewMonth);
    const list = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= total; day += 1) {
      list.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    }
    return list;
  }, [viewMonth]);

  // While picking the end date, preview the range under the cursor.
  const previewEnd = end || (start && hovered && hovered > start ? hovered : null);

  const inRange = date => {
    if (!start || !previewEnd) return false;
    return date > start && date < previewEnd;
  };

  const selectDate = date => {
    if (date < today) return;
    if (!start || (start && end)) {
      onChange({ start: date, end: null });
      return;
    }
    if (date < start) {
      onChange({ start: date, end: null });
      return;
    }
    onChange({ start, end: date });
    onClose?.();
  };

  const moveFocus = next => {
    if (next < today) return;
    shouldFocusRef.current = true;
    setFocusedDate(next);
    if (!sameMonth(next, viewMonth)) setViewMonth(firstOfMonth(next));
  };

  const handleKeyDown = event => {
    const key = event.key;
    if (key === 'Escape') {
      onClose?.();
      return;
    }
    const moves = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (moves[key] !== undefined) {
      event.preventDefault();
      moveFocus(addDays(focusedDate, moves[key]));
      return;
    }
    if (key === 'PageUp' || key === 'PageDown') {
      event.preventDefault();
      moveFocus(addMonths(focusedDate, key === 'PageUp' ? -1 : 1));
      return;
    }
    if (key === 'Home' || key === 'End') {
      event.preventDefault();
      const offset = key === 'Home' ? -focusedDate.getDay() : 6 - focusedDate.getDay();
      moveFocus(addDays(focusedDate, offset));
    }
  };

  const shiftMonth = n => {
    const next = addMonths(viewMonth, n);
    setViewMonth(next);
    setFocusedDate(current => (sameMonth(current, next) ? current : next));
  };

  return (
    <div
      role="dialog"
      aria-label="Choose dates"
      onKeyDown={handleKeyDown}
      className="w-[300px] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-[#15192b]"
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span
          aria-live="polite"
          className="text-[13px] font-semibold text-[var(--sw-ink)] dark:text-white"
        >
          {monthLabel(viewMonth)}
        </span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 pb-1">
        {WEEKDAYS.map((day, i) => (
          <span
            key={i}
            className="flex h-7 items-center justify-center text-[10px] font-semibold uppercase text-slate-400"
          >
            {day[0]}
          </span>
        ))}
      </div>

      <div ref={gridRef} className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => setHovered(null)}>
        {cells.map((date, index) => {
          if (!date) return <span key={`pad-${index}`} />;

          const disabled = date < today;
          const isStart = sameDay(date, start);
          const isEnd = sameDay(date, end);
          const isEdge = isStart || isEnd;
          const between = inRange(date);
          const isFocused = sameDay(date, focusedDate);

          return (
            <div
              key={date.toISOString()}
              className={`flex justify-center ${between ? RANGE_BG : ''} ${
                isStart && previewEnd ? `rounded-l-full ${RANGE_BG}` : ''
              } ${isEnd ? `rounded-r-full ${RANGE_BG}` : ''}`}
            >
              <button
                type="button"
                disabled={disabled}
                data-focused={isFocused ? 'true' : 'false'}
                tabIndex={isFocused ? 0 : -1}
                aria-label={fullLabel(date)}
                aria-pressed={isEdge}
                onMouseEnter={() => setHovered(date)}
                onClick={() => selectDate(date)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[12.5px] transition-colors ${
                  disabled
                    ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                    : isEdge
                      ? 'bg-[var(--sw-accent)] font-semibold text-white'
                      : `text-[var(--sw-ink)] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 ${
                          sameDay(date, today) ? 'font-bold underline underline-offset-4' : ''
                        }`
                }`}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onChange({ start: null, end: null })}
          className="rounded-lg px-2 py-1 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Anytime
        </button>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="rounded-lg px-3 py-1 text-[12px] font-semibold text-[var(--sw-accent)] transition-colors hover:bg-[#6C70F2]/10"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default HomeDatePicker;
