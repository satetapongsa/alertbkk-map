-- =====================================================================
-- MIRRIX: PostGIS Geospatial Intelligence Production Database Schema
-- Focus: Real-World Intelligence (Bangkok & Global Scaling)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Camera Sources Registry
CREATE TABLE IF NOT EXISTS camera_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- TRAFFIC, PUBLIC_WEBCAM, GOVERNMENT, AIRPORT, etc.
    source_url TEXT NOT NULL,
    stream_url TEXT,
    thumbnail_url TEXT,
    embed_url TEXT,
    is_youtube BOOLEAN DEFAULT FALSE,
    youtube_video_id VARCHAR(64),
    license VARCHAR(100) NOT NULL DEFAULT 'Public Open Access',
    public_access BOOLEAN DEFAULT TRUE,
    embedding_allowed BOOLEAN DEFAULT TRUE,
    country VARCHAR(100) NOT NULL DEFAULT 'Thailand',
    city VARCHAR(100) NOT NULL DEFAULT 'Bangkok',
    district VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    geog GEOGRAPHY(Point, 4326),
    timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- ONLINE, OFFLINE, DEGRADED, UNKNOWN
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    last_checked TIMESTAMPTZ DEFAULT NOW(),
    latency_ms INTEGER DEFAULT 45,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camera_sources_geom ON camera_sources USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_camera_sources_geog ON camera_sources USING GIST(geog);
CREATE INDEX IF NOT EXISTS idx_camera_sources_status ON camera_sources(status);
CREATE INDEX IF NOT EXISTS idx_camera_sources_city ON camera_sources(city);
CREATE INDEX IF NOT EXISTS idx_camera_sources_district ON camera_sources(district);

-- 2. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- ACCIDENT, FIRE, FLOOD, TRAFFIC, ROAD_CLOSURE, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    geog GEOGRAPHY(Point, 4326),
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Bangkok',
    country VARCHAR(100) NOT NULL DEFAULT 'Thailand',
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INVESTIGATING, CONTAINED, RESOLVED
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    source_count INTEGER DEFAULT 1,
    confidence NUMERIC(4, 2) DEFAULT 0.85,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ai_classified BOOLEAN DEFAULT FALSE,
    ai_evidence TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    related_cameras JSONB DEFAULT '[]'::jsonb,
    related_places JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_incidents_geom ON incidents USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_incidents_geog ON incidents USING GIST(geog);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON incidents(reported_at DESC);

-- 3. Points of Interest (Hospitals, Police Stations, Fire/Rescue Stations, Airports)
CREATE TABLE IF NOT EXISTS places_of_interest (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- HOSPITAL, POLICE, FIRE_STATION, AIRPORT, INFRASTRUCTURE
    name VARCHAR(255) NOT NULL,
    address TEXT,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Bangkok',
    country VARCHAR(100) NOT NULL DEFAULT 'Thailand',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    geog GEOGRAPHY(Point, 4326),
    phone VARCHAR(50),
    website TEXT,
    emergency_capability VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poi_geom ON places_of_interest USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_poi_type ON places_of_interest(type);
CREATE INDEX IF NOT EXISTS idx_poi_district ON places_of_interest(district);

-- 4. Traffic Flow & Congestion Segments
CREATE TABLE IF NOT EXISTS traffic_segments (
    id VARCHAR(64) PRIMARY KEY,
    road_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'MODERATE', -- FREE, LIGHT, MODERATE, HEAVY, SEVERE
    avg_speed_kmh NUMERIC(5, 1) DEFAULT 35.0,
    line_geom GEOMETRY(LineString, 4326),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_traffic_geom ON traffic_segments USING GIST(line_geom);

-- 5. Flood Monitoring & Water Level Zones
CREATE TABLE IF NOT EXISTS flood_zones (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    water_level_m NUMERIC(5, 2) NOT NULL DEFAULT 1.20,
    threshold_m NUMERIC(5, 2) NOT NULL DEFAULT 1.80,
    status VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- NORMAL, WATCH, WARNING, SEVERE
    polygon_geom GEOMETRY(Polygon, 4326),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flood_geom ON flood_zones USING GIST(polygon_geom);

-- 6. External Data Source Health Monitoring
CREATE TABLE IF NOT EXISTS source_health (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    latency_ms INTEGER DEFAULT 50,
    error_rate_pct NUMERIC(5, 2) DEFAULT 0.0,
    last_check TIMESTAMPTZ DEFAULT NOW(),
    last_successful_fetch TIMESTAMPTZ DEFAULT NOW(),
    next_check TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 minute')
);

-- Trigger to keep PostGIS geometry synced on insert/update
CREATE OR REPLACE FUNCTION sync_geom_points()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    NEW.geog = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_camera_geom ON camera_sources;
CREATE TRIGGER trg_sync_camera_geom
BEFORE INSERT OR UPDATE ON camera_sources
FOR EACH ROW EXECUTE FUNCTION sync_geom_points();

DROP TRIGGER IF EXISTS trg_sync_incident_geom ON incidents;
CREATE TRIGGER trg_sync_incident_geom
BEFORE INSERT OR UPDATE ON incidents
FOR EACH ROW EXECUTE FUNCTION sync_geom_points();
