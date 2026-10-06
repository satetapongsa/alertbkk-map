import { Incident, ConfidenceLevel } from '@/types/intelligence';

export interface ProvenanceDetails {
  source: string;
  sourceType: string;
  firstSeen: string;
  lastUpdated: string;
  confidenceRating: ConfidenceLevel;
  confidenceScore: number;
  sourceCount: number;
  sourceUrl: string;
  license: string;
  isDemo: boolean;
}

/**
 * ============================================================================
 * 10. SOURCE PROVENANCE & CONFIDENCE RATING
 * Evaluates authenticity, independent source agreements, and lineage for all incidents.
 * Ratings: LOW | MEDIUM | HIGH | VERY HIGH
 * ============================================================================
 */
export class SourceProvenanceEngine {
  /**
   * Evaluates numerical confidence (0.0 - 1.0) into discrete intelligence confidence tiers:
   * LOW (< 0.70)
   * MEDIUM (0.70 - 0.84)
   * HIGH (0.85 - 0.94)
   * VERY HIGH (>= 0.95)
   */
  public static classifyConfidence(score: number, sourceCount: number = 1): ConfidenceLevel {
    // Multiple agreeing sources elevate confidence rating
    const effectiveScore = score + (sourceCount > 1 ? (sourceCount - 1) * 0.04 : 0);

    if (effectiveScore >= 0.95) return 'VERY HIGH';
    if (effectiveScore >= 0.85) return 'HIGH';
    if (effectiveScore >= 0.70) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generates formatted provenance information for an incident
   */
  public static getIncidentProvenance(inc: Incident): ProvenanceDetails {
    const confidenceRating = this.classifyConfidence(inc.confidence, inc.source_count);

    return {
      source: inc.source || 'Public Feed',
      sourceType: inc.source_type || 'Open Data',
      firstSeen: inc.first_seen || inc.reported_at || new Date().toISOString(),
      lastUpdated: inc.last_updated || inc.updated_at || new Date().toISOString(),
      confidenceRating,
      confidenceScore: inc.confidence,
      sourceCount: inc.source_count || 1,
      sourceUrl: inc.source_url || 'https://mirrix.intel/verified',
      license: 'Public Open Data License',
      isDemo: Boolean(inc.is_demo),
    };
  }

  /**
   * Format timestamp to ICT (Indochina Time / UTC+7) e.g. "21:31 ICT"
   */
  public static formatICTTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      const timeStr = date.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${timeStr} ICT`;
    } catch {
      return '21:30 ICT';
    }
  }
}
