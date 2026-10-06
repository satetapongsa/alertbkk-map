import { IncidentSeverity, IncidentType } from '@/types/intelligence';

export interface AIClassificationResult {
  incident_type: IncidentType;
  location: string;
  severity: IncidentSeverity;
  confidence: number;
  summary: string;
  evidence: string;
}

/**
 * AI Event Classifier Pipeline
 * Parses raw multilingual incident reports (Thai & English)
 * Strictly strictly safety-focused: NO facial recognition, NO personal surveillance.
 */
export class AIEventClassifier {
  private static LOCATION_DICTIONARY: Record<string, { lat: number; lng: number; district: string }> = {
    asok: { lat: 13.7372, lng: 100.5604, district: 'Watthana' },
    อโศก: { lat: 13.7372, lng: 100.5604, district: 'Watthana' },
    sukhumvit: { lat: 13.7389, lng: 100.5601, district: 'Watthana' },
    สุขุมวิท: { lat: 13.7389, lng: 100.5601, district: 'Watthana' },
    'rama ix': { lat: 13.7578, lng: 100.5661, district: 'Huai Khwang' },
    พระราม9: { lat: 13.7578, lng: 100.5661, district: 'Huai Khwang' },
    'พระราม 9': { lat: 13.7578, lng: 100.5661, district: 'Huai Khwang' },
    silom: { lat: 13.7287, lng: 100.5342, district: 'Bang Rak' },
    สีลม: { lat: 13.7287, lng: 100.5342, district: 'Bang Rak' },
    siam: { lat: 13.7466, lng: 100.5348, district: 'Pathum Wan' },
    สยาม: { lat: 13.7466, lng: 100.5348, district: 'Pathum Wan' },
    chatuchak: { lat: 13.8037, lng: 100.5539, district: 'Chatuchak' },
    จตุจักร: { lat: 13.8037, lng: 100.5539, district: 'Chatuchak' },
    phetchaburi: { lat: 13.7505, lng: 100.5368, district: 'Ratchathewi' },
    เพชรบุรี: { lat: 13.7505, lng: 100.5368, district: 'Ratchathewi' },
    bangkapi: { lat: 13.7658, lng: 100.6475, district: 'Bang Kapi' },
    บางกะปิ: { lat: 13.7658, lng: 100.6475, district: 'Bang Kapi' },
  };

  public static classifyReport(rawText: string): AIClassificationResult {
    const textLower = rawText.toLowerCase();

    // 1. Detect Incident Type
    let type: IncidentType = 'OTHER';
    if (
      textLower.includes('ชน') ||
      textLower.includes('accident') ||
      textLower.includes('collision') ||
      textLower.includes('crash')
    ) {
      type = 'ACCIDENT';
    } else if (
      textLower.includes('ไฟไหม้') ||
      textLower.includes('fire') ||
      textLower.includes('smoke') ||
      textLower.includes('เพลิง')
    ) {
      type = 'FIRE';
    } else if (
      textLower.includes('น้ำท่วม') ||
      textLower.includes('flood') ||
      textLower.includes('water level') ||
      textLower.includes('ขัง')
    ) {
      type = 'FLOOD';
    } else if (
      textLower.includes('ปิดถนน') ||
      textLower.includes('closure') ||
      textLower.includes('block')
    ) {
      type = 'ROAD_CLOSURE';
    } else if (
      textLower.includes('รถติด') ||
      textLower.includes('traffic') ||
      textLower.includes('jam') ||
      textLower.includes('congestion')
    ) {
      type = 'TRAFFIC';
    } else if (
      textLower.includes('พายุ') ||
      textLower.includes('storm') ||
      textLower.includes('rain')
    ) {
      type = 'STORM';
    }

    // 2. Extract Location
    let matchedLocation = 'Bangkok Metropolitan Area';
    for (const [key] of Object.entries(this.LOCATION_DICTIONARY)) {
      if (textLower.includes(key)) {
        matchedLocation = key.toUpperCase();
        break;
      }
    }

    // 3. Extract Severity
    let severity: IncidentSeverity = 'MEDIUM';
    if (
      textLower.includes('รุนแรง') ||
      textLower.includes('critical') ||
      textLower.includes('เสียชีวิต') ||
      textLower.includes('fatal') ||
      textLower.includes('ระเบิด')
    ) {
      severity = 'CRITICAL';
    } else if (
      textLower.includes('หนัก') ||
      textLower.includes('high') ||
      textLower.includes('3 คัน') ||
      textLower.includes('บาดเจ็บ') ||
      textLower.includes('ไฟลาม')
    ) {
      severity = 'HIGH';
    } else if (textLower.includes('เล็กน้อย') || textLower.includes('minor') || textLower.includes('low')) {
      severity = 'LOW';
    }

    // Confidence Calculation
    const confidence = Math.min(0.96, 0.75 + (type !== 'OTHER' ? 0.12 : 0) + (matchedLocation !== 'Bangkok Metropolitan Area' ? 0.08 : 0));

    return {
      incident_type: type,
      location: matchedLocation,
      severity,
      confidence,
      summary: `Automated detection: ${type} at ${matchedLocation} [Severity: ${severity}]`,
      evidence: `Syntactic keyword trigger analysis: detected linguistic markers in source text "${rawText.slice(0, 80)}"`,
    };
  }
}
