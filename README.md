# AlertBKK: Bangkok Incident & Geospatial Situation Intelligence Platform

AlertBKK is a real-time geospatial situation intelligence and incident response platform designed for Bangkok and metropolitan Thailand. The system synthesizes crowdsourced community reports, meteorological radar telemetry, satellite atmospheric data, multimodal urban transit statuses, and aviation tracking into a unified common operating picture (COP).

Designed for high reliability, responsiveness, and rapid situational awareness, AlertBKK features sub-second event streaming, automated spatial de-duplication, multi-factor consensus scoring, and administrative audit controls.

---

## Executive Summary

Urban environments face dynamic challenges ranging from flash flooding and severe traffic congestion to transit outages and infrastructure disruptions. AlertBKK addresses these operational needs by bridging the gap between citizen reporting and official telemetry:

- Common Operating Picture: Interactive Leaflet-based GIS mapping layer with vector and satellite overlays.
- Telemetry Integration: Ingestion of live weather radar from TMD and BMA stations, Open-Meteo atmospheric metrics, and OpenSky ADS-B flight feeds.
- Community Consensus Engine: Distance-weighted corroboration, dispute handling, and automated 350-meter deduplication.
- Public Transit Visibility: Live operational status monitoring across BTS, MRT, SRT, Airport Rail Link, and BMTA bus routes.
- Enterprise Security: Role-based access control, cryptographic session handling, and environment isolation.

---

## System Architecture

AlertBKK utilizes a layered modern web architecture designed for low latency, horizontal scalability, and zero-maintenance serverless persistence.

```
+---------------------------------------------------------------------------------------+
|                                      CLIENT TIER                                      |
|    Next.js 16 (React 19) | Leaflet GIS Engine | Web Push API | SSE Consumer Client    |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | HTTPS / Server-Sent Events (SSE)
                                            v
+---------------------------------------------------------------------------------------+
|                                    APPLICATION TIER                                   |
|                                                                                       |
|  +--------------------+   +-----------------------+   +----------------------------+  |
|  |     API Gateway    |   |  Real-Time Event Bus  |   |    Background Ingestion    |  |
|  | - Rate Limiter     |   | - SSE Broadcaster     |   | - TMD Meteorological Radar |  |
|  | - Spatial Filter   |   | - Pub/Sub Hub         |   | - Open-Meteo Telemetry     |  |
|  | - Zod Validation   |   | - Reconnect Handler   |   | - Transit Schedule Poller  |  |
|  +---------+----------+   +-----------+-----------+   +-------------+--------------+  |
|            |                          |                             |                 |
|            +--------------------------+-----------------------------+                 |
|                                       v                                               |
|                    +-------------------------------------+                            |
|                    |      Domain & Consensus Engine      |                            |
|                    | - Duplicate Detection (350m radius) |                            |
|                    | - Community Trust Scoring           |                            |
|                    | - Auto-Expiry & Resolution State    |                            |
|                    +------------------+------------------+                            |
+---------------------------------------|-----------------------------------------------+
                                        v
+---------------------------------------------------------------------------------------+
|                                   PERSISTENCE TIER                                    |
|                                                                                       |
|  +---------------------------------------+   +-------------------------------------+  |
|  |           Prisma ORM Client           |   |          Connection Pooler          |  |
|  | - Type-Safe Schema Generation         |-->| - Neon PgBouncer Connection Pool   |  |
|  | - Declarative Migrations              |   | - SSL/TLS Transport Encryption      |  |
|  +---------------------------------------+   +------------------+------------------+  |
|                                                                 v                     |
|                                              +-------------------------------------+  |
|                                              |      Neon Serverless PostgreSQL     |  |
|                                              | - Spatial & Compound Indexes        |  |
|                                              | - Relational Data Integrity         |  |
|                                              | - Immutable Audit Logging           |  |
|                                              +-------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## Key Functional Modules

### 1. Geospatial Command Map
- Dynamic GIS mapping powered by Leaflet with support for OpenStreetMap and high-resolution satellite hybrid layers.
- Device geolocation tracking with smooth viewport panning and precision GPS accuracy rings.
- Dynamic clustering and viewport-bounded querying to maintain rendering performance under dense alert loads.
- Interactive incident markers with color-coded severity tiers and category-specific iconography.

### 2. Meteorological and Atmospheric Telemetry
- Integration with Thai Meteorological Department (TMD) and Bangkok Metropolitan Administration (BMA) dual Doppler radar stations (Phasi Charoen and Nong Chok).
- Atmospheric surface readings including temperature, relative humidity, wind velocity/direction, and precipitation probability via Open-Meteo.
- Geospatial radar overlays indicating convective cloud density and rainfall progression across the Chao Phraya basin.

### 3. Incident Verification and Consensus Engine
- Duplicate Detection: Automatically groups incoming reports submitted within a 350-meter radius into existing incident threads.
- Trust Scoring: Calculates confidence levels (Low, Medium, Community-Verified, Official-Verified) based on reporter reputation and confirmation-to-dispute ratios.
- Lifecycle Management: Transitions incidents through Active, Monitoring, Resolved, and Expired states based on time-to-live policies and administrative verification.

### 4. Urban Transit and Aviation Operations
- Rail Transit Lines: Comprehensive status indicators for BTS Sukhumvit, BTS Silom, BTS Gold, MRT Blue, MRT Purple, MRT Yellow, MRT Pink, SRT Red Lines, and Airport Rail Link.
- Bus Transit: Route schedules and line tracking for major BMTA corridors.
- Aviation Surveillance: Live ADS-B flight operations covering Suvarnabhumi Airport (BKK) and Don Mueang International Airport (DMK) powered by OpenSky Network.

### 5. Administrative Control and Governance
- Passcode-secured management portal for designated municipal operators and moderators.
- Bulk incident triage, escalation, spatial overrides, and resolution tracking.
- Immutable audit logging of administrative actions to ensure compliance and accountability.

---

## Technology Stack

### Core Frameworks and Runtime
- Language: TypeScript 5.x
- Application Framework: Next.js 16 (App Router architecture with Turbopack)
- UI Library: React 19
- Styling: Tailwind CSS 4 with PostCSS
- Component Utilities: clsx, tailwind-merge, Lucide React

### Data and Geospatial Services
- Database: PostgreSQL (Serverless via Neon with PgBouncer)
- Object-Relational Mapping: Prisma ORM 6.4
- Geospatial Visualization: Leaflet 1.9
- Data Visualization: Recharts 3.x
- Schema Validation: Zod 4.x
- Date Handling: date-fns 4.x

---

## Project Structure

```
alertbkk-map/
├── prisma/
│   └── schema.prisma           # Prisma data models, enums, and relational schema
├── public/                     # Static assets, icons, and vector files
├── scripts/                    # Automation and administrative maintenance scripts
├── src/
│   ├── app/                    # Next.js App Router endpoints and view controllers
│   │   ├── admin/              # Administrative control portal
│   │   ├── api/                # REST API and SSE endpoint routes
│   │   │   ├── admin/          # Admin authentication and incident moderation
│   │   │   ├── dashboard/      # Aggregated metrics for operations dashboards
│   │   │   ├── flights/        # OpenSky ADS-B aviation telemetry proxy
│   │   │   ├── incidents/      # CRUD and verification routes for incidents
│   │   │   ├── realtime/       # Server-Sent Events (SSE) streaming gateway
│   │   │   ├── sync/           # Telemetry feed synchronization endpoint
│   │   │   ├── transport/      # Transit line status and schedule queries
│   │   │   └── weather/        # Meteorological and radar echo queries
│   │   ├── dashboard/          # Operations and analytics center
│   │   ├── incident/           # Granular incident detail views
│   │   ├── transport/          # Multimodal transit network monitoring view
│   │   ├── layout.tsx          # Root HTML shell and typography providers
│   │   └── page.tsx            # Main interactive geospatial command view
│   ├── components/             # Modular React UI components
│   │   ├── incidents/          # Submission modals, cards, and detail sheets
│   │   ├── map/                # Leaflet map container, markers, and controls
│   │   ├── transit/            # Transit status badges and route lists
│   │   ├── weather/            # Radar monitors, barometers, and weather pills
│   │   ├── navbar.tsx          # Top navigation bar with status telemetry
│   │   └── PageNavigationTabs.tsx # Tabbed interface controls
│   ├── lib/                    # Shared business logic and service clients
│   │   ├── providers/          # Global application context providers
│   │   ├── services/           # External feed ingestion (TMD, BMA, OpenSky)
│   │   ├── db.ts               # In-memory database fallback and caching layer
│   │   ├── prisma.ts           # Instantiated Prisma client singleton
│   │   ├── realtime.ts         # SSE event broadcast hub
│   │   └── utils.ts            # Formatting, geospatial distance, and math helpers
│   └── types/                  # Shared TypeScript interfaces and domain types
├── .env.example                # Sample environment configuration template
├── eslint.config.mjs           # ESLint linting configuration
├── next.config.ts              # Next.js build and runtime configuration
├── package.json                # Project dependencies and script declarations
├── postcss.config.mjs          # PostCSS processing configuration
└── tsconfig.json               # TypeScript compiler options
```

---

## Getting Started

### Prerequisites

Ensure the following runtimes and tools are installed on your workstation:
- Node.js: v20.x or higher
- Package Manager: npm (v10+), pnpm (v9+), or yarn
- PostgreSQL Database: Serverless instance from Neon, Supabase, or a local PostgreSQL 16+ installation

### Installation

1. Clone the repository to your local development environment:
   ```bash
   git clone https://github.com/satetapongsa/alertbkk-map.git
   cd alertbkk-map
   ```

2. Install runtime and development dependencies:
   ```bash
   npm install
   ```

3. Initialize local environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local` settings as detailed in the Environment Configuration section below.

5. Generate the Prisma database client:
   ```bash
   npx prisma generate
   ```

6. Synchronize the database schema:
   ```bash
   npx prisma db push
   ```

7. Start the local development server:
   ```bash
   npm run dev
   ```

8. Open your browser and navigate to `http://localhost:3000`.

---

## Environment Configuration

Create a `.env.local` file in the project root. The following configuration variables are supported:

| Parameter | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | N/A | PostgreSQL connection URI with pooled connection parameters (e.g. Neon connection string). |
| `ADMIN_PASSCODE` | Yes | N/A | Secure passphrase required for `/admin` session authorization. |
| `NEXT_PUBLIC_APP_URL` | Recommended | `http://localhost:3000` | Fully-qualified public URL of the deployed application. |
| `NODE_ENV` | Optional | `development` | Node environment runtime flag (`development`, `production`, or `test`). |

Sample `.env.local` configuration:

```env
DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
ADMIN_PASSCODE="YourSecureProductionPasscodeString"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## Data Models and Schema Design

The persistence tier is specified using Prisma schema definitions (`prisma/schema.prisma`):

- `User`: Represents platform users, trusted reporters, moderators, and administrators. Tracks reputation points and authentication status.
- `Incident`: Core event entity storing geospatial coordinates, incident category (`FLOOD`, `TRAFFIC`, `ACCIDENT`, `ROAD_CLOSED`, `TRANSIT`, `EMERGENCY`, `GENERAL`), severity level, status lifecycle, and dynamic JSON metadata.
- `Confirmation`: Records citizen verifications and dispute assertions per incident, keyed by IP hash and user ID to prevent vote fraud.
- `Comment`: Chronological discussion thread per incident with optional moderation flags.
- `TransportLine` and `TransportStation`: Network topology and operational health for metropolitan rail systems.
- `SavedArea`: Geographic watch-zones defined by users with radius thresholds for future alert dispatches.
- `AuditLog`: Immutable history of administrative interventions including incident resolutions, deletions, and user sanctions.

---

## API Reference

### Incident Operations

- `GET /api/incidents`
  - Retrieves active incidents. Supports optional spatial filtering via query parameters (`latitude`, `longitude`, `radiusKm`, `type`, `status`).
- `POST /api/incidents`
  - Submits a new incident report. Executes automated duplicate evaluation against active events within 350 meters.
- `GET /api/incidents/[id]`
  - Retrieves detailed data for a specific incident, including comments, verification history, and status updates.
- `POST /api/incidents/[id]/confirm`
  - Records an upvote or positive confirmation of incident persistence.
- `POST /api/incidents/[id]/dispute`
  - Records a dispute assertion indicating an incident is no longer present or inaccurate.
- `POST /api/incidents/[id]/comments`
  - Appends a comment or update to an existing incident thread.

### Telemetry and Streaming

- `GET /api/realtime`
  - Server-Sent Events (SSE) connection endpoint. Streams live incident creation, status transitions, and metric changes to connected clients in real time.
- `GET /api/weather`
  - Returns current atmospheric telemetry and Doppler radar station operational metrics.
- `GET /api/flights`
  - Returns live ADS-B flight positions within Bangkok airspace covering BKK and DMK international airports.
- `GET /api/transport`
  - Returns status metrics for BTS, MRT, SRT, and Airport Rail Link lines.
- `POST /api/sync`
  - Triggers an ingestion cycle across external telemetry feeds (TMD radar, highway cameras, and meteorological observations).

### Administrative Management

- `POST /api/admin/auth`
  - Authenticates administrator sessions via cryptographic comparison of provided passcodes.
- `DELETE /api/admin/auth`
  - Invalidates administrative session tokens.
- `GET /api/admin`
  - Retrieves administrative overview data, including flagged reports, unverified queues, and recent audit logs.
- `POST /api/admin`
  - Applies moderator actions (resolve, hide, merge, update severity, or ban reporter).

---

## Page Routes

| Route | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Primary command map interface with live radar bar, GPS warp control, and real-time incident feed. |
| `/dashboard` | Public | Operations and analytics portal featuring severity distribution charts, transit status grids, and flight tracking. |
| `/transport` | Public | Detailed metropolitan transit line status, route diagrams, and service disruption alerts. |
| `/incident/[id]` | Public | Individual incident profile containing media attachments, location metadata, and discussion threads. |
| `/admin` | Authenticated | Operations management panel for report triage, audit review, and status overrides. |

---

## Deployment Guide

### Deployment on Vercel

1. Push your repository to your preferred Git provider (GitHub, GitLab, or Bitbucket).
2. Import the project within the Vercel dashboard.
3. Configure the build and output settings (Next.js preset is automatically detected):
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Define production environment variables under Project Settings:
   - `DATABASE_URL`: Your production Neon PostgreSQL connection string.
   - `ADMIN_PASSCODE`: Your production administrative passphrase.
   - `NEXT_PUBLIC_APP_URL`: Your live domain (e.g. `https://alertbkk-map.vercel.app`).
5. Deploy. Vercel automatically deploys the serverless functions and provisions edge routes.

### Self-Hosted and Docker Production Deployment

To package and run the application in a containerized environment:

```dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
```

Build and execute the container:
```bash
docker build -t alertbkk-map .
docker run -p 3000:3000 --env-file .env.local alertbkk-map
```

---

## Quality Assurance and Build Verification

Before committing changes, execute the verification suite:

```bash
# Verify TypeScript compilation and production build
npm run build

# Run static analysis and linting
npm run lint
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for complete terms.
