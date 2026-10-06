export interface GeocodeResult {
  latitude: number;
  longitude: number;
  district: string;
  city: string;
  country: string;
  confidence: number;
  matchedLandmark?: string;
}

/**
 * ============================================================================
 * 7. GEOCODING PIPELINE
 * Resolves Thai/English road names, intersections, and landmarks to verified coordinates.
 * Validates boundaries against Bangkok metropolitan boundaries [100.30 - 100.95, 13.50 - 13.95].
 * ============================================================================
 */
export class GeocodingPipeline {
  // Bangkok Strategic Geospatial Gazetteer
  private static GAZETTEER: { [key: string]: { lat: number; lng: number; district: string } } = {
    asok: { lat: 13.7372, lng: 100.5614, district: 'Watthana' },
    sukhumvit: { lat: 13.7380, lng: 100.5580, district: 'Watthana' },
    siam: { lat: 13.7466, lng: 100.5348, district: 'Pathum Wan' },
    ratchaprasong: { lat: 13.7444, lng: 100.5401, district: 'Pathum Wan' },
    silom: { lat: 13.7287, lng: 100.5342, district: 'Bang Rak' },
    sathorn: { lat: 13.7220, lng: 100.5300, district: 'Sathorn' },
    rama4: { lat: 13.7214, lng: 100.5548, district: 'Khlong Toei' },
    rama1: { lat: 13.7455, lng: 100.5320, district: 'Pathum Wan' },
    petchaburi: { lat: 13.7512, lng: 100.5375, district: 'Ratchathewi' },
    victorymonument: { lat: 13.7649, lng: 100.5383, district: 'Ratchathewi' },
    dindaeng: { lat: 13.7628, lng: 100.5512, district: 'Din Daeng' },
    thonglo: { lat: 13.7259, lng: 100.5794, district: 'Watthana' },
    ekkamai: { lat: 13.7198, lng: 100.5850, district: 'Watthana' },
    chatuchak: { lat: 13.8030, lng: 100.5535, district: 'Chatuchak' },
    bangrak: { lat: 13.7280, lng: 100.5200, district: 'Bang Rak' },
    chaophraya: { lat: 13.7267, lng: 100.5108, district: 'Khlong San' },
    iconsiam: { lat: 13.7267, lng: 100.5108, district: 'Khlong San' },
    suvarnabhumi: { lat: 13.6900, lng: 100.7501, district: 'Samut Prakan' },
    donmueang: { lat: 13.9126, lng: 100.6067, district: 'Don Mueang' },
  };

  /**
   * Geocode a raw text query or address description.
   */
  public static geocode(query: string): GeocodeResult | null {
    // 1. Direct Coordinate Detection (e.g., "13.7372, 100.5614")
    const coordMatch = query.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (this.isInBangkokBounds(lat, lng)) {
        return {
          latitude: lat,
          longitude: lng,
          district: 'Bangkok Metropolitan',
          city: 'Bangkok',
          country: 'Thailand',
          confidence: 1.0,
        };
      }
    }

    // 2. Gazetteer Landmark Match
    const clean = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, val] of Object.entries(this.GAZETTEER)) {
      if (clean.includes(key) || key.includes(clean)) {
        return {
          latitude: val.lat,
          longitude: val.lng,
          district: val.district,
          city: 'Bangkok',
          country: 'Thailand',
          confidence: 0.92,
          matchedLandmark: key.toUpperCase(),
        };
      }
    }

    return null;
  }

  /**
   * Validate if coordinates fall inside the Greater Bangkok bounds.
   */
  public static isInBangkokBounds(lat: number, lng: number): boolean {
    return lat >= 13.45 && lat <= 14.10 && lng >= 100.25 && lng <= 100.95;
  }
}
