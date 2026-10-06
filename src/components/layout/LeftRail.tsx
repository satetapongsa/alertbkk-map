'use client';

import React from 'react';
import {
  Globe,
  Plane,
  Video,
  Flame,
  Car,
  Waves,
  CloudRain,
  Tv,
  MapPin,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface LeftRailProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cameraCount: number;
  incidentCount: number;
  alertCount: number;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  activeTab,
  onSelectTab,
  cameraCount,
  incidentCount,
  alertCount,
}) => {
  const handleClick = (tab: string) => {
    tacticalAudio.playClick();
    onSelectTab(activeTab === tab ? '' : tab);
  };

  return (
    <nav className="left-rail" aria-label="Tactical Intelligence Rail">
      {/* 1. OVERVIEW */}
      <button
        className={`rail-btn ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => handleClick('overview')}
        title="OVERVIEW (Bangkok Core Global Monitoring)"
      >
        <Globe size={18} />
      </button>

      {/* 2. AIR / AVIATION */}
      <button
        className={`rail-btn ${activeTab === 'air' ? 'active' : ''}`}
        onClick={() => handleClick('air')}
        title="AIR (Aviation Corridors & Airports)"
      >
        <Plane size={18} />
      </button>

      {/* 3. CAMERAS */}
      <button
        className={`rail-btn ${activeTab === 'cameras' ? 'active' : ''}`}
        onClick={() => handleClick('cameras')}
        title="CAMERAS (Verified Public Surveillance & Traffic Cams)"
      >
        <Video size={18} />
        <span className="rail-badge green">{cameraCount}</span>
      </button>

      {/* 4. INCIDENTS */}
      <button
        className={`rail-btn ${activeTab === 'incidents' ? 'active' : ''}`}
        onClick={() => handleClick('incidents')}
        title="INCIDENTS (Active Dispatches & Emergency Events)"
      >
        <Flame size={18} />
        <span className="rail-badge amber">{incidentCount}</span>
      </button>

      {/* 5. TRAFFIC */}
      <button
        className={`rail-btn ${activeTab === 'traffic' ? 'active' : ''}`}
        onClick={() => handleClick('traffic')}
        title="TRAFFIC (Expressways & Surface Road Sensors)"
      >
        <Car size={18} />
        <span className="rail-badge green">4</span>
      </button>

      {/* 6. FLOOD */}
      <button
        className={`rail-btn ${activeTab === 'flood' ? 'active' : ''}`}
        onClick={() => handleClick('flood')}
        title="FLOOD (Hydrological Gauges & Water Levels)"
      >
        <Waves size={18} />
        <span className="rail-badge cyan">1</span>
      </button>

      {/* 7. WEATHER */}
      <button
        className={`rail-btn ${activeTab === 'weather' ? 'active' : ''}`}
        onClick={() => handleClick('weather')}
        title="WEATHER (Meteorological Telemetry & Rain Radar)"
      >
        <CloudRain size={18} />
      </button>

      {/* 8. MEDIA */}
      <button
        className={`rail-btn ${activeTab === 'media' ? 'active' : ''}`}
        onClick={() => handleClick('media')}
        title="MEDIA (Public Live Streams & Webcams)"
      >
        <Tv size={18} />
      </button>

      {/* 9. PLACES */}
      <button
        className={`rail-btn ${activeTab === 'places' ? 'active' : ''}`}
        onClick={() => handleClick('places')}
        title="PLACES (Hospitals, Police Stations, Fire Stations)"
      >
        <MapPin size={18} />
      </button>

      {/* 10. ALERTS */}
      <button
        className={`rail-btn ${activeTab === 'alerts' ? 'active' : ''}`}
        onClick={() => handleClick('alerts')}
        title="ALERTS (Civil Warnings & Critical Hotspots)"
      >
        <AlertTriangle size={18} />
        <span className="rail-badge red">{alertCount}</span>
      </button>

      {/* 11. LAYERS */}
      <button
        className={`rail-btn ${activeTab === 'layers' ? 'active' : ''}`}
        onClick={() => handleClick('layers')}
        title="LAYERS (Map Layer Manager & Density Overlays)"
      >
        <Layers size={18} />
      </button>
    </nav>
  );
};
