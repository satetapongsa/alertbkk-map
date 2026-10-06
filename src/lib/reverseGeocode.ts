/**
 * Reverse Geocoding Service Abstraction
 * Resolves raw coordinates [lat, lng] into district, city, and country.
 * Operates non-blockingly so raw coordinates always display instantly.
 */

import { calculateDistanceMeters } from './spatial';

export interface GeocodeResult {
  district?: string;
  subdistrict?: string;
  road?: string;
  city?: string;
  province?: string;
  country?: string;
  formatted_address?: string;
}

export interface IReverseGeocodeProvider {
  providerName: string;
  reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null>;
}

/**
 * High-speed local Bangkok & Thailand district boundary resolver
 */
class LocalBangkokGeocodeProvider implements IReverseGeocodeProvider {
  providerName = 'Bangkok Metro District Index';

  private districts = [
    { name: 'Pathum Wan', lat: 13.7444, lng: 100.5348, radius: 2500 },
    { name: 'Watthana', lat: 13.7389, lng: 100.5601, radius: 3500 },
    { name: 'Bang Rak', lat: 13.7287, lng: 100.5342, radius: 2200 },
    { name: 'Khlong Toei', lat: 13.7198, lng: 100.5562, radius: 3000 },
    { name: 'Ratchathewi', lat: 13.7580, lng: 100.5368, radius: 2500 },
    { name: 'Huai Khwang', lat: 13.7788, lng: 100.5752, radius: 3500 },
    { name: 'Chatuchak', lat: 13.8037, lng: 100.5539, radius: 4500 },
    { name: 'Phra Nakhon', lat: 13.7563, lng: 100.4965, radius: 2200 },
    { name: 'Bangkok Noi', lat: 13.7584, lng: 100.4856, radius: 2500 },
    { name: 'Khlong San', lat: 13.7267, lng: 100.5108, radius: 2200 },
    { name: 'Sathorn', lat: 13.7180, lng: 100.5280, radius: 2500 },
    { name: 'Don Mueang', lat: 13.9126, lng: 100.6067, radius: 5000 },
    { name: 'Bang Phli', lat: 13.6900, lng: 100.7501, radius: 6000 },
  ];

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    // Check if within Thailand approximate bounds
    const isThailand = lat >= 5.5 && lat <= 20.5 && lng >= 97.3 && lng <= 105.7;
    if (!isThailand) {
      return {
        city: 'Global',
        country: 'International',
        formatted_address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
    }

    let closest = this.districts[0];
    let minDistance = Infinity;

    for (const d of this.districts) {
      const dist = calculateDistanceMeters(lat, lng, d.lat, d.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = d;
      }
    }

    if (minDistance <= 10000) {
      return {
        district: closest.name,
        city: 'Bangkok',
        province: 'Bangkok',
        country: 'Thailand',
        formatted_address: `${closest.name}, Bangkok, Thailand`,
      };
    }

    return {
      city: 'Thailand Sector',
      country: 'Thailand',
      formatted_address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  }
}

// Active provider instance (can be swapped with OSM Nominatim / Google Geocoding API if key provided)
const activeProvider: IReverseGeocodeProvider = new LocalBangkokGeocodeProvider();

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    return await activeProvider.reverseGeocode(lat, lng);
  } catch {
    return null;
  }
}
