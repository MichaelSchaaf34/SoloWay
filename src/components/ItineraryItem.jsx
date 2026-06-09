import React from 'react';
import Badge from './ui/Badge';

const ItineraryItem = ({ time, title, type, mood }) => {
  const isActive = (mood === 'adventure' && type === 'active') || (mood === 'chill' && type === 'relax');

  return (
    <div
      className={`relative pl-7 pb-6 last:pb-0 border-l-2 transition-colors duration-500 ${
        isActive
          ? 'border-teal-400 dark:border-teal-500'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div
        className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-[3px] transition-all duration-500 ${
          isActive
            ? 'bg-teal-500 ring-teal-100 dark:ring-teal-900/60'
            : 'bg-slate-300 ring-slate-100 dark:bg-slate-600 dark:ring-slate-800'
        }`}
      />
      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide tabular-nums uppercase block mb-0.5">
        {time}
      </span>
      <h4 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">{title}</h4>
      <div className="flex gap-1.5 mt-2">
        {type === 'active' && <Badge color="rose">Adventure</Badge>}
        {type === 'relax' && <Badge color="teal">Chill</Badge>}
        {type === 'food' && <Badge color="indigo">Local Eats</Badge>}
      </div>
    </div>
  );
};

export default ItineraryItem;
