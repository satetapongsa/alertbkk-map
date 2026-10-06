'use client';

import React, { useState } from 'react';
import { CameraSource } from '@/types/intelligence';
import { X, Grid, Maximize, ExternalLink, Radio, ShieldCheck } from 'lucide-react';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface CameraGridOverlayProps {
  cameras: CameraSource[];
  onClose: () => void;
  onSelectCamera: (cam: CameraSource) => void;
}

export const CameraGridOverlay: React.FC<CameraGridOverlayProps> = ({
  cameras,
  onClose,
  onSelectCamera,
}) => {
  const [gridSize, setGridSize] = useState<1 | 2 | 4 | 6 | 9>(4);

  const handleSizeChange = (size: 1 | 2 | 4 | 6 | 9) => {
    tacticalAudio.playClick();
    setGridSize(size);
  };

  const visibleCameras = cameras.slice(0, gridSize);

  return (
    <div className="camera-grid-overlay" aria-label="Camera Surveillance Wall">
      <div className="grid-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={18} color="#00ff66" />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '800', color: '#d4af37', letterSpacing: '2px' }}>
              SURVEILLANCE MATRIX &bull; BANGKOK SECTOR
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#8b949e' }}>
              ACTIVE FEEDS: {visibleCameras.length} &bull; COMPLIANT OPEN-ACCESS STREAMING
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="grid-selector-group">
            {([1, 2, 4, 6, 9] as const).map((size) => (
              <button
                key={size}
                className={`grid-select-btn ${gridSize === size ? 'active' : ''}`}
                onClick={() => handleSizeChange(size)}
              >
                {size} CAM{size > 1 ? 'S' : ''}
              </button>
            ))}
          </div>

          <button className="panel-close-btn" onClick={onClose} title="Return to Map View">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className={`matrix-cells grid-${gridSize}`}>
        {visibleCameras.map((cam) => (
          <div
            key={cam.id}
            style={{
              background: '#090d12',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Cell Video Container */}
            <div style={{ flex: 1, position: 'relative', background: '#000', minHeight: 180 }}>
              {cam.embedding_allowed && cam.is_youtube && cam.embed_url ? (
                <iframe
                  src={cam.embed_url}
                  title={cam.name}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : cam.embedding_allowed && cam.stream_url ? (
                <video
                  src={cam.stream_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    color: '#8b949e',
                    padding: '16px',
                    textAlign: 'center',
                    gap: '8px',
                  }}
                >
                  <ShieldCheck size={24} color="#d4af37" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f0f6fc' }}>
                    DIRECT EMBED RESTRICTED
                  </div>
                  <a
                    href={cam.source_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="tactical-pill-btn cyan"
                    style={{ fontSize: '10px', padding: '4px 8px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={10} />
                    <span>OPEN PUBLIC SOURCE</span>
                  </a>
                </div>
              )}

              {/* Feed Status Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '2px 8px',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: '#00ff66',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: cam.status === 'ONLINE' ? '#00ff66' : '#f59e0b',
                  }}
                />
                <span>{cam.status}</span>
                <span>&bull;</span>
                <span>{new Date().toLocaleTimeString()} ICT</span>
              </div>

              {/* Focus on Map Button */}
              <button
                onClick={() => {
                  onSelectCamera(cam);
                  onClose();
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '4px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
                title="Focus on Map"
              >
                <Maximize size={12} />
              </button>
            </div>

            {/* Cell Bottom Bar */}
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(12, 17, 24, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#f0f6fc' }}>
                  {cam.name}
                </div>
                <div style={{ fontSize: '9px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                  {cam.district} &bull; {cam.provider}
                </div>
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: '#00f0ff',
                  background: 'rgba(0, 240, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                }}
              >
                {cam.source_type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
