/** City-center coordinates for live destination pages and map fallbacks. */
export const DESTINATION_COORDINATES = {
  medellin: { lat: 6.2476, lng: -75.5658, label: 'Medellín' },
  lisbon: { lat: 38.7223, lng: -9.1393, label: 'Lisbon' },
  kyoto: { lat: 35.0116, lng: 135.7681, label: 'Kyoto' },
  'cape-town': { lat: -33.9249, lng: 18.4241, label: 'Cape Town' },
  barcelona: { lat: 41.3874, lng: 2.1686, label: 'Barcelona' },
  reykjavik: { lat: 64.1466, lng: -21.9426, label: 'Reykjavik' },
  florence: { lat: 43.7696, lng: 11.2558, label: 'Florence' },
  bangkok: { lat: 13.7563, lng: 100.5018, label: 'Bangkok' },
  bali: { lat: -8.4095, lng: 115.1889, label: 'Bali' },
  marrakech: { lat: 31.6295, lng: -7.9811, label: 'Marrakech' },
  'new-york': { lat: 40.7128, lng: -74.006, label: 'New York' },
  paris: { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'buenos-aires': { lat: -34.6037, lng: -58.3816, label: 'Buenos Aires' },
  seoul: { lat: 37.5665, lng: 126.978, label: 'Seoul' },
  prague: { lat: 50.0755, lng: 14.4378, label: 'Prague' },
};

export function getDestinationCoordinates(destinationSlug) {
  return DESTINATION_COORDINATES[destinationSlug] || null;
}
