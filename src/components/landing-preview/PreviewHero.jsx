import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Send, Smile, Users } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import PreviewDiscoveryCard from './PreviewDiscoveryCard';
import PreviewSearchBar from './PreviewSearchBar';

const HIGHLIGHTS = [
  { icon: Users, title: 'Meet solo travelers', sub: 'Connect safely' },
  { icon: Smile, title: 'Find ideas & events', sub: 'For any length of stay' },
  { icon: Heart, title: 'Save memories', sub: 'Cherish every moment' },
];

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80';

const PreviewHero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[center_38%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/70 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1120px] px-5 pb-16 pt-16 sm:px-8 lg:pb-6 lg:pt-20">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <div>
              <div className="max-w-xl">
                <h1 className="text-[42px] font-bold leading-[1.07] tracking-tight text-[var(--pv-ink)] sm:text-[52px] lg:text-[58px]">
                  Explore the world.
                  <br />
                  On{' '}
                  <span className="font-serif-italic pr-1 text-[var(--pv-accent)]">your</span>{' '}
                  terms.
                </h1>
                <p className="mt-5 max-w-[430px] text-[16px] leading-[1.65] text-slate-500">
                  The safe, smart way to discover places, find solo travelers, and create
                  unforgettable memories.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to={isAuthenticated ? '/start' : '/auth'}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--pv-ink)] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1f2440]"
                  >
                    Start your journey
                    <Send className="h-4 w-4" />
                  </Link>
                  <a
                    href="#inspiration"
                    className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-[var(--pv-ink)] shadow-sm transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">
                      <Play className="h-2.5 w-2.5 fill-current" />
                    </span>
                    Watch how it works
                  </a>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {HIGHLIGHTS.map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-[var(--pv-ink)] shadow-[0_2px_10px_rgba(20,24,43,0.08)]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-semibold text-[var(--pv-ink)]">
                        {title}
                      </span>
                      <span className="block text-xs text-slate-500">{sub}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden justify-self-end lg:-mt-8 lg:block xl:mr-20">
              <PreviewDiscoveryCard />
            </div>
          </div>
        </div>
      </section>

      {/* Search bar straddles the hero photo's bottom edge, matching the mock. */}
      <div className="relative z-30 -mt-9">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
          <PreviewSearchBar />
        </div>
      </div>
    </>
  );
};

export default PreviewHero;
