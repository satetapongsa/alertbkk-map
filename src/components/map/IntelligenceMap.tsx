'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CameraSource,
  Incident,
  POI,
  TrafficSegment,
  FloodZone,
  MeasurementToolState,
  UserLocationData,
  LocationStatus,
} from '@/types/intelligence';
import { TacticalUserLocationMarker } from '@/components/location/UserLocationMarker';
import { generateAccuracyCircleGeoJSON, generateCircleGeoJSON } from '@/lib/accuracyCircle';
import { formatTacticalCoordinates, calculateDistanceKm, calculateDistanceMeters } from '@/lib/spatial';
import { tacticalAudio } from '@/lib/tacticalAudio';
import {
  Plus,
  Minus,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Shield,
  Activity,
  Flame,
  Plane,
  Radar,
  Copy,
  Check,
  Search,
  PenTool,
  X,
} from 'lucide-react';

interface IntelligenceMapProps {
  cameras: CameraSource[];
  incidents: Incident[];
  pois: POI[];
  trafficSegments: TrafficSegment[];
  floodZones: FloodZone[];
  selectedCamera: CameraSource | null;
  selectedIncident: Incident | null;
  onSelectCamera: (cam: CameraSource) => void;
  onSelectIncident: (inc: Incident) => void;
  showCameras: boolean;
  showIncidents: boolean;
  showHospitals: boolean;
  showPolice: boolean;
  showFireStations: boolean;
  showTraffic: boolean;
  showFloods: boolean;
  showHeatmap?: boolean;
  showCameraCoverage?: boolean;
  scanAreaState?: { center: [number, number]; radiusMeters: number } | null;
  measurementState: MeasurementToolState;
  onUpdateMeasurement: (state: MeasurementToolState) => void;
  userLocation: UserLocationData | null;
  locationStatus: LocationStatus;
  onTriggerScanArea?: (coords: [number, number], radiusMeters?: number) => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

// Configurable Tactical Map Styles
const SATELLITE_TILE_URL =
  process.env.NEXT_PUBLIC_SATELLITE_TILES_URL ||
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const MAP_VECTOR_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const MAP_STYLES = {
  SAT: {
    version: 8 as const,
    sources: {
      'esri-satellite': {
        type: 'raster' as const,
        tiles: [SATELLITE_TILE_URL],
        tileSize: 256,
        attribution: 'Esri World Imagery &bull; MIRRIX Geospatial Engine',
      },
    },
    layers: [
      {
        id: 'satellite-basemap',
        type: 'raster' as const,
        source: 'esri-satellite',
        paint: {
          'raster-contrast': 0.15,
          'raster-brightness-min': 0.05,
          'raster-brightness-max': 0.88,
          'raster-saturation': -0.15,
        },
      },
    ],
  },
  MAP: MAP_VECTOR_STYLE,
};

export const IntelligenceMap: React.FC<IntelligenceMapProps> = ({
  cameras,
  incidents,
  pois,
  trafficSegments,
  floodZones,
  selectedCamera,
  selectedIncident,
  onSelectCamera,
  onSelectIncident,
  showCameras,
  showIncidents,
  showHospitals,
  showPolice,
  showFireStations,
  showTraffic,
  showFloods,
  showHeatmap = false,
  showCameraCoverage = false,
  scanAreaState,
  measurementState,
  onUpdateMeasurement,
  userLocation,
  locationStatus,
  onTriggerScanArea,
  onMapReady,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Orthogonal Camera and Basemap modes: DEFAULT IS 2D + SAT (TRUE TOP-DOWN SATELLITE VIEW)
  const [activeBaseMode, setActiveBaseMode] = useState<'SAT' | 'MAP'>('SAT');
  const [activeDimensionMode, setActiveDimensionMode] = useState<'3D' | '2D'>('2D');

  // Mouse telemetry readouts
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({
    lat: 13.7420,
    lng: 100.5450,
  });
  const [zoomLevel, setZoomLevel] = useState<number>(12.7);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lng: number;
    lat: number;
  } | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Markers reference dictionary to manage DOM markers without memory leaks
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const userMarkerRef = useRef<TacticalUserLocationMarker | null>(null);

  // Initialize MapLibre: DEFAULT MUST BE TRUE TOP-DOWN SATELLITE VIEW (pitch: 0, bearing: 0)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.SAT,
      center: [100.5450, 13.7420], // Central Bangkok (Ratchaprasong / Sukhumvit / Asok)
      zoom: 12.7,
      pitch: 0, // TRUE 2D: pitch 0
      bearing: 0, // TRUE 2D: bearing 0 (North up)
      attributionControl: false,
    });

    initialMap.on('mousemove', (e: maplibregl.MapMouseEvent) => {
      setCursorCoords({
        lat: Number(e.lngLat.lat.toFixed(6)),
        lng: Number(e.lngLat.lng.toFixed(6)),
      });
    });

    initialMap.on('zoom', () => {
      setZoomLevel(Number(initialMap.getZoom().toFixed(1)));
    });

    // Right-Click Context Menu
    initialMap.on('contextmenu', (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      tacticalAudio.playRadarBlip();
      setContextMenu({
        x: e.point.x,
        y: e.point.y,
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
      });
      setCopiedCoords(false);
    });

    initialMap.on('click', (e: maplibregl.MapMouseEvent) => {
      setContextMenu(null);

      // Measurement tool click logic
      if (measurementState.activeTool === 'DISTANCE') {
        const nextPts = [...measurementState.points, [e.lngLat.lng, e.lngLat.lat] as [number, number]];
        let distKm = 0;
        if (nextPts.length >= 2) {
          for (let i = 0; i < nextPts.length - 1; i++) {
            distKm += calculateDistanceKm(
              nextPts[i][1],
              nextPts[i][0],
              nextPts[i + 1][1],
              nextPts[i + 1][0]
            );
          }
        }
        tacticalAudio.playClick();
        onUpdateMeasurement({
          ...measurementState,
          points: nextPts,
          calculatedDistanceKm: Number(distKm.toFixed(2)),
        });
      }
    });

    initialMap.on('load', () => {
      if (onMapReady) onMapReady(initialMap);
    });

    mapRef.current = initialMap;

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      initialMap.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap & Dimensions (3D / 2D / MAP / SAT)
  const setMapMode = useCallback(
    (mode: '3D' | '2D' | 'MAP' | 'SAT') => {
      tacticalAudio.playClick();
      const map = mapRef.current;
      if (!map) return;

      if (mode === '2D') {
        setActiveDimensionMode('2D');
        // TRUE TOP-DOWN OVERHEAD VIEW: pitch = 0, bearing = 0
        map.setPitch(0);
        map.setBearing(0);
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      } else if (mode === '3D') {
        setActiveDimensionMode('3D');
        // Perspective/tilted map: pitch = 50
        map.setPitch(50);
        map.easeTo({ pitch: 50, duration: 600 });
      } else if (mode === 'SAT') {
        setActiveBaseMode('SAT');
        const currentPitch = activeDimensionMode === '2D' ? 0 : 50;
        const currentBearing = activeDimensionMode === '2D' ? 0 : map.getBearing();
        map.setStyle(MAP_STYLES.SAT);
        map.once('style.load', () => {
          map.setPitch(currentPitch);
          map.setBearing(currentBearing);
        });
      } else if (mode === 'MAP') {
        setActiveBaseMode('MAP');
        const currentPitch = activeDimensionMode === '2D' ? 0 : 50;
        const currentBearing = activeDimensionMode === '2D' ? 0 : map.getBearing();
        map.setStyle(MAP_STYLES.MAP);
        map.once('style.load', () => {
          map.setPitch(currentPitch);
          map.setBearing(currentBearing);
        });
      }
    },
    [activeDimensionMode]
  );

  // Client-side 500m nearby public intelligence lookup on user location fix
  const nearbyIntel = React.useMemo(() => {
    if (!userLocation) return null;
    const r = 500;
    const cams = cameras.filter(
      (c) => calculateDistanceMeters(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude) <= r
    ).length;
    const incs = incidents.filter(
      (i) => calculateDistanceMeters(userLocation.latitude, userLocation.longitude, i.latitude, i.longitude) <= r
    ).length;
    const hosps = pois.filter(
      (p) => p.type === 'HOSPITAL' && calculateDistanceMeters(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude) <= r
    ).length;
    const pols = pois.filter(
      (p) => p.type === 'POLICE' && calculateDistanceMeters(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude) <= r
    ).length;
    const fir = pois.filter(
      (p) => p.type === 'FIRE_STATION' && calculateDistanceMeters(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude) <= r
    ).length;
    return { cameras: cams, incidents: incs, hospitals: hosps, police: pols, fire: fir };
  }, [userLocation, cameras, incidents, pois]);

  // User Location Marker & Accuracy Circle Lifecycle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (map.getSource('user-accuracy-circle')) {
        const src = map.getSource('user-accuracy-circle') as maplibregl.GeoJSONSource;
        src.setData({ type: 'FeatureCollection', features: [] });
      }
      return;
    }

    // Single Tactical User Marker ("YOU ARE HERE")
    if (!userMarkerRef.current) {
      userMarkerRef.current = new TacticalUserLocationMarker(() => {
        tacticalAudio.playRadarBlip();
        map.flyTo({
          center: [userLocation.longitude, userLocation.latitude],
          zoom: 16.5,
          pitch: activeDimensionMode === '2D' ? 0 : 50,
          duration: 800,
        });
      });
      userMarkerRef.current.addToMap(map, userLocation);
    } else {
      userMarkerRef.current.updateData(userLocation);
    }

    // Render Accuracy Circle matching userLocation.accuracy in meters
    const setupAccuracyCircle = () => {
      const geojson = generateAccuracyCircleGeoJSON(
        userLocation.longitude,
        userLocation.latitude,
        userLocation.accuracy
      );

      if (!map.getSource('user-accuracy-circle')) {
        map.addSource('user-accuracy-circle', {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: 'user-accuracy-circle-fill',
          type: 'fill',
          source: 'user-accuracy-circle',
          paint: {
            'fill-color': '#00f0ff',
            'fill-opacity': 0.12,
          },
        });

        map.addLayer({
          id: 'user-accuracy-circle-stroke',
          type: 'line',
          source: 'user-accuracy-circle',
          paint: {
            'line-color': '#00f0ff',
            'line-width': 1.5,
            'line-opacity': 0.75,
            'line-dasharray': [3, 2],
          },
        });
      } else {
        const src = map.getSource('user-accuracy-circle') as maplibregl.GeoJSONSource;
        src.setData(geojson);
      }
    };

    if (map.isStyleLoaded()) {
      setupAccuracyCircle();
    } else {
      map.once('styledata', setupAccuracyCircle);
    }
  }, [userLocation, activeBaseMode, activeDimensionMode]);

  // Tactical Area Scan Circle Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupScanLayer = () => {
      const scanData = scanAreaState
        ? generateCircleGeoJSON(scanAreaState.center[0], scanAreaState.center[1], scanAreaState.radiusMeters)
        : ({ type: 'FeatureCollection' as const, features: [] } as GeoJSON.FeatureCollection);

      if (!map.getSource('tactical-scan-circle')) {
        map.addSource('tactical-scan-circle', {
          type: 'geojson',
          data: scanData,
        });

        map.addLayer({
          id: 'tactical-scan-fill',
          type: 'fill',
          source: 'tactical-scan-circle',
          paint: {
            'fill-color': '#00f0ff',
            'fill-opacity': 0.10,
          },
        });

        map.addLayer({
          id: 'tactical-scan-stroke',
          type: 'line',
          source: 'tactical-scan-circle',
          paint: {
            'line-color': '#00f0ff',
            'line-width': 2,
            'line-opacity': 0.85,
            'line-dasharray': [4, 2],
          },
        });
      } else {
        const src = map.getSource('tactical-scan-circle') as maplibregl.GeoJSONSource;
        src.setData(scanData as GeoJSON.FeatureCollection);
      }
    };

    if (map.isStyleLoaded()) {
      setupScanLayer();
    } else {
      map.once('styledata', setupScanLayer);
    }
  }, [scanAreaState, activeBaseMode]);

  // Public Camera Coverage Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupCoverageLayer = () => {
      const coverageFeatures = cameras.map((c) =>
        generateCircleGeoJSON(c.longitude, c.latitude, 600, { name: c.name })
      );

      const coverageData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: showCameraCoverage ? coverageFeatures : [],
      };

      if (!map.getSource('camera-coverage-source')) {
        map.addSource('camera-coverage-source', {
          type: 'geojson',
          data: coverageData,
        });

        map.addLayer({
          id: 'camera-coverage-fill',
          type: 'fill',
          source: 'camera-coverage-source',
          paint: {
            'fill-color': '#00ff66',
            'fill-opacity': 0.08,
          },
        });

        map.addLayer({
          id: 'camera-coverage-stroke',
          type: 'line',
          source: 'camera-coverage-source',
          paint: {
            'line-color': '#00ff66',
            'line-width': 1,
            'line-opacity': 0.35,
          },
        });
      } else {
        const src = map.getSource('camera-coverage-source') as maplibregl.GeoJSONSource;
        src.setData(coverageData);
      }
    };

    if (map.isStyleLoaded()) {
      setupCoverageLayer();
    } else {
      map.once('styledata', setupCoverageLayer);
    }
  }, [cameras, showCameraCoverage, activeBaseMode]);

  // Incident Heatmap Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupHeatmapLayer = () => {
      const heatFeatures: GeoJSON.Feature<GeoJSON.Point>[] = incidents.map((inc) => ({
        type: 'Feature',
        properties: {
          severity_weight:
            inc.severity === 'CRITICAL' ? 4 : inc.severity === 'HIGH' ? 3 : inc.severity === 'MEDIUM' ? 2 : 1,
        },
        geometry: {
          type: 'Point',
          coordinates: [inc.longitude, inc.latitude],
        },
      }));

      const heatData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: heatFeatures,
      };

      if (!map.getSource('incident-heat-source')) {
        map.addSource('incident-heat-source', {
          type: 'geojson',
          data: heatData,
        });

        map.addLayer({
          id: 'incident-heatmap-layer',
          type: 'heatmap',
          source: 'incident-heat-source',
          layout: {
            visibility: showHeatmap ? 'visible' : 'none',
          },
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'severity_weight'],
              1, 0.2,
              4, 1.0,
            ],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 240, 255, 0)',
              0.2, '#00f0ff',
              0.5, '#f59e0b',
              0.8, '#ff3366',
            ],
            'heatmap-radius': 35,
            'heatmap-opacity': 0.75,
          },
        });
      } else {
        const src = map.getSource('incident-heat-source') as maplibregl.GeoJSONSource;
        src.setData(heatData);
        map.setLayoutProperty('incident-heatmap-layer', 'visibility', showHeatmap ? 'visible' : 'none');
      }
    };

    if (map.isStyleLoaded()) {
      setupHeatmapLayer();
    } else {
      map.once('styledata', setupHeatmapLayer);
    }
  }, [incidents, showHeatmap, activeBaseMode]);

  // Render Camera Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.keys(markersRef.current).forEach((key) => {
      if (key.startsWith('cam_')) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });

    if (!showCameras) return;

    cameras.forEach((cam) => {
      const el = document.createElement('div');
      el.className = 'tactical-camera-marker';
      el.id = `marker-${cam.id}`;

      const pin = document.createElement('div');
      pin.className = 'tactical-marker-pin';
      if (cam.status === 'DEGRADED') {
        pin.style.background = '#f59e0b';
        pin.style.boxShadow = '0 0 12px #f59e0b';
      } else if (cam.status === 'OFFLINE') {
        pin.style.background = '#6e7681';
        pin.style.boxShadow = 'none';
      }

      const label = document.createElement('div');
      label.className = 'tactical-marker-label';
      label.textContent = cam.name;

      el.appendChild(pin);
      el.appendChild(label);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        tacticalAudio.playRadarBlip();
        onSelectCamera(cam);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cam.longitude, cam.latitude])
        .addTo(map);

      markersRef.current[`cam_${cam.id}`] = marker;
    });
  }, [cameras, showCameras, onSelectCamera]);

  // Render Incident Markers with Smart Priority
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.keys(markersRef.current).forEach((key) => {
      if (key.startsWith('inc_')) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });

    if (!showIncidents) return;

    incidents.forEach((inc) => {
      const el = document.createElement('div');
      el.className = `tactical-incident-marker ${inc.severity.toLowerCase()}`;
      el.id = `marker-inc-${inc.id}`;

      const iconWrap = document.createElement('div');
      iconWrap.className = 'incident-marker-icon';

      if (inc.type === 'FIRE') {
        iconWrap.innerHTML = '🔥';
      } else if (inc.type === 'FLOOD') {
        iconWrap.innerHTML = '🌊';
      } else if (inc.type === 'ACCIDENT') {
        iconWrap.innerHTML = '⚠️';
      } else {
        iconWrap.innerHTML = '🚨';
      }

      const label = document.createElement('div');
      label.className = 'tactical-marker-label';
      label.textContent = `${inc.type} • ${inc.district}`;

      el.appendChild(iconWrap);
      el.appendChild(label);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        tacticalAudio.playCriticalAlert();
        onSelectIncident(inc);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([inc.longitude, inc.latitude])
        .addTo(map);

      markersRef.current[`inc_${inc.id}`] = marker;
    });
  }, [incidents, showIncidents, onSelectIncident]);

  // Render POI Markers (Hospitals, Police, Fire, Airports)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.keys(markersRef.current).forEach((key) => {
      if (key.startsWith('poi_')) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });

    pois.forEach((poi) => {
      if (poi.type === 'HOSPITAL' && !showHospitals) return;
      if (poi.type === 'POLICE' && !showPolice) return;
      if (poi.type === 'FIRE_STATION' && !showFireStations) return;

      const el = document.createElement('div');
      el.className = 'tactical-poi-marker';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '1px solid rgba(255,255,255,0.4)';
      el.style.boxShadow = '0 0 8px rgba(0,0,0,0.8)';

      if (poi.type === 'HOSPITAL') {
        el.style.background = '#0284c7';
        el.innerHTML = '<span style="color:#fff;font-weight:bold;font-size:14px;line-height:1;">+</span>';
      } else if (poi.type === 'POLICE') {
        el.style.background = '#1e3a8a';
        el.innerHTML = '<span style="color:#38bdf8;font-size:10px;">★</span>';
      } else if (poi.type === 'FIRE_STATION') {
        el.style.background = '#dc2626';
        el.innerHTML = '<span style="color:#fff;font-size:10px;">▲</span>';
      } else if (poi.type === 'AIRPORT') {
        el.style.background = '#475569';
        el.innerHTML = '<span style="color:#f8fafc;font-size:11px;">✈</span>';
      }

      el.title = `${poi.name} (${poi.district})`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        tacticalAudio.playClick();
        map.flyTo({ center: [poi.longitude, poi.latitude], zoom: 15, duration: 1000 });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(map);

      markersRef.current[`poi_${poi.id}`] = marker;
    });
  }, [pois, showHospitals, showPolice, showFireStations]);

  // Traffic Segments & Flood Zones vector layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupLayers = () => {
      // Traffic Lines
      if (!map.getSource('traffic-lines')) {
        map.addSource('traffic-lines', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: trafficSegments.map((seg) => ({
              type: 'Feature',
              properties: {
                status: seg.status,
                road_name: seg.road_name,
                speed: seg.avg_speed_kmh,
              },
              geometry: {
                type: 'LineString',
                coordinates: seg.coordinates,
              },
            })),
          },
        });

        map.addLayer({
          id: 'traffic-lines-glow',
          type: 'line',
          source: 'traffic-lines',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
            visibility: showTraffic ? 'visible' : 'none',
          },
          paint: {
            'line-width': 6,
            'line-blur': 3,
            'line-color': [
              'match',
              ['get', 'status'],
              'SEVERE', '#ff3366',
              'HEAVY', '#f59e0b',
              'MODERATE', '#00f0ff',
              '#00ff66',
            ],
            'line-opacity': 0.8,
          },
        });
      } else {
        map.setLayoutProperty('traffic-lines-glow', 'visibility', showTraffic ? 'visible' : 'none');
      }

      // Flood Polygons
      if (!map.getSource('flood-zones')) {
        map.addSource('flood-zones', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: floodZones.map((fz) => ({
              type: 'Feature',
              properties: {
                name: fz.name,
                status: fz.status,
              },
              geometry: {
                type: 'Polygon',
                coordinates: [fz.coordinates],
              },
            })),
          },
        });

        map.addLayer({
          id: 'flood-zones-fill',
          type: 'fill',
          source: 'flood-zones',
          layout: {
            visibility: showFloods ? 'visible' : 'none',
          },
          paint: {
            'fill-color': '#00f0ff',
            'fill-opacity': 0.22,
          },
        });

        map.addLayer({
          id: 'flood-zones-outline',
          type: 'line',
          source: 'flood-zones',
          layout: {
            visibility: showFloods ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#00f0ff',
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        });
      } else {
        map.setLayoutProperty('flood-zones-fill', 'visibility', showFloods ? 'visible' : 'none');
        map.setLayoutProperty('flood-zones-outline', 'visibility', showFloods ? 'visible' : 'none');
      }
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once('styledata', setupLayers);
    }
  }, [trafficSegments, floodZones, showTraffic, showFloods, activeBaseMode]);

  // Tactical Camera Navigation
  const panMap = (dx: number, dy: number) => {
    tacticalAudio.playClick();
    mapRef.current?.panBy([dx, dy], { duration: 300 });
  };

  const zoomIn = () => {
    tacticalAudio.playClick();
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const zoomOut = () => {
    tacticalAudio.playClick();
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const resetBearing = () => {
    tacticalAudio.playClick();
    const map = mapRef.current;
    if (!map) return;
    if (activeDimensionMode === '2D') {
      map.easeTo({ bearing: 0, pitch: 0, duration: 600 });
    } else {
      map.easeTo({ bearing: 0, pitch: 55, duration: 600 });
    }
  };

  // Right-Click Context Menu Actions
  const handleCopyCoords = () => {
    if (!contextMenu) return;
    const txt = `${contextMenu.lat.toFixed(6)}, ${contextMenu.lng.toFixed(6)}`;
    navigator.clipboard.writeText(txt).catch(() => {});
    setCopiedCoords(true);
    tacticalAudio.playRadarBlip();
    setTimeout(() => {
      setContextMenu(null);
      setCopiedCoords(false);
    }, 1200);
  };

  const handleScanFromContext = () => {
    if (!contextMenu) return;
    if (onTriggerScanArea) {
      onTriggerScanArea([contextMenu.lng, contextMenu.lat], 2000);
    }
    setContextMenu(null);
  };

  const handleMeasureFromContext = () => {
    if (!contextMenu) return;
    onUpdateMeasurement({
      activeTool: 'DISTANCE',
      points: [[contextMenu.lng, contextMenu.lat]],
      calculatedDistanceKm: 0,
    });
    setContextMenu(null);
  };

  return (
    <div className="map-viewport">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* BOTTOM-LEFT TACTICAL VIEW CONTROLS: [ 3D ] [ 2D ] [ MAP ] [ SAT ] */}
      <div className="bottom-left-controls">
        <div className="mode-pill-group">
          <button
            className={`mode-pill-btn ${activeDimensionMode === '3D' ? 'active' : ''}`}
            onClick={() => setMapMode('3D')}
            title="3D Perspective View (Pitch 55°)"
          >
            3D
          </button>
          <button
            className={`mode-pill-btn ${activeDimensionMode === '2D' ? 'active' : ''}`}
            onClick={() => setMapMode('2D')}
            title="2D Top-Down Cartographic View (Pitch 0°, North-Up)"
          >
            2D
          </button>
          <button
            className={`mode-pill-btn ${activeBaseMode === 'MAP' ? 'active' : ''}`}
            onClick={() => setMapMode('MAP')}
            title="Dark Cartographic Vector Map"
          >
            MAP
          </button>
          <button
            className={`mode-pill-btn ${activeBaseMode === 'SAT' ? 'active' : ''}`}
            onClick={() => setMapMode('SAT')}
            title="High-Resolution Tactical Satellite Imagery"
          >
            SAT
          </button>
        </div>

        {/* Compact Tactical Nearby Intelligence Badge */}
        {userLocation && nearbyIntel && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '4px 10px',
              background: 'rgba(10, 14, 20, 0.92)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#c9d1d9',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto',
              width: 'fit-content',
            }}
          >
            <span style={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.5px' }}>NEARBY (500M)</span>
            <span>CAMERAS <strong style={{ color: '#00ff66' }}>{nearbyIntel.cameras}</strong></span>
            <span>INCIDENTS <strong style={{ color: '#ff3366' }}>{nearbyIntel.incidents}</strong></span>
            <span>HOSPITALS <strong style={{ color: '#38bdf8' }}>{nearbyIntel.hospitals}</strong></span>
            <span>POLICE <strong style={{ color: '#38bdf8' }}>{nearbyIntel.police}</strong></span>
            <span>FIRE <strong style={{ color: '#f59e0b' }}>{nearbyIntel.fire}</strong></span>
          </div>
        )}

        {/* Telemetry coordinate strip */}
        <div className="bottom-telemetry-bar">
          <span>
            Cursor <span className="cyan">{cursorCoords.lat}</span>,{' '}
            <span className="cyan">{cursorCoords.lng}</span>
          </span>
          <span>
            Location <span className="gold">Bangkok, Thailand</span>
          </span>
          <span>
            Zoom <span className="cyan">{zoomLevel}</span>
          </span>
          {activeDimensionMode === '2D' && (
            <span style={{ color: '#00ff66', fontWeight: '700' }}>
              NORTH UP
            </span>
          )}
          {userLocation ? (
            <span style={{ color: '#00f0ff' }}>
              <span style={{ color: '#00ff66', fontWeight: '700' }}>LOCATION LOCKED</span>{' '}
              <span className="cyan">{userLocation.latitude.toFixed(6)}° N, {userLocation.longitude.toFixed(6)}° E</span>{' '}
              <span className="gold">[±{Math.round(userLocation.accuracy)}m]</span>
            </span>
          ) : locationStatus === 'REQUESTING' ? (
            <span style={{ color: '#00f0ff' }}>LOCATING...</span>
          ) : locationStatus === 'PERMISSION_DENIED' ? (
            <span style={{ color: '#ff3366', fontWeight: '700' }}>LOCATION ACCESS DENIED</span>
          ) : locationStatus === 'TIMEOUT' ? (
            <span style={{ color: '#ff3366', fontWeight: '700' }}>LOCATION TIMEOUT</span>
          ) : locationStatus === 'POSITION_UNAVAILABLE' ? (
            <span style={{ color: '#ff3366', fontWeight: '700' }}>LOCATION UNAVAILABLE</span>
          ) : (
            <span style={{ color: '#6e7681' }}>LOCATION: STANDBY</span>
          )}
          {measurementState.activeTool !== 'NONE' && (
            <span style={{ color: '#00ff66' }}>
              MEASURE: {measurementState.calculatedDistanceKm || 0} km ({measurementState.points.length} pts)
            </span>
          )}
        </div>
      </div>

      {/* BOTTOM-RIGHT NAVIGATION & SHORTCUTS */}
      <div className="bottom-right-controls">
        <div className="nav-dpad-cluster">
          <div />
          <button className="dpad-btn" onClick={() => panMap(0, -120)} title="Pan North">
            <ArrowUp size={14} />
          </button>
          <div />
          <button className="dpad-btn" onClick={() => panMap(-120, 0)} title="Pan West">
            <ArrowLeft size={14} />
          </button>
          <button className="dpad-btn" onClick={resetBearing} title="Reset Bearing (North-Up)">
            <Compass size={14} color="#d4af37" />
          </button>
          <button className="dpad-btn" onClick={() => panMap(120, 0)} title="Pan East">
            <ArrowRight size={14} />
          </button>
          <button className="dpad-btn" onClick={zoomIn} title="Zoom In">
            <Plus size={14} />
          </button>
          <button className="dpad-btn" onClick={() => panMap(0, 120)} title="Pan South">
            <ArrowDown size={14} />
          </button>
          <button className="dpad-btn" onClick={zoomOut} title="Zoom Out">
            <Minus size={14} />
          </button>
        </div>

        <div className="keyboard-shortcut-hint">
          [F: Fullscreen &bull; R: Reset &bull; S: Search &bull; C: Cameras &bull; I: Incidents &bull; L: Layers]
        </div>
      </div>

      {/* RIGHT-CLICK TACTICAL CONTEXT MENU */}
      {contextMenu && (
        <div
          className="map-context-menu"
          style={{
            position: 'absolute',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 1000,
            background: 'rgba(10, 14, 20, 0.96)',
            border: '1px solid var(--border-cyan)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
            borderRadius: '4px',
            padding: '6px 0',
            width: '220px',
            backdropFilter: 'blur(10px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '6px 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#00f0ff',
            }}
          >
            <div>COORDINATES</div>
            <div style={{ color: '#f0f6fc', fontWeight: '700', marginTop: '2px' }}>
              {contextMenu.lat.toFixed(6)}° N, {contextMenu.lng.toFixed(6)}° E
            </div>
          </div>

          <button
            className="context-menu-item"
            onClick={handleCopyCoords}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: '#c9d1d9',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {copiedCoords ? <Check size={13} color="#00ff66" /> : <Copy size={13} color="#00f0ff" />}
            <span>{copiedCoords ? 'COORDINATES COPIED' : 'COPY COORDINATES'}</span>
          </button>

          <button
            className="context-menu-item"
            onClick={handleScanFromContext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: '#c9d1d9',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Radar size={13} color="#00f0ff" />
            <span>SCAN AREA (2 KM)</span>
          </button>

          <button
            className="context-menu-item"
            onClick={handleMeasureFromContext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: '#c9d1d9',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <PenTool size={13} color="#00ff66" />
            <span>MEASURE DISTANCE</span>
          </button>
        </div>
      )}
    </div>
  );
};
