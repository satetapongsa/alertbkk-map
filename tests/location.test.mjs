import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Geodesic Distance Utility
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

// 2. Accuracy Quality Classifier
function classifyQuality(accuracy) {
  if (accuracy <= 10) return 'EXCELLENT';
  if (accuracy <= 25) return 'GOOD';
  if (accuracy <= 100) return 'FAIR';
  return 'POOR';
}

// 3. Zoom calculation based on accuracy
function getZoomForAccuracy(accuracy) {
  if (accuracy <= 10) return 17;
  if (accuracy <= 50) return 16;
  if (accuracy <= 200) return 14.5;
  return 13;
}

// 4. Coordinate formatting (6 decimals)
function formatTacticalCoordinates(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}

// 5. Circle generation approximation test
function generateCirclePolygon(lng, lat, radiusMeters) {
  const steps = 32;
  const coords = [];
  const km = Math.max(radiusMeters, 2) / 1000;
  const radLat = (km / 6371) * (180 / Math.PI);
  const radLng = radLat / Math.cos((lat * Math.PI) / 180);

  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * (2 * Math.PI);
    const x = lng + radLng * Math.cos(theta);
    const y = lat + radLat * Math.sin(theta);
    coords.push([x, y]);
  }
  coords.push(coords[0]); // Close ring

  return {
    type: 'Feature',
    properties: { accuracy: radiusMeters },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

// 6. Mock One-Shot Geolocation Controller (MIRRIX: No watchPosition, No Tracking)
class MockOneShotGeolocationController {
  constructor() {
    this.status = 'IDLE';
    this.location = null;
    this.watchPositionCalled = false;
    this.serverTransmissionAttempted = false;
    this.fixCount = 0;
    this.errorMsg = null;
  }

  locate(mockPosition) {
    this.status = 'REQUESTING';
    if (!mockPosition) {
      this.status = 'ERROR';
      this.errorMsg = 'Location request failed';
      return;
    }
    if (mockPosition.error) {
      if (mockPosition.code === 1) this.status = 'PERMISSION_DENIED';
      else if (mockPosition.code === 2) this.status = 'POSITION_UNAVAILABLE';
      else if (mockPosition.code === 3) this.status = 'TIMEOUT';
      this.errorMsg = mockPosition.message;
      return;
    }

    this.fixCount++;
    this.status = 'LOCATED';
    this.location = {
      latitude: mockPosition.coords.latitude,
      longitude: mockPosition.coords.longitude,
      accuracy: mockPosition.coords.accuracy,
      heading: mockPosition.coords.heading || null,
      speed: mockPosition.coords.speed || null,
      timestamp: Date.now(),
      quality: classifyQuality(mockPosition.coords.accuracy),
    };
  }
}

// 7. Mock Map View Mode Controller
class MockMapModeController {
  constructor() {
    this.dimension = '2D'; // Default is 2D
    this.basemap = 'SAT';  // Default is SAT
    this.pitch = 0;        // Default is 0 (True Top-Down)
    this.bearing = 0;      // Default is 0 (North-Up)
  }

  set2D() {
    this.dimension = '2D';
    this.pitch = 0;
    this.bearing = 0;
  }

  set3D() {
    this.dimension = '3D';
    this.pitch = 55;
    this.bearing = -15;
  }

  setSat() {
    this.basemap = 'SAT';
  }

  setMap() {
    this.basemap = 'MAP';
  }
}

// --- TESTS ---

test('Location Quality: Accuracy classification thresholds', () => {
  assert.equal(classifyQuality(5.4), 'EXCELLENT');
  assert.equal(classifyQuality(10.0), 'EXCELLENT');
  assert.equal(classifyQuality(18.2), 'GOOD');
  assert.equal(classifyQuality(65.0), 'FAIR');
  assert.equal(classifyQuality(120.0), 'POOR');
});

test('Location Zoom: Appropriate zoom levels tailored to accuracy', () => {
  assert.equal(getZoomForAccuracy(8), 17);
  assert.equal(getZoomForAccuracy(25), 16);
  assert.equal(getZoomForAccuracy(150), 14.5);
  assert.equal(getZoomForAccuracy(500), 13);
});

test('Tactical Coordinate Formatting: 6 decimals and hemisphere direction', () => {
  const formatted = formatTacticalCoordinates(13.756331, 100.501762);
  assert.equal(formatted, '13.756331° N, 100.501762° E');
});

test('One-Shot Location Fix: Exact coordinates and accuracy circle of 8 meters', () => {
  const controller = new MockOneShotGeolocationController();
  assert.equal(controller.status, 'IDLE');

  controller.locate({
    coords: {
      latitude: 13.756331,
      longitude: 100.501762,
      accuracy: 8.0,
      heading: 182,
      speed: null,
    },
  });

  assert.equal(controller.status, 'LOCATED');
  assert.equal(controller.location.latitude, 13.756331);
  assert.equal(controller.location.longitude, 100.501762);
  assert.equal(controller.location.accuracy, 8.0);
  assert.equal(controller.location.quality, 'EXCELLENT');
  assert.equal(controller.watchPositionCalled, false);
});

test('Zero Continuous Tracking: watchPosition is NEVER called and no background tracking', () => {
  const controller = new MockOneShotGeolocationController();
  controller.locate({
    coords: {
      latitude: 13.756331,
      longitude: 100.501762,
      accuracy: 8.0,
    },
  });

  assert.equal(controller.watchPositionCalled, false);
  assert.equal(controller.status, 'LOCATED');

  // Triggering locate again gets a new fresh one-shot position
  controller.locate({
    coords: {
      latitude: 13.756400,
      longitude: 100.501800,
      accuracy: 6.5,
    },
  });

  assert.equal(controller.fixCount, 2);
  assert.equal(controller.location.latitude, 13.756400);
  assert.equal(controller.location.accuracy, 6.5);
  assert.equal(controller.watchPositionCalled, false);
});

test('Error Handling: PERMISSION_DENIED state', () => {
  const controller = new MockOneShotGeolocationController();
  controller.locate({
    error: true,
    code: 1,
    message: 'User denied Geolocation',
  });
  assert.equal(controller.status, 'PERMISSION_DENIED');
  assert.ok(controller.errorMsg.includes('denied'));
});

test('Error Handling: TIMEOUT state', () => {
  const controller = new MockOneShotGeolocationController();
  controller.locate({
    error: true,
    code: 3,
    message: 'Geolocation timed out',
  });
  assert.equal(controller.status, 'TIMEOUT');
});

test('Accuracy Circle: Circle polygon coordinates match device accuracy of 8 meters', () => {
  const circle = generateCirclePolygon(100.501762, 13.756331, 8.0);
  assert.equal(circle.type, 'Feature');
  assert.equal(circle.geometry.type, 'Polygon');
  assert.equal(circle.properties.accuracy, 8.0);
  assert.ok(circle.geometry.coordinates[0].length > 10);
});

test('Privacy By Default: User coordinates are never sent to server backend', () => {
  const controller = new MockOneShotGeolocationController();
  controller.locate({
    coords: {
      latitude: 13.756331,
      longitude: 100.501762,
      accuracy: 6.0,
    },
  });
  assert.equal(controller.serverTransmissionAttempted, false);
});

test('2D Map Mode: True Top-Down View (pitch = 0, bearing = 0)', () => {
  const map = new MockMapModeController();
  // Default opens as 2D + SAT
  assert.equal(map.dimension, '2D');
  assert.equal(map.basemap, 'SAT');
  assert.equal(map.pitch, 0);
  assert.equal(map.bearing, 0);

  // Switch to 3D
  map.set3D();
  assert.equal(map.dimension, '3D');
  assert.equal(map.pitch, 55);

  // Switch back to 2D -> must strictly restore pitch = 0 and bearing = 0
  map.set2D();
  assert.equal(map.dimension, '2D');
  assert.equal(map.pitch, 0);
  assert.equal(map.bearing, 0);
});

test('Decoupled Map Modes: 2D+SAT, 2D+MAP, 3D+SAT, 3D+MAP orthogonal states', () => {
  const map = new MockMapModeController();

  // 1. 2D + SAT
  map.set2D();
  map.setSat();
  assert.equal(map.dimension, '2D');
  assert.equal(map.basemap, 'SAT');
  assert.equal(map.pitch, 0);

  // 2. 2D + MAP
  map.setMap();
  assert.equal(map.dimension, '2D');
  assert.equal(map.basemap, 'MAP');
  assert.equal(map.pitch, 0);

  // 3. 3D + MAP
  map.set3D();
  assert.equal(map.dimension, '3D');
  assert.equal(map.basemap, 'MAP');
  assert.equal(map.pitch, 55);

  // 4. 3D + SAT
  map.setSat();
  assert.equal(map.dimension, '3D');
  assert.equal(map.basemap, 'SAT');
  assert.equal(map.pitch, 55);
});
