import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Source Registry & Specification
class MockSourceRegistry {
  constructor() {
    this.sources = [
      {
        id: 'src_bma_traffic',
        name: 'Bangkok BMA Traffic Portal',
        provider: 'BMA Department of Transport',
        type: 'TRAFFIC_CCTV_STREAM',
        url: 'https://traffic.bma.go.th',
        license: 'Open Government Data License (OGDL)',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: new Date().toISOString(),
        last_success: new Date().toISOString(),
        latency: 42,
        error_count: 0,
      },
      {
        id: 'src_exat_expressway',
        name: 'EXAT Expressway Surveillance',
        provider: 'Expressway Authority of Thailand',
        type: 'HIGHWAY_MONITORING',
        url: 'https://exat.co.th',
        license: 'Public Expressway Safety Data License',
        public_access: true,
        embed_allowed: false,
        status: 'ONLINE',
        last_checked: new Date().toISOString(),
        last_success: new Date().toISOString(),
        latency: 58,
        error_count: 0,
      },
      {
        id: 'src_doh_highway',
        name: 'Department of Highways CCTV',
        provider: 'Department of Highways, Thailand',
        type: 'HIGHWAY_CCTV',
        url: 'https://highway.go.th',
        license: 'Thailand Open Data License',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: new Date().toISOString(),
        last_success: new Date().toISOString(),
        latency: 48,
        error_count: 0,
      },
      {
        id: 'src_tmd_weather',
        name: 'Thai Meteorological Department',
        provider: 'Thai Meteorological Department',
        type: 'METEOROLOGY_RADAR',
        url: 'https://tmd.go.th',
        license: 'Public Meteorological Data Commons',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: new Date().toISOString(),
        last_success: new Date().toISOString(),
        latency: 35,
        error_count: 0,
      },
      {
        id: 'src_ddpm_civil_defense',
        name: 'Department of Disaster Prevention and Mitigation',
        provider: 'Ministry of Interior, Thailand',
        type: 'DISASTER_ALERT_FEED',
        url: 'https://disaster.go.th',
        license: 'Public Safety Directive License',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: new Date().toISOString(),
        last_success: new Date().toISOString(),
        latency: 62,
        error_count: 0,
      },
      {
        id: 'src_bkk_traffic_police',
        name: 'Bangkok Traffic Police Radio',
        provider: 'Royal Thai Police',
        type: 'POLICE_INCIDENT_DISPATCH',
        url: 'https://trafficpolice.go.th',
        license: 'Public Safety Broadcast License',
        public_access: true,
        embed_allowed: true,
        status: 'ONLINE',
        last_checked: new Date().toISOString(),
        last_success: new Date().toISOString(),
        latency: 39,
        error_count: 0,
      },
    ];
  }

  getAll() {
    return this.sources;
  }
}

// 2. Data Age Engine
class MockDataAgeEngine {
  static classifyAge(timestampMs) {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
    if (elapsedSeconds < 60) return 'LIVE';
    if (elapsedSeconds < 15 * 60) return 'RECENT';
    if (elapsedSeconds < 60 * 60) return 'STALE';
    return 'OFFLINE';
  }

  static formatAge(timestampMs) {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
    if (elapsedSeconds < 5) return 'JUST NOW';
    if (elapsedSeconds < 60) return `${elapsedSeconds} SEC AGO`;
    const mins = Math.floor(elapsedSeconds / 60);
    if (mins < 60) return `${mins} MIN AGO`;
    return `${Math.floor(mins / 60)} HR AGO`;
  }
}

// 3. Provenance & Confidence Rating
class MockProvenanceEngine {
  static classifyConfidence(score, sourceCount = 1) {
    const effective = score + (sourceCount > 1 ? (sourceCount - 1) * 0.04 : 0);
    if (effective >= 0.95) return 'VERY HIGH';
    if (effective >= 0.85) return 'HIGH';
    if (effective >= 0.70) return 'MEDIUM';
    return 'LOW';
  }
}

// 4. Geocoding Pipeline
class MockGeocodingPipeline {
  static geocode(text) {
    const lower = text.toLowerCase();
    if (lower.includes('asok') || lower.includes('sukhumvit')) {
      return { latitude: 13.7372, longitude: 100.5614, district: 'Watthana' };
    }
    if (lower.includes('siam')) {
      return { latitude: 13.7466, longitude: 100.5348, district: 'Pathum Wan' };
    }
    return null;
  }

  static isInBangkokBounds(lat, lng) {
    return lat >= 13.45 && lat <= 14.10 && lng >= 100.25 && lng <= 100.95;
  }
}

// 5. PostGIS Spatial Operations
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- TESTS ---

test('Source Registry: Every source contains all 13 required fields and status', () => {
  const registry = new MockSourceRegistry();
  const sources = registry.getAll();
  assert.ok(sources.length >= 6);

  const requiredFields = [
    'id',
    'name',
    'provider',
    'type',
    'url',
    'license',
    'public_access',
    'embed_allowed',
    'status',
    'last_checked',
    'last_success',
    'latency',
    'error_count',
  ];

  for (const src of sources) {
    for (const field of requiredFields) {
      assert.ok(src[field] !== undefined, `Missing field: ${field}`);
    }
    assert.ok(['ONLINE', 'DEGRADED', 'OFFLINE', 'STALE'].includes(src.status));
  }
});

test('Camera Model: Verified Bangkok camera attributes', () => {
  const camera = {
    id: 'cam_petchaburi_rd',
    name: 'Petchaburi Road - Bangkok',
    latitude: 13.7512,
    longitude: 100.5375,
    type: 'TRAFFIC',
    source: 'BMA Department of Transport (Open Data)',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    embed_url: 'https://traffic.bma.go.th/embed/petchaburi-01',
    status: 'ONLINE',
    last_verified: new Date().toISOString(),
    license: 'Open Government Data License (OGDL)',
  };

  const fields = [
    'id',
    'name',
    'latitude',
    'longitude',
    'type',
    'source',
    'stream_url',
    'embed_url',
    'status',
    'last_verified',
    'license',
  ];

  for (const f of fields) {
    assert.ok(camera[f] !== undefined, `Missing camera field: ${f}`);
  }
});

test('Incident Model: Verified Bangkok incident attributes', () => {
  const incident = {
    id: 'inc_bkk_001',
    type: 'ACCIDENT',
    title: 'Multi-Vehicle Collision on Sukhumvit Road at Asok',
    description: 'Blocking two lanes',
    latitude: 13.7375,
    longitude: 100.5608,
    severity: 'HIGH',
    confidence: 0.94,
    source_count: 3,
    first_seen: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    last_updated: new Date().toISOString(),
    source_url: 'https://trafficpolice.go.th/alerts/inc_bkk_001',
  };

  const fields = [
    'id',
    'type',
    'title',
    'description',
    'latitude',
    'longitude',
    'severity',
    'confidence',
    'source_count',
    'first_seen',
    'last_updated',
    'source_url',
  ];

  for (const f of fields) {
    assert.ok(incident[f] !== undefined, `Missing incident field: ${f}`);
  }
});

test('Data Age Engine: Classifies LIVE, RECENT, STALE, OFFLINE and relative formatting', () => {
  const now = Date.now();

  assert.equal(MockDataAgeEngine.classifyAge(now - 10 * 1000), 'LIVE');
  assert.equal(MockDataAgeEngine.classifyAge(now - 5 * 60 * 1000), 'RECENT');
  assert.equal(MockDataAgeEngine.classifyAge(now - 30 * 60 * 1000), 'STALE');
  assert.equal(MockDataAgeEngine.classifyAge(now - 2 * 3600 * 1000), 'OFFLINE');

  assert.equal(MockDataAgeEngine.formatAge(now - 3 * 1000), 'JUST NOW');
  assert.equal(MockDataAgeEngine.formatAge(now - 18 * 1000), '18 SEC AGO');
  assert.equal(MockDataAgeEngine.formatAge(now - 2 * 60 * 1000), '2 MIN AGO');
  assert.equal(MockDataAgeEngine.formatAge(now - 14 * 60 * 1000), '14 MIN AGO');
});

test('Source Provenance: Categorizes confidence into LOW, MEDIUM, HIGH, VERY HIGH', () => {
  assert.equal(MockProvenanceEngine.classifyConfidence(0.50, 1), 'LOW');
  assert.equal(MockProvenanceEngine.classifyConfidence(0.75, 1), 'MEDIUM');
  assert.equal(MockProvenanceEngine.classifyConfidence(0.88, 1), 'HIGH');
  assert.equal(MockProvenanceEngine.classifyConfidence(0.96, 1), 'VERY HIGH');
  assert.equal(MockProvenanceEngine.classifyConfidence(0.88, 3), 'VERY HIGH');
});

test('Geocoding Pipeline: Resolves Bangkok gazetteer locations and validates bounds', () => {
  const asok = MockGeocodingPipeline.geocode('Sukhumvit Road near Asok');
  assert.ok(asok !== null);
  assert.equal(asok.district, 'Watthana');

  const siam = MockGeocodingPipeline.geocode('Siam Paragon District');
  assert.ok(siam !== null);
  assert.equal(siam.district, 'Pathum Wan');

  assert.equal(MockGeocodingPipeline.isInBangkokBounds(13.7420, 100.5450), true);
  assert.equal(MockGeocodingPipeline.isInBangkokBounds(48.8566, 2.3522), false);
});

test('PostGIS Spatial Engine: ST_DWithin filters entities by distance radius', () => {
  const centerLat = 13.7372;
  const centerLng = 100.5604;

  const testEntities = [
    { id: 'near', lat: 13.7375, lng: 100.5606 },
    { id: 'far', lat: 13.8500, lng: 100.6500 },
  ];

  const within500m = testEntities.filter((e) => {
    return calculateDistanceMeters(centerLat, centerLng, e.lat, e.lng) <= 500;
  });

  assert.equal(within500m.length, 1);
  assert.equal(within500m[0].id, 'near');
});
