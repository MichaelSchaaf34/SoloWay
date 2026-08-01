import { DESTINATIONS } from '../components/Destinations';
import { getDestinationIds } from '../data/activityCatalog';

/**
 * Destinations that have curated activity fallbacks and/or Ticketmaster event
 * lookups. Atlas editorial cards in DESTINATIONS are the source of truth;
 * catalog-only stubs can be added here for cities that are not yet on the atlas.
 */
const CATALOG_ONLY = {};

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
