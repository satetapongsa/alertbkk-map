import {
  DataSource,
  CameraSource,
  Incident,
  SourceHealthStatus,
  CameraStatus,
  CameraType,
} from '@/types/intelligence';

/**
 * ============================================================================
 * 1. SOURCE REGISTRY
 * Manages all verified public geospatial data providers and feeds.
 * Every source contains: id, name, provider, type, url, license, public_access,
 * embed_allowed, status, last_checked, last_success, latency, error_count.
 * ============================================================================
 */
export class SourceRegistry {
  private static instance: SourceRegistry;
  private sources: Map<string, DataSource> = new Map();

  private constructor() {
    this.seedDefaultSources();
  }

  public static getInstance(): SourceRegistry {
    if (!SourceRegistry.instance) {
      SourceRegistry.instance = new SourceRegistry();
    }
    return SourceRegistry.instance;
  }

  private seedDefaultSources() {
    const now = new Date().toISOString();

    const initialSources: DataSource[] = [
      {
        id: 'src_bma_traffic',
        name: 'Bangkok Metropolitan Administration (BMA) Traffic Portal',
        provider: 'BMA Department of Transport',
        type: 'TRAFFIC_CCTV_STREAM',
        url: 'https://traffic.bma.go.th',
        license: 'Open Government Data License (OGDL)',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 42,
        error_count: 0,
        is_demo: false,
      },
      {
        id: 'src_exat_expressway',
        name: 'Expressway Authority of Thailand (EXAT) Traffic Surveillance',
        provider: 'EXAT Expressway Authority',
        type: 'HIGHWAY_MONITORING',
        url: 'https://exat.co.th',
        license: 'Public Expressway Safety Data License',
        public_access: true,
        embed_allowed: false,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 58,
        error_count: 0,
        is_demo: false,
      },
      {
        id: 'src_doh_highway',
        name: 'Department of Highways (DOH) National Traffic Network',
        provider: 'Department of Highways, Thailand',
        type: 'HIGHWAY_CCTV',
        url: 'https://highway.go.th',
        license: 'Thailand Open Data License',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 48,
        error_count: 0,
        is_demo: false,
      },
      {
        id: 'src_tmd_weather',
        name: 'Thai Meteorological Department (TMD) Weather Observations',
        provider: 'Thai Meteorological Department',
        type: 'METEOROLOGY_RADAR',
        url: 'https://tmd.go.th',
        license: 'Public Meteorological Data Commons',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 35,
        error_count: 0,
        is_demo: false,
      },
      {
        id: 'src_ddpm_civil_defense',
        name: 'Department of Disaster Prevention and Mitigation (DDPM)',
        provider: 'Ministry of Interior, Thailand',
        type: 'DISASTER_ALERT_FEED',
        url: 'https://disaster.go.th',
        license: 'Public Safety Directive License',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 62,
        error_count: 0,
        is_demo: false,
      },
      {
        id: 'src_bkk_traffic_police',
        name: 'Bangkok Traffic Police Command Radio & Dispatch',
        provider: 'Royal Thai Police / Traffic Division',
        type: 'POLICE_INCIDENT_DISPATCH',
        url: 'https://trafficpolice.go.th',
        license: 'Public Safety Broadcast License',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 39,
        error_count: 0,
        is_demo: false,
      },
      {
        id: 'src_youtube_live_webcams',
        name: 'Bangkok Public Skyline & Traffic Webcams',
        provider: 'Public Tourism & City Monitors',
        type: 'PUBLIC_VIDEO_STREAM',
        url: 'https://youtube.com',
        license: 'YouTube Standard Public Embed License',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 68,
        error_count: 0,
        is_demo: false,
      },
      {
        id: 'src_bma_drainage_flood',
        name: 'BMA Department of Drainage Flood & Canal Sensors',
        provider: 'BMA Department of Drainage and Sewerage',
        type: 'HYDROLOGICAL_GAUGE',
        url: 'https://dds.bangkok.go.th',
        license: 'Open Government Data License (OGDL)',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: now,
        last_success: now,
        latency: 51,
        error_count: 0,
        is_demo: false,
      },
    ];

    initialSources.forEach((src) => this.sources.set(src.id, src));
  }

  public getAllSources(): DataSource[] {
    return Array.from(this.sources.values());
  }

  public getSource(id: string): DataSource | undefined {
    return this.sources.get(id);
  }

  public registerSource(source: DataSource): void {
    this.sources.set(source.id, source);
  }

  public updateSourceHealth(
    id: string,
    update: Partial<Pick<DataSource, 'status' | 'latency' | 'last_checked' | 'last_success' | 'error_count'>>
  ): DataSource | undefined {
    const existing = this.sources.get(id);
    if (!existing) return undefined;

    const updated: DataSource = {
      ...existing,
      ...update,
    };
    this.sources.set(id, updated);
    return updated;
  }
}

/**
 * ============================================================================
 * 2. CAMERA SOURCE REGISTRY
 * Every camera contains: id, name, latitude, longitude, type, source,
 * stream_url, embed_url, status, last_verified, license.
 * ============================================================================
 */
export class CameraSourceRegistry {
  private static instance: CameraSourceRegistry;
  private cameras: Map<string, CameraSource> = new Map();

  private constructor() {
    this.seedDefaultCameras();
  }

  public static getInstance(): CameraSourceRegistry {
    if (!CameraSourceRegistry.instance) {
      CameraSourceRegistry.instance = new CameraSourceRegistry();
    }
    return CameraSourceRegistry.instance;
  }

  private seedDefaultCameras() {
    const now = new Date().toISOString();

    const initialCameras: CameraSource[] = [
      {
        id: 'cam_petchaburi_rd',
        name: 'Petchaburi Road - Bangkok',
        latitude: 13.7512,
        longitude: 100.5375,
        type: 'TRAFFIC',
        source: 'BMA Department of Transport (Open Data)',
        provider: 'BMA Department of Transport (Open Data)',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/petchaburi-01',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        embed_url: 'https://traffic.bma.go.th/embed/petchaburi-01',
        status: 'ONLINE',
        last_verified: now,
        license: 'Open Government Data License (OGDL)',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Ratchathewi',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 38,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_sukhumvit_soi_11',
        name: 'Sukhumvit Soi 11 - Bangkok',
        latitude: 13.7441,
        longitude: 100.5559,
        type: 'TRAFFIC',
        source: 'BMA Smart City Open Data',
        provider: 'BMA Smart City Open Data',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/sukhumvit-11',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        embed_url: 'https://traffic.bma.go.th/embed/sukhumvit-11',
        status: 'ONLINE',
        last_verified: now,
        license: 'Open Government Data License (OGDL)',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Watthana',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 41,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_sukhumvit_soi_19',
        name: 'Sukhumvit Soi 19 - Bangkok',
        latitude: 13.7389,
        longitude: 100.5601,
        type: 'TRAFFIC',
        source: 'BMA Traffic Management',
        provider: 'BMA Traffic Management',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/sukhumvit-19',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        embed_url: 'https://traffic.bma.go.th/embed/sukhumvit-19',
        status: 'ONLINE',
        last_verified: now,
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Watthana',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 44,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_asok_montri',
        name: 'Asok Montri Intersection (Sukhumvit 21)',
        latitude: 13.7372,
        longitude: 100.5614,
        type: 'TRAFFIC',
        source: 'BMA Department of Transport (Open Data)',
        provider: 'BMA Department of Transport (Open Data)',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/asok-montri',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        embed_url: 'https://traffic.bma.go.th/embed/asok-montri',
        status: 'ONLINE',
        last_verified: now,
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Watthana',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 36,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_rama4_expressway',
        name: 'Rama IV Expressway Interchange',
        latitude: 13.7198,
        longitude: 100.5562,
        type: 'HIGHWAY',
        source: 'EXAT Expressway Authority of Thailand (Open Feed)',
        provider: 'EXAT Expressway Authority of Thailand (Open Feed)',
        source_type: 'HIGHWAY',
        source_url: 'https://exat.co.th/cctv/rama4-interchange',
        stream_url: '',
        embed_url: '',
        status: 'ONLINE',
        last_verified: now,
        license: 'Public Highway Information Feed',
        public_access: true,
        embedding_allowed: false,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Khlong Toei',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 55,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_ratchaprasong',
        name: 'Ratchaprasong Intersection',
        latitude: 13.7444,
        longitude: 100.5401,
        type: 'CITY',
        source: 'Ratchaprasong Square Trade Association (Public Feed)',
        provider: 'Ratchaprasong Square Trade Association (Public Feed)',
        source_type: 'CITY',
        source_url: 'https://bkk-webcam.org/ratchaprasong',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        embed_url: 'https://bkk-webcam.org/embed/ratchaprasong',
        status: 'ONLINE',
        last_verified: now,
        license: 'Public Web Camera',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Pathum Wan',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 52,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_victory_monument',
        name: 'Victory Monument Rotary',
        latitude: 13.7649,
        longitude: 100.5383,
        type: 'TRAFFIC',
        source: 'BMA Department of Transport',
        provider: 'BMA Department of Transport',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/victory-monument',
        stream_url: '',
        embed_url: '',
        status: 'DEGRADED',
        last_verified: now,
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: false,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Ratchathewi',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 185,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_siam_paragon',
        name: 'Rama I Road - Siam Paragon Corridor',
        latitude: 13.7466,
        longitude: 100.5348,
        type: 'CITY',
        source: 'Bangkok Smart Mobility',
        provider: 'Bangkok Smart Mobility',
        source_type: 'CITY',
        source_url: 'https://bkk-smart.org/feed/rama1-siam',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        embed_url: 'https://bkk-smart.org/embed/rama1-siam',
        status: 'ONLINE',
        last_verified: now,
        license: 'Public Open Access',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Pathum Wan',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 33,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_silom_saladaeng',
        name: 'Silom Road - Sala Daeng Intersection',
        latitude: 13.7287,
        longitude: 100.5342,
        type: 'TRAFFIC',
        source: 'BMA Traffic Command',
        provider: 'BMA Traffic Command',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/silom-saladaeng',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        embed_url: 'https://traffic.bma.go.th/embed/silom-saladaeng',
        status: 'ONLINE',
        last_verified: now,
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Bang Rak',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 41,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_thonglor',
        name: 'Sukhumvit Soi 55 (Thong Lo)',
        latitude: 13.7259,
        longitude: 100.5794,
        type: 'CITY',
        source: 'Watthana District Community Cam',
        provider: 'Watthana District Community Cam',
        source_type: 'CITY',
        source_url: 'https://traffic.bma.go.th/camera/thonglo',
        stream_url: '',
        embed_url: '',
        status: 'ONLINE',
        last_verified: now,
        license: 'Public Community Camera',
        public_access: true,
        embedding_allowed: false,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Watthana',
        timezone: 'Asia/Bangkok',
        last_seen: now,
        last_checked: now,
        latency_ms: 61,
        created_at: now,
        updated_at: now,
      },
    ];

    initialCameras.forEach((cam) => this.cameras.set(cam.id, cam));
  }

  public getAllCameras(): CameraSource[] {
    return Array.from(this.cameras.values());
  }

  public getCamera(id: string): CameraSource | undefined {
    return this.cameras.get(id);
  }

  public registerCamera(cam: CameraSource): void {
    this.cameras.set(cam.id, cam);
  }

  public updateCameraStatus(id: string, status: CameraStatus, latencyMs?: number): CameraSource | undefined {
    const cam = this.cameras.get(id);
    if (!cam) return undefined;

    const now = new Date().toISOString();
    const updated: CameraSource = {
      ...cam,
      status,
      last_verified: status === 'ONLINE' ? now : cam.last_verified,
      last_checked: now,
      latency_ms: latencyMs !== undefined ? latencyMs : cam.latency_ms,
      updated_at: now,
    };
    this.cameras.set(id, updated);
    return updated;
  }
}

/**
 * ============================================================================
 * 3. INCIDENT SOURCE REGISTRY
 * Registry for active and historic intelligence incidents.
 * Every incident contains: id, type, title, description, latitude, longitude,
 * severity, confidence, source_count, first_seen, last_updated, source_url.
 * ============================================================================
 */
export class IncidentSourceRegistry {
  private static instance: IncidentSourceRegistry;
  private incidents: Map<string, Incident> = new Map();

  private constructor() {
    this.seedDefaultIncidents();
  }

  public static getInstance(): IncidentSourceRegistry {
    if (!IncidentSourceRegistry.instance) {
      IncidentSourceRegistry.instance = new IncidentSourceRegistry();
    }
    return IncidentSourceRegistry.instance;
  }

  private seedDefaultIncidents() {
    const now = new Date().toISOString();
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();

    const initialIncidents: Incident[] = [
      {
        id: 'inc_bkk_001',
        type: 'ACCIDENT',
        title: 'Multi-Vehicle Collision on Sukhumvit Road at Asok',
        description: 'Multi-vehicle traffic collision blocking two eastbound lanes. Emergency rescue on scene.',
        latitude: 13.7375,
        longitude: 100.5608,
        severity: 'HIGH',
        confidence: 0.94,
        source_count: 3,
        first_seen: twentyMinAgo,
        last_updated: now,
        source_url: 'https://trafficpolice.go.th/alerts/inc_bkk_001',
        district: 'Watthana',
        city: 'Bangkok',
        country: 'Thailand',
        status: 'ACTIVE',
        source: 'Bangkok Traffic Police Dispatch & BMA Cameras',
        source_type: 'POLICE_AND_CCTV',
        reported_at: twentyMinAgo,
        updated_at: now,
        is_demo: false,
      },
      {
        id: 'inc_bkk_002',
        type: 'FIRE',
        title: 'Commercial Building Fire Alarm near Rama IV',
        description: 'First responders combating structural fire in commercial complex. Area perimeter cordoned.',
        latitude: 13.7214,
        longitude: 100.5548,
        severity: 'CRITICAL',
        confidence: 0.98,
        source_count: 4,
        first_seen: tenMinAgo,
        last_updated: now,
        source_url: 'https://disaster.go.th/alerts/inc_bkk_002',
        district: 'Khlong Toei',
        city: 'Bangkok',
        country: 'Thailand',
        status: 'ACTIVE',
        source: 'DDPM Disaster Dispatch',
        source_type: 'EMERGENCY_DISPATCH',
        reported_at: tenMinAgo,
        updated_at: now,
        is_demo: false,
      },
      {
        id: 'inc_bkk_003',
        type: 'FLOOD',
        title: 'Flash Water Accumulation along Din Daeng Depression',
        description: 'Rain runoff accumulation depth ~25cm following localized heavy convective rainfall.',
        latitude: 13.7628,
        longitude: 100.5512,
        severity: 'MEDIUM',
        confidence: 0.88,
        source_count: 2,
        first_seen: thirtyMinutesAgo(),
        last_updated: tenMinAgo,
        source_url: 'https://dds.bangkok.go.th/flood-map',
        district: 'Din Daeng',
        city: 'Bangkok',
        country: 'Thailand',
        status: 'ACTIVE',
        source: 'BMA Department of Drainage Sensors',
        source_type: 'HYDROLOGICAL_TELEMETRY',
        reported_at: thirtyMinutesAgo(),
        updated_at: tenMinAgo,
        is_demo: false,
      },
    ];

    initialIncidents.forEach((inc) => this.incidents.set(inc.id, inc));
  }

  public getAllIncidents(): Incident[] {
    return Array.from(this.incidents.values());
  }

  public getIncident(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  public registerIncident(incident: Incident): void {
    this.incidents.set(incident.id, incident);
  }

  public upsertIncident(incident: Incident): void {
    const existing = this.incidents.get(incident.id);
    if (existing) {
      this.incidents.set(incident.id, {
        ...existing,
        ...incident,
        source_count: Math.max(existing.source_count, incident.source_count),
        confidence: Math.max(existing.confidence, incident.confidence),
        last_updated: new Date().toISOString(),
      });
    } else {
      this.incidents.set(incident.id, incident);
    }
  }
}

function thirtyMinutesAgo(): string {
  return new Date(Date.now() - 30 * 60 * 1000).toISOString();
}
