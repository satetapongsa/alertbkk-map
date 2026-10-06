'use client';

import React from 'react';
import { CameraSource, Incident } from '@/types/intelligence';
import {
  X,
  Radio,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  AlertTriangle,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import { formatTacticalCoordinates, formatDistance, calculateDistanceMeters, formatDataAge } from '@/lib/spatial';
import { UserLocationData } from '@/types/intelligence';

interface CameraIntelligencePanelProps {
  camera: CameraSource;
  nearbyIncidents: Incident[];
  onClose: () => void;
  onCenterMap: (lat: number, lng: number) => void;
  onSelectIncident: (inc: Incident) => void;
  onToggleSplitView?: () => void;
  userLocation?: UserLocationData | null;
}

export const CameraIntelligencePanel: React.FC<CameraIntelligencePanelProps> = ({
  camera,
  nearbyIncidents,
  onClose,
  onCenterMap,
  onSelectIncident,
  onToggleSplitView,
  userLocation,
}) => {
  return (
    <aside className="intel-slide-panel" aria-label="Camera Intelligence">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-title">
          <Radio size={14} color="#00ff66" />
          <span>CAMERA INTELLIGENCE FEED</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close Panel [Esc]">
          <X size={16} />
        </button>
      </div>

      <div className="panel-body">
        {/* Stream Player or Safe Embed Link */}
        <div className="tactical-video-container">
          {camera.embedding_allowed && camera.is_youtube && camera.embed_url ? (
            <iframe
              src={camera.embed_url}
              title={camera.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : camera.embedding_allowed && camera.stream_url ? (
            <video
              src={camera.stream_url}
              autoPlay
              muted
              loop
              playsInline
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#090d12',
                color: '#8b949e',
                padding: '20px',
                textAlign: 'center',
                gap: '12px',
              }}
            >
              <ShieldCheck size={28} color="#d4af37" />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f0f6fc' }}>
                DIRECT STREAM RESTRICTED BY SOURCE POLICY
              </div>
              <div style={{ fontSize: '10px', color: '#6e7681' }}>
                Per MIRRIX Public Safety Protocol, access this verified stream directly on the official host:
              </div>
              <a
                href={camera.source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="tactical-pill-btn cyan"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={12} />
                <span>OPEN PUBLIC SOURCE</span>
              </a>
            </div>
          )}

          {/* Live Overlay HUD */}
          <div className="video-overlay-hud">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: camera.status === 'ONLINE' ? '#00ff66' : '#f59e0b',
              }}
            />
            <span>{camera.status}</span>
            <span>&bull;</span>
            <span>{formatDataAge(camera.last_checked || camera.last_seen).toUpperCase()}</span>
          </div>
        </div>

        {/* Primary Meta Card */}
        <div className="tactical-data-card">
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f0f6fc', marginBottom: '8px' }}>
            {camera.name}
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">STATUS</span>
            <span
              className="tactical-meta-val"
              style={{
                color: camera.status === 'ONLINE' ? '#00ff66' : '#f59e0b',
                fontWeight: '700',
              }}
            >
              {camera.status} ({formatDataAge(camera.last_checked || camera.last_seen)})
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">SECTOR / DISTRICT</span>
            <span className="tactical-meta-val">
              {camera.district}, {camera.city}
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">SOURCE PROVIDER</span>
            <span className="tactical-meta-val" style={{ color: '#00f0ff' }}>
              {camera.provider}
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">SOURCE TYPE</span>
            <span className="tactical-meta-val">{camera.source_type}</span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">LICENSE</span>
            <span className="tactical-meta-val" style={{ color: '#d4af37' }}>
              {camera.license}
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">COORDINATES</span>
            <span className="tactical-meta-val">
              {formatTacticalCoordinates(camera.latitude, camera.longitude)}
            </span>
          </div>

          <div className="tactical-meta-row">
            <span className="tactical-meta-label">LAST VERIFIED</span>
            <span className="tactical-meta-val">
              {new Date(camera.last_verified || camera.last_checked).toLocaleTimeString()} ICT ({camera.latency_ms}ms)
            </span>
          </div>

          {userLocation && (
            <div className="tactical-meta-row">
              <span className="tactical-meta-label">DISTANCE FROM YOU</span>
              <span className="tactical-meta-val" style={{ color: '#00f0ff', fontWeight: '700' }}>
                {formatDistance(calculateDistanceMeters(userLocation.latitude, userLocation.longitude, camera.latitude, camera.longitude))}
              </span>
            </div>
          )}
        </div>

        {/* Nearby Incidents in Sector */}
        <div className="tactical-data-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#d4af37', fontWeight: '700' }}>
              NEARBY INCIDENTS IN SECTOR ({nearbyIncidents.length})
            </div>
          </div>

          {nearbyIncidents.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#6e7681', padding: '6px 0' }}>
              No critical incidents reported within this 1.5 km corridor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nearbyIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  style={{
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#f0f6fc' }}>
                      {inc.title}
                    </span>
                    <span className={`severity-badge ${inc.severity.toLowerCase()}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '3px' }}>
                    {inc.description.slice(0, 75)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="tactical-pill-btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => onCenterMap(camera.latitude, camera.longitude)}
          >
            <MapPin size={12} />
            <span>CENTER MAP</span>
          </button>

          <a
            href={camera.source_url}
            target="_blank"
            rel="noreferrer noopener"
            className="tactical-pill-btn cyan"
            style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
          >
            <ExternalLink size={12} />
            <span>SOURCE PORTAL</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
