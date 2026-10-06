'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  CameraSource,
  Incident,
  POI,
  TrafficSegment,
  FloodZone,
  MeasurementToolState,
} from '@/types/intelligence';
import { TopHUD } from '@/components/layout/TopHUD';
import { LeftRail } from '@/components/layout/LeftRail';
import { RightRail } from '@/components/layout/RightRail';
import { IntelligenceMap } from '@/components/map/IntelligenceMap';
import { CameraIntelligencePanel } from '@/components/panels/CameraIntelligencePanel';
import { IncidentIntelligencePanel } from '@/components/panels/IncidentIntelligencePanel';
import { CameraGridOverlay } from '@/components/panels/CameraGridOverlay';
import { GlobalSearchModal } from '@/components/panels/GlobalSearchModal';
import { AdvancedFiltersDrawer } from '@/components/panels/AdvancedFiltersDrawer';
import { LiveTimelineDrawer } from '@/components/panels/LiveTimelineDrawer';
import { AnalyticsModal } from '@/components/panels/AnalyticsModal';
import { AdminSourcesModal } from '@/components/panels/AdminSourcesModal';
import { ScanAreaModal } from '@/components/panels/ScanAreaModal';
import { EventReplayDrawer } from '@/components/panels/EventReplayDrawer';
import { SituationalSummaryModal } from '@/components/panels/SituationalSummaryModal';
import { BookmarksModal } from '@/components/panels/BookmarksModal';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRealtimeStream } from '@/lib/useRealtimeStream';
import { tacticalAudio } from '@/lib/tacticalAudio';

export default function Home() {
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  // Primary Entity Collections
  const [cameras, setCameras] = useState<CameraSource[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [trafficSegments, setTrafficSegments] = useState<TrafficSegment[]>([]);
  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);

  // Replay filtered incidents (when replay active)
  const [replayIncidents, setReplayIncidents] = useState<Incident[] | null>(null);

  // Selected Entities
  const [selectedCamera, setSelectedCamera] = useState<CameraSource | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Active Panels / Overlays
  const [activeWindow, setActiveWindow] = useState<
    | 'NONE'
    | 'SEARCH'
    | 'FILTERS'
    | 'TIMELINE'
    | 'ANALYTICS'
    | 'SYSTEM_STATUS'
    | 'SCAN_AREA'
    | 'REPLAY'
    | 'SUMMARY'
    | 'BOOKMARKS'
    | 'GRID_VIEW'
    | 'CAMERA_PANEL'
    | 'INCIDENT_PANEL'
  >('NONE');
  const [leftRailTab, setLeftRailTab] = useState<string>('');
  const [activeRightPanel, setActiveRightPanel] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState<boolean>(false);
  const [isGridView, setIsGridView] = useState<boolean>(false);
  const [isScanAreaModalOpen, setIsScanAreaModalOpen] = useState<boolean>(false);
  const [isReplayOpen, setIsReplayOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);

  // Tactical Area Scan State
  const [scanAreaState, setScanAreaState] = useState<{
    center: [number, number]; // [lng, lat]
    radiusMeters: number;
  } | null>(null);

  // Layer Toggles
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showWeather, setShowWeather] = useState<boolean>(true);
  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [showPolice, setShowPolice] = useState<boolean>(true);
  const [showFireStations, setShowFireStations] = useState<boolean>(true);
  const [showFloods, setShowFloods] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showCameraCoverage, setShowCameraCoverage] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  // Measurement Tool State
  const [measurementState, setMeasurementState] = useState<MeasurementToolState>({
    activeTool: 'NONE',
    points: [],
  });

  // User Geolocation Hook (High Accuracy, Single-Shot Fix, No Tracking)
  const {
    status: locationStatus,
    location: userLocation,
    locate,
  } = useUserLocation({
    onFollowMapCenter: (lat, lng, zoom) => {
      if (mapInstanceRef.current) {
        const is2D = mapInstanceRef.current.getPitch() === 0;
        mapInstanceRef.current.flyTo({
          center: [lng, lat],
          zoom: zoom || 17.0,
          pitch: is2D ? 0 : 50,
          bearing: is2D ? 0 : mapInstanceRef.current.getBearing(),
          duration: 1200,
          curve: 1.42,
          speed: 1.5,
          essential: true,
        });
      }
    },
  });

  // Initial Data Fetch
  const loadData = useCallback(async () => {
    try {
      const [cRes, iRes, pRes, tRes] = await Promise.all([
        fetch('/api/cameras').then((r) => r.json()),
        fetch('/api/incidents').then((r) => r.json()),
        fetch('/api/pois').then((r) => r.json()),
        fetch('/api/traffic').then((r) => r.json()),
      ]);

      if (cRes.success) setCameras(cRes.data);
      if (iRes.success) setIncidents(iRes.data);
      if (pRes.success) setPois(pRes.data);
      if (tRes.success) {
        setTrafficSegments(tRes.traffic_segments || []);
        setFloodZones(tRes.flood_zones || []);
      }
    } catch (e) {
      console.error('Failed to load initial MIRRIX telemetry data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time Event Stream (Incident Flash & Audio Alert)
  useRealtimeStream((event) => {
    if (event.event === 'incident.created') {
      tacticalAudio.playCriticalAlert();
      loadData();
    }
  });

  // Comprehensive Window Coordinator (Mutual Exclusivity: Only 1 Window Active at a time)
  const closeAllPanels = useCallback(() => {
    setActiveWindow('NONE');
    setSelectedCamera(null);
    setSelectedIncident(null);
    setIsSearchOpen(false);
    setIsFiltersOpen(false);
    setIsTimelineOpen(false);
    setIsAnalyticsOpen(false);
    setIsSystemStatusOpen(false);
    setIsScanAreaModalOpen(false);
    setIsReplayOpen(false);
    setIsSummaryOpen(false);
    setIsBookmarksOpen(false);
    setIsGridView(false);
    setActiveRightPanel('');
    setLeftRailTab('');
  }, []);

  const openWindow = useCallback(
    (
      target:
        | 'NONE'
        | 'SEARCH'
        | 'FILTERS'
        | 'TIMELINE'
        | 'ANALYTICS'
        | 'SYSTEM_STATUS'
        | 'SCAN_AREA'
        | 'REPLAY'
        | 'SUMMARY'
        | 'BOOKMARKS'
        | 'GRID_VIEW'
        | 'CAMERA_PANEL'
        | 'INCIDENT_PANEL',
      payload?: any
    ) => {
      // 1. Close all previous windows so they never overlap
      closeAllPanels();

      // 2. Activate requested window as the topmost element
      setActiveWindow(target);

      switch (target) {
        case 'SEARCH':
          setIsSearchOpen(true);
          setActiveRightPanel('search');
          break;
        case 'FILTERS':
          setIsFiltersOpen(true);
          setActiveRightPanel('filters');
          break;
        case 'TIMELINE':
          setIsTimelineOpen(true);
          setActiveRightPanel('timeline');
          break;
        case 'ANALYTICS':
          setIsAnalyticsOpen(true);
          setActiveRightPanel('analytics');
          break;
        case 'SYSTEM_STATUS':
          setIsSystemStatusOpen(true);
          break;
        case 'SCAN_AREA': {
          let center: [number, number] = [100.5450, 13.7420];
          if (payload?.coords) {
            center = payload.coords;
          } else if (mapInstanceRef.current) {
            const c = mapInstanceRef.current.getCenter();
            center = [c.lng, c.lat];
          }
          setScanAreaState({ center, radiusMeters: payload?.radiusMeters || 2000 });
          setIsScanAreaModalOpen(true);
          setActiveRightPanel('scan_area');
          break;
        }
        case 'REPLAY':
          setIsReplayOpen(true);
          break;
        case 'SUMMARY':
          setIsSummaryOpen(true);
          setLeftRailTab('overview');
          break;
        case 'BOOKMARKS':
          setIsBookmarksOpen(true);
          setActiveRightPanel('bookmarks');
          break;
        case 'GRID_VIEW':
          setIsGridView(true);
          setLeftRailTab('cameras');
          break;
        case 'CAMERA_PANEL':
          setSelectedCamera(payload);
          break;
        case 'INCIDENT_PANEL':
          setSelectedIncident(payload);
          break;
        default:
          break;
      }
    },
    [closeAllPanels]
  );

  const toggleWindow = useCallback(
    (
      target:
        | 'NONE'
        | 'SEARCH'
        | 'FILTERS'
        | 'TIMELINE'
        | 'ANALYTICS'
        | 'SYSTEM_STATUS'
        | 'SCAN_AREA'
        | 'REPLAY'
        | 'SUMMARY'
        | 'BOOKMARKS'
        | 'GRID_VIEW'
        | 'CAMERA_PANEL'
        | 'INCIDENT_PANEL',
      payload?: any
    ) => {
      if (activeWindow === target) {
        closeAllPanels();
      } else {
        openWindow(target, payload);
      }
    },
    [activeWindow, closeAllPanels, openWindow]
  );

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case 'l':
          toggleWindow('FILTERS');
          break;
        case 'c':
          toggleWindow('GRID_VIEW');
          break;
        case 'i':
          toggleWindow('TIMELINE');
          break;
        case 's':
          e.preventDefault();
          toggleWindow('SEARCH');
          break;
        case 'a':
          toggleWindow('ANALYTICS');
          break;
        case 'r':
          // Reset view to Bangkok Core
          closeAllPanels();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [100.5450, 13.7420],
              zoom: 12.7,
              pitch: 0,
              bearing: 0,
              duration: 1200,
            });
          }
          break;
        case 'escape':
          closeAllPanels();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllPanels, toggleWindow]);

  const handleSelectCamera = (cam: CameraSource) => {
    openWindow('CAMERA_PANEL', cam);
  };

  const handleSelectIncident = (inc: Incident) => {
    openWindow('INCIDENT_PANEL', inc);
  };

  // Pure One-Shot MY LOCATION click handler (Instant warp zoom to current pin)
  const handleLocateButtonClick = useCallback(() => {
    // 1. Immediately close any open modal/drawer so map viewport is completely clear
    closeAllPanels();

    // 2. If userLocation already exists, immediately trigger high-speed tactical warp
    if (userLocation && mapInstanceRef.current) {
      const is2D = mapInstanceRef.current.getPitch() === 0;
      mapInstanceRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 17.0,
        pitch: is2D ? 0 : 50,
        bearing: is2D ? 0 : mapInstanceRef.current.getBearing(),
        duration: 1200,
        curve: 1.42,
        speed: 1.5,
        essential: true,
      });
    }

    // 3. Acquire / re-verify one-shot position fix
    locate();
  }, [closeAllPanels, userLocation, locate]);

  const toggleDrawingTool = () => {
    closeAllPanels();
    if (measurementState.activeTool === 'NONE') {
      tacticalAudio.playRadarBlip();
      setMeasurementState({ activeTool: 'DISTANCE', points: [] });
    } else {
      setMeasurementState({ activeTool: 'NONE', points: [] });
    }
  };

  // Trigger Area Scan Tool
  const triggerScanArea = (coords?: [number, number], radiusMeters: number = 2000) => {
    openWindow('SCAN_AREA', { coords, radiusMeters });
  };

  // Get map center coordinates for modal queries
  const getCurrentMapCenter = (): [number, number] => {
    if (mapInstanceRef.current) {
      const c = mapInstanceRef.current.getCenter();
      return [c.lng, c.lat];
    }
    return [100.5450, 13.7420];
  };

  // Nearby Incidents for currently selected camera
  const nearbyIncidentsForCamera = selectedCamera
    ? incidents.filter((inc) => {
        const latDiff = Math.abs(inc.latitude - selectedCamera.latitude);
        const lngDiff = Math.abs(inc.longitude - selectedCamera.longitude);
        return latDiff < 0.02 && lngDiff < 0.02;
      })
    : [];

  // Emergency Services
  const hospitals = pois.filter((p) => p.type === 'HOSPITAL');
  const police = pois.filter((p) => p.type === 'POLICE');
  const fire = pois.filter((p) => p.type === 'FIRE_STATION');

  // Active Incidents List (Normal vs Replay)
  const displayedIncidents = replayIncidents !== null ? replayIncidents : incidents;

  return (
    <main className="mirrix-shell">
      {/* 1. TOP COMMAND HUD */}
      <TopHUD
        onlineCameras={cameras.filter((c) => c.status === 'ONLINE').length}
        activeIncidents={incidents.filter((i) => i.status === 'ACTIVE').length}
        alertCount={incidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length}
        onOpenSystemStatus={() => toggleWindow('SYSTEM_STATUS')}
        onToggleGrid={() => toggleWindow('GRID_VIEW')}
        isGridView={isGridView}
        onResetView={closeAllPanels}
        locationStatus={locationStatus}
        userLocation={userLocation}
        onOpenSummary={() => toggleWindow('SUMMARY')}
        onOpenWeather={() => toggleWindow('SUMMARY')}
      />

      {/* 2. LEFT VERTICAL TACTICAL RAIL */}
      <LeftRail
        activeTab={leftRailTab}
        onSelectTab={(tab) => {
          if (leftRailTab === tab) {
            closeAllPanels();
            return;
          }
          if (tab === 'cameras') toggleWindow('GRID_VIEW');
          else if (tab === 'incidents' || tab === 'alerts') toggleWindow('TIMELINE');
          else if (tab === 'layers' || tab === 'traffic' || tab === 'flood') toggleWindow('FILTERS');
          else if (tab === 'overview' || tab === 'weather') toggleWindow('SUMMARY');
          else {
            closeAllPanels();
            setLeftRailTab(tab);
          }
        }}
        cameraCount={cameras.length}
        incidentCount={incidents.length}
        alertCount={incidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length}
      />

      {/* 3. RIGHT VERTICAL CONTROLS RAIL */}
      <RightRail
        onOpenSearch={() => toggleWindow('SEARCH')}
        onOpenFilters={() => toggleWindow('FILTERS')}
        onOpenAnalytics={() => toggleWindow('ANALYTICS')}
        onToggleDrawing={toggleDrawingTool}
        onOpenTimeline={() => toggleWindow('TIMELINE')}
        onOpenScanArea={() => toggleWindow('SCAN_AREA')}
        onOpenBookmarks={() => toggleWindow('BOOKMARKS')}
        onOpenLayers={() => toggleWindow('FILTERS')}
        onOpenSignals={() => toggleWindow('TIMELINE')}
        isDrawingActive={measurementState.activeTool !== 'NONE'}
        activePanel={activeRightPanel}
        onSelectPanel={(p) => {
          if (!p) closeAllPanels();
        }}
        locationStatus={locationStatus}
        onLocateClick={handleLocateButtonClick}
      />

      {/* 4. MAP VIEWPORT ENGINE */}
      <IntelligenceMap
        cameras={cameras}
        incidents={displayedIncidents}
        pois={pois}
        trafficSegments={trafficSegments}
        floodZones={floodZones}
        selectedCamera={selectedCamera}
        selectedIncident={selectedIncident}
        onSelectCamera={handleSelectCamera}
        onSelectIncident={handleSelectIncident}
        showCameras={showCameras}
        showIncidents={showIncidents}
        showHospitals={showHospitals}
        showPolice={showPolice}
        showFireStations={showFireStations}
        showTraffic={showTraffic}
        showFloods={showFloods}
        showHeatmap={showHeatmap}
        showCameraCoverage={showCameraCoverage}
        scanAreaState={scanAreaState}
        measurementState={measurementState}
        onUpdateMeasurement={setMeasurementState}
        userLocation={userLocation}
        locationStatus={locationStatus}
        onTriggerScanArea={(coords, r) => triggerScanArea(coords, r)}
        onMapReady={(map) => {
          mapInstanceRef.current = map;
        }}
      />

      {/* 5. CAMERA INTELLIGENCE SLIDE-IN PANEL */}
      {selectedCamera && !isGridView && (
        <CameraIntelligencePanel
          camera={selectedCamera}
          nearbyIncidents={nearbyIncidentsForCamera}
          onClose={closeAllPanels}
          onCenterMap={(lat, lng) => {
            mapInstanceRef.current?.flyTo({ center: [lng, lat], zoom: 15.5, duration: 1000 });
          }}
          onSelectIncident={handleSelectIncident}
          userLocation={userLocation}
        />
      )}

      {/* 6. INCIDENT SITUATIONAL REPORT SLIDE-IN PANEL */}
      {selectedIncident && !isGridView && (
        <IncidentIntelligencePanel
          incident={selectedIncident}
          nearbyCameras={cameras}
          nearbyHospitals={hospitals}
          nearbyPolice={police}
          nearbyFire={fire}
          onClose={closeAllPanels}
          onSelectCamera={handleSelectCamera}
          onCenterMap={(lat, lng) => {
            mapInstanceRef.current?.flyTo({ center: [lng, lat], zoom: 15.5, duration: 1000 });
          }}
          onMeasureRadius={(lat, lng) => {
            setMeasurementState({
              activeTool: 'RADIUS',
              points: [[lng, lat]],
              radiusMeters: 2000,
            });
          }}
          userLocation={userLocation}
        />
      )}

      {/* 7. MULTI-CAMERA SURVEILLANCE GRID OVERLAY */}
      {isGridView && (
        <CameraGridOverlay
          cameras={cameras}
          onClose={closeAllPanels}
          onSelectCamera={handleSelectCamera}
        />
      )}

      {/* 10. GLOBAL SPATIAL SEARCH MODAL (WITH COORDINATE JUMP) */}
      {isSearchOpen && (
        <GlobalSearchModal
          onClose={closeAllPanels}
          onFlyTo={(lat, lng) => {
            mapInstanceRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
          }}
          onSelectCamera={handleSelectCamera}
          onSelectIncident={handleSelectIncident}
          allCameras={cameras}
          allIncidents={incidents}
        />
      )}

      {/* 11. MAP LAYER MANAGER & ADVANCED FILTERS DRAWER */}
      {isFiltersOpen && (
        <AdvancedFiltersDrawer
          onClose={closeAllPanels}
          showCameras={showCameras}
          setShowCameras={setShowCameras}
          showIncidents={showIncidents}
          setShowIncidents={setShowIncidents}
          showTraffic={showTraffic}
          setShowTraffic={setShowTraffic}
          showWeather={showWeather}
          setShowWeather={setShowWeather}
          showHospitals={showHospitals}
          setShowHospitals={setShowHospitals}
          showPolice={showPolice}
          setShowPolice={setShowPolice}
          showFireStations={showFireStations}
          setShowFireStations={setShowFireStations}
          showFloods={showFloods}
          setShowFloods={setShowFloods}
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
          showCameraCoverage={showCameraCoverage}
          setShowCameraCoverage={setShowCameraCoverage}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
        />
      )}

      {/* 12. REAL-TIME INCIDENT TIMELINE 2.0 DRAWER */}
      {isTimelineOpen && (
        <LiveTimelineDrawer
          incidents={incidents}
          onClose={closeAllPanels}
          onSelectIncident={handleSelectIncident}
        />
      )}

      {/* 13. GEOSPATIAL SITUATIONAL ANALYTICS MODAL */}
      {isAnalyticsOpen && <AnalyticsModal onClose={closeAllPanels} />}

      {/* 14. DATA SOURCE HEALTH & OBSERVABILITY MODAL */}
      {isSystemStatusOpen && (
        <AdminSourcesModal
          onClose={closeAllPanels}
          onRefreshSources={loadData}
        />
      )}

      {/* 15. AREA SCAN MODAL */}
      {isScanAreaModalOpen && (
        <ScanAreaModal
          centerCoords={scanAreaState ? scanAreaState.center : getCurrentMapCenter()}
          cameras={cameras}
          incidents={incidents}
          pois={pois}
          trafficSegments={trafficSegments}
          floodZones={floodZones}
          onClose={closeAllPanels}
          onApplyRadius={(radiusMeters) => {
            setScanAreaState((prev) =>
              prev ? { ...prev, radiusMeters } : { center: getCurrentMapCenter(), radiusMeters }
            );
          }}
          onSelectCamera={handleSelectCamera}
          onSelectIncident={handleSelectIncident}
        />
      )}

      {/* 16. EVENT REPLAY DRAWER */}
      {isReplayOpen && (
        <EventReplayDrawer
          incidents={incidents}
          onClose={closeAllPanels}
          onSelectIncident={handleSelectIncident}
          onFilterReplayIncidents={(activeIncs) => setReplayIncidents(activeIncs)}
        />
      )}

      {/* 17. SITUATIONAL SUMMARY MODAL */}
      {isSummaryOpen && (
        <SituationalSummaryModal
          cameras={cameras}
          incidents={incidents}
          trafficSegments={trafficSegments}
          floodZones={floodZones}
          onClose={closeAllPanels}
        />
      )}

      {/* 18. TACTICAL BOOKMARKS MODAL */}
      {isBookmarksOpen && (
        <BookmarksModal
          currentCenter={getCurrentMapCenter()}
          onClose={closeAllPanels}
          onFlyTo={(lat, lng, zoom) => {
            mapInstanceRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1200 });
          }}
        />
      )}
    </main>
  );
}
