import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Spatial Haversine Function Test
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

test('Geospatial: distance between Siam Paragon and Asok Intersection', () => {
  // Siam: 13.7466, 100.5348
  // Asok: 13.7372, 100.5604
  const distance = calculateDistanceMeters(13.7466, 100.5348, 13.7372, 100.5604);
  assert.ok(distance > 2800 && distance < 3300, `Expected ~3km, received ${distance}m`);
});

test('Geospatial: distance between Sukhumvit Soi 11 and Soi 19', () => {
  const distance = calculateDistanceMeters(13.7441, 100.5559, 13.7389, 100.5601);
  assert.ok(distance > 500 && distance < 900, `Expected ~700m, received ${distance}m`);
});

// 2. AI Event Classifier Test
function classifyReport(rawText) {
  const textLower = rawText.toLowerCase();
  let type = 'OTHER';
  if (textLower.includes('ชน') || textLower.includes('accident') || textLower.includes('collision')) {
    type = 'ACCIDENT';
  } else if (textLower.includes('ไฟไหม้') || textLower.includes('fire')) {
    type = 'FIRE';
  } else if (textLower.includes('น้ำท่วม') || textLower.includes('flood')) {
    type = 'FLOOD';
  }

  let severity = 'MEDIUM';
  if (textLower.includes('critical') || textLower.includes('fatal') || textLower.includes('ระเบิด')) {
    severity = 'CRITICAL';
  } else if (textLower.includes('หนัก') || textLower.includes('high') || textLower.includes('3 คัน')) {
    severity = 'HIGH';
  }

  return { type, severity };
}

test('AI Classifier: Thai accident report extraction', () => {
  const result = classifyReport('รถชนกัน 3 คัน บริเวณแยกอโศก รถติดหนัก');
  assert.equal(result.type, 'ACCIDENT');
  assert.equal(result.severity, 'HIGH');
});

test('AI Classifier: Fire report extraction', () => {
  const result = classifyReport('ไฟไหม้อาคารพาณิชย์ บางกะปิ เกิดเหตุระเบิด');
  assert.equal(result.type, 'FIRE');
  assert.equal(result.severity, 'CRITICAL');
});

// 3. Legal and Source Safety Validator Test
function validateSourceLegality(sourceUrl) {
  if (
    sourceUrl.includes('192.168.') ||
    sourceUrl.includes('10.0.') ||
    sourceUrl.includes('172.16.') ||
    sourceUrl.includes('admin:admin') ||
    sourceUrl.includes('root:')
  ) {
    return { valid: false, reason: 'SECURITY_VIOLATION' };
  }
  return { valid: true };
}

test('Legal Compliance: Rejects private LAN CCTV addresses', () => {
  const test1 = validateSourceLegality('rtsp://admin:admin@192.168.1.100:554/live');
  assert.equal(test1.valid, false);
  assert.equal(test1.reason, 'SECURITY_VIOLATION');
});

test('Legal Compliance: Accepts verified public web sources', () => {
  const test2 = validateSourceLegality('https://traffic.bma.go.th/camera/petchaburi-01');
  assert.equal(test2.valid, true);
});

// 4. Data Age Formatter Test
function formatDataAge(timestamp, now = Date.now()) {
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

test('Data Age: formats seconds, minutes, and hours properly', () => {
  const now = Date.now();
  assert.equal(formatDataAge(now - 12000, now), '12s ago');
  assert.equal(formatDataAge(now - 300000, now), '5m ago');
  assert.equal(formatDataAge(now - 3600000 * 2, now), '2h ago');
});

// 5. Incident Confidence Calculator Test
function computeIncidentConfidence(sourceCount, baseConfidence = 0.8) {
  let multiplier = 1.0;
  if (sourceCount >= 4) multiplier = 1.25;
  else if (sourceCount === 3) multiplier = 1.15;
  else if (sourceCount === 2) multiplier = 1.05;
  else multiplier = 0.9;

  const score = Math.min(1.0, Math.max(0.2, baseConfidence * multiplier));
  let level = 'MEDIUM';
  if (score >= 0.9) level = 'VERY HIGH';
  else if (score >= 0.75) level = 'HIGH';
  else if (score >= 0.5) level = 'MEDIUM';
  else level = 'LOW';

  return { score: Number(score.toFixed(2)), level };
}

test('Incident Confidence: multi-source agreement boosts confidence level', () => {
  const single = computeIncidentConfidence(1, 0.7);
  assert.equal(single.level, 'MEDIUM');

  const multi = computeIncidentConfidence(4, 0.8);
  assert.equal(multi.level, 'VERY HIGH');
  assert.equal(multi.score, 1.0);
});

// 6. Coordinate Input Parser Test
function parseCoordinateInput(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/^([-+]?\d{1,3}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

test('Coordinate Parsing: handles comma and space separated lat/lon', () => {
  const parsed1 = parseCoordinateInput('13.756331, 100.501762');
  assert.deepEqual(parsed1, { lat: 13.756331, lng: 100.501762 });

  const parsed2 = parseCoordinateInput('13.756331 100.501762');
  assert.deepEqual(parsed2, { lat: 13.756331, lng: 100.501762 });

  const invalid = parseCoordinateInput('bangkok highway');
  assert.equal(invalid, null);
});
