import React from 'react';
import { Shield, Check, Bell, AlertTriangle } from 'lucide-react';

const SAFETY_FEATURES = [
  'Neighborhood safety heatmaps',
  "Automated 'I'm Safe' texts to trusted contacts",
  'Offline maps and emergency phrases',
];

const Safety = () => {
  return (
    <section id="safety" className="relative py-24 lg:py-32 bg-white dark:bg-slate-950/60 overflow-hidden">
      {/* Ambient background wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/60 to-transparent dark:via-slate-900/40" />
      <div className="pointer-events-none absolute -top-40 -left-20 h-80 w-80 rounded-full blur-3xl bg-emerald-200/30 dark:bg-emerald-900/20" />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left - Safety Card Demo */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-emerald-200/40 dark:bg-emerald-900/30 blur-2xl pointer-events-none" />
              <div className="relative w-full max-w-sm mx-auto lg:mx-0 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200/80 dark:border-slate-700/60 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)] overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 ring-1 ring-emerald-200/60 dark:ring-emerald-800/60 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-[15px] tracking-tight">Guardian Active</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Monitoring neighborhood safety</p>
                  </div>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Check-in scheduled</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">11:00 PM · "I'm safe back at the hostel"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50/60 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 opacity-70">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-rose-700 dark:text-rose-300">Panic Mode</p>
                      <p className="text-[12px] text-rose-500/80 dark:text-rose-400/70">One tap alerts contacts + local services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="flex-1">
            <span className="inline-block text-[11px] font-semibold tracking-[0.22em] text-emerald-600 dark:text-emerald-400 uppercase mb-4">
              Safety first
            </span>
            <h2 className="text-balance text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold text-slate-900 dark:text-white leading-[1.1] mb-5">
              Safety isn't an afterthought. It's the foundation.
            </h2>
            <p className="text-pretty text-[17px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-xl">
              SoloWay doesn't just show you where to go — it tells you where to avoid.
              Our Guardian Agent analyzes local crime data, lighting conditions, and crowd levels to route you safely.
            </p>
            <ul className="space-y-3">
              {SAFETY_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-3.5 text-[15px] text-slate-700 dark:text-slate-200 font-medium">
                  <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-900/40 ring-1 ring-teal-200/60 dark:ring-teal-800/60 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Safety;
