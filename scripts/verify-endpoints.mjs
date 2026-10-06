const endpoints = [
  'http://localhost:3000/',
  'http://localhost:3000/api/cameras',
  'http://localhost:3000/api/cameras/cam_petchaburi_rd',
  'http://localhost:3000/api/cameras/nearby?lat=13.7389&lng=100.5601',
  'http://localhost:3000/api/incidents',
  'http://localhost:3000/api/incidents/inc_bkk_001',
  'http://localhost:3000/api/incidents/timeline',
  'http://localhost:3000/api/pois',
  'http://localhost:3000/api/traffic',
  'http://localhost:3000/api/weather',
  'http://localhost:3000/api/telemetry',
  'http://localhost:3000/api/sources/health',
  'http://localhost:3000/api/analytics',
  'http://localhost:3000/api/search?q=Sukhumvit',
];

async function run() {
  console.log('--- STARTING MIRRIX HEADLESS CLI ENDPOINTS VERIFICATION ---');
  let passCount = 0;

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log(`[PASS] ${res.status} OK - ${url}`);
        passCount++;
      } else {
        console.error(`[FAIL] ${res.status} ${res.statusText} - ${url}`);
      }
    } catch (e) {
      console.error(`[FAIL] Connection error - ${url}: ${e.message}`);
    }
  }

  // Test Security Validation (Section 2 - Reject private IP addresses)
  console.log('\n--- TESTING SECTION 2 LEGAL/SECURITY COMPLIANCE ---');
  try {
    const secRes = await fetch('http://localhost:3000/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Illegal Private Camera',
        source_url: 'rtsp://admin:admin@192.168.1.50/stream',
        latitude: 13.7,
        longitude: 100.5,
      }),
    });
    if (secRes.status === 403) {
      console.log('[PASS] 403 Forbidden - Correctly rejected private RTSP endpoint.');
      passCount++;
    } else {
      console.error(`[FAIL] Expected 403 but got ${secRes.status}`);
    }
  } catch (e) {
    console.error('[FAIL] Security test error:', e);
  }

  console.log(`\nVERIFICATION SUMMARY: ${passCount} / ${endpoints.length + 1} checks PASSED!`);
}

run();
