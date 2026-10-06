import * as turf from '@turf/turf';

/**
 * Generates a GeoJSON Polygon Feature representing the exact accuracy radius around the user.
 * @param lng Longitude
 * @param lat Latitude
 * @param accuracyMeters Accuracy radius in meters from Geolocation API
 */
export function generateAccuracyCircleGeoJSON(
  lng: number,
  lat: number,
  accuracyMeters: number
): GeoJSON.Feature<GeoJSON.Polygon> {
  const radiusKm = Math.max(accuracyMeters, 2) / 1000;
  return turf.circle([lng, lat], radiusKm, {
    steps: 64,
    units: 'kilometers',
    properties: {
      accuracy: accuracyMeters,
    },
  });
}

/**
 * Generates a GeoJSON Polygon Feature representing a tactical circle (e.g. Scan Radius, Coverage).
 */
export function generateCircleGeoJSON(
  lng: number,
  lat: number,
  radiusMeters: number,
  properties: Record<string, unknown> = {}
): GeoJSON.Feature<GeoJSON.Polygon> {
  const radiusKm = Math.max(radiusMeters, 2) / 1000;
  return turf.circle([lng, lat], radiusKm, {
    steps: 64,
    units: 'kilometers',
    properties,
  });
}
