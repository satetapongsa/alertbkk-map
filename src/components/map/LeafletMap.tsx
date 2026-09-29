'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident, TransportLine } from '@/types';
import { INCIDENT_CONFIG, SEVERITY_CONFIG } from '@/lib/utils';
import { BANGKOK_TRANSIT_LINES } from '@/lib/transit-data';
import {
  Navigation,
  Plus,
  Minus,
  Plane,
  Crosshair,
  Layers,
  Map as MapIcon,
  Globe,
} from 'lucide-react';

interface LeafletMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  userCoords?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  watchArea?: { lat: number; lng: number; radiusKm: number } | null;
  onLocateUser?: (coords: { lat: number; lng: number }) => void;
}

export type MapTileMode = 'STREET' | 'SATELLITE';

export const LeafletMap: React.FC<LeafletMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  flyToCoords,
  userCoords,
  onMapClick,
  watchArea,
  onLocateUser,
}) => {
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const transitLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const watchCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Map Tile Mode: Default to REAL HIGH-RESOLUTION SATELLITE (Like looking down from orbit)
  const [mapMode, setMapMode] = useState<MapTileMode>('SATELLITE');
  const [showTransit, setShowTransit] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Default Center: Bangkok Grand Palace / Siam / City Center
  const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018];
  const DEFAULT_ZOOM = 12;

  // Tile URL configuration: Real Street Map and Real High-Resolution Satellite
  const TILE_PROVIDERS: Record<MapTileMode, { url: string; options: L.TileLayerOptions; name: string }> = {
    STREET: {
      name: 'OpenStreetMap Road Telemetry',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    SATELLITE: {
      name: 'Google Maps Satellite Imagery',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      options: {
        maxZoom: 20,
        attribution: '&copy; Google Maps Satellite Imagery',
      },
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // Custom controls
      attributionControl: false,
    });

    // Initial Tile: Real Google Satellite Imagery (Down-looking satellite view)
    const initialConfig = TILE_PROVIDERS.SATELLITE;
    activeTileLayerRef.current = L.tileLayer(initialConfig.url, initialConfig.options).addTo(map);

    L.control
      .attribution({
        position: 'bottomright',
        prefix: '<span style="color:#64748b; font-size:10px;">Thailand Real-Time Incident Map</span>',
      })
      .addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    transitLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);

    // Map click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    // Invalidate size after mount to ensure all tiles render cleanly
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 600);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      try {
        if (markersLayerRef.current) markersLayerRef.current.clearLayers();
        if (transitLayerRef.current) transitLayerRef.current.clearLayers();
        if (heatmapLayerRef.current) heatmapLayerRef.current.clearLayers();
        map.remove();
      } catch (err) {
        // Ignore Leaflet unmount cleanup error during route transition
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Change Tile Layer when mapMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const config = TILE_PROVIDERS[mapMode];
    if (activeTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    }

    activeTileLayerRef.current = L.tileLayer(config.url, config.options).addTo(
      mapInstanceRef.current
    );
    activeTileLayerRef.current.bringToBack();
  }, [mapMode]);

  // Update Incident Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    incidents.forEach((incident) => {
      const cfg = INCIDENT_CONFIG[incident.type] || INCIDENT_CONFIG.GENERAL;
      const isCritical = incident.severity === 'CRITICAL' || incident.severity === 'HIGH';
      const isSelected = selectedIncident?.id === incident.id;

      // Custom HTML DivIcon
      const iconHtml = `
        <div class="custom-incident-pin" style="transform: ${isSelected ? 'scale(1.35)' : 'scale(1)'};">
          ${
            isCritical
              ? `<div class="marker-pulse-ring" style="background-color: ${cfg.markerHex}33; border: 2px solid ${cfg.markerHex};"></div>`
              : ''
          }
          <div style="
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border: 2px solid ${isSelected ? '#38bdf8' : cfg.markerHex};
            box-shadow: 0 4px 14px ${cfg.markerHex}88, inset 0 0 10px rgba(0,0,0,0.5);
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
              line-height: 1;
            ">${cfg.icon}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'incident-div-icon',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      const marker = L.marker([incident.latitude, incident.longitude], {
        icon: customIcon,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectIncident(incident);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [incidents, selectedIncident, onSelectIncident]);

  // Update Transit Polylines & Stations Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !transitLayerRef.current) return;

    transitLayerRef.current.clearLayers();

    if (!showTransit) return;

    BANGKOK_TRANSIT_LINES.forEach((line) => {
      // Draw Transit Track Polyline
      const polyline = L.polyline(line.coordinates, {
        color: line.colorCode,
        weight: line.status === 'DELAYED' ? 5 : 4,
        opacity: 0.9,
        dashArray: line.status === 'DELAYED' ? '6, 8' : undefined,
      });

      polyline.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 180px;">
          <div style="font-weight: bold; font-size: 13px; color: ${line.colorCode}; margin-bottom: 4px;">
            ${line.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            ${line.nameEn}
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-weight: 600; margin-bottom: 4px;">
            <span style="color: ${line.status === 'NORMAL' ? '#22c55e' : '#f59e0b'};">
              ● ${line.status === 'NORMAL' ? 'Normal Operations' : 'Delayed Service'}
            </span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4;">
            ${line.statusDetail || 'Regular scheduled frequency'}
          </div>
        </div>
      `);

      polyline.addTo(transitLayerRef.current!);

      // Draw Key Stations
      line.stations.forEach((st) => {
        const stationIcon = L.divIcon({
          html: `<div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #ffffff;
            border: 2.5px solid ${line.colorCode};
            box-shadow: 0 0 6px ${line.colorCode};
          "></div>`,
          className: 'station-pin',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        const stMarker = L.marker([st.latitude, st.longitude], {
          icon: stationIcon,
        });

        stMarker.bindTooltip(`${st.name} (${st.nameEn})`, {
          direction: 'top',
          offset: [0, -5],
          className: 'glass-panel text-xs text-white px-2 py-1 rounded-md border-0',
        });

        stMarker.addTo(transitLayerRef.current!);
      });
    });
  }, [showTransit]);

  // Update Heatmap / Density Circles Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !heatmapLayerRef.current) return;

    heatmapLayerRef.current.clearLayers();

    if (!showHeatmap) return;

    incidents.forEach((inc) => {
      const cfg = INCIDENT_CONFIG[inc.type] || INCIDENT_CONFIG.GENERAL;
      const circle = L.circle([inc.latitude, inc.longitude], {
        radius: 650,
        color: cfg.markerHex,
        fillColor: cfg.markerHex,
        fillOpacity: 0.28,
        weight: 1,
      });
      circle.addTo(heatmapLayerRef.current!);
    });
  }, [showHeatmap, incidents]);

  // Update User GPS Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userCoords) {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 22px; height: 22px;">
              <div style="position: absolute; inset: 0; border-radius: 50%; background: #38bdf8; opacity: 0.5; animation: pulse-ring 2s infinite;"></div>
              <div style="width: 14px; height: 14px; margin: 4px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 10px #38bdf8;"></div>
            </div>
          `,
          className: 'user-gps-pin',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
          icon: userIcon,
        }).addTo(mapInstanceRef.current);
      } else {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      }
    }
  }, [userCoords]);

  // Update Watch Area Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (watchArea) {
      if (!watchCircleRef.current) {
        watchCircleRef.current = L.circle([watchArea.lat, watchArea.lng], {
          radius: watchArea.radiusKm * 1000,
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '5, 8',
        }).addTo(mapInstanceRef.current);
      } else {
        watchCircleRef.current.setLatLng([watchArea.lat, watchArea.lng]);
        watchCircleRef.current.setRadius(watchArea.radiusKm * 1000);
      }
    } else if (watchCircleRef.current) {
      watchCircleRef.current.remove();
      watchCircleRef.current = null;
    }
  }, [watchArea]);

  // Smooth FlyTo Effect
  useEffect(() => {
    if (!mapInstanceRef.current || !flyToCoords) return;

    mapInstanceRef.current.flyTo(
      [flyToCoords.lat, flyToCoords.lng],
      flyToCoords.zoom || 15,
      {
        duration: 1.2,
        easeLinearity: 0.25,
      }
    );
  }, [flyToCoords]);

  // Custom Controls Functions
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleCenterBangkok = () =>
    mapInstanceRef.current?.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1 });

  const handleFlyToUser = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 16, {
        duration: 1.2,
      });
      return;
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIsLocatingUser(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocatingUser(false);
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          if (onLocateUser) onLocateUser(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([coords.lat, coords.lng], 16, {
              duration: 1.2,
            });
          }
        },
        (err) => {
          setIsLocatingUser(false);
          alert('Could not retrieve current location. Please allow browser location access.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Floating Map Controls on Right Side (Top-Right under summary) */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 lg:top-auto lg:bottom-28 z-[600] pointer-events-auto flex flex-col gap-2 items-center">
        {/* Compact Map Layer Mode Switcher Pill (Street vs Satellite Icons) */}
        <div className="flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 shadow-2xl backdrop-blur-md gap-1">
          <button
            onClick={() => setMapMode('STREET')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              mapMode === 'STREET'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Street Map (OpenStreetMap)"
            aria-label="Street Map"
          >
            <MapIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMapMode('SATELLITE')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              mapMode === 'SATELLITE'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Satellite Imagery (Google Satellite)"
            aria-label="Satellite Imagery"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Warp to My Current Location Button (Always Visible) */}
        <button
          onClick={handleFlyToUser}
          disabled={isLocatingUser}
          title="Warp to My Current GPS Location"
          className="w-10 h-10 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-cyan-400 border border-cyan-500/50 shadow-2xl flex items-center justify-center transition-all active:scale-90 hover:scale-105 cursor-pointer relative group"
        >
          <Navigation className={`w-5 h-5 fill-cyan-400 ${isLocatingUser ? 'animate-spin text-cyan-300' : ''}`} />
          {userCoords && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border border-slate-900"></span>
            </span>
          )}
        </button>

        <button
          onClick={handleCenterBangkok}
          title="Reset to Bangkok Center"
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        <div className="flex flex-col bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-xl overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-10 h-10 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition-colors border-b border-slate-800 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-10 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Flight Radar & Airport Operations Shortcut */}
        <a
          href="/dashboard#flights"
          title="Live Flight Radar & Airport Flight Telemetry"
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer select-none group"
        >
          <Plane className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </div>
  );
};
