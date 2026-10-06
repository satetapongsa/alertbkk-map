'use client';

import React, { useState, useEffect } from 'react';
import { SourceHealth } from '@/types/intelligence';
import { X, Activity, Plus, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface AdminSourcesModalProps {
  onClose: () => void;
  onRefreshSources?: () => void;
}

export const AdminSourcesModal: React.FC<AdminSourcesModalProps> = ({ onClose, onRefreshSources }) => {
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states
  const [sourceName, setSourceName] = useState('');
  const [provider, setProvider] = useState('');
  const [sourceType, setSourceType] = useState('TRAFFIC');
  const [sourceUrl, setSourceUrl] = useState('');
  const [lat, setLat] = useState('13.7380');
  const [lng, setLng] = useState('100.5600');
  const [district, setDistrict] = useState('Watthana');
  const [license, setLicense] = useState('Open Government Data License');
  const [formMsg, setFormMsg] = useState<{ text: string; error: boolean } | null>(null);

  const fetchSources = () => {
    setLoading(true);
    fetch('/api/sources/health')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSources(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleRegisterSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    tacticalAudio.playClick();

    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sourceName,
          provider,
          source_type: sourceType,
          source_url: sourceUrl,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          district,
          license,
          embedding_allowed: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        tacticalAudio.playRadarBlip();
        setFormMsg({ text: 'Public source validated and ingested into MIRRIX index.', error: false });
        setShowAddForm(false);
        fetchSources();
        if (onRefreshSources) onRefreshSources();
      } else {
        setFormMsg({ text: json.error || 'Validation failed.', error: true });
      }
    } catch {
      setFormMsg({ text: 'Network communication failure.', error: true });
    }
  };

  return (
    <div className="search-modal" style={{ width: '740px', maxHeight: '88vh' }} aria-label="Data Source Health & Administration">
      <div className="panel-header">
        <div className="panel-header-title">
          <Activity size={16} color="#00ff66" />
          <span>MIRRIX DATA SOURCE MONITOR & OBSERVABILITY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="tactical-pill-btn cyan"
            style={{ padding: '4px 10px', fontSize: '10px' }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={12} />
            <span>{showAddForm ? 'VIEW HEALTH' : 'ADD PUBLIC SOURCE'}</span>
          </button>

          <button className="panel-close-btn" onClick={onClose} title="Close Panel">
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ padding: '18px', overflowY: 'auto', maxHeight: 'calc(88vh - 65px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {formMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '3px',
              fontSize: '11px',
              background: formMsg.error ? 'rgba(255, 51, 102, 0.15)' : 'rgba(0, 255, 102, 0.15)',
              border: `1px solid ${formMsg.error ? '#ff3366' : '#00ff66'}`,
              color: formMsg.error ? '#ff3366' : '#00ff66',
            }}
          >
            {formMsg.text}
          </div>
        )}

        {showAddForm ? (
          /* Add / Register Public Source Form */
          <form onSubmit={handleRegisterSource} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
              REGISTER VERIFIED OPEN-DATA SOURCE
            </div>
            <div style={{ fontSize: '10px', color: '#8b949e' }}>
              Per Section 2 compliance: only publicly accessible endpoints with verified licenses are accepted. Private CCTV, local subnets, and credential scanning are rejected by policy.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>SOURCE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asok Junction Traffic Monitor"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-tactical)', color: '#fff', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>PROVIDER / MUNICIPALITY</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BMA Transport Dept"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-tactical)', color: '#fff', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>TYPE</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: '#0d1117', border: '1px solid var(--border-tactical)', color: '#fff', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                >
                  <option value="TRAFFIC">TRAFFIC</option>
                  <option value="PUBLIC_WEBCAM">PUBLIC_WEBCAM</option>
                  <option value="GOVERNMENT">GOVERNMENT</option>
                  <option value="CITY">CITY</option>
                  <option value="HIGHWAY">HIGHWAY</option>
                  <option value="PORT">PORT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>DISTRICT</label>
                <input
                  type="text"
                  placeholder="e.g. Watthana"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-tactical)', color: '#fff', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>LATITUDE</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-tactical)', color: '#fff', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>LONGITUDE</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-tactical)', color: '#fff', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>PUBLIC URL / STREAM ENDPOINT</label>
              <input
                type="url"
                required
                placeholder="https://traffic.bma.go.th/camera/... or YouTube Live URL"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-tactical)', color: '#fff', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button type="submit" className="tactical-pill-btn" style={{ flex: 1, justifyContent: 'center' }}>
                <ShieldCheck size={14} color="#00ff66" />
                <span>VALIDATE &amp; REGISTER INGESTION</span>
              </button>
              <button
                type="button"
                className="tactical-pill-btn"
                style={{ padding: '6px 12px' }}
                onClick={() => setShowAddForm(false)}
              >
                CANCEL
              </button>
            </div>
          </form>
        ) : (
          /* Live Health Table */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#d4af37', fontWeight: '700' }}>
                INGESTION DAEMON REGISTRY ({sources.length} SOURCES ACTIVE)
              </div>
              <button
                onClick={fetchSources}
                style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}
              >
                <RefreshCw size={11} />
                <span>REFRESH TELEMETRY</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sources.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#f0f6fc' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8b949e' }}>
                      {s.provider} &bull; <span style={{ color: '#00f0ff' }}>{s.type}</span> &bull; {s.region}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: s.status === 'ONLINE' ? '#00ff66' : '#f59e0b',
                        }}
                      />
                      <span style={{ color: s.status === 'ONLINE' ? '#00ff66' : '#f59e0b', fontWeight: '700' }}>
                        {s.status}
                      </span>
                    </div>
                    <div style={{ color: '#6e7681', marginTop: '2px' }}>
                      LATENCY: <span style={{ color: '#00f0ff' }}>{s.latency_ms}ms</span> &bull; ERR: {s.error_rate_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
