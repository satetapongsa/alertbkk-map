'use client';

import React from 'react';
import { BarChart2, X, AlertTriangle, Video, Car, Waves, CloudRain, CheckCircle } from 'lucide-react';
import { CameraSource, Incident, TrafficSegment, FloodZone } from '@/types/intelligence';

interface SituationalSummaryModalProps {
  cameras: CameraSource[];
  incidents: Incident[];
  trafficSegments: TrafficSegment[];
  floodZones: FloodZone[];
  onClose: () => void;
}

export const SituationalSummaryModal: React.FC<SituationalSummaryModalProps> = ({
  cameras,
  incidents,
  trafficSegments,
  floodZones,
  onClose,
}) => {
  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter((i) => i.severity === 'HIGH').length;
  const camerasOnline = cameras.filter((c) => c.status === 'ONLINE').length;
  const trafficHotspots = trafficSegments.filter((t) => t.status === 'SEVERE' || t.status === 'HEAVY').length;
  const floodAlerts = floodZones.filter((f) => f.status === 'WARNING' || f.status === 'SEVERE').length;

  return (
    <div className="search-modal" role="dialog" aria-modal="true" style={{ width: '460px' }}>
      <div className="panel-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-cyan)' }}>
        <div className="panel-header-title">
          <BarChart2 size={16} color="#d4af37" />
          <span>SITUATIONAL SUMMARY &bull; BANGKOK</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close [Esc]">
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>ACTIVE INCIDENTS</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '2px' }}>
              {activeIncidents.length}
            </div>
            <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px' }}>
              <span style={{ color: '#ff3366', fontWeight: '700' }}>{criticalCount} Critical</span> &bull;{' '}
              <span style={{ color: '#f59e0b', fontWeight: '700' }}>{highCount} High</span>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>CAMERAS ONLINE</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#00ff66', marginTop: '2px' }}>
              {camerasOnline}
            </div>
            <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px' }}>
              Total {cameras.length} registered feeds
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>TRAFFIC HOTSPOTS</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: trafficHotspots > 0 ? '#ff3366' : '#00ff66', marginTop: '2px' }}>
              {trafficHotspots}
            </div>
            <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px' }}>
              Heavy / Severe Corridors
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>FLOOD / WATER ALERTS</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: floodAlerts > 0 ? '#00f0ff' : '#00ff66', marginTop: '2px' }}>
              {floodAlerts}
            </div>
            <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px' }}>
              Monitored Drainage Basins
            </div>
          </div>
        </div>

        {/* Intelligence Status Banner */}
        <div
          style={{
            padding: '10px',
            background: 'rgba(0, 240, 255, 0.05)',
            borderLeft: '2px solid #00f0ff',
            fontSize: '11px',
            color: '#c9d1d9',
            fontFamily: 'var(--font-mono)',
          }}
        >
          MIRRIX SYSTEM STATUS: NORMAL MONITORING. All verified public geospatial endpoints responsive.
        </div>
      </div>
    </div>
  );
};
