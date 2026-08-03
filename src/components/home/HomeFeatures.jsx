import React from 'react';
import { Heart, Lock, UserPlus, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: Lock,
    title: 'Safe by design',
    body: 'Verified profiles, safety tools, and 24/7 support.',
  },
  {
    icon: UserPlus,
    title: 'Made for solo',
    body: 'Everything you need, whether for a day or a month.',
  },
  {
    icon: Users,
    title: 'Real connections',
    body: 'Meet solo travelers and locals.',
  },
  {
    icon: Heart,
    title: 'Memories that last',
    body: 'Save, share, and revisit your journey.',
  },
];

const HomeFeatures = () => (
  <section className="bg-white px-5 pb-20 pt-2 dark:bg-[#0f1220] sm:px-8">
    <div className="mx-auto grid max-w-[1360px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[var(--sw-ink)] dark:border-slate-700 dark:text-white">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span>
            <h3 className="text-[16px] font-semibold text-[var(--sw-ink)] dark:text-white">
              {title}
            </h3>
            <p className="mt-1 max-w-[230px] text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
              {body}
            </p>
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default HomeFeatures;
