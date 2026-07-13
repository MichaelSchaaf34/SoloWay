import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';
import DestinationScene from './DestinationScene';
import { rotateForDate } from '../utils/destinationRotation';

/**
 * Curated destination picks. The header area is an atmospheric CSS gradient
 * (two radial stops + a linear base) so we don't need per-destination photos
 * while still feeling editorial. Easy to swap for real imagery later by
 * replacing `gradient` with a photo URL.
 */
export const DESTINATIONS = [
  {
    id: 'medellin',
    name: 'Medellín',
    country: 'Colombia',
    vibe: 'Vibrant',
    vibeColor: 'from-amber-400 to-rose-500',
    nearby: 22,
    desc: "'City of Eternal Spring'. El Poblado and Laureles pack coworking, Spanish schools, and salsa into walkable zones.",
    bestTime: 'Dec – Mar',
    avgPerDay: 55,
    highlights: ['Salsa nights', 'Comuna 13 art walks', 'Coffee-country day trips'],
    scene: 'canopy',
    sceneCaption: 'Andean valley air',
    image: 'https://images.unsplash.com/photo-1727813658887-abf22d586862?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Medellín skyline surrounded by green mountains',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 20%, rgba(255,170,80,0.95) 0%, rgba(255,170,80,0) 55%), radial-gradient(at 80% 80%, rgba(236,72,153,0.85) 0%, rgba(236,72,153,0) 60%), linear-gradient(135deg, #7c2d12 0%, #312e81 100%)',
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    vibe: 'Sunlit',
    vibeColor: 'from-sky-400 to-emerald-400',
    nearby: 34,
    desc: 'Hill-top miradouros, tiled cafés, and a startup scene that welcomes newcomers. English works nearly everywhere.',
    bestTime: 'May – Oct',
    avgPerDay: 90,
    highlights: ['Alfama food walks', 'Sunset miradouros', 'Sintra day trips'],
    scene: 'sunglow',
    sceneCaption: 'Atlantic golden hour',
    image: 'https://images.unsplash.com/photo-1702758045561-7d5d5fe33d4a?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Historic Lisbon streets and colorful buildings',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 15% 25%, rgba(253,224,71,0.9) 0%, rgba(253,224,71,0) 55%), radial-gradient(at 85% 85%, rgba(59,130,246,0.85) 0%, rgba(59,130,246,0) 60%), linear-gradient(135deg, #0c4a6e 0%, #701a75 100%)',
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    vibe: 'Reflective',
    vibeColor: 'from-teal-400 to-indigo-400',
    nearby: 18,
    desc: 'Temples, tea houses, and bamboo groves a short cycle apart. The gold standard for safe, rewarding solo travel.',
    bestTime: 'Oct – Nov',
    avgPerDay: 140,
    highlights: ['Temple walks', 'Tea ceremonies', 'Arashiyama cycling'],
    scene: 'petals',
    sceneCaption: 'Falling blossom season',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Travelers wearing traditional kimono in Kyoto',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 30%, rgba(45,212,191,0.85) 0%, rgba(45,212,191,0) 55%), radial-gradient(at 80% 75%, rgba(217,70,239,0.7) 0%, rgba(217,70,239,0) 60%), linear-gradient(135deg, #064e3b 0%, #1e1b4b 100%)',
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    vibe: 'Epic',
    vibeColor: 'from-orange-400 to-blue-500',
    nearby: 12,
    desc: 'Stunning nature meets vibrant neighborhoods, a global hostel scene, and favorable exchange rates.',
    bestTime: 'Oct – Apr',
    avgPerDay: 70,
    highlights: ['Table Mountain hikes', 'Cape Peninsula tours', 'Local food markets'],
    scene: 'coast',
    sceneCaption: 'Two-ocean sea mist',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Cape Town coastline beneath Table Mountain',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 30% 25%, rgba(251,146,60,0.9) 0%, rgba(251,146,60,0) 55%), radial-gradient(at 80% 80%, rgba(37,99,235,0.9) 0%, rgba(37,99,235,0) 60%), linear-gradient(135deg, #7c2d12 0%, #0c4a6e 100%)',
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    vibe: 'Social',
    vibeColor: 'from-pink-400 to-amber-400',
    nearby: 41,
    desc: 'Beach mornings, Gaudí afternoons, late dinners on the plaza. Easy to meet other travelers without trying.',
    bestTime: 'May – Jun · Sep',
    avgPerDay: 105,
    highlights: ['Gaudí architecture', 'Tapas walks', 'Mediterranean sailing'],
    scene: 'sunglow',
    sceneCaption: 'Mediterranean light',
    image: 'https://images.unsplash.com/photo-1711534283558-812f4dadb433?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Barcelona city lights viewed from above',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 20%, rgba(244,114,182,0.9) 0%, rgba(244,114,182,0) 55%), radial-gradient(at 85% 85%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 60%), linear-gradient(135deg, #831843 0%, #78350f 100%)',
  },
  {
    id: 'reykjavik',
    name: 'Reykjavík',
    country: 'Iceland',
    vibe: 'Otherworldly',
    vibeColor: 'from-cyan-400 to-violet-500',
    nearby: 7,
    desc: 'Safe enough to wander at 2am, small enough to learn in a weekend, wild enough to see auroras from the city.',
    bestTime: 'Sep – Mar',
    avgPerDay: 160,
    highlights: ['Northern lights tours', 'Geothermal lagoons', 'Golden Circle trips'],
    scene: 'aurora',
    sceneCaption: 'Aurora over the harbor',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Icelandic landscape near Reykjavík',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 30%, rgba(34,211,238,0.85) 0%, rgba(34,211,238,0) 55%), radial-gradient(at 80% 85%, rgba(139,92,246,0.85) 0%, rgba(139,92,246,0) 60%), linear-gradient(135deg, #0c4a6e 0%, #1e1b4b 100%)',
  },
];

const Destinations = ({ rotationDate = new Date() }) => {
  const orderedDestinations = rotateForDate(DESTINATIONS, rotationDate);

  return (
    <section id="destinations" className="relative py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 lg:mb-16">
          <div className="max-w-2xl">
            <span className="inline-block text-[11px] font-semibold tracking-[0.22em] text-teal-600 dark:text-teal-400 uppercase mb-4">
              The atlas
            </span>
            <h2 className="text-balance text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold text-slate-900 dark:text-white leading-[1.1]">
              Where solo travelers <span className="font-serif-italic bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">thrive</span>.
            </h2>
          </div>
          <p className="md:max-w-sm text-pretty text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Hand-picked cities that are safe, social, and easy to navigate on your own — ranked by the SoloWay community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {orderedDestinations.map((d) => (
            <Link
              key={d.id}
              to={`/destinations/${d.id}`}
              className="group block bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_24px_50px_-20px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Atmospheric gradient header */}
              <div
                className="relative h-44 overflow-hidden"
                style={{ backgroundImage: d.gradient }}
              >
                <img
                  src={d.image}
                  alt={d.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: d.imagePosition }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/45" />
                <DestinationScene scene={d.scene} compact className="opacity-80" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold tracking-[0.18em] uppercase ring-1 ring-inset ring-white/20">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${d.vibeColor}`} />
                    {d.vibe}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold ring-1 ring-inset ring-white/20 tabular-nums">
                    <Users className="w-3 h-3" />
                    +{d.nearby}
                  </span>
                </div>
                <ArrowUpRight className="absolute bottom-4 right-4 w-4 h-4 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {d.name}
                </h3>
                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
                  {d.country}
                </p>
                <p className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                  {d.desc}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 dark:text-slate-500">Best time</div>
                    <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 tabular-nums mt-0.5">{d.bestTime}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 dark:text-slate-500">Avg / day</div>
                    <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 tabular-nums mt-0.5">${d.avgPerDay}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
