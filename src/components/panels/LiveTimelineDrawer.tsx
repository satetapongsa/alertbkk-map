'use client';

import React from 'react';
import { Incident } from '@/types/intelligence';
import { X, Clock, Flame, AlertTriangle, ArrowRight, Radio } from 'lucide-react';
import { formatDataAge } from '@/lib/spatial';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface LiveTimelineDrawerProps {
  incidents: Incident[];
  onClose: () => void;
  onSelectIncident: (inc: Incident) => void;
}

export const LiveTimelineDrawer: React.FC<LiveTimelineDrawerProps> = ({
  incidents,
  onClose,
  onSelectIncident,
}) => {
  return (
    <aside className="intel-slide-panel" aria-label="Incident Timeline Stream" style={{ width: '440px' }}>
      <div className="panel-header">
        <div className="panel-header-title">
          <Clock size={15} color="#d4af37" />
          <span>TIMELINE 2.0 &bull; REAL-TIME INCIDENT STREAM</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close Timeline">
          <X size={16} />
        </button>
      </div>

      <div className="panel-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#00ff66', fontFamily: 'var(--font-mono)' }}>
          <span className="telem-indicator-dot" />
          <span>STREAMING ACTIVE EVENT DISPATCHES ({incidents.length} TOTAL)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {incidents.map((inc) => {
            const timeStr = new Date(inc.reported_at).toLocaleTimeString('en-GB', {
              hour12: false,
            });
            const dataAge = formatDataAge(inc.updated_at || inc.reported_at);

            return (
              <div
                key={inc.id}
                onClick={() => {
                  tacticalAudio.playRadarBlip();
                  onSelectIncident(inc);
                }}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                }}
              >
                {/* Header: TIME & SEVERITY */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00f0ff', fontWeight: '700' }}>
                      {timeStr}
                    </span>
                    <span style={{ fontSize: '10px', color: '#8b949e' }}>ICT</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: '#00ff66',
                        background: 'rgba(0, 255, 102, 0.08)',
                        padding: '1px 5px',
                        borderRadius: '2px',
                      }}
                    >
                      {dataAge.toUpperCase()}
                    </span>
                    <span className={`severity-badge ${inc.severity.toLowerCase()}`} style={{ fontSize: '10px' }}>
                      {inc.severity}
                    </span>
                  </div>
                </div>

                {/* TYPE & LOCATION */}
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#f0f6fc', marginBottom: '3px', letterSpacing: '0.5px' }}>
                  {inc.type} &bull; {inc.district.toUpperCase()}
                </div>

                {/* DESCRIPTION */}
                <div style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.4', marginBottom: '6px' }}>
                  {inc.title}
                </div>

                {/* SOURCE & AGE */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    paddingTop: '6px',
                    fontSize: '10px',
                    color: '#6e7681',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: '#00f0ff' }}>
                    SRC: {inc.source.toUpperCase()}
                  </span>
                  <span style={{ color: '#d4af37', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    TARGET LOC <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
