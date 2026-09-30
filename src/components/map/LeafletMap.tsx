'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident } from '@/types';
import { INCIDENT_CONFIG, SEVERITY_CONFIG } from '@/lib/utils';
import { FlightItem } from '@/app/api/flights/route';
import {
  BANGKOK_CCTV_CAMERAS,
  BANGKOK_RECON_UNITS,
  BANGKOK_WIFI_HOTSPOTS,
  BangkokCCTVCamera,
  BangkokWifiHotspot,
} from '@/lib/recon-data';
import {
  BANGKOK_CANAL_STATIONS,
  BANGKOK_PM25_STATIONS,
  BANGKOK_SHELTERS,
  BANGKOK_PUMP_TRUCKS,
  BANGKOK_RELIEF_DEPOTS,
  BANGKOK_HOSPITALS,
} from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';
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
  Shield,
  Wifi,
  Droplets,
  Wind,
  CloudRain,
  Building2,
  Truck,
  Package,
  Hospital,
  AlertTriangle,
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
  flights?: FlightItem[];
  showFlights?: boolean;
  onToggleFlights?: () => void;
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
  flights = [],
  showFlights = false,
  onToggleFlights,
}) => {
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const watchCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Map Tile Mode: Default to REAL HIGH-RESOLUTION SATELLITE (Like looking down from orbit)
  const [mapMode, setMapMode] = useState<MapTileMode>('SATELLITE');
  
  // Master Visibility & Individual Recon Layer Toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showCCTV, setShowCCTV] = useState(true);
  const [showRecon, setShowRecon] = useState(true);
  const [showWifi, setShowWifi] = useState(true);
  const [showCanals, setShowCanals] = useState(true);
  const [showAirQuality, setShowAirQuality] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showPumpTrucks, setShowPumpTrucks] = useState(true);
  const [showSandbagDepots, setShowSandbagDepots] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showTmdRadar, setShowTmdRadar] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Extra Layer Groups
  const cctvLayerRef = useRef<L.LayerGroup | null>(null);
  const reconLayerRef = useRef<L.LayerGroup | null>(null);
  const wifiLayerRef = useRef<L.LayerGroup | null>(null);
  const canalsLayerRef = useRef<L.LayerGroup | null>(null);
  const airQualityLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersLayerRef = useRef<L.LayerGroup | null>(null);
  const pumpTrucksLayerRef = useRef<L.LayerGroup | null>(null);
  const sandbagDepotsLayerRef = useRef<L.LayerGroup | null>(null);
  const hospitalsLayerRef = useRef<L.LayerGroup | null>(null);
  const tmdRadarLayerRef = useRef<L.LayerGroup | null>(null);
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
    cctvLayerRef.current = L.layerGroup().addTo(map);
    reconLayerRef.current = L.layerGroup().addTo(map);
    wifiLayerRef.current = L.layerGroup().addTo(map);
    canalsLayerRef.current = L.layerGroup().addTo(map);
    airQualityLayerRef.current = L.layerGroup().addTo(map);
    sheltersLayerRef.current = L.layerGroup().addTo(map);
    pumpTrucksLayerRef.current = L.layerGroup().addTo(map);
    sandbagDepotsLayerRef.current = L.layerGroup().addTo(map);
    hospitalsLayerRef.current = L.layerGroup().addTo(map);
    tmdRadarLayerRef.current = L.layerGroup().addTo(map);
    flightsLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);

    // Map click handler (supports clicking anywhere in Bangkok or other provinces)
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (!clickMarkerRef.current) {
        const pinIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 28px; height: 28px;">
              <div style="position: absolute; inset: 0; border-radius: 50%; background: #f59e0b; opacity: 0.45; animation: pulse 2s infinite;"></div>
              <div style="position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; border-radius: 50%; background: #0f172a; border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
          `,
          className: 'custom-click-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        clickMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      } else {
        clickMarkerRef.current.setLatLng([lat, lng]);
      }

      if (onMapClick) {
        onMapClick(lat, lng);
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
        if (heatmapLayerRef.current) heatmapLayerRef.current.clearLayers();
        if (flightsLayerRef.current) flightsLayerRef.current.clearLayers();
        if (canalsLayerRef.current) canalsLayerRef.current.clearLayers();
        if (airQualityLayerRef.current) airQualityLayerRef.current.clearLayers();
        if (sheltersLayerRef.current) sheltersLayerRef.current.clearLayers();
        if (pumpTrucksLayerRef.current) pumpTrucksLayerRef.current.clearLayers();
        if (sandbagDepotsLayerRef.current) sandbagDepotsLayerRef.current.clearLayers();
        if (hospitalsLayerRef.current) hospitalsLayerRef.current.clearLayers();
        if (tmdRadarLayerRef.current) tmdRadarLayerRef.current.clearLayers();
        if (clickMarkerRef.current) {
          clickMarkerRef.current.remove();
          clickMarkerRef.current = null;
        }
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

  // Update Bangkok Wi-Fi Hotspots & Cyber Telemetry
  // Green: Corporate / Service Provider Networks
  // Yellow: Coffee Shops / Shopping Malls
  // Red: Suspicious Unsecured / Rogue Evil Twin Networks
  useEffect(() => {
    if (!mapInstanceRef.current || !wifiLayerRef.current) return;
    wifiLayerRef.current.clearLayers();
    if (!showWifi) return;

    BANGKOK_WIFI_HOTSPOTS.forEach((spot) => {
      let iconColor = '#22c55e'; // Green for corporate / ISP
      let bgColor = 'rgba(20, 83, 45, 0.9)';
      let borderColor = '#22c55e';
      let shadowColor = 'rgba(34, 197, 94, 0.45)';
      let badgeLabel = 'VERIFIED ISP';

      if (spot.category === 'COMMERCIAL_MALL_CAFE') {
        iconColor = '#eab308'; // Yellow for coffee shop / mall
        bgColor = 'rgba(113, 63, 18, 0.9)';
        borderColor = '#eab308';
        shadowColor = 'rgba(234, 179, 8, 0.45)';
        badgeLabel = 'CAFE / MALL';
      } else if (spot.category === 'SUSPICIOUS_UNSECURED') {
        iconColor = '#ef4444'; // Red warning
        bgColor = 'rgba(127, 29, 29, 0.95)';
        borderColor = '#ef4444';
        shadowColor = 'rgba(239, 68, 68, 0.6)';
        badgeLabel = 'SUSPICIOUS';
      }

      const wifiIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: ${bgColor};
            border: 1.5px solid ${borderColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px ${shadowColor};
            cursor: pointer;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          </div>
        `,
        className: 'wifi-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: wifiIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${bgColor}; color: ${iconColor}; border: 1px solid ${borderColor};">
              ${badgeLabel}
            </span>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">${spot.signalStrength} dBm</span>
          </div>
          <div style="font-weight: bold; font-size: 13px; color: #ffffff; margin-bottom: 2px;">
            ${spot.ssid}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Provider: <strong style="color:#e2e8f0;">${spot.provider}</strong></div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">Location: ${spot.locationName}</div>
          <div style="font-size: 10px; color: #cbd5e1; margin-bottom: 4px;">Security: <span style="font-family: monospace; color:${iconColor};">${spot.securityType}</span></div>
          ${
            spot.warningMessage
              ? `<div style="margin-top: 6px; padding: 6px 8px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; font-size: 10px; line-height: 1.4;">
                  ${spot.warningMessage}
                </div>`
              : ''
          }
        </div>
      `);
      marker.addTo(wifiLayerRef.current!);
    });
  }, [showWifi]);

  // Update Airspace Live Flights & Airport Sectors (BKK / DMK)
  useEffect(() => {
    if (!mapInstanceRef.current || !flightsLayerRef.current) return;
    flightsLayerRef.current.clearLayers();

    if (!showFlights) return;

    // 1. Suvarnabhumi & Don Mueang Airport Hub Markers
    const airports = [
      { name: 'Suvarnabhumi Airport (BKK / VTBS)', code: 'BKK', lat: 13.6900, lng: 100.7501, color: '#3b82f6' },
      { name: 'Don Mueang Airport (DMK / VTBD)', code: 'DMK', lat: 13.9126, lng: 100.6067, color: '#f59e0b' },
    ];

    airports.forEach((apt) => {
      // Outer radar sector circle
      L.circle([apt.lat, apt.lng], {
        radius: 12000,
        color: apt.color,
        fillColor: apt.color,
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(flightsLayerRef.current!);

      const aptIcon = L.divIcon({
        html: `
          <div style="display: flex; align-items: center; gap: 4px; background: rgba(15, 23, 42, 0.92); border: 1.5px solid ${apt.color}; border-radius: 8px; padding: 2px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-family: monospace; font-size: 10px; font-weight: bold; color: #ffffff;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${apt.color}" stroke-width="2.5"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
            <span>${apt.code}</span>
          </div>
        `,
        className: 'airport-hub-marker',
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const aptMarker = L.marker([apt.lat, apt.lng], { icon: aptIcon });
      aptMarker.bindPopup(`
        <div style="padding: 8px; font-size: 12px; color: #f8fafc; min-width: 180px;">
          <strong style="color: ${apt.color}; font-size: 13px;">${apt.name}</strong>
          <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">Primary Bangkok Terminal Control Area</div>
          <div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 4px;">Lat: ${apt.lat} | Lng: ${apt.lng}</div>
        </div>
      `);
      aptMarker.addTo(flightsLayerRef.current!);
    });

    // 2. Active Flights Markers
    flights.forEach((flight) => {
      const isArrival = flight.direction === 'ARRIVAL';
      const isBkk = flight.airport === 'BKK';
      const flightColor = isBkk ? '#60a5fa' : '#fbbf24';

      const planeIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: rgba(15, 23, 42, 0.95);
              border: 1.5px solid ${flightColor};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              transform: rotate(${flight.heading || 0}deg);
              transition: transform 0.5s ease;
            ">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${flightColor}" stroke="${flightColor}" stroke-width="1.5">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
              </svg>
            </div>
            <div style="
              margin-top: 2px;
              padding: 1px 4px;
              border-radius: 4px;
              background: rgba(15, 23, 42, 0.88);
              border: 1px solid rgba(255,255,255,0.15);
              color: #f1f5f9;
              font-family: monospace;
              font-size: 9px;
              font-weight: 700;
              white-space: nowrap;
              pointer-events: none;
            ">
              ${flight.callsign}
            </div>
          </div>
        `,
        className: 'flight-air-pin',
        iconSize: [36, 44],
        iconAnchor: [18, 14],
      });

      const marker = L.marker([flight.latitude, flight.longitude], { icon: planeIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${flightColor}; font-size: 14px; font-family: monospace;">${flight.callsign}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">
              ${flight.airport} ${flight.direction}
            </span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Airline: <strong style="color: #ffffff;">${flight.airline}</strong></div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            ${flight.routeOrigin || flight.airport} ➔ ${flight.routeDestination || 'Destination'}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; background: rgba(15, 23, 42, 0.8); border-radius: 8px; border: 1px solid #334155; font-size: 10px; font-family: monospace;">
            <div><span style="color: #94a3b8;">ALT:</span> <strong style="color: #f8fafc;">${flight.altitudeFeet.toLocaleString()} ft</strong></div>
            <div><span style="color: #94a3b8;">SPD:</span> <strong style="color: #f8fafc;">${flight.speedKmh} km/h</strong></div>
            <div><span style="color: #94a3b8;">HDG:</span> <strong style="color: #f8fafc;">${flight.heading}°</strong></div>
            <div><span style="color: #94a3b8;">DIST:</span> <strong style="color: #f8fafc;">${flight.distanceToAirportKm} km</strong></div>
          </div>
          <div style="font-size: 9px; color: #64748b; font-family: monospace; margin-top: 6px;">
            ICAO24: ${flight.icao24} | STATUS: ${flight.status}
          </div>
        </div>
      `);
      marker.addTo(flightsLayerRef.current!);
    });
  }, [showFlights, flights]);

  // Update Bangkok Major Canal Water Level Stations (BMA Drainage Dept)
  useEffect(() => {
    if (!mapInstanceRef.current || !canalsLayerRef.current) return;
    canalsLayerRef.current.clearLayers();
    if (!showCanals) return;

    BANGKOK_CANAL_STATIONS.forEach((station) => {
      const isCritical = station.status === 'CRITICAL';
      const isWarning = station.status === 'WARNING';
      const statusColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#06b6d4';
      const statusBg = isCritical ? 'rgba(127, 29, 29, 0.95)' : isWarning ? 'rgba(113, 63, 18, 0.95)' : 'rgba(8, 51, 68, 0.95)';

      const canalIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: ${statusBg};
            border: 1.5px solid ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px ${statusColor}66;
            cursor: pointer;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
        `,
        className: 'canal-water-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([station.lat, station.lng], { icon: canalIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${statusColor}; font-size: 13px;">${station.name}</strong>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}66;">
              ${station.statusTh}
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            สายคลอง: <strong style="color: #e2e8f0;">${station.canalName}</strong> (${station.district})
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; background: rgba(15, 23, 42, 0.85); border-radius: 8px; border: 1px solid #334155; font-size: 10px; font-family: monospace;">
            <div><span style="color: #94a3b8;">ระดับน้ำ:</span> <strong style="color: ${statusColor};">+${station.waterLevelMsl.toFixed(2)} ม.รทก.</strong></div>
            <div><span style="color: #94a3b8;">ระดับคันกั้น:</span> <strong style="color: #f8fafc;">+${station.bankLevelMsl.toFixed(2)} ม.รทก.</strong></div>
            <div><span style="color: #94a3b8;">แนวโน้ม:</span> <strong style="color: #f8fafc;">${station.trendTh}</strong></div>
            <div><span style="color: #94a3b8;">อัตราไหล:</span> <strong style="color: #f8fafc;">${station.flowRateCubicM} m3/s</strong></div>
          </div>
          <div style="font-size: 9px; color: #64748b; font-family: monospace; margin-top: 6px;">
            แหล่งข้อมูล: สำนักการระบายน้ำ กทม. (${station.lastUpdated})
          </div>
        </div>
      `);
      marker.addTo(canalsLayerRef.current!);
    });
  }, [showCanals]);

  // Update Bangkok PM2.5 Air Quality Sensors (PCD / BMA Network)
  useEffect(() => {
    if (!mapInstanceRef.current || !airQualityLayerRef.current) return;
    airQualityLayerRef.current.clearLayers();
    if (!showAirQuality) return;

    BANGKOK_PM25_STATIONS.forEach((station) => {
      const pmPinIcon = L.divIcon({
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 2px;
            background: rgba(15, 23, 42, 0.95);
            border: 1.5px solid ${station.colorHex};
            border-radius: 8px;
            padding: 2px 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            cursor: pointer;
            font-family: monospace;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${station.colorHex};"></span>
            <span style="font-size: 10px; font-weight: 800; color: #ffffff;">${station.pm25.toFixed(0)}</span>
          </div>
        `,
        className: 'pm25-sensor-pin',
        iconSize: [40, 22],
        iconAnchor: [20, 11],
      });

      const marker = L.marker([station.lat, station.lng], { icon: pmPinIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${station.colorHex}; font-size: 13px;">${station.stationName}</strong>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${station.colorHex}22; color: ${station.colorHex}; border: 1px solid ${station.colorHex}66;">
              ${station.statusTh}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 11px;">
            <span>PM2.5: <strong style="color:${station.colorHex}; font-size:13px;">${station.pm25} µg/m³</strong></span>
            <span style="color:#64748b;">|</span>
            <span>AQI: <strong style="color:#ffffff;">${station.aqi}</strong></span>
          </div>
          <div style="padding: 6px 8px; background: rgba(15, 23, 42, 0.85); border-radius: 8px; border: 1px solid #334155; font-size: 10px; color: #cbd5e1; margin-bottom: 6px; line-height: 1.4;">
            คำแนะนำ: ${station.healthAdviceTh}
          </div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">
            อุณหภูมิ: ${station.temperatureC}°C | ความชื้น: ${station.humidityPct}% (${station.lastUpdated})
          </div>
        </div>
      `);
      marker.addTo(airQualityLayerRef.current!);
    });
  }, [showAirQuality]);

  // Update Bangkok Flood Shelters & High-Ground Parking Points
  useEffect(() => {
    if (!mapInstanceRef.current || !sheltersLayerRef.current) return;
    sheltersLayerRef.current.clearLayers();
    if (!showShelters) return;

    BANGKOK_SHELTERS.forEach((shelter) => {
      const isParking = shelter.type === 'PARKING_HIGH_GROUND';
      const color = isParking ? '#818cf8' : '#34d399';
      const bg = isParking ? 'rgba(30, 27, 75, 0.95)' : 'rgba(6, 78, 59, 0.95)';

      const shelterIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: ${bg};
            border: 1.5px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px ${color}66;
            cursor: pointer;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
            </svg>
          </div>
        `,
        className: 'shelter-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${color}; font-size: 13px;">${shelter.name}</strong>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${color}22; color: ${color}; border: 1px solid ${color}66;">
              ${isParking ? 'ที่จอดรถที่สูง' : 'ศูนย์พักพิงน้ำท่วม'}
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">เขต: ${shelter.district}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; background: rgba(15, 23, 42, 0.85); border-radius: 8px; border: 1px solid #334155; font-size: 10px; font-family: monospace;">
            <div><span style="color: #94a3b8;">ความจุคน:</span> <strong style="color: #f8fafc;">${shelter.capacityPeople.toLocaleString()} คน</strong></div>
            <div><span style="color: #94a3b8;">ที่จอดรถ:</span> <strong style="color: #f8fafc;">${shelter.parkingSpots} คัน</strong></div>
            <div><span style="color: #94a3b8;">ระดับพื้น:</span> <strong style="color: #f8fafc;">+${shelter.elevationMsl} ม.รทก.</strong></div>
            <div><span style="color: #94a3b8;">ติดต่อ:</span> <strong style="color: #38bdf8;">${shelter.contactTel}</strong></div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #cbd5e1;">
            สิ่งอำนวยความสะดวก: ${shelter.amenities.join(', ')}
          </div>
        </div>
      `);
      marker.addTo(sheltersLayerRef.current!);
    });
  }, [showShelters]);

  // Update TMD Weather Doppler Radar Rain Echo Sweep Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tmdRadarLayerRef.current) return;
    tmdRadarLayerRef.current.clearLayers();
    if (!showTmdRadar) return;

    // 1. Doppler Radar Station Centers (Nong Chok & Phasi Charoen)
    const radarStations = [
      { name: 'TMD Nong Chok Doppler Radar', lat: 13.8552, lng: 100.8654, radiusM: 45000 },
      { name: 'TMD Phasi Charoen Doppler Radar', lat: 13.7142, lng: 100.4351, radiusM: 38000 },
    ];

    radarStations.forEach((st) => {
      // Outer radar sweep ring
      L.circle([st.lat, st.lng], {
        radius: st.radiusM,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        fillOpacity: 0.04,
        weight: 1.5,
        dashArray: '5, 8',
      }).addTo(tmdRadarLayerRef.current!);

      // Mid ring
      L.circle([st.lat, st.lng], {
        radius: st.radiusM * 0.5,
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.03,
        weight: 1,
        dashArray: '3, 6',
      }).addTo(tmdRadarLayerRef.current!);
    });

    // 2. Simulated Active Precipitation Rain Echo Clusters over Bangkok Basin
    const rainClusters = [
      { lat: 13.7850, lng: 100.5820, radius: 6500, color: '#22c55e', intensity: 'Moderate Rain (10-25 mm/h)' },
      { lat: 13.8200, lng: 100.6200, radius: 4800, color: '#eab308', intensity: 'Heavy Rain Echo (25-45 mm/h)' },
      { lat: 13.6800, lng: 100.5200, radius: 5200, color: '#38bdf8', intensity: 'Light Rain (5-10 mm/h)' },
      { lat: 13.7400, lng: 100.7200, radius: 4000, color: '#ef4444', intensity: 'Very Heavy Cloudburst (> 45 mm/h)' },
    ];

    rainClusters.forEach((cl) => {
      const echo = L.circle([cl.lat, cl.lng], {
        radius: cl.radius,
        color: cl.color,
        fillColor: cl.color,
        fillOpacity: 0.28,
        weight: 1,
      });
      echo.bindPopup(`
        <div style="padding: 8px; font-size: 11px; color: #f8fafc;">
          <strong style="color: ${cl.color}; font-size: 12px;">กลุ่มฝนเรดาร์ตรวจวัด (Doppler Rain Echo)</strong>
          <div style="color: #cbd5e1; margin-top: 4px;">ความเข้ม: ${cl.intensity}</div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">อ้างอิง: เรดาร์ตรวจอากาศ กทม. หนองจอก/ภาษีเจริญ</div>
        </div>
      `);
      echo.addTo(tmdRadarLayerRef.current!);
    });
  }, [showTmdRadar]);

  // Update BMA Mobile Flood Pump Trucks Layer (หน่วยสูบน้ำเคลื่อนที่เร็ว BEST)
  useEffect(() => {
    if (!mapInstanceRef.current || !pumpTrucksLayerRef.current) return;
    pumpTrucksLayerRef.current.clearLayers();
    if (!showPumpTrucks) return;

    BANGKOK_PUMP_TRUCKS.forEach((truck) => {
      const isPumping = truck.status === 'PUMPING';
      const statusColor = isPumping ? '#38bdf8' : truck.status === 'STANDBY' ? '#f59e0b' : '#a855f7';
      const statusBg = isPumping ? 'rgba(3, 105, 161, 0.95)' : 'rgba(180, 83, 9, 0.95)';

      const truckIcon = L.divIcon({
        html: `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: ${statusBg};
            border: 1.5px solid ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px ${statusColor}77;
            cursor: pointer;
          ">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-4v10"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
        `,
        className: 'pump-truck-pin',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([truck.lat, truck.lng], { icon: truckIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${statusColor}; font-size: 13px;">${truck.unitCode} (${truck.district})</strong>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}66;">
              ${truck.statusTh}
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            จุดปฏิบัติการ: <strong style="color: #e2e8f0;">${truck.locationName}</strong>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; background: rgba(15, 23, 42, 0.85); border-radius: 8px; border: 1px solid #334155; font-size: 10px; font-family: monospace;">
            <div><span style="color: #94a3b8;">กำลังสูบ:</span> <strong style="color: #38bdf8;">${truck.pumpCapacityLps} ลิตร/วินาที</strong></div>
            <div><span style="color: #94a3b8;">ระบายลง:</span> <strong style="color: #f8fafc;">${truck.dischargingTo}</strong></div>
            <div style="grid-column: span 2;"><span style="color: #94a3b8;">หน่วยงาน:</span> <strong style="color: #e2e8f0;">${truck.officerInCharge}</strong></div>
          </div>
          <div style="margin-top: 6px; font-size: 11px;">
            เบอร์โทรฉุกเฉินประจำรถ: <a href="tel:${truck.contactTel}" style="color: #38bdf8; font-weight: bold;">${truck.contactTel}</a>
          </div>
        </div>
      `);
      marker.addTo(pumpTrucksLayerRef.current!);
    });
  }, [showPumpTrucks]);

  // Update Bangkok Sandbag Distribution Depots Layer (คลังกระสอบทรายสำนักงานเขต)
  useEffect(() => {
    if (!mapInstanceRef.current || !sandbagDepotsLayerRef.current) return;
    sandbagDepotsLayerRef.current.clearLayers();
    if (!showSandbagDepots) return;

    BANGKOK_RELIEF_DEPOTS.forEach((depot) => {
      const isCritical = depot.sandbagStock < 2000;
      const statusColor = isCritical ? '#ef4444' : depot.sandbagStock < 3500 ? '#f59e0b' : '#10b981';

      const depotIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(15, 23, 42, 0.95);
            border: 1.5px solid ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px ${statusColor}55;
            cursor: pointer;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2z"/>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
        `,
        className: 'sandbag-depot-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([depot.lat, depot.lng], { icon: depotIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${statusColor}; font-size: 13px;">${depot.officeName}</strong>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}66;">
              ${depot.sandbagStatusTh}
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            เขตพื้นที่: <strong style="color: #cbd5e1;">เขต${depot.district}</strong>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; background: rgba(15, 23, 42, 0.85); border-radius: 8px; border: 1px solid #334155; font-size: 10px; font-family: monospace;">
            <div><span style="color: #94a3b8;">คงเหลือ:</span> <strong style="color: ${statusColor};">${depot.sandbagStock.toLocaleString()} ใบ</strong></div>
            <div><span style="color: #94a3b8;">สถานะ:</span> <strong style="color: #f8fafc;">${depot.sandbagStatus}</strong></div>
            <div style="grid-column: span 2;"><span style="color: #94a3b8;">บริการ:</span> <strong style="color: #e2e8f0;">${depot.services.join(', ')}</strong></div>
          </div>
          <div style="margin-top: 6px; font-size: 11px;">
            โทรประสานงาน: <a href="tel:${depot.contactTel}" style="color: #38bdf8; font-weight: bold;">${depot.contactTel}</a>
          </div>
        </div>
      `);
      marker.addTo(sandbagDepotsLayerRef.current!);
    });
  }, [showSandbagDepots]);

  // Update Bangkok Trauma Hospitals & Flood Readiness Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !hospitalsLayerRef.current) return;
    hospitalsLayerRef.current.clearLayers();
    if (!showHospitals) return;

    BANGKOK_HOSPITALS.forEach((hosp) => {
      const isAvailable = hosp.erBedStatus === 'AVAILABLE';
      const statusColor = isAvailable ? '#10b981' : '#f59e0b';
      const bg = 'rgba(15, 23, 42, 0.95)';

      const hospIcon = L.divIcon({
        html: `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: ${bg};
            border: 2px solid ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px ${statusColor}66;
            cursor: pointer;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12M6 12h12"/>
            </svg>
          </div>
        `,
        className: 'hospital-telemetry-pin',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon });
      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 250px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #ffffff; font-size: 13px;">${hosp.name}</strong>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}66;">
              ${hosp.erBedStatusTh}
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            เขตพื้นที่: <strong style="color: #cbd5e1;">${hosp.district}</strong> (${hosp.traumaLevel === 'LEVEL_1' ? 'ศูนย์อุบัติเหตุระดับ 1' : 'ศูนย์อุบัติเหตุระดับ 2'})
          </div>
          <div style="padding: 4px 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; font-size: 10px; color: #6ee7b7; margin-bottom: 6px;">
            เส้นทาง: ${hosp.accessStatusTh}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; background: rgba(15, 23, 42, 0.85); border-radius: 8px; border: 1px solid #334155; font-size: 10px; font-family: monospace;">
            <div><span style="color: #94a3b8;">คันกั้นน้ำ:</span> <strong style="color: #38bdf8;">+${hosp.floodBarrierMsl.toFixed(1)} ม.รทก.</strong></div>
            <div><span style="color: #94a3b8;">ไฟสำรอง:</span> <strong style="color: #10b981;">${hosp.generatorBackupHours} ชม.</strong></div>
            <div><span style="color: #94a3b8;">ออกซิเจน:</span> <strong style="color: #f8fafc;">${hosp.oxygenSupplyDays} วัน</strong></div>
            <div><span style="color: #94a3b8;">ลานจอด ฮ.:</span> <strong style="color: ${hosp.helipadReady ? '#38bdf8' : '#64748b'};">${hosp.helipadReady ? 'พร้อม' : 'ไม่มี'}</strong></div>
          </div>
          <div style="margin-top: 6px; font-size: 11px;">
            สายด่วนฉุกเฉิน: <a href="tel:${hosp.emergencyTel}" style="color: #38bdf8; font-weight: bold;">${hosp.emergencyTel}</a>
          </div>
        </div>
      `);
      marker.addTo(hospitalsLayerRef.current!);
    });
  }, [showHospitals]);

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
  const handleCenterThailand = () =>
    mapInstanceRef.current?.flyTo([13.7367, 100.5231], 6, { duration: 1.2 });

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

      {/* Floating Map Controls on Right Side (Adjusted with mobile padding so bottom nav doesn't clip) */}
      <div className="absolute bottom-20 sm:bottom-24 lg:bottom-28 right-3 sm:right-4 z-[600] pointer-events-auto flex flex-col gap-2 items-center">
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

          {/* Layer Selector Glassmorphism Panel (Optimized for small screens) */}
          {showLayerMenu && (
            <div className="absolute right-12 bottom-0 w-64 max-w-[calc(100vw-80px)] bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-[700] text-slate-200 animate-in fade-in slide-in-from-right-2 duration-150 max-h-[70vh] overflow-y-auto">
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

                {/* Live Airspace Flight Radar Toggle */}
                <button
                  onClick={() => onToggleFlights && onToggleFlights()}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showFlights
                      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Airspace Flights</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showFlights ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showFlights && <Check className="w-3 h-3 stroke-[3]" />}
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

                {/* Free Wi-Fi Hotspots & Cyber Telemetry */}
                <button
                  onClick={() => setShowWifi((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showWifi
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="flex items-center gap-1.5">
                      <span>Free Wi-Fi Hotspots</span>
                      <span className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Corporate/ISP: Green"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Café/Mall: Yellow"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Suspicious: Red"></span>
                      </span>
                    </span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showWifi ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showWifi && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Canal Water Level Gauges */}
                <button
                  onClick={() => setShowCanals((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showCanals
                      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Canal Water Level (คลอง กทม.)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showCanals ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showCanals && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* PM2.5 Air Quality Sensors */}
                <button
                  onClick={() => setShowAirQuality((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showAirQuality
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Air Quality (PM2.5 ประจำเขต)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showAirQuality ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showAirQuality && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Flood Evacuation Shelters & High-Ground Parking */}
                <button
                  onClick={() => setShowShelters((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showShelters
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Flood Shelters & Parking (จุดพักพิง/ที่จอดรถ)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showShelters ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showShelters && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* TMD Doppler Weather Rain Radar Echo */}
                <button
                  onClick={() => {
                    setShowTmdRadar((prev) => !prev);
                    tacticalAudio.playRadarSonarPing();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showTmdRadar
                      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TMD Rain Radar (เรดาร์ฝน กทม.)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showTmdRadar ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showTmdRadar && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* BMA Mobile Pump Trucks */}
                <button
                  onClick={() => setShowPumpTrucks((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showPumpTrucks
                      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pump Trucks (หน่วยสูบน้ำ กทม.)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showPumpTrucks ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showPumpTrucks && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Sandbag Relief Depots */}
                <button
                  onClick={() => setShowSandbagDepots((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showSandbagDepots
                      ? 'bg-amber-950/40 text-amber-200 border border-amber-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sandbag Depots (คลังกระสอบทราย)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showSandbagDepots ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showSandbagDepots && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>

                {/* Trauma Hospitals & Emergency Readiness */}
                <button
                  onClick={() => setShowHospitals((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    showHospitals
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hospital className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Trauma Hospitals (รพ. ฉุกเฉิน)</span>
                  </span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showHospitals ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {showHospitals && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>
              </div>

              {/* Master Bulk Action */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => {
                    setShowIncidents(true);
                    setShowCCTV(true);
                    setShowRecon(true);
                    setShowWifi(true);
                    setShowCanals(true);
                    setShowAirQuality(true);
                    setShowShelters(true);
                    setShowPumpTrucks(true);
                    setShowSandbagDepots(true);
                    setShowHospitals(true);
                    setShowTmdRadar(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded hover:bg-slate-900 cursor-pointer"
                >
                  Enable All
                </button>
                <button
                  onClick={() => {
                    setShowIncidents(false);
                    setShowCCTV(false);
                    setShowRecon(false);
                    setShowWifi(false);
                    setShowCanals(false);
                    setShowAirQuality(false);
                    setShowShelters(false);
                    setShowPumpTrucks(false);
                    setShowSandbagDepots(false);
                    setShowHospitals(false);
                    setShowTmdRadar(false);
                  }}
                  className="text-slate-400 hover:text-rose-400 font-medium px-2 py-1 rounded hover:bg-slate-900 cursor-pointer"
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
          title="Reset to Bangkok Center (เน้นกรุงเทพฯ)"
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Crosshair className="w-5 h-5 text-cyan-400" />
        </button>

        <button
          onClick={handleCenterThailand}
          title="ภาพรวมทุกจังหวัดทั่วไทย (View All Thailand)"
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Globe className="w-5 h-5 text-indigo-400" />
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

        {/* Flight Radar & Airport Operations Shortcut Button */}
        <button
          onClick={onToggleFlights}
          title={showFlights ? "ซ่อนเรดาร์การบิน (Hide Flight Radar)" : "เปิดเรดาร์การบินสด (Show Airspace Flight Radar)"}
          className={`w-10 h-10 rounded-xl shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer select-none group relative ${
            showFlights
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/50 ring-2 ring-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40'
          }`}
        >
          <Plane className={`w-5 h-5 transition-transform ${showFlights ? 'rotate-45' : 'group-hover:scale-110'}`} />
          {flights && flights.length > 0 && (
            <span className={`absolute -top-1 -right-1 text-[9px] font-mono px-1 rounded-full ${
              showFlights ? 'bg-slate-950 text-cyan-400 font-bold' : 'bg-cyan-500 text-slate-950 font-extrabold'
            }`}>
              {flights.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
