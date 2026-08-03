import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HomePhone from './HomePhone';
import { DESTINATIONS } from '../Destinations';
import { ATLAS_CARD_COUNT, selectForDate } from '../../utils/destinationRotation';
import { pickAvatars } from './homeAssets';

/**
 * "Inspiration for your next adventure" — six destination cards fed by the
 * daily atlas rotation, with the phone mockup floating on the right.
 */
const HomeInspiration = ({ rotationDate }) => {
  const cards = selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, rotationDate);

  return (
    <section id="destinations" className="bg-white pb-12 pt-8 dark:bg-[#0f1220]">
      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8">
        {/* Floats only at >=1440px, where the grid and hero card leave a clear lane. */}
        <div className="absolute -top-16 right-0 z-30 hidden w-[250px] min-[1440px]:block">
          <HomePhone />
        </div>

        <div className="min-[1440px]:max-w-[1010px]">
          <h2 className="text-[30px] font-bold tracking-tight text-[var(--sw-ink)] dark:text-white sm:text-[36px]">
            Inspiration for your next{' '}
            <span className="font-serif-italic pr-1 text-[var(--sw-accent)]">adventure</span>
          </h2>
          <p className="mt-3 max-w-[360px] text-[16px] leading-relaxed text-slate-500 dark:text-slate-400">
            Curated ideas, events, and experiences just for solo travelers.
          </p>
          <Link
            to="/explore"
            className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--sw-accent)] hover:underline"
          >
            Explore all destinations
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((destination, index) => (
              <Link
                key={destination.id}
                to={`/destinations/${destination.id}`}
                className="group block overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_10px_30px_-18px_rgba(20,24,43,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-22px_rgba(20,24,43,0.35)] dark:border-slate-800 dark:bg-[#15192b]"
              >
                <div className="relative h-[170px] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.imageAlt || `${destination.name}, ${destination.country}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ objectPosition: destination.imagePosition }}
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-white ${
                      index === 1 ? 'bg-amber-500' : 'bg-slate-900/60 backdrop-blur-sm'
                    }`}
                  >
                    {destination.vibe}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[17px] font-bold tracking-tight text-[var(--sw-ink)] dark:text-white">
                    {destination.name}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-slate-400">{destination.country}</p>
                  <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {destination.desc}
                  </p>
                  <div className="mt-3 flex items-center">
                    <span className="flex -space-x-1.5">
                      {pickAvatars(4, index).map(src => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className="h-5 w-5 rounded-full border-2 border-white object-cover dark:border-[#15192b]"
                        />
                      ))}
                    </span>
                    <span className="ml-2 text-[11.5px] font-semibold text-slate-400">
                      +{destination.nearby}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeInspiration;
