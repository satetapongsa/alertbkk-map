'use client';

import React from 'react';
import { Incident, CameraSource, POI } from '@/types/intelligence';
import {
  X,
  AlertTriangle,
  Video,
  Hospital,
  Shield,
  Flame,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';
import {
  formatTacticalCoordinates,
  formatDistance,
  calculateDistanceMeters,
  formatDataAge,
  computeIncidentConfidence,
} from '@/lib/spatial';
import { UserLocationData } from '@/types/intelligence';

interface IncidentIntelligencePanelProps {
  incident: Incident;
  nearbyCameras: CameraSource[];
  nearbyHospitals: POI[];
  nearbyPolice: POI[];
  nearbyFire: POI[];
  onClose: () => void;
  onSelectCamera: (cam: CameraSource) => void;
  onCenterMap: (lat: number, lng: number) => void;
  onMeasureRadius: (lat: number, lng: number) => void;
  userLocation?: UserLocationData | null;
}

export const IncidentIntelligencePanel: React.FC<IncidentIntelligencePanelProps> = ({
  incident,
  nearbyCameras,
  nearbyHospitals,
  nearbyPolice,
  nearbyFire,
  onClose,
  onSelectCamera,
  onCenterMap,
  onMeasureRadius,
  userLocation,
}) => {
  const confidenceData = computeIncidentConfidence(incident);
  const dataAge = formatDataAge(incident.updated_at || incident.reported_at);

  // Compute nearby cameras sorted by geodesic distance
  const sortedCameras = nearbyCameras
    .map((cam) => ({
      cam,
      distance: calculateDistanceMeters(incident.latitude, incident.longitude, cam.latitude, cam.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  // Compute emergency services sorted by distance
  const sortedHospitals = nearbyHospitals
    .map((p) => ({
      p,
      distance: calculateDistanceMeters(incident.latitude, incident.longitude, p.latitude, p.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  const sortedPolice = nearbyPolice
    .map((p) => ({
      p,
      distance: calculateDistanceMeters(incident.latitude, incident.longitude, p.latitude, p.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  const sortedFire = nearbyFire
    .map((p) => ({
      p,
      distance: calculateDistanceMeters(incident.latitude, incident.longitude, p.latitude, p.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <aside className="intel-slide-panel" aria-label="Incident Intelligence" style={{ width: '440px' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-title">
          <AlertTriangle size={15} color="#ff3366" />
          <span>INCIDENT SITUATIONAL REPORT</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close Panel [Esc]">
          <X size={16} />
        </button>
      </div>

      <div className="panel-body">
        {/* Severity Banner */}
        <div
          style={{
            padding: '12px',
            background: incident.severity === 'CRITICAL' ? 'rgba(255, 51, 102, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${incident.severity === 'CRITICAL' ? '#ff3366' : '#f59e0b'}`,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#8b949e' }}>
              SEVERITY &bull; {dataAge.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                fontWeight: '800',
                color: incident.severity === 'CRITICAL' ? '#ff3366' : '#f59e0b',
                letterSpacing: '1px',
              }}
            >
              {incident.severity} &bull; {incident.type}
            </div>
          </div>
          <span className={`severity-badge ${incident.severity.toLowerCase()}`}>
            {incident.status}
          </span>
        </div>

        {/* Primary Meta Card */}
        <div className="tactical-data-card">
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#f0f6fc', marginBottom: '8px' }}>
            {incident.title}
          </div>

          <p style={{ fontSize: '12px', color: '#c9d1d9', lineHeight: '1.5', marginBottom: '12px' }}>
            {incident.description}
          </p>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">SECTOR / DISTRICT</span>
            <span className="tactical-meta-val">
              {incident.district}, {incident.city}
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">COORDINATES</span>
            <span className="tactical-meta-val" style={{ color: '#00f0ff' }}>
              {formatTacticalCoordinates(incident.latitude, incident.longitude, 6)}
            </span>
          </div>

          {userLocation && (
            <div className="tactical-meta-row">
              <span className="tactical-meta-label">DISTANCE FROM YOU</span>
              <span className="tactical-meta-val" style={{ color: '#ff3366', fontWeight: '700' }}>
                {formatDistance(calculateDistanceMeters(userLocation.latitude, userLocation.longitude, incident.latitude, incident.longitude))}
              </span>
            </div>
          )}
        </div>

        {/* SOURCE PROVENANCE & CONFIDENCE */}
        <div className="tactical-data-card" style={{ borderLeft: '3px solid #00f0ff' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00f0ff', fontWeight: '700', marginBottom: '8px' }}>
            SOURCE PROVENANCE &bull; VERIFICATION
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">SOURCE</span>
            <span className="tactical-meta-val" style={{ color: '#f0f6fc', fontWeight: '700' }}>
              {incident.source}
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">SOURCE TYPE</span>
            <span className="tactical-meta-val">
              {incident.source_type || 'GOVERNMENT OPEN DATA'}
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">SOURCE URL</span>
            <span className="tactical-meta-val">
              <a
                href={incident.source_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00f0ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>OPEN OFFICIAL FEED</span>
                <ExternalLink size={11} />
              </a>
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">FIRST REPORTED</span>
            <span className="tactical-meta-val">
              {new Date(incident.reported_at).toLocaleTimeString('en-GB', { hour12: false })} ICT
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">LAST UPDATED</span>
            <span className="tactical-meta-val">
              {new Date(incident.updated_at || incident.reported_at).toLocaleTimeString('en-GB', { hour12: false })} ICT ({dataAge})
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">CONFIDENCE</span>
            <span
              className="tactical-meta-val"
              style={{
                color:
                  confidenceData.level === 'VERY HIGH' || confidenceData.level === 'HIGH'
                    ? '#00ff66'
                    : '#f59e0b',
                fontWeight: '800',
              }}
            >
              {confidenceData.level} ({Math.round(confidenceData.score * 100)}%)
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px', fontStyle: 'italic' }}>
            Confidence basis: {confidenceData.reasoning}
          </div>
        </div>

        {/* INCIDENT CORRELATION: Nearby Cameras sorted by distance */}
        <div className="tactical-data-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00ff66', fontWeight: '700', marginBottom: '8px' }}>
            CORRELATED CAMERAS NEARBY ({sortedCameras.slice(0, 4).length})
          </div>

          {sortedCameras.length === 0 ? (
            <div style={{ fontSize: '10px', color: '#6e7681' }}>No public cameras found nearby.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sortedCameras.slice(0, 4).map(({ cam, distance }) => (
                <div
                  key={cam.id}
                  onClick={() => onSelectCamera(cam)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#f0f6fc', fontWeight: '600' }}>{cam.name}</div>
                    <div style={{ fontSize: '9px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>{cam.provider}</div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    {formatDistance(distance)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INCIDENT CORRELATION: Emergency Services sorted by distance */}
        <div className="tactical-data-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#38bdf8', fontWeight: '700', marginBottom: '8px' }}>
            NEAREST EMERGENCY INFRASTRUCTURE
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sortedHospitals[0] && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: '#8b949e' }}>HOSPITAL: <strong style={{ color: '#f0f6fc' }}>{sortedHospitals[0].p.name}</strong></span>
                <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{formatDistance(sortedHospitals[0].distance)}</span>
              </div>
            )}
            {sortedPolice[0] && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: '#8b949e' }}>POLICE: <strong style={{ color: '#f0f6fc' }}>{sortedPolice[0].p.name}</strong></span>
                <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{formatDistance(sortedPolice[0].distance)}</span>
              </div>
            )}
            {sortedFire[0] && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: '#8b949e' }}>FIRE / RESCUE: <strong style={{ color: '#f0f6fc' }}>{sortedFire[0].p.name}</strong></span>
                <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{formatDistance(sortedFire[0].distance)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            className="tactical-pill-btn cyan"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => onCenterMap(incident.latitude, incident.longitude)}
          >
            <Crosshair size={13} />
            <span>CENTER MAP</span>
          </button>
          <button
            className="tactical-pill-btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => onMeasureRadius(incident.latitude, incident.longitude)}
          >
            <Shield size={13} />
            <span>RADIAL BUFFER (2KM)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
