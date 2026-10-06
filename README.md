# MIRRIX — Real-World Intelligence

> **Live Global Situational Awareness Platform**  
> Assembled from public geospatial, camera, traffic, weather, infrastructure, and incident data.  
> Focused initially on Bangkok, Thailand with a distributed architecture designed to scale globally.

---

## 1. System Overview

**MIRRIX** (Mirror + Matrix) is a live mirror of the real world, assembled from public geospatial intelligence. It allows an operator to open the system and immediately answer:
- **WHAT IS HAPPENING?**
- **WHERE IS IT?**
- **WHEN DID IT HAPPEN?**
- **WHAT PUBLIC CAMERAS ARE NEARBY?**
- **WHAT PUBLIC SOURCES REPORTED IT?**
- **WHAT SERVICES ARE NEARBY?**
- **WHAT IS THE CURRENT TRAFFIC / WEATHER / FLOOD SITUATION?**

### Visual & Tactical Direction
- **Map-First Experience**: High-resolution dark satellite imagery dominates ~90% of the viewport.
- **True 2D Overhead Projection**: Default application view is True 2D top-down satellite (pitch 0°, bearing 0°). Decoupled 3D (pitch 55°) and basemaps (`MAP` / `SAT`).
- **Command HUD**: Real-time Zulu clock, live status indicator, location status, active camera matrix, situational summary.
- **Reference-Accurate Markers**: Glowing camera markers, pulsating incident severity markers, and emergency services (hospitals, police, fire & rescue).
- **Tactical Controls**: `[ 3D ] [ 2D ] [ MAP ] [ SAT ]` perspective controls with pitch, bearing, and zoom.

---

## 2. Source Safety & Legal Compliance Policy

Per strict operational requirements:
- **Zero Private CCTV**: Private network endpoints (`192.168.x.x`, `10.x.x.x`), RTSP brute-forcing, and authentication bypass are prohibited.
- **Strictly Public & Open Data**: Only ingests verified open-government data (Bangkok BMA, DOH, EXAT), Creative Commons webcams, and embeddable YouTube Live feeds.
- **Safe Fallback**: If an official public source prohibits direct embedding, the system provides a direct **"OPEN PUBLIC SOURCE"** portal link instead of attempting to circumvent restrictions.
- **Privacy & Civil Liberties**: No facial recognition, no biometric analysis, no individual tracking.

---

## 3. Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tactical Dark SOC Design System (Vanilla CSS, Glassmorphism, JetBrains Mono)
- **Map Engine**: MapLibre GL JS + Esri World Imagery (High-Res Dark Satellite) + Carto Dark Matter
- **Geospatial Computations**: Turf.js, Haversine geodesic indexing, Bounding-Box filtering
- **Database & Storage**: PostgreSQL 16 + PostGIS extension (DDL included in `src/lib/schema.sql`)
- **Real-Time Layer**: Server-Sent Events (SSE) `/api/events` + Companion WebSocket Server (`scripts/start-ws.mjs`)
- **Acoustic Feedback**: Web Audio API tactical synthesizer (radar chirp, alert chime)
- **One-Shot Location**: Native Browser Geolocation API (`getCurrentPosition` with `enableHighAccuracy: true`) + Turf.js dynamic accuracy circle + Client-side Privacy Enclave

---

## 3.1 Device Location System (Privacy-First One-Shot Fix)

MIRRIX features a pure one-shot, privacy-first device location system:
- **Single Target Fix**: Clicking `[ MY LOCATION ]` requests a single position fix (`getCurrentPosition`), moves map directly to those exact coordinates, renders single user target marker ("YOU ARE HERE"), and displays accuracy circle matching `coords.accuracy` in meters (`±X M`).
- **No Continuous Tracking**: Zero background monitoring, zero `watchPosition`, zero telemetry persistence.
- **Zero Server Transmission**: Coordinates remain strictly within client-side browser memory.
- **Nearby Tactical Association**: Instantly calculates geodesic distances from unit to nearby public cameras, active incidents, and trauma emergency POIs.

---

## 4. Key Intelligence Features

- **True 2D Overhead Projection**: Perpendicular top-down cartographic and satellite view (`pitch: 0, bearing: 0`).
- **Incident Density Heatmap**: Subtle multi-domain heat density overlay for accidents, fires, and floods.
- **Event Replay Mode**: Chronological event progression (15M, 1H, 6H, 24H) with scrub slider and speed control.
- **Source Provenance & Data Age**: Transparent tracking of source, type, URL, first reported, last updated, and transparent confidence rating (LOW, MEDIUM, HIGH, VERY HIGH).
- **Tactical Area Scan**: Radial multi-domain scan (500M, 1KM, 2KM, 5KM) around current map center.
- **Global Search with Coordinate Input**: Direct parsing of geographic coordinates (e.g. `13.756331, 100.501762`) with instant flyTo.
- **Right-Click Tactical Context Menu**: Direct access to copy coordinates, scan area, and measure distance.
- **Local Bookmarks**: Save and navigate to key sectors (Sukhumvit, Siam, Rama IX, Airport, Bang Na).

---

## 5. Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run test suite
npm test

# Run production build
npm run build
```
