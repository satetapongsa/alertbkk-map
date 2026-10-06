'use client';

import React, { useState } from 'react';
import { Radar, X, Video, AlertTriangle, Hospital, Shield, Flame, Car, Waves, ArrowRight } from 'lucide-react';
import { CameraSource, Incident, POI, TrafficSegment, FloodZone } from '@/types/intelligence';
import { calculateDistanceMeters, formatDistance } from '@/lib/spatial';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface ScanAreaModalProps {
  centerCoords: [number, number]; // [lng, lat]
  cameras: CameraSource[];
  incidents: Incident[];
  pois: POI[];
  trafficSegments: TrafficSegment[];
  floodZones: FloodZone[];
  onClose: () => void;
  onApplyRadius: (radiusMeters: number) => void;
  onSelectCamera: (cam: CameraSource) => void;
  onSelectIncident: (inc: Incident) => void;
}

export const ScanAreaModal: React.FC<ScanAreaModalProps> = ({
  centerCoords,
  cameras,
  incidents,
  pois,
  trafficSegments,
  floodZones,
  onClose,
  onApplyRadius,
  onSelectCamera,
  onSelectIncident,
}) => {
  const [selectedRadius, setSelectedRadius] = useState<number>(2000); // Default 2 KM

  const [lng, lat] = centerCoords;

  // Compute nearby items
  const nearbyCameras = cameras
    .map((c) => ({ item: c, dist: calculateDistanceMeters(lat, lng, c.latitude, c.longitude) }))
    .filter((x) => x.dist <= selectedRadius)
    .sort((a, b) => a.dist - b.dist);

  const nearbyIncidents = incidents
    .map((i) => ({ item: i, dist: calculateDistanceMeters(lat, lng, i.latitude, i.longitude) }))
    .filter((x) => x.dist <= selectedRadius)
    .sort((a, b) => a.dist - b.dist);

  const nearbyHospitals = pois
    .filter((p) => p.type === 'HOSPITAL')
    .map((p) => ({ item: p, dist: calculateDistanceMeters(lat, lng, p.latitude, p.longitude) }))
    .filter((x) => x.dist <= selectedRadius)
    .sort((a, b) => a.dist - b.dist);

  const nearbyPolice = pois
    .filter((p) => p.type === 'POLICE')
    .map((p) => ({ item: p, dist: calculateDistanceMeters(lat, lng, p.latitude, p.longitude) }))
    .filter((x) => x.dist <= selectedRadius)
    .sort((a, b) => a.dist - b.dist);

  const nearbyFire = pois
    .filter((p) => p.type === 'FIRE_STATION')
    .map((p) => ({ item: p, dist: calculateDistanceMeters(lat, lng, p.latitude, p.longitude) }))
    .filter((x) => x.dist <= selectedRadius)
    .sort((a, b) => a.dist - b.dist);

  const handleRadiusChange = (radius: number) => {
    tacticalAudio.playClick();
    setSelectedRadius(radius);
    onApplyRadius(radius);
  };

  return (
    <div className="search-modal" role="dialog" aria-modal="true" style={{ width: '560px', maxHeight: '85vh' }}>
      <div className="panel-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-cyan)' }}>
        <div className="panel-header-title">
          <Radar size={16} color="#00f0ff" />
          <span>AREA SCAN &bull; RADIUS {formatDistance(selectedRadius).toUpperCase()}</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close [Esc]">
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Center Coordinate Target Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>SCAN ORIGIN COORDINATES</div>
            <div style={{ fontSize: '13px', color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
              {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
            </div>
          </div>

          {/* Radius Selector Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[500, 1000, 2000, 5000].map((r) => (
              <button
                key={r}
                className={`tactical-pill-btn ${selectedRadius === r ? 'active cyan' : ''}`}
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => handleRadiusChange(r)}
              >
                {r < 1000 ? `${r} M` : `${r / 1000} KM`}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Domain Metric Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>CAMERAS</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#00ff66' }}>{nearbyCameras.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>INCIDENTS</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>{nearbyIncidents.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>HOSPITALS</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8' }}>{nearbyHospitals.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>POLICE / FIRE</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#ff3366' }}>{nearbyPolice.length + nearbyFire.length}</div>
          </div>
        </div>

        {/* Detailed Items Tabs / Scrollable List */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {nearbyIncidents.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#f59e0b', marginBottom: '6px', fontWeight: '700' }}>
                DETECTED INCIDENTS WITHIN RADIUS ({nearbyIncidents.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {nearbyIncidents.map(({ item, dist }) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      tacticalAudio.playRadarBlip();
                      onSelectIncident(item);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', color: '#f0f6fc', fontWeight: '600' }}>{item.title}</div>
                      <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                        {item.type} &bull; {item.severity} &bull; {item.district}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#ff3366', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      {formatDistance(dist)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nearbyCameras.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#00ff66', marginBottom: '6px', fontWeight: '700' }}>
                PUBLIC CAMERAS WITHIN RADIUS ({nearbyCameras.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {nearbyCameras.slice(0, 5).map(({ item, dist }) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      tacticalAudio.playRadarBlip();
                      onSelectCamera(item);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', color: '#f0f6fc', fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                        {item.provider} &bull; {item.status}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      {formatDistance(dist)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
