import {
  CameraSource,
  Incident,
  POI,
  TrafficSegment,
  FloodZone,
  WeatherTelemetry,
  SourceHealth,
  FilterState,
} from '@/types/intelligence';
import { calculateDistanceMeters, isPointInBBox, isPointInRadius } from './spatial';

/**
 * MIRRIX Geospatial Database & Intelligence Engine
 * Handles in-memory spatial indexes, real-time mutations, query filtering, and POI association.
 */
class IntelligenceDatabase {
  private cameras: Map<string, CameraSource> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private pois: Map<string, POI> = new Map();
  private trafficSegments: Map<string, TrafficSegment> = new Map();
  private floodZones: Map<string, FloodZone> = new Map();
  private sourceHealth: Map<string, SourceHealth> = new Map();
  private weather: WeatherTelemetry;

  constructor() {
    this.weather = {
      city: 'Bangkok, Thailand',
      temperature_c: 31.5,
      condition: 'Scattered Clouds / Humid',
      rain_mm: 2.4,
      wind_kmh: 12.0,
      humidity_pct: 78,
      alerts: ['Advisory: Moderate afternoon convective rain expected along Chao Phraya basin'],
      updated_at: new Date().toISOString(),
    };
    this.seedDatabase();
  }

  private seedDatabase() {
    const now = new Date().toISOString();

    // 1. SEED CAMERAS (Matching reference screenshot + strategic Bangkok corridors)
    const seedCameras: CameraSource[] = [
      {
        id: 'cam_petchaburi_rd',
        name: 'Petchaburi Road - Bangkok',
        provider: 'BMA Department of Transport (Open Data)',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/petchaburi-01',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Open Government Data License (OGDL)',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Ratchathewi',
        latitude: 13.7512,
        longitude: 100.5375,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 38,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_sukhumvit_soi_11',
        name: 'Sukhumvit Soi 11 - Bangkok',
        provider: 'BMA Smart City Open Data',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/sukhumvit-11',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Open Government Data License (OGDL)',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Watthana',
        latitude: 13.7441,
        longitude: 100.5559,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 41,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_sukhumvit_soi_19',
        name: 'Sukhumvit Soi 19 - Bangkok',
        provider: 'BMA Traffic Management',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/sukhumvit-19',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Watthana',
        latitude: 13.7389,
        longitude: 100.5601,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 32,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_rama4_expressway',
        name: 'Rama IV Expressway Interchange',
        provider: 'EXAT Expressway Authority of Thailand (Open Feed)',
        source_type: 'HIGHWAY',
        source_url: 'https://exat.co.th/cctv/rama4-interchange',
        license: 'Public Highway Information Feed',
        public_access: true,
        embedding_allowed: false, // Testing non-embeddable public source fallback
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Khlong Toei',
        latitude: 13.7198,
        longitude: 100.5562,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 55,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_chaophraya_thonburi',
        name: 'Petchaburi Road (West) / Chao Phraya Pier',
        provider: 'Marine Department Public Safety Watch',
        source_type: 'PORT',
        source_url: 'https://md.go.th/cctv/chaophraya-west',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Public Maritime Open Stream',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Bangkok Yai',
        latitude: 13.7485,
        longitude: 100.4912,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 45,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_ratchaprasong',
        name: 'Ratchaprasong Intersection',
        provider: 'Ratchaprasong Square Trade Association (Public Feed)',
        source_type: 'CITY',
        source_url: 'https://bkk-webcam.org/ratchaprasong',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Public Web Camera',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Pathum Wan',
        latitude: 13.7444,
        longitude: 100.5401,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 49,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_asok_skycam',
        name: 'Sukhumvit Road - Asok SkyCam (Live Stream)',
        provider: 'YouTube Live Public Stream',
        source_type: 'PUBLIC_WEBCAM',
        source_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embed_url: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=1',
        is_youtube: true,
        youtube_video_id: 'jfKfPfyJRdk',
        license: 'YouTube Public Embed License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Watthana',
        latitude: 13.7372,
        longitude: 100.5604,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 60,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_victory_monument',
        name: 'Victory Monument Rotary',
        provider: 'BMA Department of Transport',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/victory-monument',
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: false,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Ratchathewi',
        latitude: 13.7649,
        longitude: 100.5383,
        timezone: 'Asia/Bangkok',
        status: 'DEGRADED',
        last_seen: now,
        last_checked: now,
        latency_ms: 195,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_siam_paragon',
        name: 'Rama I Road - Siam Paragon Corridor',
        provider: 'Bangkok Smart Mobility',
        source_type: 'CITY',
        source_url: 'https://bkk-smart.org/feed/rama1-siam',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Public Open Access',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Pathum Wan',
        latitude: 13.7466,
        longitude: 100.5348,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 36,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_silom_saladaeng',
        name: 'Silom Road - Sala Daeng Intersection',
        provider: 'BMA Traffic Command',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/silom-saladaeng',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Bang Rak',
        latitude: 13.7287,
        longitude: 100.5342,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 41,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_rama9_fortunetown',
        name: 'Rama IX Road - Fortune Town Junction',
        provider: 'BMA Traffic Monitoring',
        source_type: 'TRAFFIC',
        source_url: 'https://traffic.bma.go.th/camera/rama9-fortune',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Open Government Data License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Huai Khwang',
        latitude: 13.7578,
        longitude: 100.5661,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 39,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_chaophraya_iconsiam',
        name: 'Chao Phraya River & IconSiam Watch',
        provider: 'Public Tourism & River Watch',
        source_type: 'PUBLIC_WEBCAM',
        source_url: 'https://www.youtube.com/watch?v=live_bkk_river',
        embed_url: 'https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1&mute=1',
        is_youtube: true,
        youtube_video_id: '5qap5aO4i9A',
        license: 'Creative Commons Public Stream',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Khlong San',
        latitude: 13.7267,
        longitude: 100.5108,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 54,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cam_chatuchak_market',
        name: 'Chatuchak Phahon Yothin Skywalk',
        provider: 'State Railway of Thailand / BMA',
        source_type: 'CITY',
        source_url: 'https://traffic.bma.go.th/camera/chatuchak',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        license: 'Open Data License',
        public_access: true,
        embedding_allowed: true,
        country: 'Thailand',
        city: 'Bangkok',
        district: 'Chatuchak',
        latitude: 13.8037,
        longitude: 100.5539,
        timezone: 'Asia/Bangkok',
        status: 'ONLINE',
        last_seen: now,
        last_checked: now,
        latency_ms: 48,
        created_at: now,
        updated_at: now,
      },
    ];

    seedCameras.forEach((cam) => this.cameras.set(cam.id, cam));

    // 2. SEED INCIDENTS
    const seedIncidents: Incident[] = [
      {
        id: 'inc_bkk_001',
        type: 'ACCIDENT',
        title: 'Sukhumvit Road - Multi-Vehicle Collision',
        description: 'Multi-car collision on Sukhumvit outbound near Soi 19 intersection. Inbound lanes moving slowly; emergency responders on scene.',
        latitude: 13.7385,
        longitude: 100.5598,
        district: 'Watthana',
        city: 'Bangkok',
        country: 'Thailand',
        severity: 'HIGH',
        status: 'ACTIVE',
        source: 'Public Traffic Radio (JS100 / FM91)',
        source_url: 'https://js100.com/alert/sukhumvit-001',
        source_count: 3,
        confidence: 0.94,
        reported_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        updated_at: now,
        related_cameras: ['cam_sukhumvit_soi_19', 'cam_sukhumvit_soi_11', 'cam_asok_skycam'],
        ai_classified: true,
        ai_evidence: 'High confidence cross-referenced text extraction from multiple citizen reports and JS100 traffic telemetry.',
      },
      {
        id: 'inc_bkk_002',
        type: 'TRAFFIC',
        title: 'Rama IX Expressway - Severe Congestion',
        description: 'Stalled commercial transport truck obstructing two median lanes. Traffic tailback extends 2.8 km toward Srinakarin interchange.',
        latitude: 13.7571,
        longitude: 100.5658,
        district: 'Huai Khwang',
        city: 'Bangkok',
        country: 'Thailand',
        severity: 'MEDIUM',
        status: 'ACTIVE',
        source: 'EXAT Live Sensor Network',
        source_url: 'https://exat.co.th/traffic-alerts',
        source_count: 2,
        confidence: 0.89,
        reported_at: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        updated_at: now,
        related_cameras: ['cam_rama9_fortunetown'],
        ai_classified: true,
        ai_evidence: 'Average speed dropped below 9 km/h on expressway sector 4B.',
      },
      {
        id: 'inc_bkk_003',
        type: 'FIRE',
        title: 'Bang Kapi - Commercial Warehouse Structure Fire',
        description: 'Second-alarm commercial structure fire reported. BMA Fire & Rescue units dispatched from Bang Kapi and Huai Khwang stations. Water supply established.',
        latitude: 13.7658,
        longitude: 100.6475,
        district: 'Bang Kapi',
        city: 'Bangkok',
        country: 'Thailand',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        source: 'Bangkok Fire & Rescue Dispatch',
        source_url: 'https://fire.bma.go.th/alerts/bk-fire-01',
        source_count: 4,
        confidence: 0.98,
        reported_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        updated_at: now,
        related_cameras: [],
        ai_classified: true,
        ai_evidence: 'Emergency dispatch confirmation + acoustic distress notification via 199 municipal queue.',
      },
      {
        id: 'inc_bkk_004',
        type: 'FLOOD',
        title: 'Chatuchak - Canal Overflow Water Level Alert',
        description: 'Prem Prachakon canal gauge reads +1.95m MSL (Threshold: +1.80m). Water spilling onto roadway shoulder near Vibhavadi Rangsit Soi 3.',
        latitude: 13.8042,
        longitude: 100.5545,
        district: 'Chatuchak',
        city: 'Bangkok',
        country: 'Thailand',
        severity: 'MEDIUM',
        status: 'INVESTIGATING',
        source: 'BMA Department of Drainage and Sewerage',
        source_url: 'https://dds.bma.go.th/water-level',
        source_count: 2,
        confidence: 0.91,
        reported_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
        updated_at: now,
        related_cameras: ['cam_chatuchak_market'],
        ai_classified: true,
        ai_evidence: 'Telemetry gauge threshold triggered automated hydrological alert.',
      },
      {
        id: 'inc_bkk_005',
        type: 'ROAD_CLOSURE',
        title: 'Phetchaburi Road - Water Pipe Replacement Lane Closure',
        description: 'MWA (Metropolitan Waterworks Authority) emergency pipe maintenance. 2 left lanes blocked westbound near Pratunam intersection.',
        latitude: 13.7508,
        longitude: 100.5371,
        district: 'Ratchathewi',
        city: 'Bangkok',
        country: 'Thailand',
        severity: 'LOW',
        status: 'ACTIVE',
        source: 'Traffic Police Division (Traffic 1197)',
        source_url: 'https://trafficpolice.go.th/closure-notice',
        source_count: 1,
        confidence: 0.85,
        reported_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        updated_at: now,
        related_cameras: ['cam_petchaburi_rd'],
        ai_classified: false,
      },
      {
        id: 'inc_bkk_006',
        type: 'EMERGENCY',
        title: 'Silom - Rapid Medical Transit Priority',
        description: 'Erawan Center ambulance convoy transferring critical cardiac patient towards King Chulalongkorn Memorial Hospital. Police clearing intersections.',
        latitude: 13.7292,
        longitude: 100.5348,
        district: 'Bang Rak',
        city: 'Bangkok',
        country: 'Thailand',
        severity: 'MEDIUM',
        status: 'ACTIVE',
        source: 'Erawan Medical Emergency Center (1669)',
        source_url: 'https://erawan.bma.go.th/transit',
        source_count: 2,
        confidence: 0.93,
        reported_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        updated_at: now,
        related_cameras: ['cam_silom_saladaeng'],
        ai_classified: true,
        ai_evidence: 'Erawan 1669 dispatch alert beacon active.',
      },
    ];

    seedIncidents.forEach((inc) => this.incidents.set(inc.id, inc));

    // 3. SEED POINTS OF INTEREST (Hospitals, Police, Fire, Airports)
    const seedPOIs: POI[] = [
      // Hospitals
      {
        id: 'poi_hosp_chula',
        type: 'HOSPITAL',
        name: 'King Chulalongkorn Memorial Hospital',
        address: '1874 Rama IV Rd, Pathum Wan, Bangkok 10330',
        district: 'Pathum Wan',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7314,
        longitude: 100.5359,
        phone: '+66 2 256 4000',
        website: 'https://chulalongkornhospital.go.th',
        emergency_capability: 'Level 1 Trauma Center, 24/7 Heliport, Comprehensive Emergency Department',
      },
      {
        id: 'poi_hosp_bumrungrad',
        type: 'HOSPITAL',
        name: 'Bumrungrad International Hospital',
        address: '33 Sukhumvit Soi 3, Khlong Toei Nuea, Watthana, Bangkok 10110',
        district: 'Watthana',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7468,
        longitude: 100.5529,
        phone: '+66 2 066 8888',
        website: 'https://www.bumrungrad.com',
        emergency_capability: 'Advanced Emergency Center, Multilingual Medical Evacuation',
      },
      {
        id: 'poi_hosp_police',
        type: 'HOSPITAL',
        name: 'Police General Hospital',
        address: '492/1 Rama I Rd, Pathum Wan, Bangkok 10330',
        district: 'Pathum Wan',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7439,
        longitude: 100.5388,
        phone: '+66 2 207 6000',
        website: 'https://policehospital.go.th',
        emergency_capability: 'Emergency Trauma & Disaster Medicine Division',
      },
      {
        id: 'poi_hosp_bangkok_hosp',
        type: 'HOSPITAL',
        name: 'Bangkok Hospital (BDMS Headquarter)',
        address: '2 Soi Phetchaburi 47, Bang Kapi, Huai Khwang, Bangkok 10310',
        district: 'Huai Khwang',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7481,
        longitude: 100.5841,
        phone: '+66 2 310 3000',
        website: 'https://www.bangkokhospital.com',
        emergency_capability: 'BDMS Critical Care & Air Evacuation Wing',
      },
      {
        id: 'poi_hosp_siriraj',
        type: 'HOSPITAL',
        name: 'Siriraj Hospital',
        address: '2 Wang Lang Rd, Bangkok Noi, Bangkok 10700',
        district: 'Bangkok Noi',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7584,
        longitude: 100.4856,
        phone: '+66 2 419 7000',
        website: 'https://www.si.mahidol.ac.th',
        emergency_capability: 'Premier National University Medical Center & Level 1 Trauma',
      },

      // Police Stations
      {
        id: 'poi_pol_lumpini',
        type: 'POLICE',
        name: 'Lumpini Metropolitan Police Station',
        address: 'Wireless Road, Lumphini, Pathum Wan, Bangkok 10330',
        district: 'Pathum Wan',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7356,
        longitude: 100.5435,
        phone: '+66 2 255 5350',
        emergency_capability: 'Patrol Dispatch, Diplomatic Security Zone, Tourist Assistance',
      },
      {
        id: 'poi_pol_thonglo',
        type: 'POLICE',
        name: 'Thong Lo Metropolitan Police Station',
        address: '800 Sukhumvit 55, Khlong Tan Nuea, Watthana, Bangkok 10110',
        district: 'Watthana',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7348,
        longitude: 100.5835,
        phone: '+66 2 390 2240',
        emergency_capability: 'Rapid Response Unit, Urban Incident Command',
      },
      {
        id: 'poi_pol_bangrak',
        type: 'POLICE',
        name: 'Bang Rak Metropolitan Police Station',
        address: 'Naret Road, Si Phraya, Bang Rak, Bangkok 10500',
        district: 'Bang Rak',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7291,
        longitude: 100.5262,
        phone: '+66 2 234 0242',
        emergency_capability: 'Commercial Corridor Patrol, Financial District Command',
      },
      {
        id: 'poi_pol_huaikhwang',
        type: 'POLICE',
        name: 'Huai Khwang Metropolitan Police Station',
        address: 'Pracha Rat Bamphen Rd, Huai Khwang, Bangkok 10310',
        district: 'Huai Khwang',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7788,
        longitude: 100.5752,
        phone: '+66 2 277 1515',
        emergency_capability: 'Suburban Command Center',
      },

      // Fire Stations
      {
        id: 'poi_fire_bangrak',
        type: 'FIRE_STATION',
        name: 'Bang Rak Fire & Rescue Station',
        address: 'Charoen Krung Rd, Bang Rak, Bangkok 10500',
        district: 'Bang Rak',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7258,
        longitude: 100.5173,
        phone: '+66 2 233 4627',
        emergency_capability: 'River & High-Rise Aerial Ladder Division',
      },
      {
        id: 'poi_fire_phayathai',
        type: 'FIRE_STATION',
        name: 'Phaya Thai Fire Station',
        address: 'Phaya Thai Rd, Ratchathewi, Bangkok 10400',
        district: 'Ratchathewi',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7592,
        longitude: 100.5348,
        phone: '+66 2 245 4252',
        emergency_capability: 'Heavy Rescue Squad, Chemical Incident Response',
      },
      {
        id: 'poi_fire_klongtoey',
        type: 'FIRE_STATION',
        name: 'Khlong Toei Fire & Rescue Station',
        address: 'Rama IV Rd, Khlong Toei, Bangkok 10110',
        district: 'Khlong Toei',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7175,
        longitude: 100.5642,
        phone: '+66 2 249 0555',
        emergency_capability: 'Port Logistics & Industrial Hazard Response',
      },

      // Airports
      {
        id: 'poi_air_suvarnabhumi',
        type: 'AIRPORT',
        name: 'Suvarnabhumi International Airport (BKK)',
        address: '999 Bang Phli District, Samut Prakan 10540',
        district: 'Samut Prakan / BKK East',
        city: 'Bangkok Metro',
        country: 'Thailand',
        latitude: 13.6900,
        longitude: 100.7501,
        phone: '+66 2 132 1888',
        website: 'https://suvarnabhumi.airportthai.co.th',
        emergency_capability: 'ICAO Category 10 ARFF Crash Fire Rescue, International Aeromedical Evac',
      },
      {
        id: 'poi_air_donmueang',
        type: 'AIRPORT',
        name: 'Don Mueang International Airport (DMK)',
        address: '222 Vibhavadi Rangsit Rd, Sanambin, Don Mueang, Bangkok 10210',
        district: 'Don Mueang',
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.9126,
        longitude: 100.6067,
        phone: '+66 2 535 1192',
        website: 'https://donmueang.airportthai.co.th',
        emergency_capability: 'RTAF Military Base Emergency Wing & Domestic Commercial Operations',
      },
    ];

    seedPOIs.forEach((poi) => this.pois.set(poi.id, poi));

    // 4. SEED TRAFFIC SEGMENTS
    const seedTraffic: TrafficSegment[] = [
      {
        id: 'traf_sukhumvit_main',
        road_name: 'Sukhumvit Road (Route 3 Corridor)',
        district: 'Watthana / Khlong Toei',
        status: 'HEAVY',
        avg_speed_kmh: 14.5,
        coordinates: [
          [100.5480, 13.7410],
          [100.5559, 13.7380],
          [100.5650, 13.7320],
          [100.5750, 13.7250],
        ],
        updated_at: now,
      },
      {
        id: 'traf_rama9_express',
        road_name: 'Sirat Expressway - Rama IX Segment',
        district: 'Huai Khwang',
        status: 'SEVERE',
        avg_speed_kmh: 8.2,
        coordinates: [
          [100.5520, 13.7540],
          [100.5661, 13.7578],
          [100.5820, 13.7590],
        ],
        updated_at: now,
      },
      {
        id: 'traf_petchaburi',
        road_name: 'Phetchaburi New Road',
        district: 'Ratchathewi',
        status: 'MODERATE',
        avg_speed_kmh: 28.0,
        coordinates: [
          [100.5280, 13.7510],
          [100.5375, 13.7512],
          [100.5500, 13.7490],
        ],
        updated_at: now,
      },
      {
        id: 'traf_chaloem_maha_nakhon',
        road_name: 'Chaloem Maha Nakhon Expressway',
        district: 'Khlong Toei',
        status: 'LIGHT',
        avg_speed_kmh: 62.0,
        coordinates: [
          [100.5400, 13.7120],
          [100.5562, 13.7198],
          [100.5650, 13.7280],
        ],
        updated_at: now,
      },
    ];

    seedTraffic.forEach((seg) => this.trafficSegments.set(seg.id, seg));

    // 5. SEED FLOOD ZONES
    const seedFloods: FloodZone[] = [
      {
        id: 'fld_saensaep',
        name: 'Khlong Saen Saep Drainage Corridor',
        district: 'Watthana / Ratchathewi',
        water_level_m: 1.45,
        threshold_m: 1.80,
        status: 'WATCH',
        coordinates: [
          [100.5300, 13.7500],
          [100.5600, 13.7480],
          [100.5850, 13.7460],
          [100.5840, 13.7440],
          [100.5300, 13.7480],
        ],
        updated_at: now,
      },
      {
        id: 'fld_prempra',
        name: 'Prem Prachakon Hydrological Basin',
        district: 'Chatuchak',
        water_level_m: 1.95,
        threshold_m: 1.80,
        status: 'WARNING',
        coordinates: [
          [100.5480, 13.8010],
          [100.5600, 13.8090],
          [100.5550, 13.8150],
          [100.5430, 13.8060],
          [100.5480, 13.8010],
        ],
        updated_at: now,
      },
    ];

    seedFloods.forEach((fz) => this.floodZones.set(fz.id, fz));

    // 6. SEED DATA SOURCE MONITOR HEALTH
    const seedSources: SourceHealth[] = [
      {
        id: 'src_bma_traffic',
        name: 'Bangkok BMA Traffic Management System',
        provider: 'Bangkok Metropolitan Administration',
        type: 'Open Data REST / GeoJSON',
        region: 'Bangkok Urban Core',
        status: 'ONLINE',
        last_check: now,
        latency_ms: 38,
        error_rate_pct: 0.1,
        last_successful_fetch: now,
        next_check: new Date(Date.now() + 60000).toISOString(),
      },
      {
        id: 'src_exat_highways',
        name: 'EXAT Expressway Authority Real-Time Monitor',
        provider: 'Ministry of Transport Thailand',
        type: 'Highway Sensors / Public Cameras',
        region: 'Greater Bangkok Tollways',
        status: 'ONLINE',
        last_check: now,
        latency_ms: 55,
        error_rate_pct: 0.4,
        last_successful_fetch: now,
        next_check: new Date(Date.now() + 60000).toISOString(),
      },
      {
        id: 'src_yt_public',
        name: 'YouTube Live Verified Public Webcams',
        provider: 'Google / YouTube Public API',
        type: 'Public Live Video Streams',
        region: 'Bangkok Cityscape',
        status: 'ONLINE',
        last_check: now,
        latency_ms: 62,
        error_rate_pct: 0.0,
        last_successful_fetch: now,
        next_check: new Date(Date.now() + 120000).toISOString(),
      },
      {
        id: 'src_tmd_weather',
        name: 'Thai Meteorological Department Radar & Sensors',
        provider: 'TMD Government Weather Portal',
        type: 'Meteorological Open Data API',
        region: 'Chao Phraya River Basin',
        status: 'ONLINE',
        last_check: now,
        latency_ms: 44,
        error_rate_pct: 0.2,
        last_successful_fetch: now,
        next_check: new Date(Date.now() + 180000).toISOString(),
      },
      {
        id: 'src_js100_traffic',
        name: 'JS100 / FM91 Emergency Traffic Radio Broadcasts',
        provider: 'Public Traffic Radio Network',
        type: 'Audio & Incident Open Feed',
        region: 'Metropolitan Emergency Net',
        status: 'ONLINE',
        last_check: now,
        latency_ms: 82,
        error_rate_pct: 0.5,
        last_successful_fetch: now,
        next_check: new Date(Date.now() + 60000).toISOString(),
      },
      {
        id: 'src_dds_flood',
        name: 'BMA Department of Drainage & Water Levels',
        provider: 'BMA Hydrological Command',
        type: 'Water Sensor Open Telemetry',
        region: 'Canal & Drainage Basins',
        status: 'DEGRADED',
        last_check: now,
        latency_ms: 185,
        error_rate_pct: 2.1,
        last_successful_fetch: now,
        next_check: new Date(Date.now() + 30000).toISOString(),
      },
    ];

    seedSources.forEach((s) => this.sourceHealth.set(s.id, s));
  }

  // --- QUERY & RETRIEVAL METHODS ---

  public getCameras(filters?: Partial<FilterState>): CameraSource[] {
    let list = Array.from(this.cameras.values());

    if (filters) {
      if (filters.cameraStatuses && filters.cameraStatuses.length > 0) {
        list = list.filter((c) => filters.cameraStatuses!.includes(c.status));
      }
      if (filters.cameraTypes && filters.cameraTypes.length > 0) {
        list = list.filter((c) => filters.cameraTypes!.includes(c.source_type));
      }
      if (filters.selectedDistrict && filters.selectedDistrict !== 'ALL') {
        list = list.filter((c) => c.district.toLowerCase() === filters.selectedDistrict!.toLowerCase());
      }
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.district.toLowerCase().includes(q) ||
            c.provider.toLowerCase().includes(q)
        );
      }
    }

    return list;
  }

  public getCameraById(id: string): CameraSource | undefined {
    return this.cameras.get(id);
  }

  public getNearbyCameras(lat: number, lng: number, radiusMeters: number = 1500): CameraSource[] {
    return Array.from(this.cameras.values())
      .map((cam) => ({
        cam,
        distance: calculateDistanceMeters(lat, lng, cam.latitude, cam.longitude),
      }))
      .filter((item) => item.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.cam);
  }

  public getIncidents(filters?: Partial<FilterState>): Incident[] {
    let list = Array.from(this.incidents.values());

    if (filters) {
      if (filters.incidentSeverities && filters.incidentSeverities.length > 0) {
        list = list.filter((inc) => filters.incidentSeverities!.includes(inc.severity));
      }
      if (filters.incidentTypes && filters.incidentTypes.length > 0) {
        list = list.filter((inc) => filters.incidentTypes!.includes(inc.type));
      }
      if (filters.selectedDistrict && filters.selectedDistrict !== 'ALL') {
        list = list.filter((inc) => inc.district.toLowerCase() === filters.selectedDistrict!.toLowerCase());
      }
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        list = list.filter(
          (inc) =>
            inc.title.toLowerCase().includes(q) ||
            inc.description.toLowerCase().includes(q) ||
            inc.district.toLowerCase().includes(q)
        );
      }
    }

    return list.sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  public getPOIs(type?: string): POI[] {
    const list = Array.from(this.pois.values());
    if (type) {
      return list.filter((p) => p.type === type);
    }
    return list;
  }

  public getNearbyPOIs(lat: number, lng: number, type?: string, limit: number = 5): POI[] {
    let list = Array.from(this.pois.values());
    if (type) {
      list = list.filter((p) => p.type === type);
    }

    return list
      .map((poi) => ({
        ...poi,
        distance_meters: Math.round(calculateDistanceMeters(lat, lng, poi.latitude, poi.longitude)),
      }))
      .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0))
      .slice(0, limit);
  }

  public getTrafficSegments(): TrafficSegment[] {
    return Array.from(this.trafficSegments.values());
  }

  public getFloodZones(): FloodZone[] {
    return Array.from(this.floodZones.values());
  }

  public getWeather(): WeatherTelemetry {
    return this.weather;
  }

  public getSourceHealth(): SourceHealth[] {
    return Array.from(this.sourceHealth.values());
  }

  public addCamera(camera: CameraSource) {
    this.cameras.set(camera.id, camera);
  }

  public addIncident(incident: Incident) {
    this.incidents.set(incident.id, incident);
  }

  public updateIncident(incident: Incident) {
    this.incidents.set(incident.id, incident);
  }

  public getTelemetryHUD() {
    const onlineCams = Array.from(this.cameras.values()).filter((c) => c.status === 'ONLINE').length;
    const activeIncs = Array.from(this.incidents.values()).filter((i) => i.status === 'ACTIVE').length;
    const onlineSrcs = Array.from(this.sourceHealth.values()).filter((s) => s.status === 'ONLINE').length;

    return {
      zulu_time: new Date().toISOString().substring(11, 19) + 'Z',
      system_status: 'LIVE' as const,
      total_layers: 12,
      entities_tracked: 58352, // Global aggregate baseline
      online_cameras: onlineCams,
      active_incidents: activeIncs,
      online_sources: onlineSrcs,
      solar_kp: 'Kp1',
      wind_speed_ms: 3.4,
      viewport_location: 'Bangkok, Thailand',
    };
  }

  public searchEntities(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) return { cameras: [], incidents: [], pois: [] };

    const cameras = Array.from(this.cameras.values()).filter(
      (c) => c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q)
    );
    const incidents = Array.from(this.incidents.values()).filter(
      (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.district.toLowerCase().includes(q)
    );
    const pois = Array.from(this.pois.values()).filter(
      (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)
    );

    return { cameras, incidents, pois };
  }
}

// Global Singleton for Next.js server runtime
const globalForIntelligence = globalThis as unknown as {
  intelligenceDb: IntelligenceDatabase | undefined;
};

export const db = globalForIntelligence.intelligenceDb ?? new IntelligenceDatabase();

if (process.env.NODE_ENV !== 'production') {
  globalForIntelligence.intelligenceDb = db;
}
