'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { SafetyBanner } from '@/components/SafetyBanner';
import { MapWrapper } from '@/components/map/MapWrapper';
import { FilterPanel } from '@/components/incidents/FilterPanel';
import { IncidentFeed } from '@/components/incidents/IncidentFeed';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { CreateReportModal } from '@/components/incidents/CreateReportModal';
import { AreaWatchModal } from '@/components/incidents/AreaWatchModal';
import { CurrentEventSummary } from '@/components/CurrentEventSummary';
import { PageNavigationTabs } from '@/components/PageNavigationTabs';
import { SatelliteWeatherBar } from '@/components/weather/SatelliteWeatherBar';
import { Incident, IncidentType, TimeFilter } from '@/types';
import { Bell, Radio, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filters
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

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

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

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950">
      {/* 1. Top Navbar */}
      <Navbar
        incidents={incidents}
        activeCount={incidents.filter((i) => i.status === 'ACTIVE').length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAreaWatchModal={() => setIsAreaWatchModalOpen(true)}
        onSelectIncident={handleSelectIncident}
        onSearchLocation={handleSearchLocation}
        onSyncCompleted={fetchIncidents}
      />

      {/* 2. Real-time Satellite & Meteorology Telemetry Bar */}
      <SatelliteWeatherBar />

      {/* 3. Mandatory Safety Banner */}
      <SafetyBanner />

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
          onLocateUser={(coords) => {
            setUserCoords(coords);
            setLiveToast({
              title: 'Warped to Current Location',
              message: `GPS Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`,
            });
            setTimeout(() => setLiveToast(null), 3000);
          }}
        />

        {/* Top-Left Navigation Tabs & Filter Bar (pointer-events-none on outer container so it never blocks map clicks) */}
        <div className="absolute top-3 sm:top-4 left-2 sm:left-3 max-w-[calc(100%-100px)] sm:max-w-xl z-[500] pointer-events-none flex flex-col gap-2">
          <div className="pointer-events-auto">
            <PageNavigationTabs />
          </div>
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
        </div>

        {/* Top-Right Bangkok Overview Summary Widget */}
        <div className="hidden lg:block absolute top-3 sm:top-4 right-3 sm:right-4 w-72 z-[500] pointer-events-auto">
          <CurrentEventSummary
            incidents={incidents}
            onSelectCategory={(type: any) => setSelectedType(type)}
          />
        </div>

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

        {/* Right-Bottom Live Incident Feed (with safe margin above mobile bottom nav) */}
        <div className="absolute bottom-16 sm:bottom-4 right-3 sm:right-4 w-full sm:w-80 md:w-96 max-w-[calc(100%-24px)] z-[500] pointer-events-auto">
          <IncidentFeed
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            userCoords={userCoords}
          />
        </div>

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
        currentMapCoords={userCoords || { lat: 13.7563, lng: 100.5018 }}
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
    </div>
  );
}
