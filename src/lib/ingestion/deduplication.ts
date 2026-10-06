import { Incident } from '@/types/intelligence';
import { calculateDistanceMeters } from '../spatial';

export interface DeduplicationCandidate {
  raw_title: string;
  raw_description: string;
  latitude: number;
  longitude: number;
  reported_at: string;
  source: string;
  source_url: string;
}

export class IncidentDeduplicationEngine {
  private static SPATIAL_THRESHOLD_METERS = 600; // Incidents within 600m
  private static TEMPORAL_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

  /**
   * Checks if an incoming candidate matches any existing active incident.
   * If matched, merges and increases confidence and source count.
   */
  public static findDuplicateMatch(
    candidate: DeduplicationCandidate,
    existingIncidents: Incident[]
  ): Incident | null {
    const candidateTime = new Date(candidate.reported_at).getTime();

    for (const inc of existingIncidents) {
      if (inc.status === 'RESOLVED') continue;

      // 1. Spatial proximity check
      const distance = calculateDistanceMeters(
        candidate.latitude,
        candidate.longitude,
        inc.latitude,
        inc.longitude
      );

      if (distance > this.SPATIAL_THRESHOLD_METERS) {
        continue;
      }

      // 2. Temporal proximity check
      const incTime = new Date(inc.reported_at).getTime();
      const timeDiff = Math.abs(candidateTime - incTime);
      if (timeDiff > this.TEMPORAL_THRESHOLD_MS) {
        continue;
      }

      // 3. Keyword / semantic similarity check
      const candKeywords = (candidate.raw_title + ' ' + candidate.raw_description).toLowerCase();
      const incKeywords = (inc.title + ' ' + inc.description).toLowerCase();

      // Check common tokens
      const candWords = candKeywords.split(/\s+/).filter((w) => w.length > 3);
      let matchCount = 0;
      for (const w of candWords) {
        if (incKeywords.includes(w)) {
          matchCount++;
        }
      }

      // If close distance (< 300m) or high keyword overlap
      if (distance < 300 || matchCount >= 1) {
        return inc;
      }
    }

    return null;
  }

  /**
   * Merges a matching candidate into the target incident
   */
  public static mergeIncident(target: Incident, candidate: DeduplicationCandidate): Incident {
    const newSourceCount = (target.source_count || 1) + 1;
    // Boost confidence score as more independent sources confirm the event
    const boostedConfidence = Math.min(0.99, Number((target.confidence + 0.05).toFixed(2)));

    return {
      ...target,
      source_count: newSourceCount,
      confidence: boostedConfidence,
      updated_at: new Date().toISOString(),
      description: `${target.description} (Cross-verified by ${candidate.source})`,
    };
  }
}
