import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';

const ItineraryItem = ({ time, title, type, mood, to, price }) => {
  const isActive = (mood === 'adventure' && type === 'active') || (mood === 'chill' && (type === 'relax' || type === 'food'));

  const content = (
    <>
      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide tabular-nums uppercase block mb-0.5">
        {time}
      </span>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">{title}</h4>
        {price && (
          <span className="shrink-0 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            {price}
          </span>
        )}
      </div>
      <div className="flex gap-1.5 mt-2">
        {type === 'active' && <Badge color="rose">Adventure</Badge>}
        {type === 'relax' && <Badge color="teal">Chill</Badge>}
        {type === 'food' && <Badge color="indigo">Local Eats</Badge>}
      </div>
    </>
  );

  const rowClassName = `relative pl-7 pb-6 last:pb-0 border-l-2 transition-colors duration-500 ${
    isActive
      ? 'border-teal-400 dark:border-teal-500'
      : 'border-slate-200 dark:border-slate-700'
  }`;

  const dotClassName = `absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-[3px] transition-all duration-500 ${
    isActive
      ? 'bg-teal-500 ring-teal-100 dark:ring-teal-900/60'
      : 'bg-slate-300 ring-slate-100 dark:bg-slate-600 dark:ring-slate-800'
  }`;

  if (to) {
    return (
      <Link
        to={to}
        className={`group block ${rowClassName} hover:border-teal-300 dark:hover:border-teal-600`}
      >
        <div className={dotClassName} />
        <div className="group-hover:translate-x-0.5 transition-transform">
          {content}
        </div>
      </Link>
    );
  }

  return (
    <div className={rowClassName}>
      <div className={dotClassName} />
      {content}
    </div>
  );
};

export default ItineraryItem;
