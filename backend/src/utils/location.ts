// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Find nearby locations within radius
export const findNearbyLocations = (
  centerLat: number,
  centerLon: number,
  locations: Array<{ id: string; latitude: number; longitude: number }>,
  radiusKm: number = 50
): Array<{ id: string; distance: number }> => {
  return locations
    .map(location => ({
      id: location.id,
      distance: calculateDistance(centerLat, centerLon, location.latitude, location.longitude),
    }))
    .filter(result => result.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

// Validate coordinates
export const isValidCoordinate = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

// Geocode city/country to coordinates (mock implementation)
// In production, use Google Maps API or similar
export const geocodeLocation = async (
  city: string,
  country: string
): Promise<{ latitude: number; longitude: number } | null> => {
  const locations: Record<string, [number, number]> = {
    'bangalore_india': [12.9716, 77.5946],
    'delhi_india': [28.7041, 77.1025],
    'mumbai_india': [19.0760, 72.8777],
    'hyderabad_india': [17.3850, 78.4867],
    'pune_india': [18.5204, 73.8567],
    'london_uk': [51.5074, -0.1278],
    'newyork_usa': [40.7128, -74.0060],
    'sydney_australia': [-33.8688, 151.2093],
  };

  const key = `${city.toLowerCase().replace(/\s+/g, '')}_${country.toLowerCase().replace(/\s+/g, '')}`;
  const coords = locations[key];

  if (coords) {
    return { latitude: coords[0], longitude: coords[1] };
  }

  return null;
};
