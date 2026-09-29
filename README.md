# AlertBKK - Bangkok Real-Time Incident & Satellite Meteorology Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet)](https://leafletjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-4169e1?logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2d3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, real-time geospatial situation intelligence platform for Bangkok and Thailand. Aggregates live citizen crowdsourced incidents, meteorological radar and satellite telemetry, and urban rail transit disruption feeds into a unified command-and-control geospatial operating picture.

---

## 🌟 Highlights & Key Capabilities

- **🛰️ Live Satellite & Doppler Meteorology Telemetry**:
  - Live Bangkok basin atmospheric observation via high-resolution geostationary orbit models (Himawari-9 / GEO-KOMPSAT-2A) and TMD / BMA Dual Doppler Radar stations (Phasi Charoen & Nong Chok).
  - Real-time **Temperature (°C)**, **Feels-like Temperature**, **Relative Humidity (%)**, **Surface Wind Vector (km/h & direction)**, and **Hourly Precipitation Probability (%)**.
- **🗺️ High-Precision Geospatial Operating Engine**:
  - Full-screen Leaflet GIS map with **Instant GPS Warp to My Location** (smooth animated camera tracking).
  - Streamlined, one-click toggle between **Real Street Map (OpenStreetMap)** and **High-Resolution Satellite Imagery (Google Maps Hybrid)**.
- **⚡ Real-Time Streaming & Community Consensus**:
  - Low-latency event streaming via **Server-Sent Events (SSE)**.
  - Multi-tier verification model: community upvotes/downvotes, distance decay, and agency corroboration.
  - Automatic duplicate alert detection within a 350-meter proximity radius.
- **🚇 Metropolitan Rail Transit Disruption Layer**:
  - Complete Bangkok rail transit status: BTS Sukhumvit/Silom/Gold, MRT Blue/Purple/Yellow/Pink, Airport Rail Link, and SRT Dark/Light Red Lines.
- **🛡️ Secure Admin Portal**:
  - Incident resolution, dispute auditing, and administrative management secured via cryptographic hash verification and environment-variable passcodes.
- **📱 Responsive Cyber-Navy Interface**:
  - Designed for high-density command centers, tablets, and mobile devices with dark glassmorphism and clean international English typography.

---

## 🏗️ System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|  Next.js 16 (React 19) SPA | Leaflet GIS Engine | Web Push API | SSE Consumer Client  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | HTTPS / EventStream
                                            v
+---------------------------------------------------------------------------------------+
|                                  APPLICATION TIER                                     |
|                                                                                       |
|  +--------------------+   +-----------------------+   +----------------------------+  |
|  |   API Gateway      |   | Real-Time Event Bus   |   |   Background Ingestion     |  |
|  | - Rate Limiter     |   | - SSE Broadcaster     |   | - TMD Meteorological Radar |  |
|  | - Spatial Filter   |   | - Pub/Sub Hub         |   | - Open-Meteo Telemetry     |  |
|  | - Zod Validator    |   | - Reconnect Handler   |   | - Transit Schedule Poller  |  |
|  +---------+----------+   +-----------+-----------+   +-------------+--------------+  |
|            |                          |                             |                 |
|            +--------------------------+-----------------------------+                 |
|                                       v                                               |
|                    +-------------------------------------+                            |
|                    |     Domain & Consensus Engine       |                            |
|                    | - Duplicate Detection (350m radius) |                            |
|                    | - Community Trust Scoring           |                            |
|                    | - Auto-Expiry & Resolution State    |                            |
|                    +------------------+------------------+                            |
+---------------------------------------|-----------------------------------------------+
                                        v
+---------------------------------------------------------------------------------------+
|                                  PERSISTENCE TIER                                     |
|                                                                                       |
|  +---------------------------------------+   +-------------------------------------+  |
|  |          Prisma ORM Client            |   |         Connection Pooler           |  |
|  | - Connection Management               |-->| - Neon PgBouncer Pooler             |  |
|  | - Schema Migrations & Types           |   | - SSL/TLS Transport Security        |  |
|  +---------------------------------------+   +------------------+------------------+  |
|                                                                 v                     |
|                                              +-------------------------------------+  |
|                                              |      Neon Serverless PostgreSQL     |  |
|                                              | - Relational Schema                 |  |
|                                              | - Spatial & Compound Indexes        |  |
|                                              | - Immutable Audit Logging           |  |
|                                              +-------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## 🔒 Security & Environment Variables

> [!IMPORTANT]
> **Zero Credential Leakage:** All secrets, connection strings, and admin credentials are kept strictly out of git history. `.env`, `.env*.local`, and `.env.production` are strictly tracked in `.gitignore`.

### 1. Local Development (`.env.local`)

Copy `.env.example` to create your local `.env.local` file:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# PostgreSQL / Neon Database Connection String (Pooler recommended)
DATABASE_URL="postgresql://<username>:<password>@ep-xxxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Authentication Passcode (Set your own secure secret)
ADMIN_PASSCODE="YourSecureAdminPasscodeHere"

# Environment
NODE_ENV="development"
```

### 2. Vercel Deployment

When deploying to Vercel:
1. Connect your repository to Vercel.
2. Go to **Settings** > **Environment Variables**.
3. Add `DATABASE_URL` with your Neon connection string.
4. Add `ADMIN_PASSCODE` with your custom administrator password.
5. Deploy. Secrets are injected at runtime and never exposed in the client bundle.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.18+ or v20+
- **npm** or **pnpm**
- **PostgreSQL Database**: Free instance from [Neon.tech](https://neon.tech) or Supabase

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/satetapongsa/alertbkk-map.git
   cd alertbkk-map
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database**:
   ```bash
   # Initialize and generate Prisma Client
   npx prisma generate

   # Push schema to database (optional, in-memory fallback available)
   npx prisma db push
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or configured port) in your browser.

---

## 📡 API Endpoints Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/incidents` | `GET`, `POST` | List and report geospatial incidents |
| `/api/incidents/[id]/confirm` | `POST` | Upvote and corroborate incident confidence |
| `/api/incidents/[id]/dispute` | `POST` | Dispute unverified or expired incident |
| `/api/weather` | `GET` | Live satellite telemetry, radar echo, temperature & rain probability |
| `/api/flights` | `GET` | Live Suvarnabhumi (BKK) & Don Mueang (DMK) OpenSky ADS-B flights |
| `/api/sync` | `POST` | Synchronize feeds from TMD, BMA radar, and highway cameras |
| `/api/realtime` | `GET` | Server-Sent Events (SSE) live incident broadcast stream |
| `/api/admin/auth` | `POST`, `DELETE` | Authenticate and manage administrative session |
| `/api/admin` | `GET`, `POST` | Audit logging, incident resolution, and moderation |

---

## 🗺️ Live Navigation Pages

- **`/`**: Real-time interactive command map with satellite telemetry bar, GPS location warp, unified incident overview & live feed.
- **`/dashboard`**: All-in-One Operations & Analytics Center:
  - Incident Category Analytics & Severity Distributions
  - BTS, MRT, SRT, ARL Rapid Transit Network Status
  - Bangkok City Bus Routes & Live Station Stops
  - Live Airport Flight Radar (Suvarnabhumi BKK & Don Mueang DMK live ADS-B telemetry)
- **`/admin`**: Protected administration portal for incident moderation and resolution (hidden from public navigation).

---

## 🌐 Vercel Deployment Checklist

When deploying to **Vercel** (`https://vercel.com`), configure these environment variables under **Project Settings > Environment Variables**:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Neon PostgreSQL pooled connection string | `postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `ADMIN_PASSCODE` | **Yes** | Secret administrator passphrase for `/admin` | `YourStrongAdminPassword2026` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Production domain URL | `https://alertbkk-map.vercel.app` |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
