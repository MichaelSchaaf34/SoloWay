import { DESTINATIONS } from '../components/Destinations';
import { getDestinationIds } from '../data/activityCatalog';

/**
 * Destinations that have curated activity fallbacks and/or Ticketmaster event
 * lookups. Merges the editorial DESTINATIONS cards with catalog-only cities.
 */

const CATALOG_ONLY = {
  florence: {
    id: 'florence',
    name: 'Florence',
    country: 'Italy',
    vibe: 'Art & Aperitivo',
    vibeColor: 'from-rose-400 to-amber-400',
    highlights: ['Uffizi Gallery', 'Tuscan wine', 'Duomo climb'],
    scene: 'petals',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Florence skyline with the Duomo',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 25%, rgba(251,113,133,0.85) 0%, rgba(251,113,133,0) 55%), radial-gradient(at 80% 80%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 60%), linear-gradient(135deg, #881337 0%, #78350f 100%)',
  },
  bangkok: {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    vibe: 'Street Food & Temples',
    vibeColor: 'from-amber-400 to-teal-400',
    highlights: ['Grand Palace', 'Floating markets', 'Rooftop bars'],
    scene: 'canopy',
    image: 'https://images.unsplash.com/photo-1768392810963-017c92313d79?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Wat Arun temple at sunset in Bangkok',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 30%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 55%), radial-gradient(at 80% 75%, rgba(20,184,166,0.85) 0%, rgba(20,184,166,0) 60%), linear-gradient(135deg, #78350f 0%, #134e4a 100%)',
  },
  bali: {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    vibe: 'Surf & Serenity',
    vibeColor: 'from-emerald-400 to-teal-400',
    highlights: ['Rice terraces', 'Temple sunrise', 'Beach clubs'],
    scene: 'coast',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Balinese rice terraces',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 30%, rgba(52,211,153,0.85) 0%, rgba(52,211,153,0) 55%), radial-gradient(at 80% 80%, rgba(20,184,166,0.85) 0%, rgba(20,184,166,0) 60%), linear-gradient(135deg, #064e3b 0%, #0c4a6e 100%)',
  },
  marrakech: {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    vibe: 'Souks & Spice',
    vibeColor: 'from-orange-400 to-rose-500',
    highlights: ['Medina souks', 'Riads', 'Atlas day trips'],
    scene: 'sunglow',
    image: 'https://images.unsplash.com/photo-1773500164244-d79b2d29e29c?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Marrakech medina at dusk',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 25%, rgba(251,146,60,0.9) 0%, rgba(251,146,60,0) 55%), radial-gradient(at 80% 80%, rgba(244,63,94,0.85) 0%, rgba(244,63,94,0) 60%), linear-gradient(135deg, #7c2d12 0%, #881337 100%)',
  },
  'new-york': {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    vibe: 'City That Never Sleeps',
    vibeColor: 'from-sky-400 to-indigo-500',
    highlights: ['Broadway', 'Central Park', 'Food halls'],
    scene: 'sunglow',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Manhattan skyline',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 20%, rgba(56,189,248,0.85) 0%, rgba(56,189,248,0) 55%), radial-gradient(at 80% 85%, rgba(99,102,241,0.85) 0%, rgba(99,102,241,0) 60%), linear-gradient(135deg, #0c4a6e 0%, #312e81 100%)',
  },
  paris: {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    vibe: 'Cafés & Culture',
    vibeColor: 'from-indigo-400 to-rose-400',
    highlights: ['Museum mornings', 'Seine walks', 'Bistro nights'],
    scene: 'petals',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Paris skyline with the Eiffel Tower',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 30%, rgba(129,140,248,0.85) 0%, rgba(129,140,248,0) 55%), radial-gradient(at 80% 75%, rgba(244,114,182,0.85) 0%, rgba(244,114,182,0) 60%), linear-gradient(135deg, #312e81 0%, #831843 100%)',
  },
  'buenos-aires': {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    country: 'Argentina',
    vibe: 'Tango & Steak',
    vibeColor: 'from-rose-400 to-amber-400',
    highlights: ['Palermo cafés', 'Tango shows', 'Steak houses'],
    scene: 'sunglow',
    image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Buenos Aires street at night',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 25%, rgba(244,114,182,0.85) 0%, rgba(244,114,182,0) 55%), radial-gradient(at 85% 80%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 60%), linear-gradient(135deg, #881337 0%, #78350f 100%)',
  },
  seoul: {
    id: 'seoul',
    name: 'Seoul',
    country: 'South Korea',
    vibe: 'K-Culture & Street Food',
    vibeColor: 'from-violet-400 to-pink-400',
    highlights: ['Night markets', 'Palace walks', 'Han river sunsets'],
    scene: 'sunglow',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Seoul cityscape at night',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 25% 25%, rgba(167,139,250,0.85) 0%, rgba(167,139,250,0) 55%), radial-gradient(at 80% 80%, rgba(244,114,182,0.85) 0%, rgba(244,114,182,0) 60%), linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
  },
  prague: {
    id: 'prague',
    name: 'Prague',
    country: 'Czech Republic',
    vibe: 'Castles & Beer',
    vibeColor: 'from-amber-400 to-red-400',
    highlights: ['Old Town square', 'Castle views', 'Beer halls'],
    scene: 'petals',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=82',
    imageAlt: 'Prague old town and Charles Bridge',
    imagePosition: 'center',
    gradient:
      'radial-gradient(at 20% 30%, rgba(251,191,36,0.85) 0%, rgba(251,191,36,0) 55%), radial-gradient(at 80% 75%, rgba(248,113,113,0.85) 0%, rgba(248,113,113,0) 60%), linear-gradient(135deg, #78350f 0%, #7f1d1d 100%)',
  },
};

const editorialById = new Map(DESTINATIONS.map(destination => [destination.id, destination]));

/** All destinations with live detail pages (experiences, events, or curated picks). */
export function getLiveDestinations() {
  return getDestinationIds()
    .map(id => editorialById.get(id) || CATALOG_ONLY[id])
    .filter(Boolean);
}

export function getLiveDestination(id) {
  return editorialById.get(id) || CATALOG_ONLY[id] || null;
}
