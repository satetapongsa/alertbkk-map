'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { MapWrapper } from '@/components/map/MapWrapper';
import { FilterPanel } from '@/components/incidents/FilterPanel';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { CreateReportModal } from '@/components/incidents/CreateReportModal';
import { AreaWatchModal } from '@/components/incidents/AreaWatchModal';
import { SatelliteWeatherBar } from '@/components/weather/SatelliteWeatherBar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CompactFlightRadarDrawer } from '@/components/transit/CompactFlightRadarDrawer';
import { BangkokEmergencySosModal } from '@/components/modals/BangkokEmergencySosModal';
import { BangkokDistrictsModal } from '@/components/modals/BangkokDistrictsModal';
import { SafeRouteHazardModal } from '@/components/modals/SafeRouteHazardModal';
import { VehicleFloodRiskModal } from '@/components/modals/VehicleFloodRiskModal';
import { BangkokWaterTideModal } from '@/components/modals/BangkokWaterTideModal';
import { BangkokDistrict } from '@/lib/bkk-environmental-data';
import { AirportFlightResponse, FlightItem } from '@/app/api/flights/route';
import { Incident, IncidentType, TimeFilter } from '@/types';
import {
  Bell,
  Radio,
  CheckCircle2,
  MapPin,
  Plus,
  X,
  Plane,
  AlertOctagon,
  Compass,
  ShieldCheck,
  Gauge,
  Waves,
} from 'lucide-react';

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Live Airspace Radar Telemetry (Suvarnabhumi & Don Mueang ADS-B)
  const [flightData, setFlightData] = useState<AirportFlightResponse | null>(null);
  const [isFlightLoading, setIsFlightLoading] = useState(false);
  const [showFlightRadar, setShowFlightRadar] = useState(false);

  // Filters & Selected Coordinates
  const [clickedMapCoords, setClickedMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedType, setSelectedType] = useState<IncidentType | 'ALL'>('ALL');
  const [selectedTime, setSelectedTime] = useState<TimeFilter>('LIVE');
  const [showHistorical, setShowHistorical] = useState(false);

  // Navigation / Camera
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [watchArea, setWatchArea] = useState<{ lat: number; lng: number; radiusKm: number } | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAreaWatchModalOpen, setIsAreaWatchModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isDistrictsModalOpen, setIsDistrictsModalOpen] = useState(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isWaterTideModalOpen, setIsWaterTideModalOpen] = useState(false);

  // Live Toast Notification
  const [liveToast, setLiveToast] = useState<{ title: string; message: string } | null>(null);

  // Fetch initial incidents
  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (data.success) {
        setIncidents(data.data);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    }
  }, []);

  // Fetch Live Flights Telemetry
  const fetchFlights = useCallback(async () => {
    setIsFlightLoading(true);
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      if (data.success) {
        setFlightData(data);
      }
    } catch (err) {
      console.error('Error fetching live flights:', err);
    } finally {
      setIsFlightLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 30000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  // Check URL query parameters for modal opening and category filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('report') === '1') {
        setIsReportModalOpen(true);
      } else if (params.get('watch') === '1') {
        setIsAreaWatchModalOpen(true);
      }
      const typeParam = params.get('type');
      if (typeParam) {
        setSelectedType(typeParam as any);
      }
    }
  }, []);

  // Request User Geolocation on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.log('Location permission not granted or timeout; using Bangkok default center.');
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, []);

  // Real-Time SSE Subscription
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/realtime');

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === 'incident.created') {
            const newInc: Incident = parsed.data;
            setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
            setLiveToast({
              title: 'New Incident Reported',
              message: `${newInc.title} (${newInc.locationName})`,
            });
            setTimeout(() => setLiveToast(null), 5000);
          } else if (parsed.type === 'incident.confirmed') {
            const { id, confirmCount } = parsed.data;
            setIncidents((prev) =>
              prev.map((i) => (i.id === id ? { ...i, confirmCount } : i))
            );
            if (selectedIncident?.id === id) {
              setSelectedIncident((prev) => (prev ? { ...prev, confirmCount } : null));
            }
          } else if (parsed.type === 'incident.disputed') {
            const { id, disputeCount } = parsed.data;
            setIncidents((prev) =>
              prev.map((i) => (i.id === id ? { ...i, disputeCount } : i))
            );
            if (selectedIncident?.id === id) {
              setSelectedIncident((prev) => (prev ? { ...prev, disputeCount } : null));
            }
          } else if (parsed.type === 'incident.resolved') {
            const { id, status } = parsed.data;
            setIncidents((prev) =>
              prev.map((i) => (i.id === id ? { ...i, status } : i))
            );
          }
        } catch (e) {
          // heartbeat or unparseable
        }
      };

      eventSource.onerror = () => {
        // EventSource will automatically retry connecting
      };
    } catch (err) {
      console.error('SSE initialization error:', err);
    }

    return () => {
      eventSource?.close();
    };
  }, [selectedIncident]);

  /**
   * ARCHITECTURE SPECIFICATION (AlertBKK Core):
   * 1. Priority Focus: Bangkok Metropolitan Region (BKK).
   *    AlertBKK is primarily designed to serve Bangkok first; default camera views,
   *    recon layers, and telemetry anchor around Bangkok (13.7563, 100.5018).
   * 2. Provincial Extensibility: Incidents reported across other provinces in Thailand
   *    remain fully loaded and queryable on the map without cluttering the UI with dedicated
   *    scope filter toggle buttons.
   */
  // Apply Client Filtering
  useEffect(() => {
    let list = [...incidents];

    // Filter Type
    if (selectedType !== 'ALL') {
      list = list.filter((i) => i.type === selectedType);
    }

    // Filter Historical / Active
    if (!showHistorical) {
      list = list.filter((i) => i.status === 'ACTIVE' || i.status === 'MONITORING');
    }

    // Filter Time Horizon
    const now = Date.now();
    if (selectedTime === '1H') {
      list = list.filter((i) => now - new Date(i.createdAt).getTime() <= 1000 * 60 * 60);
    } else if (selectedTime === '3H') {
      list = list.filter((i) => now - new Date(i.createdAt).getTime() <= 1000 * 60 * 60 * 3);
    } else if (selectedTime === '6H') {
      list = list.filter((i) => now - new Date(i.createdAt).getTime() <= 1000 * 60 * 60 * 6);
    } else if (selectedTime === '24H' || selectedTime === 'TODAY') {
      list = list.filter((i) => now - new Date(i.createdAt).getTime() <= 1000 * 60 * 60 * 24);
    } else if (selectedTime === '7D') {
      list = list.filter((i) => now - new Date(i.createdAt).getTime() <= 1000 * 60 * 60 * 24 * 7);
    }

    setFilteredIncidents(list);
  }, [incidents, selectedType, selectedTime, showHistorical]);

  // Incident Select Handlers
  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setFlyToCoords({ lat: incident.latitude, lng: incident.longitude, zoom: 15 });
  };

  const handleSearchLocation = (lat: number, lng: number, label: string) => {
    setFlyToCoords({ lat, lng, zoom: 15 });
    setLiveToast({
      title: 'Navigating to Location',
      message: label,
    });
    setTimeout(() => setLiveToast(null), 3000);
  };

  const handleConfirmIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/confirm`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? data.data : i))
        );
        setSelectedIncident(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisputeIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/dispute`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? data.data : i))
        );
        setSelectedIncident(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Consolidate BKK & DMK active flights from telemetry response
  const activeFlights = flightData
    ? [...flightData.airports.suvarnabhumi.flights, ...flightData.airports.donmueang.flights]
    : [];
  const totalFlightCount = flightData?.totalAirborneInBKKBasin || activeFlights.length;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950">
      {/* 1. Top Navbar */}
      <Navbar
        incidents={incidents}
        activeCount={incidents.filter((i) => i.status === 'ACTIVE').length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAreaWatchModal={() => setIsAreaWatchModalOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        onOpenDistrictsModal={() => setIsDistrictsModalOpen(true)}
        onOpenHazardModal={() => setIsHazardModalOpen(true)}
        onSelectIncident={handleSelectIncident}
        onSearchLocation={handleSearchLocation}
        onSyncCompleted={fetchIncidents}
      />

      {/* 2. Real-time Satellite & Meteorology Telemetry Bar */}
      <SatelliteWeatherBar />

      {/* 3. Main Map & Overlays Container */}
      <main className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
        {/* Full-Screen Leaflet Map */}
        <MapWrapper
          incidents={filteredIncidents}
          selectedIncident={selectedIncident}
          onSelectIncident={handleSelectIncident}
          flyToCoords={flyToCoords}
          userCoords={userCoords}
          watchArea={watchArea}
          flights={activeFlights}
          showFlights={showFlightRadar}
          onToggleFlights={() => setShowFlightRadar((prev) => !prev)}
          onMapClick={(lat, lng) => {
            setClickedMapCoords({ lat, lng });
            setLiveToast({
              title: 'ปักหมุดตำแหน่งบนแผนที่',
              message: `พิกัด ${lat.toFixed(4)}, ${lng.toFixed(4)} (คลิกปุ่มด้านล่างเพื่อปักหมุดบ้านหรือแจ้งเหตุ)`,
            });
            setTimeout(() => setLiveToast(null), 3500);
          }}
          onLocateUser={(coords) => {
            setUserCoords(coords);
            setLiveToast({
              title: 'Warped to Current Location',
              message: `GPS Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`,
            });
            setTimeout(() => setLiveToast(null), 3000);
          }}
        />

        {/* Satellite Orbital HUD Overlay (Non-intrusive transparent grid & reticle) */}
        <div className="absolute inset-0 pointer-events-none satellite-grid-overlay z-[400] opacity-40" />

        {/* Orbit Telemetry Stamp (Bottom-Left) */}
        <div className="hidden lg:flex absolute bottom-6 left-6 z-[500] pointer-events-none items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md text-[10px] font-mono text-slate-400 select-none shadow-2xl">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>ORBITAL RECON: 35,786 KM GEO-SYNCHRONOUS</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">BASIN SCAN: ACTIVE</span>
        </div>

        {/* Top-Left Filter Bar & Quick Flight Radar Launcher */}
        <div className="absolute top-3 sm:top-4 left-2 sm:left-3 max-w-[calc(100%-100px)] sm:max-w-xl z-[500] pointer-events-none flex flex-col gap-2">
          <div className="pointer-events-auto">
            <FilterPanel
              selectedType={selectedType}
              onSelectType={setSelectedType}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              showHistorical={showHistorical}
              onToggleHistorical={setShowHistorical}
              incidents={incidents}
            />
          </div>

          {/* Quick Tactical Action Pills */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Airspace Flight Radar Launcher Pill */}
            <button
              onClick={() => setShowFlightRadar((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border backdrop-blur-xl text-xs font-semibold shadow-lg transition-all cursor-pointer select-none ${
                showFlightRadar
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-cyan-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border-cyan-500/40'
              }`}
              title="ดูสายการบินและเรดาร์น่านฟ้าสด (BKK & DMK)"
            >
              <Plane className={`w-3.5 h-3.5 ${showFlightRadar ? 'rotate-45' : ''}`} />
              <span>สายการบิน</span>
              {totalFlightCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    showFlightRadar
                      ? 'bg-slate-950 text-cyan-300'
                      : 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                  }`}
                >
                  {totalFlightCount} ลำ
                </span>
              )}
            </button>

            {/* 50 Districts Quick Selector Pill */}
            <button
              onClick={() => setIsDistrictsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750 backdrop-blur-xl text-xs font-semibold shadow-lg transition-all cursor-pointer select-none"
              title="เลือกดูพิกัด 50 เขต กทม."
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>50 เขต</span>
            </button>

            {/* Safe Commute / Hazard Scanner Button */}
            <button
              onClick={() => setIsHazardModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/40 backdrop-blur-xl text-xs font-semibold shadow-lg transition-all cursor-pointer select-none"
              title="สแกนเส้นทางกลับบ้าน/ที่หมาย ปลอดภัยจากน้ำท่วมและอุบัติเหตุ"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>สแกนเส้นทาง</span>
            </button>

            {/* Vehicle Flood Clearance Calculator Pill */}
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 backdrop-blur-xl text-xs font-semibold shadow-lg transition-all cursor-pointer select-none"
              title="ตรวจความเสี่ยงน้ำท่วมตามประเภทรถ (Sedan, SUV, EV, มอเตอร์ไซค์)"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">ตรวจน้ำท่วมตามรุ่นรถ</span>
              <span className="sm:hidden">รุ่นรถ</span>
            </button>

            {/* Chao Phraya Water Tides & Sluice Gates Pill */}
            <button
              onClick={() => setIsWaterTideModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-300 hover:text-white border border-sky-500/40 backdrop-blur-xl text-xs font-semibold shadow-lg transition-all cursor-pointer select-none"
              title="ระดับน้ำแม่น้ำเจ้าพระยาและสถานีสูบน้ำหลัก กทม."
            >
              <Waves className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">ระดับน้ำเจ้าพระยา</span>
              <span className="sm:hidden">ระดับน้ำ</span>
            </button>

            {/* SOS Hotline Button */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Live Flight Radar Compact Drawer */}
        <CompactFlightRadarDrawer
          isOpen={showFlightRadar}
          onClose={() => setShowFlightRadar(false)}
          flightData={flightData}
          loading={isFlightLoading}
          onRefresh={fetchFlights}
          onSelectFlight={(flight) => {
            setFlyToCoords({ lat: flight.latitude, lng: flight.longitude, zoom: 15 });
          }}
        />

        {/* Selected Incident Floating Popup Card */}
        {selectedIncident && (
          <div className="absolute top-20 left-3 sm:left-4 max-w-sm sm:max-w-md w-[calc(100%-24px)] z-[600] pointer-events-auto animate-in slide-in-from-top-4 duration-200">
            <IncidentCard
              incident={selectedIncident}
              userCoords={userCoords}
              onConfirm={handleConfirmIncident}
              onDispute={handleDisputeIncident}
              onClose={() => setSelectedIncident(null)}
            />
          </div>
        )}

        {/* Floating Quick Action when User clicks anywhere on the Map (Home Pin / Report Here / Scan Path) */}
        {clickedMapCoords && !selectedIncident && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/95 border border-amber-500/60 text-slate-100 px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[92vw]">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>{clickedMapCoords.lat.toFixed(4)}, {clickedMapCoords.lng.toFixed(4)}</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ปักหมุดบ้าน / แจ้งเหตุ</span>
            </button>
            <button
              onClick={() => setIsHazardModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>สแกนเส้นทางมาจุดนี้</span>
            </button>
            <button
              onClick={() => setClickedMapCoords(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Close pin"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Real-time Broadcast Toast */}
        {liveToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[700] bg-cyan-950/95 border border-cyan-500/80 text-cyan-200 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse flex-shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">{liveToast.title}</p>
              <p className="text-[11px] text-cyan-300/90">{liveToast.message}</p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={(newInc) => {
          setIncidents((prev) => [newInc, ...prev]);
          handleSelectIncident(newInc);
        }}
        currentMapCoords={clickedMapCoords || userCoords || { lat: 13.7563, lng: 100.5018 }}
      />

      <AreaWatchModal
        isOpen={isAreaWatchModalOpen}
        onClose={() => setIsAreaWatchModalOpen(false)}
        userCoords={userCoords}
        onSaveWatchArea={(area) => {
          if (userCoords) {
            setWatchArea({
              lat: userCoords.lat,
              lng: userCoords.lng,
              radiusKm: area.radiusKm,
            });
          }
        }}
      />

      {/* Bangkok Emergency SOS Hotlines Modal */}
      <BangkokEmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        userCoords={userCoords}
      />

      {/* Bangkok 50 Districts Explorer Modal */}
      <BangkokDistrictsModal
        isOpen={isDistrictsModalOpen}
        onClose={() => setIsDistrictsModalOpen(false)}
        onSelectDistrict={(district) => {
          setFlyToCoords({ lat: district.lat, lng: district.lng, zoom: 14 });
          setLiveToast({
            title: `สำรวจพื้นที่เขต${district.nameTh} (${district.nameEn})`,
            message: `พิกัด ${district.lat.toFixed(4)}, ${district.lng.toFixed(4)} • รหัสไปรษณีย์ ${district.postalCode}`,
          });
          setTimeout(() => setLiveToast(null), 4000);
        }}
      />

      {/* Safe Commute / Hazard Scanner Modal */}
      <SafeRouteHazardModal
        isOpen={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
        userCoords={userCoords}
        targetCoords={clickedMapCoords}
        incidents={incidents}
        onFlyToIncident={(lat, lng) => {
          setFlyToCoords({ lat, lng, zoom: 15 });
        }}
      />

      {/* Vehicle Clearance Flood Risk Calculator Modal */}
      <VehicleFloodRiskModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
      />

      {/* Bangkok Chao Phraya River Water Level & Sluice Gates Modal */}
      <BangkokWaterTideModal
        isOpen={isWaterTideModalOpen}
        onClose={() => setIsWaterTideModalOpen(false)}
      />

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenReport={() => setIsReportModalOpen(true)}
        onToggleFlights={() => setShowFlightRadar((prev) => !prev)}
        showFlights={showFlightRadar}
        flightCount={totalFlightCount}
      />
    </div>
  );
}
