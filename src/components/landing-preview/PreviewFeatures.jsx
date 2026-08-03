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

const PreviewFeatures = () => (
  <section className="bg-white px-5 pb-20 pt-2 sm:px-8">
    <div className="mx-auto grid max-w-[1360px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[var(--pv-ink)]">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span>
            <h3 className="text-[16px] font-semibold text-[var(--pv-ink)]">{title}</h3>
            <p className="mt-1 max-w-[230px] text-[13.5px] leading-relaxed text-slate-500">{body}</p>
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default PreviewFeatures;
