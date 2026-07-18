import { ACTIVITY_LOCATIONS } from '../data/activityLocations';
import { getDestinationCoordinates } from '../data/destinationCoordinates';

function hashString(value = '') {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function jitterAroundCenter(center, seed) {
  const hash = hashString(seed);
  return {
    lat: center.lat + ((hash % 100) - 50) * 0.0018,
    lng: center.lng + (((hash >> 8) % 100) - 50) * 0.0018,
  };
}

export function resolveExperienceLocation(item, destination) {
  if (!destination?.id) return null;

  const center = getDestinationCoordinates(destination.id);
  if (!center) return null;

  const catalogId = item.id?.startsWith('suggested-')
    ? item.id.replace('suggested-', '')
    : item.id;

  const explicit = ACTIVITY_LOCATIONS[catalogId];
  if (explicit) {
    return {
      lat: explicit.lat,
      lng: explicit.lng,
      label: explicit.label || item.title || item.locationName,
      country: destination.country,
      destinationName: destination.name,
    };
  }

  const seed = item.locationName || item.title || item.id || destination.id;
  const jittered = jitterAroundCenter(center, seed);

  return {
    ...jittered,
    label: item.locationName || item.title || center.label,
    country: destination.country,
    destinationName: destination.name,
  };
}
