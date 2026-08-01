import React from 'react';
import {
  Bookmark,
  MapPin,
  MessageCircle,
  Signal,
  Sun,
  User,
  Wifi,
} from 'lucide-react';
import { img, pickAvatars } from './previewAssets';

const TABS = ['For you', 'Events', 'Solo travelers', 'Ideas'];

const ITEMS = [
  {
    time: '10:00 AM',
    title: 'Medina Walking Tour',
    tag: 'Event',
    tagClass: 'bg-[#EEF0FE] text-[var(--pv-accent)]',
    meta: '6 spots left',
    image: img('photo-1597211833712-5e41faa202ea', 120),
    avatars: pickAvatars(3, 1),
  },
  {
    time: '2:00 PM',
    title: 'Rooftop Coffee & Chat',
    tag: 'Meetup',
    tagClass: 'bg-violet-50 text-violet-500',
    meta: '4 going',
    image: img('photo-1511920170033-f8396924c348', 120),
    avatars: pickAvatars(3, 5),
  },
  {
    time: '7:30 PM',
    title: 'Sunset Desert Experience',
    tag: 'Experience',
    tagClass: 'bg-amber-50 text-amber-500',
    meta: '6 going',
    image: img('photo-1509316785289-025f5b846b35', 120),
    avatars: pickAvatars(4, 2),
  },
];

const PEOPLE = pickAvatars(4, 0);

const NAV = [
  { icon: MapPin, label: 'Explore', active: true },
  { icon: MessageCircle, label: 'Messages' },
  { icon: Bookmark, label: 'Save' },
  { icon: User, label: 'Profile' },
];

/** Static Marrakech phone mockup floating on the right of the page, per the mock. */
const PreviewPhone = () => (
  <div className="rounded-[36px] bg-[var(--pv-ink)] p-[9px] shadow-[0_45px_90px_-35px_rgba(20,24,43,0.6)]">
    <div className="overflow-hidden rounded-[28px] bg-white">
      <div className="flex items-center justify-between px-4 pt-3 text-[var(--pv-ink)]">
        <span className="text-[10px] font-semibold">9:41</span>
        <span className="flex items-center gap-1">
          <Signal className="h-2.5 w-2.5" />
          <Wifi className="h-2.5 w-2.5" />
          <span className="ml-0.5 h-[7px] w-3.5 rounded-[2px] bg-[var(--pv-ink)]" />
        </span>
      </div>

      <div className="mt-1.5 flex items-start justify-between px-4">
        <div>
          <p className="text-[9px] font-medium text-slate-400">Discover</p>
          <h4 className="text-[12.5px] font-bold tracking-tight text-[var(--pv-ink)]">
            Marrakech, Morocco
          </h4>
        </div>
        <span className="flex items-center gap-1 pt-1">
          <Sun className="h-3 w-3 text-amber-400" />
          <span className="text-[9.5px] font-semibold text-[var(--pv-ink)]">24°C</span>
        </span>
      </div>

      <div className="mt-2 flex gap-3 border-b border-slate-100 px-4">
        {TABS.map((label, i) => (
          <span
            key={label}
            className={`whitespace-nowrap pb-1.5 text-[8.5px] ${
              i === 0
                ? '-mb-px border-b-2 border-[var(--pv-accent)] font-semibold text-[var(--pv-ink)]'
                : 'font-medium text-slate-400'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between px-4">
        <h5 className="text-[11px] font-bold text-[var(--pv-ink)]">Today&rsquo;s highlights</h5>
        <span className="text-[9px] font-semibold text-[var(--pv-accent)] underline underline-offset-2">
          View all
        </span>
      </div>

      <div className="px-3">
        {ITEMS.map(item => (
          <div key={item.title} className="flex gap-2 py-2">
            <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[8px] text-slate-400">{item.time}</p>
              <p className="truncate text-[10px] font-semibold text-[var(--pv-ink)]">
                {item.title}
              </p>
              <p className="mt-0.5 text-[8px] text-slate-400">{item.meta}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
              <span
                className={`rounded-full px-1.5 py-0.5 text-[7px] font-semibold ${item.tagClass}`}
              >
                {item.tag}
              </span>
              <span className="flex -space-x-1">
                {item.avatars.map(src => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-3.5 w-3.5 rounded-full border border-white object-cover"
                  />
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between px-4">
        <h5 className="text-[11px] font-bold text-[var(--pv-ink)]">People in Marrakech</h5>
        <span className="text-[9px] font-semibold text-[var(--pv-accent)] underline underline-offset-2">
          See all
        </span>
      </div>
      <div className="mt-1.5 grid grid-cols-4 gap-1.5 px-4">
        {PEOPLE.map(src => (
          <img key={src} src={src} alt="" className="h-10 w-full rounded-xl object-cover" />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 border-t border-slate-100 px-2 py-2">
        {NAV.map(({ icon: Icon, label, active }) => (
          <span key={label} className="flex flex-col items-center gap-0.5">
            <Icon
              className={`h-3.5 w-3.5 ${active ? 'text-[var(--pv-accent)]' : 'text-slate-400'}`}
            />
            <span
              className={`text-[7.5px] font-medium ${
                active ? 'text-[var(--pv-accent)]' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default PreviewPhone;
