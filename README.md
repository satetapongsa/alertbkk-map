# MIRRIX — Real-World Intelligence

> **LIVE GLOBAL SITUATIONAL AWARENESS PLATFORM**  
> *A live mirror of the real world assembled from public geospatial feeds, traffic cameras, weather radar, civil defense bulletins, and urban sensor networks.*  
> **Initial Operational Sector**: Bangkok, Thailand (scalable globally).

---

## 1. System Vision & Architecture

**MIRRIX** (*Mirror + Matrix*) provides real-time situational awareness by aggregating, validating, and normalizing public safety data without compromising civil privacy. It empowers operators to instantly ascertain:

- **WHAT IS HAPPENING?** (Accidents, fires, floods, hazardous weather)
- **WHERE IS IT?** (Geocoded coordinates, district boundaries, road corridors)
- **WHEN DID IT OCCUR?** (Precise ICT/Zulu timestamps, data age, decay status)
- **WHAT PUBLIC SENSORS ARE NEARBY?** (Live traffic cameras, flood gauges, air stations)
- **WHAT IS THE SOURCE PROVENANCE?** (Multi-agency corroboration, confidence ratings)
- **WHERE ARE CRITICAL SERVICES?** (Trauma hospitals, police stations, fire & rescue bases)

```
       ┌─────────────────────────────────────────────────────────────┐
       │             PUBLIC DATA ADAPTER FRAMEWORK                   │
       │  BMA Traffic │ EXAT │ DOH │ TMD │ DDPM │ Traffic Police │ DDS │
       └──────────────────────────────┬──────────────────────────────┘
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                 REAL DATA INGESTION PIPELINE                │
       │  • Source Registry (13 Fields & Latency Tracking)           │
       │  • Bilingual Thai/EN Normalizer & Severity Engine           │
       │  • Bangkok Geocoding Pipeline & Gazetteer                   │
       │  • Deduplication Engine (Spatial 350m / Temporal 60m)       │
       │  • Data Age Engine (LIVE / RECENT / STALE / OFFLINE)        │
       │  • PostGIS Spatial Indexing & Redis TTL Caching Layer       │
       └──────────────────────────────┬──────────────────────────────┘
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                MIRRIX TACTICAL PRESENTATION                 │
       │  • True 2D Overhead Map (pitch: 0°) / Orthogonal 3D View    │
       │  • Instant One-Shot GPS Tactical Zoom Warp                  │
       │  • Non-Overlapping Window Management (Mutual Exclusivity)   │
       │  • Multi-Camera Surveillance Wall & Radial Area Scanner     │
       └─────────────────────────────────────────────────────────────┘
```

---

## 2. Real Data Ingestion Engine

MIRRIX integrates a modular data pipeline built specifically for verified public feeds:

### 2.1 Pluggable Public Data Adapters
New data providers plug directly into the `PublicDataAdapterFramework` without modifying core visualization logic:
- **`BmaTrafficAdapter`**: Bangkok Metropolitan Administration Department of Transport CCTV.
- **`ExatExpresswayAdapter`**: Expressway Authority of Thailand surveillance feeds.
- **`DohHighwayAdapter`**: Department of Highways intercity highway network.
- **`TmdWeatherAdapter`**: Thai Meteorological Department weather stations and radar telemetry.
- **`DdpmDisasterAdapter`**: Department of Disaster Prevention and Mitigation civil defense alerts.
- **`BkkTrafficPoliceAdapter`**: Bangkok Traffic Police Command & public radio dispatches (FM91 / JS100).
- **`YouTubeWebcamAdapter`**: Official public skyline and traffic live video streams.
- **`BmaDrainageAdapter`**: Department of Drainage and Sewerage flood and canal telemetry.

### 2.2 Strict Source Attributes (13 Required Fields)
Every registered source contains complete provenance tracking:
```json
{
  "id": "src_bma_traffic",
  "name": "Bangkok Metropolitan Administration (BMA) Traffic Portal",
  "provider": "BMA Department of Transport",
  "type": "TRAFFIC_CCTV_STREAM",
  "url": "https://traffic.bma.go.th",
  "license": "Open Government Data License (OGDL)",
  "public_access": true,
  "embed_allowed": true,
  "status": "ONLINE",
  "last_checked": "2026-10-06T15:44:34.284Z",
  "last_success": "2026-10-06T15:44:34.284Z",
  "latency": 25,
  "error_count": 0
}
```

### 2.3 Verified Camera Model
```json
{
  "id": "cam_petchaburi_rd",
  "name": "Petchaburi Road - Bangkok",
  "latitude": 13.7512,
  "longitude": 100.5375,
  "type": "TRAFFIC",
  "source": "BMA Department of Transport (Open Data)",
  "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "embed_url": "https://traffic.bma.go.th/embed/petchaburi-01",
  "status": "ONLINE",
  "last_verified": "2026-10-06T15:44:30.132Z",
  "license": "Open Government Data License (OGDL)"
}
```

### 2.4 Incident Normalizer & Deduplication
- **Bilingual Extraction**: Automatic classification of incident reports in Thai (ชน, ไฟไหม้, น้ำท่วม, ฝนตก) and English (Accident, Fire, Flood, Weather).
- **Spatial Clustering**: Haversine geodesic clustering merges duplicate reports within 350 meters.
- **Temporal Windows**: Events reported within 60 minutes of each other are consolidated with an elevated `source_count` and calculated confidence score (`0.0 - 1.0`).
- **Data Age Engine**: Dynamic status tagging (`LIVE` < 60s, `RECENT` < 15m, `STALE` < 1h, `OFFLINE` > 1h) with human-readable relative ages (`JUST NOW`, `45 SEC AGO`, `12 MIN AGO`).

---

## 3. Map Viewport & Navigation Mechanics

### 3.1 One-Shot GPS Location with Tactical Zoom Warp
Clicking **`[ MY LOCATION ]`** triggers high-precision navigation:
1. **One-Shot Execution**: Uses `navigator.geolocation.getCurrentPosition()` (`enableHighAccuracy: true`, `timeout: 10000`).
2. **Immediate Tactical Warp**: Triggers MapLibre `flyTo` directly to user coordinates at high-speed close-range zoom (`zoom: 17.0`, `duration: 1200ms`, `curve: 1.42`, `speed: 1.5`, `essential: true`).
3. **No Continuous Tracking**: Strictly avoids `watchPosition` or background polling. Coordinates stay in client memory.
4. **Resilient Fallback**: If browser permissions or hardware GPS are unavailable, automatically anchors to Bangkok Central sector (Pathum Wan) so the tactical pin always renders and the warp animation executes smoothly.

### 3.2 True 2D Overhead & Decoupled 3D Modes
- **2D Mode**: Strictly locked perpendicular top-down (`pitch: 0°, bearing: 0°`).
- **3D Mode**: Tactical tilted perspective (`pitch: 50°`, bearing preserved).
- **Decoupled Cartography**: Seamless orthogonal switching between `[ MAP ]` (Carto Dark Matter vector tiles) and `[ SAT ]` (Esri World High-Res Satellite imagery).

### 3.3 Mutual Exclusivity Window Coordinator
To prevent UI clutter and window overlap:
- **Single Active Window**: Opening any drawer or modal (`SEARCH`, `FILTERS`, `TIMELINE`, `ANALYTICS`, `SYSTEM_STATUS`, `SCAN_AREA`, `SUMMARY`, `BOOKMARKS`, `GRID_VIEW`, or item inspectors) immediately dismisses whatever window was previously open.
- **Topmost Priority**: Elevated `z-index` layering (`z-index: 100`) guarantees active windows remain unobstructed.
- **Click to Toggle**: Clicking an active navigation button closes the window and returns immediately to the map view.

---

## 4. REST & Streaming API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/sources` | `GET` | Returns all 8 data sources with all 13 required metadata fields. |
| `/api/sources/health` | `GET` | Real-time source health breakdown (`ONLINE`, `DEGRADED`, `OFFLINE`, `STALE`). |
| `/api/cameras` | `GET` | List all verified Bangkok traffic cameras with stream and embed URLs. |
| `/api/cameras/[id]` | `GET` | Retrieve specific camera details and nearby incident cross-references. |
| `/api/cameras/nearby` | `GET` | Spatial query returning cameras within radius meters (`lat`, `lng`, `radius`). |
| `/api/incidents` | `GET` | Active verified incidents with severity, confidence, and source links. |
| `/api/incidents/timeline`| `GET` | Chronological incident history for retrospective incident playback. |
| `/api/pois` | `GET` | Critical infrastructure (Trauma hospitals, police, fire stations). |
| `/api/traffic` | `GET` | Surface expressway segment flow and drainage canal flood alerts. |
| `/api/weather` | `GET` | TMD atmospheric observations, temperature, radar rain telemetry. |
| `/api/telemetry` | `GET` | Tactical HUD telemetry (Zulu clock, active layers, entity count). |
| `/api/events` | `GET` | Server-Sent Events (SSE) live stream for instant event dispatching. |

---

## 5. Security & Legal Compliance Policy

- **Zero Private CCTV**: Private IP address ranges (`10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`), LAN streams, or unauthorized RTSP connections are rejected.
- **Open Government Data**: Ingestion is restricted to publicly published endpoints under OGDL, Creative Commons, or official public YouTube embed licenses.
- **No Biometric Surveillance**: Zero facial recognition, zero license-plate tracking, and zero personal data retention.
- **Demo / Simulation Transparency**: Where authenticated live streams are temporarily offline or restricted, sources are explicitly watermarked `DEMO / SIMULATION` to prevent false intelligence.

---

## 6. Installation & Deployment

### Prerequisites
- Node.js `v20.x` or `v22.x`+
- npm `v10.x`+

### Development Setup
```bash
# Clone the repository
git clone https://github.com/satetapongsa/alertbkk-map.git
cd alertbkk-map

# Install dependencies
npm install

# Run automated test suite (27 tests)
npm test

# Run TypeScript compilation check
npx tsc --noEmit

# Start development server
npm run dev
```

### Production Build & Launch
```bash
# Build optimized Turbopack bundle
npm run build

# Start production server
npm run start
```
Access the application at `http://localhost:3000`.

---

## 7. Keyboard Shortcuts

- `[ S ]` — Toggle Global Search & Coordinate Jump
- `[ L ]` — Toggle Map Layers & Filter Drawer
- `[ T ]` / `[ I ]` — Toggle Incident Timeline & Signals
- `[ A ]` — Toggle Situational Analytics Dashboard
- `[ C ]` — Toggle Multi-Camera Surveillance Wall
- `[ F ]` — Toggle Fullscreen Command Center Mode
- `[ R ]` — Reset Camera View to Bangkok Core Sector
- `[ ESC ]` — Close Active Window / Clear Overlay

---

## 8. License

Distributed under the MIT License for public safety, civil defense research, and open geospatial analysis.
