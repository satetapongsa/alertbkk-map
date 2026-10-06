export type SourceHealthStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'STALE';

export type DataAgeStatus = 'LIVE' | 'RECENT' | 'STALE' | 'OFFLINE';

export type CameraStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'STALE' | 'UNKNOWN';

export type CameraType =
  | 'TRAFFIC'
  | 'PUBLIC_WEBCAM'
  | 'GOVERNMENT'
  | 'AIRPORT'
  | 'WEATHER'
  | 'PORT'
  | 'CITY'
  | 'HIGHWAY'
  | 'RAILWAY'
  | 'OTHER';

export interface DataSource {
  id: string;
  name: string;
  provider: string;
  type: string;
  url: string;
  license: string;
  public_access: boolean;
  embed_allowed: boolean;
  status: SourceHealthStatus;
  last_checked: string;
  last_success: string;
  latency: number; // latency in ms
  error_count: number;
  is_demo?: boolean;
}

export interface CameraSource {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: CameraType;
  source?: string;
  stream_url?: string;
  embed_url?: string;
  status: CameraStatus;
  last_verified?: string;
  license: string;
  provider: string;
  source_type: CameraType;
  source_url: string;
  thumbnail_url?: string;
  is_youtube?: boolean;
  youtube_video_id?: string;
  public_access: boolean;
  embedding_allowed: boolean;
  country: string;
  city: string;
  district: string;
  timezone: string;
  last_seen: string;
  last_checked: string;
  latency_ms?: number;
  data_age?: DataAgeStatus;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export type IncidentType =
  | 'ACCIDENT'
  | 'FIRE'
  | 'FLOOD'
  | 'TRAFFIC'
  | 'ROAD_CLOSURE'
  | 'BUILDING_COLLAPSE'
  | 'WEATHER'
  | 'STORM'
  | 'EARTHQUAKE'
  | 'LANDSLIDE'
  | 'MISSING_PERSON'
  | 'EMERGENCY'
  | 'POLICE_ACTIVITY'
  | 'MEDICAL'
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'ACTIVE' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  district: string;
  city: string;
  country: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: string;
  source_url: string;
  source_type?: string;
  source_count: number;
  confidence: number; // 0.0 - 1.0
  first_seen?: string;
  last_updated?: string;
  reported_at: string;
  updated_at: string;
  data_age?: DataAgeStatus;
  age_formatted?: string;
  is_demo?: boolean;
  images?: string[];
  videos?: string[];
  related_cameras?: string[];
  related_places?: string[];
  ai_classified?: boolean;
  ai_evidence?: string;
}

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';

export type POIType = 'HOSPITAL' | 'POLICE' | 'FIRE_STATION' | 'AIRPORT' | 'INFRASTRUCTURE';

export interface POI {
  id: string;
  type: POIType;
  name: string;
  address: string;
  district: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  emergency_capability?: string;
  distance_meters?: number;
}

export type TrafficCongestion = 'FREE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE';

export interface TrafficSegment {
  id: string;
  road_name: string;
  district: string;
  status: TrafficCongestion;
  avg_speed_kmh: number;
  coordinates: [number, number][]; // [lng, lat] GeoJSON LineString coordinates
  updated_at: string;
}

export type FloodSeverity = 'NORMAL' | 'WATCH' | 'WARNING' | 'SEVERE';

export interface FloodZone {
  id: string;
  name: string;
  district: string;
  water_level_m: number;
  threshold_m: number;
  status: FloodSeverity;
  coordinates: [number, number][]; // Polygon coords [lng, lat]
  updated_at: string;
}

export interface WeatherTelemetry {
  city: string;
  temperature_c: number;
  condition: string;
  rain_mm: number;
  wind_kmh: number;
  humidity_pct: number;
  alerts: string[];
  updated_at: string;
}

export interface SourceHealth {
  id: string;
  name: string;
  provider: string;
  type: string;
  region: string;
  status: SourceHealthStatus;
  last_check: string;
  latency_ms: number;
  error_rate_pct: number;
  last_successful_fetch: string;
  next_check: string;
}

export interface TelemetryHUDData {
  zulu_time: string;
  system_status: 'LIVE' | 'SIMULATION' | 'DEGRADED';
  total_layers: number;
  entities_tracked: number;
  online_cameras: number;
  active_incidents: number;
  online_sources: number;
  solar_kp: string;
  wind_speed_ms: number;
  viewport_location: string;
}

export interface FilterState {
  searchQuery: string;
  showCameras: boolean;
  showIncidents: boolean;
  showTraffic: boolean;
  showWeather: boolean;
  showHospitals: boolean;
  showPolice: boolean;
  showFireStations: boolean;
  showFloods: boolean;
  cameraStatuses: CameraStatus[];
  cameraTypes: CameraType[];
  incidentSeverities: IncidentSeverity[];
  incidentTypes: IncidentType[];
  timeWindow: 'LIVE' | '15M' | '1H' | '6H' | '24H' | 'ALL';
  selectedDistrict: string;
}

export interface MeasurementToolState {
  activeTool: 'NONE' | 'DISTANCE' | 'RADIUS' | 'POLYGON';
  points: [number, number][]; // [lng, lat]
  radiusMeters?: number;
  calculatedDistanceKm?: number;
}

export type LocationStatus =
  | 'IDLE'
  | 'REQUESTING'
  | 'LOCATED'
  | 'ERROR'
  | 'PERMISSION_DENIED'
  | 'TIMEOUT'
  | 'POSITION_UNAVAILABLE';

export type LocationTrackingStatus = LocationStatus;

export type LocationQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface UserLocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters (e.g. 8.2)
  altitude: number | null; // in meters
  altitudeAccuracy: number | null;
  heading: number | null; // in degrees (0-360)
  speed: number | null; // in m/s
  timestamp: number;
  quality: LocationQuality;
  district?: string;
  city?: string;
  country?: string;
}

export interface Bookmark {
  id: string;
  label: string;
  description: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface AreaScanResult {
  radiusMeters: number;
  center: [number, number]; // [lng, lat]
  camerasCount: number;
  incidentsCount: number;
  hospitalsCount: number;
  policeCount: number;
  fireCount: number;
  trafficCount: number;
  floodCount: number;
  topIncidents: Incident[];
  topCameras: CameraSource[];
}


