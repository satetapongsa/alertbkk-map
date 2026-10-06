import { calculateDistanceMeters, isPointInBBox, isPointInRadius } from '../spatial';
import { CameraSource, Incident, POI } from '@/types/intelligence';

export interface AreaScanBreakdown {
  radiusMeters: number;
  center: [number, number];
  cameras: number;
  incidents: number;
  hospitals: number;
  police: number;
  fire: number;
  traffic_alerts: number;
  entities: {
    cameras: CameraSource[];
    incidents: Incident[];
    pois: POI[];
  };
}

/**
 * ============================================================================
 * 12. POSTGIS SPATIAL QUERY ENGINE
 * Provides both in-memory geospatial execution and raw PostGIS SQL generation
 * for high-performance spatial indexing (ST_DWithin, ST_Contains, ST_MakeEnvelope).
 * ============================================================================
 */
export class PostGISSpatialQueryEngine {
  /**
   * PostGIS ST_DWithin: Finds all entities within radiusMeters from [centerLng, centerLat].
   */
  public static stDWithin<T extends { latitude: number; longitude: number }>(
    entities: T[],
    centerLng: number,
    centerLat: number,
    distanceMeters: number
  ): T[] {
    return entities.filter((item) =>
      isPointInRadius(item.latitude, item.longitude, centerLat, centerLng, distanceMeters)
    );
  }

  /**
   * PostGIS ST_MakeEnvelope: Finds all entities inside bounding box [minLng, minLat, maxLng, maxLat].
   */
  public static stBBox<T extends { latitude: number; longitude: number }>(
    entities: T[],
    bbox: [number, number, number, number]
  ): T[] {
    return entities.filter((item) => isPointInBBox(item.latitude, item.longitude, bbox));
  }

  /**
   * PostGIS Nearest Neighbor (kNN): Finds k closest entities ordered by distance.
   */
  public static findNearest<T extends { latitude: number; longitude: number }>(
    entities: T[],
    centerLng: number,
    centerLat: number,
    k: number = 5
  ): (T & { distance_meters: number })[] {
    return entities
      .map((item) => ({
        ...item,
        distance_meters: Math.round(
          calculateDistanceMeters(centerLat, centerLng, item.latitude, item.longitude)
        ),
      }))
      .sort((a, b) => a.distance_meters - b.distance_meters)
      .slice(0, k);
  }

  /**
   * Comprehensive Multi-Layer Area Scan (for 500m, 1km, 2km, 5km)
   */
  public static performAreaScan(
    centerLng: number,
    centerLat: number,
    radiusMeters: number,
    cameras: CameraSource[],
    incidents: Incident[],
    pois: POI[]
  ): AreaScanBreakdown {
    const nearbyCams = this.stDWithin(cameras, centerLng, centerLat, radiusMeters);
    const nearbyIncs = this.stDWithin(incidents, centerLng, centerLat, radiusMeters);
    const nearbyPois = this.stDWithin(pois, centerLng, centerLat, radiusMeters);

    return {
      radiusMeters,
      center: [centerLng, centerLat],
      cameras: nearbyCams.length,
      incidents: nearbyIncs.length,
      hospitals: nearbyPois.filter((p) => p.type === 'HOSPITAL').length,
      police: nearbyPois.filter((p) => p.type === 'POLICE').length,
      fire: nearbyPois.filter((p) => p.type === 'FIRE_STATION').length,
      traffic_alerts: nearbyIncs.filter((i) => i.type === 'TRAFFIC' || i.type === 'ACCIDENT').length,
      entities: {
        cameras: nearbyCams,
        incidents: nearbyIncs,
        pois: nearbyPois,
      },
    };
  }

  /**
   * Generate raw SQL for PostGIS execution
   */
  public static generateST_DWithinSQL(
    table: string,
    lng: number,
    lat: number,
    radiusMeters: number
  ): string {
    return `
      SELECT id, name, latitude, longitude,
             ST_Distance(geog, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS distance_meters
      FROM ${table}
      WHERE ST_DWithin(geog, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})
      ORDER BY distance_meters ASC;
    `.trim();
  }
}
