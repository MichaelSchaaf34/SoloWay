import React from 'react';

const COLORS = {
  blue:    'bg-blue-50 text-blue-700 ring-blue-200/70 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800/60',
  rose:    'bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800/60',
  teal:    'bg-teal-50 text-teal-700 ring-teal-200/70 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-800/60',
  indigo:  'bg-indigo-50 text-indigo-700 ring-indigo-200/70 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800/60',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/60',
  amber:   'bg-amber-50 text-amber-800 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800/60',
  slate:   'bg-slate-100 text-slate-700 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

const Badge = ({ children, color = 'blue', className = '' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide ring-1 ring-inset ${COLORS[color] || COLORS.blue} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
