import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';
import DestinationScene from './DestinationScene';
import { ATLAS_CARD_COUNT, selectForDate } from '../utils/destinationRotation';

/**
 * Full atlas pool. The homepage shows {@link ATLAS_CARD_COUNT} of these each
 * day (Eastern midnight), advancing through the pool so visitors see new
 * cities — not just a reordered list of the same six.
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
  {
    id: 'florence',
    name: 'Florence',
    country: 'Italy',
    vibe: 'Artful',
    vibeColor: 'from-rose-400 to-amber-400',
    nearby: 19,
    desc: 'Renaissance streets, aperitivo hours, and galleries you can linger in alone without feeling rushed.',
    bestTime: 'Apr – Jun · Sep',
    avgPerDay: 110,
    highlights: ['Uffizi Gallery', 'Tuscan wine', 'Duomo climb'],
    scene: 'petals',
    sceneCaption: 'Oltrarno evening light',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Florence skyline with the Duomo',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 25%, rgba(251,113,133,0.85) 0%, rgba(251,113,133,0) 55%), radial-gradient(at 80% 80%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 60%), linear-gradient(135deg, #881337 0%, #78350f 100%)',
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    vibe: 'Electric',
    vibeColor: 'from-amber-400 to-teal-400',
    nearby: 28,
    desc: 'Temples at dawn, street food until late, and a transit system that makes solo exploring effortless.',
    bestTime: 'Nov – Feb',
    avgPerDay: 45,
    highlights: ['Grand Palace', 'Floating markets', 'Rooftop bars'],
    scene: 'canopy',
    sceneCaption: 'Chao Phraya heat haze',
    image: 'https://images.unsplash.com/photo-1768392810963-017c92313d79?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Wat Arun temple at sunset in Bangkok',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 30%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 55%), radial-gradient(at 80% 75%, rgba(20,184,166,0.85) 0%, rgba(20,184,166,0) 60%), linear-gradient(135deg, #78350f 0%, #134e4a 100%)',
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    vibe: 'Grounded',
    vibeColor: 'from-emerald-400 to-teal-400',
    nearby: 31,
    desc: 'Rice terraces, temple sunrises, and a coworking/café circuit built for travelers on their own clock.',
    bestTime: 'Apr – Oct',
    avgPerDay: 50,
    highlights: ['Rice terraces', 'Temple sunrise', 'Beach clubs'],
    scene: 'coast',
    sceneCaption: 'Island monsoon light',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Balinese rice terraces',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 30%, rgba(52,211,153,0.85) 0%, rgba(52,211,153,0) 55%), radial-gradient(at 80% 80%, rgba(20,184,166,0.85) 0%, rgba(20,184,166,0) 60%), linear-gradient(135deg, #064e3b 0%, #0c4a6e 100%)',
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    vibe: 'Sensory',
    vibeColor: 'from-orange-400 to-rose-500',
    nearby: 14,
    desc: 'Souks, riads, and Atlas day trips — stay in a well-located medina base and the city opens up solo.',
    bestTime: 'Mar – May · Oct',
    avgPerDay: 60,
    highlights: ['Medina souks', 'Riads', 'Atlas day trips'],
    scene: 'sunglow',
    sceneCaption: 'Medina dusk spice',
    image: 'https://images.unsplash.com/photo-1773500164244-d79b2d29e29c?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Marrakech medina at dusk',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 25%, rgba(251,146,60,0.9) 0%, rgba(251,146,60,0) 55%), radial-gradient(at 80% 80%, rgba(244,63,94,0.85) 0%, rgba(244,63,94,0) 60%), linear-gradient(135deg, #7c2d12 0%, #881337 100%)',
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    vibe: 'Kinetic',
    vibeColor: 'from-sky-400 to-indigo-500',
    nearby: 52,
    desc: 'Museums, neighborhoods, and late kitchens — a city where dining alone is a flex, not a compromise.',
    bestTime: 'Apr – Jun · Sep – Nov',
    avgPerDay: 180,
    highlights: ['Broadway', 'Central Park', 'Food halls'],
    scene: 'sunglow',
    sceneCaption: 'Manhattan street glow',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Manhattan skyline',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 20%, rgba(56,189,248,0.85) 0%, rgba(56,189,248,0) 55%), radial-gradient(at 80% 85%, rgba(99,102,241,0.85) 0%, rgba(99,102,241,0) 60%), linear-gradient(135deg, #0c4a6e 0%, #312e81 100%)',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    vibe: 'Classic',
    vibeColor: 'from-indigo-400 to-rose-400',
    nearby: 38,
    desc: 'Café tables for one, museum mornings, and Seine walks that never ask you to share the moment.',
    bestTime: 'May – Jun · Sep – Oct',
    avgPerDay: 150,
    highlights: ['Museum mornings', 'Seine walks', 'Bistro nights'],
    scene: 'petals',
    sceneCaption: 'Left Bank soft rain',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Paris skyline with the Eiffel Tower',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 30%, rgba(129,140,248,0.85) 0%, rgba(129,140,248,0) 55%), radial-gradient(at 80% 75%, rgba(244,114,182,0.85) 0%, rgba(244,114,182,0) 60%), linear-gradient(135deg, #312e81 0%, #831843 100%)',
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    country: 'Argentina',
    vibe: 'Passionate',
    vibeColor: 'from-rose-400 to-amber-400',
    nearby: 24,
    desc: 'Palermo cafés, late dinners, and tango nights where solo travelers are the default guest.',
    bestTime: 'Mar – May · Sep – Nov',
    avgPerDay: 55,
    highlights: ['Palermo cafés', 'Tango shows', 'Steak houses'],
    scene: 'sunglow',
    sceneCaption: 'Palermo night breeze',
    image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Buenos Aires street at night',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 25%, rgba(244,114,182,0.85) 0%, rgba(244,114,182,0) 55%), radial-gradient(at 85% 80%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 60%), linear-gradient(135deg, #881337 0%, #78350f 100%)',
  },
  {
    id: 'seoul',
    name: 'Seoul',
    country: 'South Korea',
    vibe: 'Neon',
    vibeColor: 'from-violet-400 to-pink-400',
    nearby: 27,
    desc: 'Night markets, palace mornings, and a metro that makes every neighborhood feel walkable alone.',
    bestTime: 'Apr – May · Sep – Oct',
    avgPerDay: 85,
    highlights: ['Night markets', 'Palace walks', 'Han river sunsets'],
    scene: 'sunglow',
    sceneCaption: 'Han River neon dusk',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Seoul cityscape at night',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 25%, rgba(167,139,250,0.85) 0%, rgba(167,139,250,0) 55%), radial-gradient(at 80% 80%, rgba(244,114,182,0.85) 0%, rgba(244,114,182,0) 60%), linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
  },
  {
    id: 'prague',
    name: 'Prague',
    country: 'Czech Republic',
    vibe: 'Storybook',
    vibeColor: 'from-amber-400 to-red-400',
    nearby: 21,
    desc: 'Castle views, beer halls, and old-town streets that reward wandering without a plan.',
    bestTime: 'May – Sep',
    avgPerDay: 75,
    highlights: ['Old Town square', 'Castle views', 'Beer halls'],
    scene: 'petals',
    sceneCaption: 'Vltava morning mist',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Prague old town and Charles Bridge',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 30%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 55%), radial-gradient(at 80% 75%, rgba(248,113,113,0.85) 0%, rgba(248,113,113,0) 60%), linear-gradient(135deg, #78350f 0%, #7f1d1d 100%)',
  },
];

const Destinations = ({ rotationDate = new Date() }) => {
  const orderedDestinations = selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, rotationDate);

  return (
    <section id="destinations" className="relative bg-slate-50 pb-24 pt-16 dark:bg-slate-900 lg:pb-32 lg:pt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 lg:mb-16">
          <div className="max-w-2xl">
            <span className="inline-block text-[11px] font-semibold tracking-[0.22em] text-teal-600 dark:text-teal-400 uppercase mb-4">
              The atlas · refreshes daily
            </span>
            <h2 className="text-balance text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold text-slate-900 dark:text-white leading-[1.1]">
              Where solo travelers <span className="font-serif-italic bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">thrive</span>.
            </h2>
          </div>
          <p className="md:max-w-sm text-pretty text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
            A fresh set of hand-picked cities every day — safe, social, and easy to navigate on your own.
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
