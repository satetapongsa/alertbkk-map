'use client';

import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Activity,
  Grid,
  Radio,
  CloudRain,
  ShieldAlert,
  Crosshair,
  BarChart2,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tacticalAudio';
import { LocationStatus, UserLocationData } from '@/types/intelligence';

interface TopHUDProps {
  onlineCameras: number;
  activeIncidents: number;
  alertCount?: number;
  onOpenSystemStatus: () => void;
  onToggleGrid: () => void;
  isGridView: boolean;
  onResetView: () => void;
  locationStatus: LocationStatus;
  userLocation: UserLocationData | null;
  onOpenSummary?: () => void;
  onOpenWeather?: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  onlineCameras,
  activeIncidents,
  alertCount = 2,
  onOpenSystemStatus,
  onToggleGrid,
  isGridView,
  onResetView,
  locationStatus,
  userLocation,
  onOpenSummary,
  onOpenWeather,
}) => {
  const [zuluTime, setZuluTime] = useState<string>('00:00:00Z');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    const updateZulu = () => {
      const now = new Date();
      const zulu = now.toISOString().substring(11, 19) + 'Z';
      setZuluTime(zulu);
    };

    updateZulu();
    const interval = setInterval(updateZulu, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    tacticalAudio.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    tacticalAudio.setSoundEnabled(nextState);
    if (nextState) {
      tacticalAudio.playRadarBlip();
    }
  };

  return (
    <header className="top-hud">
      {/* Left: MIRRIX Tactical Brand & Logo */}
      <div
        className="hud-brand"
        onClick={onResetView}
        title="MIRRIX — LIVE GLOBAL SITUATIONAL AWARENESS (Click to Reset View)"
      >
        <img
          src="/mirrix-logo.jpg"
          alt="MIRRIX Logo"
          className="hud-logo-icon"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1.5px solid #00f0ff',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.4), inset 0 0 4px rgba(212, 175, 55, 0.3)',
            objectFit: 'cover',
          }}
        />

        <div className="hud-title-wrap">
          <div className="hud-title" style={{ letterSpacing: '2px' }}>MIRRIX</div>
          <div className="hud-subtitle" style={{ letterSpacing: '1px' }}>
            REAL-WORLD INTELLIGENCE &bull; BANGKOK
          </div>
        </div>
      </div>

      {/* Center: Live Telemetry Bar */}
      <div className="hud-telemetry">
        <div className="telem-item">
          <span className="telem-label">ZULU</span>
          <span className="telem-val gold">{zuluTime}</span>
        </div>

        <div className="telem-item">
          <span className="telem-indicator-dot" />
          <span className="telem-label">STATUS</span>
          <span className="telem-val green">LIVE</span>
        </div>

        <div className="telem-item">
          <span className="telem-label">CAMERAS</span>
          <span className="telem-val green">{onlineCameras}</span>
        </div>

        <div className="telem-item">
          <span className="telem-label">INCIDENTS</span>
          <span className="telem-val gold">{activeIncidents}</span>
        </div>

        <div className="telem-item">
          <span className="telem-label">ALERTS</span>
          <span className="telem-val" style={{ color: '#ff3366' }}>{alertCount}</span>
        </div>

        <div
          className="telem-item"
          onClick={onOpenSystemStatus}
          style={{ cursor: 'pointer' }}
          title="Open Data Source Monitor"
        >
          <span className="telem-label">DATA SOURCES</span>
          <span className="telem-val cyan">6 VERIFIED</span>
        </div>

        {/* Weather Quick Telemetry */}
        <div
          className="telem-item"
          onClick={onOpenWeather}
          style={{ cursor: 'pointer' }}
          title="Bangkok Meteorological Telemetry: 29°C Rain 35% Wind 8 km/h"
        >
          <span className="telem-label">WEATHER</span>
          <span className="telem-val cyan">29°C / 35%</span>
        </div>

        {/* Situational Summary Trigger */}
        {onOpenSummary && (
          <button
            className="telem-item"
            onClick={onOpenSummary}
            style={{
              cursor: 'pointer',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '3px',
              padding: '2px 6px',
            }}
            title="Open Live Situational Summary Report"
          >
            <BarChart2 size={12} color="#d4af37" />
            <span className="telem-val gold" style={{ fontSize: '10px' }}>SUMMARY</span>
          </button>
        )}
      </div>

      {/* Right: Controls & Status */}
      <div className="hud-actions">
        <button
          className={`tactical-pill-btn cyan ${isGridView ? 'active' : ''}`}
          onClick={onToggleGrid}
          title="Surveillance Camera Matrix Wall"
        >
          <Grid size={13} />
          <span>{isGridView ? 'MAP VIEW' : 'CAMERA WALL'}</span>
        </button>

        <button
          className="tactical-pill-btn"
          onClick={onOpenSystemStatus}
          title="Open MIRRIX Data Source Monitor & Health Observability"
        >
          <Activity size={13} color="#00ff66" />
          <span>$ MIRRIX / SYSTEM STATUS</span>
        </button>

        <button
          className="tactical-pill-btn"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Tactical Audio' : 'Enable Tactical Audio'}
          style={{ padding: '6px 10px' }}
        >
          {soundEnabled ? <Volume2 size={14} color="#00f0ff" /> : <VolumeX size={14} color="#7d8590" />}
        </button>

        <button
          className="tactical-pill-btn"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen Tactical Mode"
          style={{ padding: '6px 10px' }}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </header>
  );
};
