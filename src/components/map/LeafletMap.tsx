'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident, TransportLine } from '@/types';
import { INCIDENT_CONFIG, SEVERITY_CONFIG } from '@/lib/utils';
import { BANGKOK_TRANSIT_LINES } from '@/lib/transit-data';
import {
  BANGKOK_CCTV_CAMERAS,
  BANGKOK_BOAT_ROUTES,
  BANGKOK_RECON_UNITS,
  BangkokCCTVCamera,
} from '@/lib/recon-data';
import {
  Navigation,
  Plus,
  Minus,
  Plane,
  Crosshair,
  Layers,
  Map as MapIcon,
  Globe,
  Eye,
  EyeOff,
  Camera,
  Ship,
  Shield,
  Bus,
  Train,
  Check,
  X,
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
  
  // Master Visibility & Individual Recon Layer Toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showTransit, setShowTransit] = useState(true);
  const [showBus, setShowBus] = useState(true);
  const [showBoats, setShowBoats] = useState(true);
  const [showCCTV, setShowCCTV] = useState(true);
  const [showRecon, setShowRecon] = useState(true);
  const [showFlights, setShowFlights] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Extra Layer Groups
  const busLayerRef = useRef<L.LayerGroup | null>(null);
  const boatsLayerRef = useRef<L.LayerGroup | null>(null);
  const cctvLayerRef = useRef<L.LayerGroup | null>(null);
  const reconLayerRef = useRef<L.LayerGroup | null>(null);
  const flightsLayerRef = useRef<L.LayerGroup | null>(null);

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
    busLayerRef.current = L.layerGroup().addTo(map);
    boatsLayerRef.current = L.layerGroup().addTo(map);
    cctvLayerRef.current = L.layerGroup().addTo(map);
    reconLayerRef.current = L.layerGroup().addTo(map);
    flightsLayerRef.current = L.layerGroup().addTo(map);
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

  // Update Incident Markers (with Master Show/Hide Toggle)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (!showIncidents) return; // Clean map when toggled off

    incidents.forEach((incident) => {
      const cfg = INCIDENT_CONFIG[incident.type] || INCIDENT_CONFIG.GENERAL;
      const isSelected = selectedIncident?.id === incident.id;

      // Custom HTML DivIcon (Clean solid marker without flashing ring)
      const iconHtml = `
        <div class="custom-incident-pin" style="transform: ${isSelected ? 'scale(1.35)' : 'scale(1)'};">
          <div style="
            background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
            border: 2px solid ${isSelected ? '#38bdf8' : cfg.markerHex};
            box-shadow: 0 4px 14px ${cfg.markerHex}88, inset 0 0 10px rgba(0,0,0,0.5);
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 15px;
              line-height: 1;
            ">${cfg.icon}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'incident-div-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
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
  }, [incidents, selectedIncident, onSelectIncident, showIncidents]);

  // Update Train Rapid Transit (BTS / MRT / ARL / SRT)
  useEffect(() => {
    if (!mapInstanceRef.current || !transitLayerRef.current) return;
    transitLayerRef.current.clearLayers();
    if (!showTransit) return;

    BANGKOK_TRANSIT_LINES.filter((l) => l.type !== 'BUS').forEach((line) => {
      const polyline = L.polyline(line.coordinates, {
        color: line.colorCode,
        weight: line.status === 'DELAYED' ? 5 : 4,
        opacity: 0.9,
        dashArray: line.status === 'DELAYED' ? '6, 8' : undefined,
      });

      polyline.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 190px;">
          <div style="font-weight: 800; font-size: 13px; color: ${line.colorCode}; margin-bottom: 2px;">
            ${line.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${line.nameEn}</div>
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

      line.stations.forEach((st) => {
        const stationIcon = L.divIcon({
          html: `<div style="width: 9px; height: 9px; border-radius: 50%; background-color: #ffffff; border: 2.5px solid ${line.colorCode}; box-shadow: 0 0 6px ${line.colorCode};"></div>`,
          className: 'station-pin',
          iconSize: [9, 9],
          iconAnchor: [4.5, 4.5],
        });
        const stMarker = L.marker([st.latitude, st.longitude], { icon: stationIcon });
        stMarker.bindTooltip(`${st.name} (${st.nameEn})`, {
          direction: 'top',
          offset: [0, -5],
          className: 'glass-panel text-xs text-white px-2 py-1 rounded-md border-0',
        });
        stMarker.addTo(transitLayerRef.current!);
      });
    });
  }, [showTransit]);

  // Update City Bus Routes Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !busLayerRef.current) return;
    busLayerRef.current.clearLayers();
    if (!showBus) return;

    BANGKOK_TRANSIT_LINES.filter((l) => l.type === 'BUS').forEach((bus) => {
      const polyline = L.polyline(bus.coordinates, {
        color: bus.colorCode,
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 6',
      });

      polyline.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 190px;">
          <div style="font-weight: 800; font-size: 13px; color: ${bus.colorCode}; margin-bottom: 2px;">
            ${bus.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${bus.nameEn}</div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4;">
            ${bus.statusDetail || 'Regular city bus loop'}
          </div>
        </div>
      `);
      polyline.addTo(busLayerRef.current!);

      bus.stations.forEach((st) => {
        const busStopIcon = L.divIcon({
          html: `<div style="width: 8px; height: 8px; border-radius: 2px; background-color: ${bus.colorCode}; border: 1.5px solid #ffffff; box-shadow: 0 0 5px ${bus.colorCode};"></div>`,
          className: 'bus-pin',
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });
        const stMarker = L.marker([st.latitude, st.longitude], { icon: busStopIcon });
        stMarker.bindTooltip(`Bus Stop: ${st.name}`, {
          direction: 'top',
          offset: [0, -5],
          className: 'glass-panel text-xs text-white px-2 py-1 rounded-md border-0',
        });
        stMarker.addTo(busLayerRef.current!);
      });
    });
  }, [showBus]);

  // Update Chao Phraya & Canal Boat Routes
  useEffect(() => {
    if (!mapInstanceRef.current || !boatsLayerRef.current) return;
    boatsLayerRef.current.clearLayers();
    if (!showBoats) return;

    BANGKOK_BOAT_ROUTES.forEach((route) => {
      const polyline = L.polyline(route.coordinates, {
        color: route.colorCode,
        weight: 4,
        opacity: 0.9,
      });

      polyline.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 200px;">
          <div style="font-weight: bold; font-size: 13px; color: ${route.colorCode}; margin-bottom: 2px;">
            ${route.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${route.nameEn}</div>
          <div style="font-size: 11px; color: #38bdf8;">Schedule: ${route.schedule}</div>
        </div>
      `);
      polyline.addTo(boatsLayerRef.current!);

      route.piers.forEach((pier) => {
        const pierIcon = L.divIcon({
          html: `<div style="width: 10px; height: 10px; border-radius: 50%; background-color: #0284c7; border: 2px solid #ffffff; box-shadow: 0 0 6px #0284c7;"></div>`,
          className: 'pier-pin',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        const pMarker = L.marker([pier.lat, pier.lng], { icon: pierIcon });
        pMarker.bindTooltip(`Pier: ${pier.name} (${pier.nameEn})`, {
          direction: 'top',
          offset: [0, -5],
          className: 'glass-panel text-xs text-white px-2 py-1 rounded-md border-0',
        });
        pMarker.addTo(boatsLayerRef.current!);
      });
    });
  }, [showBoats]);

  // Update Street-Level CCTV Cameras
  useEffect(() => {
    if (!mapInstanceRef.current || !cctvLayerRef.current) return;
    cctvLayerRef.current.clearLayers();
    if (!showCCTV) return;

    BANGKOK_CCTV_CAMERAS.forEach((cam) => {
      const cctvIcon = L.divIcon({
        html: `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 8px;
            background: #0f172a;
            border: 1.5px solid #06b6d4;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(6, 182, 212, 0.4);
            cursor: pointer;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
          </div>
        `,
        className: 'cctv-pin',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([cam.lat, cam.lng], { icon: cctvIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: bold; font-size: 13px; color: #22d3ee;">CCTV CAMERA [${cam.agency}]</span>
            <span style="font-size: 10px; font-weight: bold; color: #22c55e;">ONLINE</span>
          </div>
          <div style="font-size: 11px; color: #e2e8f0; margin-bottom: 4px;">${cam.name}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">${cam.road}, ${cam.district} (${cam.direction})</div>
          <div style="border-radius: 8px; overflow: hidden; border: 1px solid #334155; margin-bottom: 6px;">
            <img src="${cam.sampleThumb}" alt="CCTV Feed" style="width: 100%; height: 110px; object-fit: cover; display: block;" />
          </div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">LAT: ${cam.lat.toFixed(4)} | LNG: ${cam.lng.toFixed(4)}</div>
        </div>
      `);
      marker.addTo(cctvLayerRef.current!);
    });
  }, [showCCTV]);

  // Update Security & Military Patrol Corridors
  useEffect(() => {
    if (!mapInstanceRef.current || !reconLayerRef.current) return;
    reconLayerRef.current.clearLayers();
    if (!showRecon) return;

    BANGKOK_RECON_UNITS.forEach((unit) => {
      const reconIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: #1e1b4b;
            border: 1.5px solid #818cf8;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(129, 140, 248, 0.4);
            cursor: pointer;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        `,
        className: 'recon-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([unit.lat, unit.lng], { icon: reconIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 210px;">
          <div style="font-weight: bold; font-size: 13px; color: #a5b4fc; margin-bottom: 2px;">
            ${unit.callsign}
          </div>
          <div style="font-size: 11px; color: #e2e8f0; margin-bottom: 4px;">${unit.unit}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">Zone: ${unit.zone}</div>
          <div style="font-size: 10px; color: #22c55e; font-weight: bold;">STATUS: ${unit.status}</div>
        </div>
      `);
      marker.addTo(reconLayerRef.current!);
    });
  }, [showRecon]);
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

        {/* Master Markers Visibility Toggle (Clean Map View) */}
        <button
          onClick={() => setShowIncidents((prev) => !prev)}
          title={showIncidents ? 'Clean Map: Hide All Incident Markers' : 'Show All Incident Markers'}
          className={`w-10 h-10 rounded-xl shadow-2xl flex items-center justify-center transition-all active:scale-90 hover:scale-105 cursor-pointer relative ${
            showIncidents
              ? 'bg-slate-900/95 text-cyan-400 border border-cyan-500/50 hover:bg-slate-800'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/60 hover:bg-rose-500/30'
          }`}
        >
          {showIncidents ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        {/* Layer Manager Drawer / Popover Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu((prev) => !prev)}
            title="Layer Control: Toggle CCTV, Bus, Trains, Boats & Military"
            className={`w-10 h-10 rounded-xl shadow-2xl flex items-center justify-center transition-all active:scale-90 hover:scale-105 cursor-pointer ${
              showLayerMenu
                ? 'bg-indigo-600 text-white border border-indigo-400 shadow-indigo-500/30'
                : 'bg-slate-900/95 text-slate-300 hover:text-white border border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Layer Selector Glassmorphism Panel */}
          {showLayerMenu && (
            <div className="absolute right-12 top-0 w-64 bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-[700] text-slate-200 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                    Map Recon Layers
                  </span>
                </div>
                <button
                  onClick={() => setShowLayerMenu(false)}
                  className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {/* Master Incident Markers Toggle */}
                <button
                  onClick={() => setShowIncidents((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showIncidents
                      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {showIncidents ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    <span>Incident Markers</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showIncidents ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showIncidents && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Street-Level CCTV Cameras */}
                <button
                  onClick={() => setShowCCTV((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showCCTV
                      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Street CCTV Feeds</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showCCTV ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showCCTV && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Rapid Rail Transit (BTS/MRT) */}
                <button
                  onClick={() => setShowTransit((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showTransit
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Train className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Train Lines (BTS/MRT)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showTransit ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showTransit && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* City Bus Routes (BMTA) */}
                <button
                  onClick={() => setShowBus((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showBus
                      ? 'bg-blue-950/40 text-blue-200 border border-blue-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bus className="w-3.5 h-3.5 text-blue-400" />
                    <span>City Bus Routes (BMTA)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showBus ? 'bg-blue-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showBus && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Chao Phraya & Canal Boats */}
                <button
                  onClick={() => setShowBoats((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showBoats
                      ? 'bg-sky-950/40 text-sky-200 border border-sky-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Ship className="w-3.5 h-3.5 text-sky-400" />
                    <span>Boat & Ferry Piers</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showBoats ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showBoats && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Military & Patrol Units */}
                <button
                  onClick={() => setShowRecon((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showRecon
                      ? 'bg-indigo-950/40 text-indigo-200 border border-indigo-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Security & Military Patrol</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showRecon ? 'bg-indigo-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showRecon && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>
              </div>

              {/* Master Bulk Action */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => {
                    setShowIncidents(true);
                    setShowTransit(true);
                    setShowBus(true);
                    setShowBoats(true);
                    setShowCCTV(true);
                    setShowRecon(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded hover:bg-slate-900"
                >
                  Enable All
                </button>
                <button
                  onClick={() => {
                    setShowIncidents(false);
                    setShowTransit(false);
                    setShowBus(false);
                    setShowBoats(false);
                    setShowCCTV(false);
                    setShowRecon(false);
                  }}
                  className="text-slate-400 hover:text-rose-400 font-medium px-2 py-1 rounded hover:bg-slate-900"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
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
