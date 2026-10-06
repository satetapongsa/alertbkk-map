'use client';

import React, { useEffect, useState } from 'react';
import { X, BarChart3, TrendingUp, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  total_incidents: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  by_district: Record<string, number>;
  cameras: {
    total: number;
    online: number;
    degraded: number;
    offline: number;
    uptime_percentage: number;
  };
  flood_warnings_active: number;
  hourly_distribution: { hour: string; count: number }[];
}

interface AnalyticsModalProps {
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ onClose }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="search-modal" style={{ width: '640px', maxHeight: '85vh' }} aria-label="Geospatial Analytics">
      <div className="panel-header">
        <div className="panel-header-title">
          <BarChart3 size={16} color="#d4af37" />
          <span>GEOSPATIAL SITUATIONAL ANALYTICS</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close Analytics">
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(85vh - 60px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <div className="tactical-data-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#8b949e' }}>
              CAMERA UPTIME
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '800', color: '#00ff66' }}>
              {data ? `${data.cameras.uptime_percentage}%` : '98.5%'}
            </div>
            <div style={{ fontSize: '9px', color: '#6e7681' }}>{data?.cameras.online} Feeds Live</div>
          </div>

          <div className="tactical-data-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#8b949e' }}>
              ACTIVE INCIDENTS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>
              {data?.total_incidents || 6}
            </div>
            <div style={{ fontSize: '9px', color: '#6e7681' }}>Across 5 Districts</div>
          </div>

          <div className="tactical-data-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#8b949e' }}>
              CRITICAL ALERTS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '800', color: '#ff3366' }}>
              {data?.by_severity?.CRITICAL || 1}
            </div>
            <div style={{ fontSize: '9px', color: '#6e7681' }}>Response Dispatched</div>
          </div>

          <div className="tactical-data-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#8b949e' }}>
              FLOOD WATCH
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '800', color: '#00f0ff' }}>
              {data?.flood_warnings_active || 1}
            </div>
            <div style={{ fontSize: '9px', color: '#6e7681' }}>Canal Basins</div>
          </div>
        </div>

        {/* Hourly Distribution Tactical Histogram */}
        <div className="tactical-data-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#d4af37', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} />
            <span>INCIDENTS HOURLY RATE (BANGKOK METRO 24H)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '100px', padding: '0 10px 10px' }}>
            {(data?.hourly_distribution || [
              { hour: '14:00', count: 2 },
              { hour: '15:00', count: 4 },
              { hour: '16:00', count: 3 },
              { hour: '17:00', count: 7 },
              { hour: '18:00', count: 11 },
              { hour: '19:00', count: 9 },
              { hour: '20:00', count: 6 },
            ]).map((bar) => {
              const heightPct = Math.min(100, Math.max(15, (bar.count / 12) * 100));
              return (
                <div key={bar.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#00f0ff' }}>
                    {bar.count}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #00f0ff 0%, rgba(0, 240, 255, 0.2) 100%)',
                      borderRadius: '2px 2px 0 0',
                      boxShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
                    }}
                  />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#8b949e' }}>
                    {bar.hour}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Type & District Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="tactical-data-card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00ff66', fontWeight: '700', marginBottom: '8px' }}>
              INCIDENT TAXONOMY
            </div>
            {data &&
              Object.entries(data.by_type).map(([t, count]) => (
                <div key={t} className="tactical-meta-row">
                  <span className="tactical-meta-label">{t}</span>
                  <span className="tactical-meta-val" style={{ color: '#00f0ff' }}>
                    {count} events
                  </span>
                </div>
              ))}
          </div>

          <div className="tactical-data-card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f59e0b', fontWeight: '700', marginBottom: '8px' }}>
              DISTRICT DENSITY
            </div>
            {data &&
              Object.entries(data.by_district).map(([d, count]) => (
                <div key={d} className="tactical-meta-row">
                  <span className="tactical-meta-label">{d}</span>
                  <span className="tactical-meta-val">{count} reports</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
