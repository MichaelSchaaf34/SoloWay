import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sun } from 'lucide-react';
import { img, pickAvatars } from './previewAssets';

const TABS = ['For you', 'Events', 'Solo travelers', 'Ideas'];

const ITEMS = [
  {
    time: '10:00 AM',
    title: 'Gothic Quarter Walking Tour',
    tag: 'Event',
    tagClass: 'bg-[#EEF0FE] text-[var(--pv-accent)]',
    meta: '6 spots left',
    image: img('photo-1511527661048-7fe73d85e9a4', 160),
    avatars: pickAvatars(4, 0),
  },
  {
    time: '2:00 PM',
    title: 'Beach & Coffee Hangout',
    tag: 'Meetup',
    tagClass: 'bg-violet-50 text-violet-500',
    meta: '3 going',
    image: img('photo-1507525428034-b723cf961d3e', 160),
    avatars: pickAvatars(3, 3),
  },
  {
    time: '7:00 PM',
    title: 'Tapas & Stories Night',
    tag: 'Experience',
    tagClass: 'bg-amber-50 text-amber-500',
    meta: '8 going',
    image: img('photo-1414235077428-338989a2e8c0', 160),
    avatars: pickAvatars(4, 4),
  },
];

/** Static "Discover today" card floating over the hero, per the mock. */
const PreviewDiscoveryCard = () => {
  const [tab, setTab] = useState('For you');

  return (
    <div className="w-[290px] rounded-3xl border border-white/60 bg-white/95 p-4 shadow-[0_30px_70px_-30px_rgba(20,24,43,0.45)] backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400">Discover today</p>
          <h3 className="mt-0.5 text-[16px] font-bold tracking-tight text-[var(--pv-ink)]">
            Barcelona, Spain
          </h3>
        </div>
        <span className="flex items-center gap-1.5 pt-0.5">
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-[13px] font-semibold text-[var(--pv-ink)]">24°C</span>
        </span>
      </div>

      <div className="mt-4 flex gap-3.5 border-b border-slate-100">
        {TABS.map(label => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={`whitespace-nowrap pb-2 text-[11.5px] transition-colors ${
              tab === label
                ? '-mb-px border-b-2 border-[var(--pv-accent)] font-semibold text-[var(--pv-ink)]'
                : 'font-medium text-slate-400 hover:text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-1">
        {ITEMS.map(item => (
          <div key={item.title} className="flex gap-3 py-2.5">
            <img
              src={item.image}
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400">{item.time}</p>
              <p className="text-[12.5px] font-semibold leading-snug text-[var(--pv-ink)]">
                {item.title}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">{item.meta}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${item.tagClass}`}
              >
                {item.tag}
              </span>
              <span className="flex -space-x-1.5">
                {item.avatars.map(src => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-5 w-5 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/destinations/barcelona"
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--pv-accent)] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#585ee0]"
      >
        View full plan
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
};

export default PreviewDiscoveryCard;
