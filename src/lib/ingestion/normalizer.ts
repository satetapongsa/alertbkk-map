import { Incident, IncidentType, IncidentSeverity } from '@/types/intelligence';

export interface RawIncidentPayload {
  raw_id?: string;
  headline?: string;
  text?: string;
  lat?: number;
  lng?: number;
  category?: string;
  source_name: string;
  source_url?: string;
  reported_time?: string;
  severity_hint?: string;
  district?: string;
}

/**
 * ============================================================================
 * 6. INCIDENT NORMALIZER
 * Normalizes disparate incoming multi-agency payloads into the uniform
 * MIRRIX Incident structure.
 * ============================================================================
 */
export class IncidentNormalizer {
  public static normalize(raw: RawIncidentPayload): Incident {
    const text = `${raw.headline || ''} ${raw.text || ''}`.trim();
    const type = this.detectIncidentType(text, raw.category);
    const severity = this.detectSeverity(text, raw.severity_hint);
    const confidence = this.computeInitialConfidence(raw.source_name);
    const now = new Date().toISOString();
    const timestamp = raw.reported_time || now;

    const id = raw.raw_id
      ? `inc_${raw.raw_id.replace(/[^a-zA-Z0-9_-]/g, '_')}`
      : `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id,
      type,
      title: raw.headline || this.generateTitle(type, raw.district),
      description: raw.text || raw.headline || 'Active geospatial intelligence event reported.',
      latitude: raw.lat || 13.7420, // Default to central Bangkok if not specified
      longitude: raw.lng || 100.5450,
      severity,
      confidence,
      source_count: 1,
      first_seen: timestamp,
      last_updated: now,
      source_url: raw.source_url || 'https://mirrix.intel/verified-source',
      district: raw.district || 'Bangkok Core',
      city: 'Bangkok',
      country: 'Thailand',
      status: 'ACTIVE',
      source: raw.source_name,
      reported_at: timestamp,
      updated_at: now,
    };
  }

  private static detectIncidentType(text: string, categoryHint?: string): IncidentType {
    const lower = text.toLowerCase();
    const hint = (categoryHint || '').toUpperCase();

    if (hint && ['ACCIDENT', 'FIRE', 'FLOOD', 'TRAFFIC', 'ROAD_CLOSURE', 'EMERGENCY'].includes(hint)) {
      return hint as IncidentType;
    }

    if (/ไฟไหม้|เพลิงไหม้|ควันไฟ|fire|flames|blaze|smoke/.test(lower)) {
      return 'FIRE';
    }
    if (/น้ำท่วม|น้ำรอระบาย|ท่วมขัง|flood|waterlog|submerged/.test(lower)) {
      return 'FLOOD';
    }
    if (/ชน|อุบัติเหตุ|พลิกคว่ำ|crash|collision|accident|rollover/.test(lower)) {
      return 'ACCIDENT';
    }
    if (/ปิดถนน|ปิดการจราจร|closure|blocked road|barricade/.test(lower)) {
      return 'ROAD_CLOSURE';
    }
    if (/รถติด|หนาแน่น|ชะลอตัว|traffic|congestion|gridlock|jam/.test(lower)) {
      return 'TRAFFIC';
    }
    if (/กู้ภัย|ฉุกเฉิน|บาดเจ็บ|emergency|rescue|paramedic|casualty/.test(lower)) {
      return 'EMERGENCY';
    }

    return 'OTHER';
  }

  private static detectSeverity(text: string, hint?: string): IncidentSeverity {
    if (hint && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(hint.toUpperCase())) {
      return hint.toUpperCase() as IncidentSeverity;
    }

    const lower = text.toLowerCase();
    if (/รุนแรง|เสียชีวิต|วิกฤต|ระเบิด|critical|fatal|explosion|catastrophic|major fire/.test(lower)) {
      return 'CRITICAL';
    }
    if (/บาดเจ็บ|ติดภายใน|กีดขวางทุกช่องทาง|high|severe|injuries|heavy damage/.test(lower)) {
      return 'HIGH';
    }
    if (/ชะลอตัว|เล็กน้อย|เฉี่ยวชน|minor|fender bender|slow/.test(lower)) {
      return 'LOW';
    }
    return 'MEDIUM';
  }

  private static computeInitialConfidence(source: string): number {
    const s = source.toLowerCase();
    if (s.includes('police') || s.includes('ddpm') || s.includes('bma')) {
      return 0.92;
    }
    if (s.includes('radio') || s.includes('cctv') || s.includes('sensor')) {
      return 0.88;
    }
    return 0.75;
  }

  private static generateTitle(type: IncidentType, district?: string): string {
    const loc = district ? `in ${district}` : 'in Bangkok';
    switch (type) {
      case 'ACCIDENT':
        return `Traffic Accident ${loc}`;
      case 'FIRE':
        return `Structural Fire Incident ${loc}`;
      case 'FLOOD':
        return `Localized Water Accumulation ${loc}`;
      case 'TRAFFIC':
        return `Severe Traffic Congestion ${loc}`;
      case 'ROAD_CLOSURE':
        return `Road Closure ${loc}`;
      default:
        return `Civil Safety Dispatch ${loc}`;
    }
  }
}
