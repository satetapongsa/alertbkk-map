'use client';

import React from 'react';
import {
  Crosshair,
  Radio,
  BarChart3,
  AlertOctagon,
  PenTool,
  Filter,
  Layers,
  Search,
  Database,
  Radar,
  Bookmark,
  Activity,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tacticalAudio';
import { LocationStatus } from '@/types/intelligence';

interface RightRailProps {
  onOpenSearch: () => void;
  onOpenFilters: () => void;
  onOpenAnalytics: () => void;
  onToggleDrawing: () => void;
  onOpenTimeline: () => void;
  onOpenScanArea: () => void;
  onOpenBookmarks: () => void;
  onOpenLayers: () => void;
  onOpenSignals: () => void;
  isDrawingActive: boolean;
  activePanel: string;
  onSelectPanel: (panel: string) => void;
  locationStatus: LocationStatus;
  onLocateClick: () => void;
}

export const RightRail: React.FC<RightRailProps> = ({
  onOpenSearch,
  onOpenFilters,
  onOpenAnalytics,
  onToggleDrawing,
  onOpenTimeline,
  onOpenScanArea,
  onOpenBookmarks,
  onOpenLayers,
  onOpenSignals,
  isDrawingActive,
  activePanel,
  onSelectPanel,
  locationStatus,
  onLocateClick,
}) => {
  const handleAction = (id: string, callback?: () => void) => {
    tacticalAudio.playClick();
    if (callback) {
      callback();
    } else {
      onSelectPanel(activePanel === id ? '' : id);
    }
  };

  const isLocLocked = locationStatus === 'LOCATED';
  const isLocRequesting = locationStatus === 'REQUESTING';
  const isLocError = ['PERMISSION_DENIED', 'POSITION_UNAVAILABLE', 'TIMEOUT', 'ERROR'].includes(locationStatus);

  const locationTooltip = isLocRequesting
    ? 'LOCATING...'
    : isLocLocked
    ? 'LOCATION LOCKED (Click to re-acquire)'
    : 'MY LOCATION';

  return (
    <aside className="right-rail" aria-label="Tactical Intelligence Controls">
      {/* 1. MY LOCATION (One-shot fix) */}
      <button
        className={`rail-btn ${isLocLocked ? 'active' : ''} ${activePanel === 'my_location' ? 'active' : ''}`}
        style={{
          borderColor: isLocRequesting
            ? '#00f0ff'
            : isLocError
            ? '#ff3366'
            : isLocLocked
            ? '#00ff66'
            : undefined,
          boxShadow: isLocRequesting
            ? '0 0 10px rgba(0, 240, 255, 0.5)'
            : isLocLocked
            ? '0 0 8px rgba(0, 255, 102, 0.3)'
            : undefined,
        }}
        onClick={() => {
          tacticalAudio.playRadarBlip();
          onLocateClick();
        }}
        title={locationTooltip}
      >
        <Crosshair size={18} color={isLocLocked ? '#00ff66' : isLocRequesting ? '#00f0ff' : isLocError ? '#ff3366' : undefined} />
        {isLocLocked && <span className="rail-badge green">LOCK</span>}
        {isLocRequesting && <span className="rail-badge cyan">GPS</span>}
      </button>

      {/* 2. SCAN AREA */}
      <button
        className={`rail-btn ${activePanel === 'scan_area' ? 'active' : ''}`}
        onClick={() => handleAction('scan_area', onOpenScanArea)}
        title="SCAN AREA (Radial Multi-Domain Intelligence Scan)"
      >
        <Radar size={18} color="#00f0ff" />
      </button>

      {/* 3. LIVE SIGNALS */}
      <button
        className={`rail-btn ${activePanel === 'signals' ? 'active' : ''}`}
        onClick={() => handleAction('signals', onOpenSignals)}
        title="LIVE SIGNALS (Sensors, Water Gauges & Weather Feeds)"
      >
        <Radio size={18} />
      </button>

      {/* 4. ANALYTICS */}
      <button
        className={`rail-btn ${activePanel === 'analytics' ? 'active' : ''}`}
        onClick={() => handleAction('analytics', onOpenAnalytics)}
        title="ANALYTICS (Geospatial Situational Density & Reports)"
      >
        <BarChart3 size={18} />
      </button>

      {/* 5. ALERTS & TIMELINE */}
      <button
        className={`rail-btn ${activePanel === 'timeline' ? 'active' : ''}`}
        onClick={() => handleAction('timeline', onOpenTimeline)}
        title="ALERTS (Live Incident Dispatches & Civil Defense Alerts)"
      >
        <AlertOctagon size={18} />
      </button>

      {/* 6. DRAW & MEASURE */}
      <button
        className={`rail-btn ${isDrawingActive ? 'active' : ''}`}
        onClick={() => handleAction('drawing', onToggleDrawing)}
        title="DRAW (Tactical Distance & Radius Measurement Tool)"
      >
        <PenTool size={18} color={isDrawingActive ? '#00ff66' : undefined} />
        {isDrawingActive && <span className="rail-badge green">MEAS</span>}
      </button>

      {/* 7. FILTER */}
      <button
        className={`rail-btn ${activePanel === 'filters' ? 'active' : ''}`}
        onClick={() => handleAction('filters', onOpenFilters)}
        title="FILTER (Incident Types, Severities & Districts)"
      >
        <Filter size={18} />
      </button>

      {/* 8. LAYERS */}
      <button
        className={`rail-btn ${activePanel === 'layers' ? 'active' : ''}`}
        onClick={() => handleAction('layers', onOpenLayers)}
        title="LAYERS (Map Layer Manager & Density Heatmaps)"
      >
        <Layers size={18} />
      </button>

      {/* 9. SEARCH */}
      <button
        className={`rail-btn ${activePanel === 'search' ? 'active' : ''}`}
        onClick={() => handleAction('search', onOpenSearch)}
        title="SEARCH (Coordinates, Highways, Cameras, Infrastructure)"
      >
        <Search size={18} />
      </button>

      {/* 10. DATABASE & BOOKMARKS */}
      <button
        className={`rail-btn ${activePanel === 'bookmarks' ? 'active' : ''}`}
        onClick={() => handleAction('bookmarks', onOpenBookmarks)}
        title="DATABASE & BOOKMARKS (Saved Tactical Coordinates & Locations)"
      >
        <Bookmark size={18} />
      </button>
    </aside>
  );
};
