import React from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * FeatureCard
 * Modern, numbered, editorial feature card. Uses a subtle gradient accent
 * band on hover and a tinted icon block.
 *
 * Props:
 *   icon  - Lucide icon component
 *   title - heading
 *   desc  - description paragraph
 *   tint  - one of: 'teal' | 'rose' | 'indigo' | 'emerald' | 'amber'
 *   index - 1-based index, rendered as "01", "02", ...
 */
const TINTS = {
  teal:    { icon: 'text-teal-700 dark:text-teal-300',    bg: 'bg-teal-50 dark:bg-teal-900/30',    ring: 'ring-teal-200/60 dark:ring-teal-800/60',    accent: 'from-teal-500/0 via-teal-500 to-teal-500/0' },
  rose:    { icon: 'text-rose-700 dark:text-rose-300',    bg: 'bg-rose-50 dark:bg-rose-900/30',    ring: 'ring-rose-200/60 dark:ring-rose-800/60',    accent: 'from-rose-500/0 via-rose-500 to-rose-500/0' },
  indigo:  { icon: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-900/30', ring: 'ring-indigo-200/60 dark:ring-indigo-800/60', accent: 'from-indigo-500/0 via-indigo-500 to-indigo-500/0' },
  emerald: { icon: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30', ring: 'ring-emerald-200/60 dark:ring-emerald-800/60', accent: 'from-emerald-500/0 via-emerald-500 to-emerald-500/0' },
  amber:   { icon: 'text-amber-700 dark:text-amber-300',  bg: 'bg-amber-50 dark:bg-amber-900/30',  ring: 'ring-amber-200/60 dark:ring-amber-800/60',  accent: 'from-amber-500/0 via-amber-500 to-amber-500/0' },
};

const FeatureCard = ({ icon: Icon, title, desc, tint = 'teal', index }) => {
  const t = TINTS[tint] || TINTS.teal;
  return (
    <div className="group relative bg-white dark:bg-slate-800/60 rounded-2xl p-7 border border-slate-200/80 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Hover accent bar */}
      <div className={`absolute inset-x-6 -top-px h-px bg-gradient-to-r ${t.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl ${t.bg} ring-1 ${t.ring} flex items-center justify-center transition-transform group-hover:scale-105`}>
          <Icon className={`w-5 h-5 ${t.icon}`} />
        </div>
        {index != null && (
          <span className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500 tabular-nums">
            {String(index).padStart(2, '0')}
          </span>
        )}
      </div>

      <h3 className="text-[19px] font-semibold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">{title}</h3>
      <p className="text-[14px] leading-relaxed text-slate-500 dark:text-slate-400 mb-5">{desc}</p>

      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
        Learn more
        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </div>
  );
};

export default FeatureCard;
