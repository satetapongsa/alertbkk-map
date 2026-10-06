'use client';

import React from 'react';
import { Layers, X, Flame, Video, Car, Waves, CloudRain, Hospital, Shield, Radio, Activity } from 'lucide-react';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface AdvancedFiltersDrawerProps {
  onClose: () => void;
  showCameras: boolean;
  setShowCameras: (val: boolean) => void;
  showIncidents: boolean;
  setShowIncidents: (val: boolean) => void;
  showTraffic: boolean;
  setShowTraffic: (val: boolean) => void;
  showWeather: boolean;
  setShowWeather: (val: boolean) => void;
  showHospitals: boolean;
  setShowHospitals: (val: boolean) => void;
  showPolice: boolean;
  setShowPolice: (val: boolean) => void;
  showFireStations: boolean;
  setShowFireStations: (val: boolean) => void;
  showFloods: boolean;
  setShowFloods: (val: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (val: boolean) => void;
  showCameraCoverage: boolean;
  setShowCameraCoverage: (val: boolean) => void;
  selectedDistrict: string;
  setSelectedDistrict: (val: string) => void;
}

export const AdvancedFiltersDrawer: React.FC<AdvancedFiltersDrawerProps> = ({
  onClose,
  showCameras,
  setShowCameras,
  showIncidents,
  setShowIncidents,
  showTraffic,
  setShowTraffic,
  showWeather,
  setShowWeather,
  showHospitals,
  setShowHospitals,
  showPolice,
  setShowPolice,
  showFireStations,
  setShowFireStations,
  showFloods,
  setShowFloods,
  showHeatmap,
  setShowHeatmap,
  showCameraCoverage,
  setShowCameraCoverage,
  selectedDistrict,
  setSelectedDistrict,
}) => {
  const toggle = (setter: (v: boolean) => void, curr: boolean) => {
    tacticalAudio.playClick();
    setter(!curr);
  };

  const DISTRICTS = [
    'ALL',
    'Watthana',
    'Pathum Wan',
    'Huai Khwang',
    'Chatuchak',
    'Bang Rak',
    'Ratchathewi',
    'Khlong Toei',
  ];

  return (
    <aside className="intel-slide-panel" aria-label="Map Layer Manager" style={{ width: '400px' }}>
      <div className="panel-header">
        <div className="panel-header-title">
          <Layers size={15} color="#00f0ff" />
          <span>MAP LAYER MANAGER &bull; MIRRIX</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close Panel">
          <X size={16} />
        </button>
      </div>

      <div className="panel-body">
        {/* CATEGORY 1: EVENTS */}
        <div className="tactical-data-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f59e0b', fontWeight: '700', marginBottom: '8px' }}>
            EVENTS &bull; REAL-TIME INTELLIGENCE
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#ff3366', fontWeight: '600' }}>Active Incident Markers</span>
              <input type="checkbox" checked={showIncidents} onChange={() => toggle(setShowIncidents, showIncidents)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#00f0ff', fontWeight: '600' }}>Incident Density Heatmap</span>
              <input type="checkbox" checked={showHeatmap} onChange={() => toggle(setShowHeatmap, showHeatmap)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>Traffic Flow Corridors</span>
              <input type="checkbox" checked={showTraffic} onChange={() => toggle(setShowTraffic, showTraffic)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>Flood Zones & Drainage</span>
              <input type="checkbox" checked={showFloods} onChange={() => toggle(setShowFloods, showFloods)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#818cf8', fontWeight: '600' }}>Weather & Rain Telemetry</span>
              <input type="checkbox" checked={showWeather} onChange={() => toggle(setShowWeather, showWeather)} />
            </label>
          </div>
        </div>

        {/* CATEGORY 2: MEDIA */}
        <div className="tactical-data-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00ff66', fontWeight: '700', marginBottom: '8px' }}>
            MEDIA &bull; PUBLIC OPTICAL FEEDS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#00ff66', fontWeight: '600' }}>Public Surveillance Cameras</span>
              <input type="checkbox" checked={showCameras} onChange={() => toggle(setShowCameras, showCameras)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#34d399', fontWeight: '600' }}>Public Camera Coverage Buffer</span>
              <input type="checkbox" checked={showCameraCoverage} onChange={() => toggle(setShowCameraCoverage, showCameraCoverage)} />
            </label>
          </div>
        </div>

        {/* CATEGORY 3: SERVICES */}
        <div className="tactical-data-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#38bdf8', fontWeight: '700', marginBottom: '8px' }}>
            SERVICES &bull; EMERGENCY INFRASTRUCTURE
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#0284c7' }}>Hospitals & Emergency Trauma</span>
              <input type="checkbox" checked={showHospitals} onChange={() => toggle(setShowHospitals, showHospitals)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#1e3a8a' }}>Police Stations & Precincts</span>
              <input type="checkbox" checked={showPolice} onChange={() => toggle(setShowPolice, showPolice)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span style={{ color: '#dc2626' }}>Fire & Disaster Rescue Units</span>
              <input type="checkbox" checked={showFireStations} onChange={() => toggle(setShowFireStations, showFireStations)} />
            </label>
          </div>
        </div>

        {/* SECTOR / DISTRICT FILTER */}
        <div className="tactical-data-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#8b949e', marginBottom: '8px' }}>
            SECTOR FOCUS (BANGKOK DISTRICTS)
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {DISTRICTS.map((d) => (
              <button
                key={d}
                className={`tactical-pill-btn ${selectedDistrict === d ? 'active cyan' : ''}`}
                style={{ fontSize: '10px', padding: '3px 8px' }}
                onClick={() => {
                  tacticalAudio.playClick();
                  setSelectedDistrict(d);
                }}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
