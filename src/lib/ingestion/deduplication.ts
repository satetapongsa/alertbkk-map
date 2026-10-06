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

/**
 * ============================================================================
 * 8. INCIDENT DEDUPLICATION PIPELINE
 * Identifies duplicate reports across multiple independent authorities and feeds.
 * Merges reports, increments source_count, boosts confidence, and updates timestamps.
 * ============================================================================
 */
export class IncidentDeduplicationPipeline {
  private static SPATIAL_THRESHOLD_METERS = 350; // Incidents within 350m
  private static TEMPORAL_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes

  /**
   * Checks if an incoming candidate matches any existing active incident.
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
      const incTime = new Date(inc.first_seen || inc.reported_at || Date.now()).getTime();
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

      // If close distance (< 200m) or keyword overlap
      if (distance < 200 || matchCount >= 1) {
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
    const now = new Date().toISOString();

    return {
      ...target,
      source_count: newSourceCount,
      confidence: boostedConfidence,
      last_updated: now,
      updated_at: now,
      description: `${target.description} (Cross-verified by ${candidate.source})`,
    };
  }
}

// Backwards compatibility alias
export const IncidentDeduplicationEngine = IncidentDeduplicationPipeline;
