import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import PreviewPhone from './PreviewPhone';
import { img, pickAvatars } from './previewAssets';

const CARDS = [
  {
    name: 'Tokyo',
    country: 'Japan',
    desc: 'Neon nights, quiet temples, and endless solo-friendly adventures.',
    count: 128,
    badge: 'Trending',
    badgeClass: 'bg-slate-900/60 backdrop-blur-sm',
    image: img('photo-1540959733332-eab4deabeeaf'),
    to: null,
    avatars: pickAvatars(4, 0),
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    desc: 'Find peace, connection, and inspiration on the island.',
    count: 96,
    badge: 'For you',
    badgeClass: 'bg-amber-500',
    image: img('photo-1537996194471-e657df975ab4'),
    to: '/destinations/bali',
    avatars: pickAvatars(4, 2),
  },
  {
    name: 'New York',
    country: 'USA',
    desc: 'Big energy, endless options, and solo vibes everywhere.',
    count: 342,
    badge: 'City break',
    badgeClass: 'bg-slate-900/60 backdrop-blur-sm',
    image: img('photo-1534430480872-3498386e7856'),
    to: '/destinations/new-york',
    avatars: pickAvatars(4, 4),
  },
  {
    name: 'Lisbon',
    country: 'Portugal',
    desc: 'Colorful streets, warm people, and soulful solo moments.',
    count: 74,
    badge: 'Hidden gem',
    badgeClass: 'bg-slate-900/60 backdrop-blur-sm',
    image: img('photo-1585208798174-6cedd86e019a'),
    to: '/destinations/lisbon',
    avatars: pickAvatars(4, 3),
  },
];

const CardBody = ({ card }) => (
  <>
    <div className="relative h-[150px] overflow-hidden">
      <img
        src={card.image}
        alt={`${card.name}, ${card.country}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span
        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white ${card.badgeClass}`}
      >
        {card.badge}
      </span>
    </div>
    <div className="p-4">
      <h3 className="text-[16px] font-bold tracking-tight text-[var(--pv-ink)]">{card.name}</h3>
      <p className="mt-0.5 text-[12.5px] text-slate-400">{card.country}</p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{card.desc}</p>
      <div className="mt-3 flex items-center">
        <span className="flex -space-x-1.5">
          {card.avatars.map(src => (
            <img
              key={src}
              src={src}
              alt=""
              className="h-5 w-5 rounded-full border-2 border-white object-cover"
            />
          ))}
        </span>
        <span className="ml-2 text-[11px] font-semibold text-slate-400">+{card.count}</span>
      </div>
    </div>
  </>
);

const PreviewInspiration = () => (
  <section id="inspiration" className="bg-white pb-16 pt-12">
    <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="absolute -top-[120px] right-2 z-30 hidden w-[235px] xl:block">
        <PreviewPhone />
      </div>

      <div className="xl:max-w-[930px]">
        <h2 className="text-[30px] font-bold tracking-tight text-[var(--pv-ink)] sm:text-[34px]">
          Inspiration for your next{' '}
          <span className="font-serif-italic pr-1 text-[var(--pv-accent)]">adventure</span>
        </h2>
        <p className="mt-3 max-w-[340px] text-[15px] leading-relaxed text-slate-500">
          Curated ideas, events, and experiences just for solo travelers.
        </p>
        <a
          href="/#destinations"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--pv-accent)] hover:underline"
        >
          Explore all destinations
          <ArrowRight className="h-4 w-4" />
        </a>

        <div className="relative mt-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {CARDS.map(card => {
              const className =
                'group block overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_10px_30px_-18px_rgba(20,24,43,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-22px_rgba(20,24,43,0.35)]';
              return card.to ? (
                <Link key={card.name} to={card.to} className={className}>
                  <CardBody card={card} />
                </Link>
              ) : (
                <article key={card.name} className={className}>
                  <CardBody card={card} />
                </article>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Next destinations"
            className="absolute -right-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-[var(--pv-ink)] shadow-lg transition-colors hover:bg-slate-50 xl:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default PreviewInspiration;
