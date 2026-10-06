import { DataAgeStatus } from '@/types/intelligence';

/**
 * ============================================================================
 * 9. DATA AGE ENGINE
 * Computes exact chronological age and reliability status for all geospatial objects.
 * Statuses: LIVE | RECENT | STALE | OFFLINE
 * Formats: 3 SEC AGO, 18 SEC AGO, 2 MIN AGO, 14 MIN AGO
 * ============================================================================
 */
export class DataAgeEngine {
  /**
   * Classify data age into operational readiness buckets:
   * - LIVE: < 60 seconds
   * - RECENT: 1 to 15 minutes
   * - STALE: 15 to 60 minutes
   * - OFFLINE: > 60 minutes
   */
  public static classifyAge(timestampIsoOrMs: string | number): DataAgeStatus {
    const timeMs =
      typeof timestampIsoOrMs === 'number'
        ? timestampIsoOrMs
        : new Date(timestampIsoOrMs).getTime();

    if (isNaN(timeMs)) return 'OFFLINE';

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timeMs) / 1000));

    if (elapsedSeconds < 60) {
      return 'LIVE';
    }
    if (elapsedSeconds < 15 * 60) {
      return 'RECENT';
    }
    if (elapsedSeconds < 60 * 60) {
      return 'STALE';
    }
    return 'OFFLINE';
  }

  /**
   * Format relative tactical age string (e.g., "3 SEC AGO", "18 SEC AGO", "2 MIN AGO")
   */
  public static formatAge(timestampIsoOrMs: string | number): string {
    const timeMs =
      typeof timestampIsoOrMs === 'number'
        ? timestampIsoOrMs
        : new Date(timestampIsoOrMs).getTime();

    if (isNaN(timeMs)) return 'DATA UNAVAILABLE';

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timeMs) / 1000));

    if (elapsedSeconds < 5) {
      return 'JUST NOW';
    }
    if (elapsedSeconds < 60) {
      return `${elapsedSeconds} SEC AGO`;
    }

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes} MIN AGO`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
      return `${elapsedHours} HR AGO`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays} D AGO`;
  }

  /**
   * Formats camera age readout (e.g. "LIVE • UPDATED 4 SEC AGO")
   */
  public static formatCameraReadout(status: string, timestampIso: string): string {
    if (status === 'OFFLINE') return 'OFFLINE';
    const age = this.formatAge(timestampIso);
    return `${status} • UPDATED ${age}`;
  }
}
