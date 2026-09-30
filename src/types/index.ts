export type IncidentType =
  | 'FLOOD'        // 💧 น้ำท่วม
  | 'TRAFFIC'      // 🚗 รถติด
  | 'ACCIDENT'     // 🚨 อุบัติเหตุ
  | 'ROAD_CLOSED'  // 🚧 ถนนปิด
  | 'TRANSIT'      // 🚇 รถไฟฟ้าขัดข้อง
  | 'EMERGENCY'    // ⚠️ เหตุการณ์ฉุกเฉิน
  | 'GENERAL';     // 📍 รายงานทั่วไป

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'ACTIVE' | 'MONITORING' | 'RESOLVED' | 'EXPIRED';

export type SourceType = 'COMMUNITY' | 'EXTERNAL_API' | 'VERIFIED_AGENCY';

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'COMMUNITY_VERIFIED' | 'OFFICIAL_VERIFIED';

export type TimeFilter = 'LIVE' | '1H' | '3H' | '6H' | 'TODAY' | '24H' | '7D' | 'ALL';

export type TransitStatus = 'NORMAL' | 'DELAYED' | 'SERVICE_DISRUPTION' | 'SUSPENDED';

export interface FloodDetails {
  waterLevelCm?: number;
  waterLevelCategory: '<10cm' | '10-30cm' | '30-50cm' | '50-100cm' | '>100cm';
  smallCarPassable: boolean;
  largeTruckPassable: boolean;
  roadBlocked: boolean;
  strongCurrent: boolean;
  electricRisk: boolean;
}

export interface TrafficDetails {
  speedKmh?: number;
  queueLengthKm?: number;
  cause?: string;
  direction?: string;
  trafficLevel: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'STANDSTILL';
}

export interface TransitDetails {
  lineId: string;
  lineName: string;
  lineColor: string;
  stationName?: string;
  delayMinutes?: number;
  status: TransitStatus;
  disruptionSummary?: string;
}

export interface IncidentImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
}

export interface IncidentTimelineItem {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  user?: string;
}

export interface IncidentComment {
  id: string;
  userName: string;
  message: string;
  createdAt: string;
  isOfficial?: boolean;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  district?: string;
  province: string;
  severity: Severity;
  status: IncidentStatus;
  source: SourceType;
  confidence: ConfidenceLevel;
  
  // Verification metrics
  confirmCount: number;
  disputeCount: number;
  
  // Reporter
  createdById?: string;
  createdByName?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
  resolvedAt?: string;
  expiresAt?: string;

  // Rich metadata
  images: IncidentImage[];
  timeline: IncidentTimelineItem[];
  comments: IncidentComment[];
  
  // Category specific fields
  floodDetails?: FloodDetails;
  trafficDetails?: TrafficDetails;
  transitDetails?: TransitDetails;

  // UI state helper
  userAction?: 'CONFIRMED' | 'DISPUTED' | null;
}

export interface TransportStation {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  status: TransitStatus;
}

export interface TransportLine {
  id: string;
  name: string;
  nameEn: string;
  type: 'BTS' | 'MRT' | 'ARL' | 'SRT' | 'BUS';
  colorCode: string;
  status: TransitStatus;
  statusDetail?: string;
  updatedAt: string;
  affectedStations?: string[];
  coordinates: [number, number][]; // Polyline points for map rendering
  stations: TransportStation[];
}

export interface FilterOptions {
  types?: IncidentType[];
  severities?: Severity[];
  status?: IncidentStatus[];
  timeFilter: TimeFilter;
  searchQuery?: string;
  showHistorical?: boolean;
}

export interface AreaWatchZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  active: boolean;
}

export interface RealtimeMessage {
  type:
    | 'incident.created'
    | 'incident.updated'
    | 'incident.confirmed'
    | 'incident.disputed'
    | 'incident.resolved'
    | 'transport.updated';
  data: any;
  timestamp: string;
}

export interface UserSavedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  district?: string;
  isHome?: boolean;
  createdAt: string;
}

