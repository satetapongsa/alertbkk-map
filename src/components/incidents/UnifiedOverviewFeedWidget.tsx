'use client';

import React, { useState } from 'react';
import { Incident } from '@/types';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Radio,
  Layers,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Droplets,
  Car,
  AlertTriangle,
  Train,
  Construction,
} from 'lucide-react';
import {
  formatThaiRelativeTime,
  INCIDENT_CONFIG,
  formatDistance,
  calculateDistanceKm,
} from '@/lib/utils';

interface UnifiedOverviewFeedWidgetProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectCategory?: (type: string) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export const UnifiedOverviewFeedWidget: React.FC<UnifiedOverviewFeedWidgetProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onSelectCategory,
  userCoords,
}) => {
  // State: 'MINIMIZED' (just a compact icon pill), 'EXPANDED' (full box)
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEED'>('OVERVIEW');

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const floodCount = activeIncidents.filter((i) => i.type === 'FLOOD').length;
  const trafficCount = activeIncidents.filter((i) => i.type === 'TRAFFIC').length;
  const accidentCount = activeIncidents.filter((i) => i.type === 'ACCIDENT').length;
  const transitCount = activeIncidents.filter((i) => i.type === 'TRANSIT').length;
  const roadClosedCount = activeIncidents.filter((i) => i.type === 'ROAD_CLOSED').length;

  return (
    <div className="z-[500] pointer-events-auto">
      {/* 1. Minimized Floating Icon Button (When closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-slate-700/80 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Open Bangkok Overview & Live Incident Feed"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Activity className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>Overview & Feed</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded-full border border-cyan-500/30 font-mono">
                {activeIncidents.length}
              </span>
            </div>
            <p className="text-[9px] text-slate-400">Tap to expand live radar</p>
          </div>

          <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      )}

      {/* 2. Expanded Multi-Tab Widget (When opened) */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] max-w-[calc(100vw-32px)] bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all animate-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">Live Bangkok Intelligence</h3>
                <p className="text-[10px] text-slate-400 font-mono">{activeIncidents.length} active hotspots</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Minimize to icon"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Segment Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>City Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('FEED')}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'FEED'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live Feed ({incidents.length})</span>
            </button>
          </div>

          {/* Tab Content 1: Overview Categories */}
          {activeTab === 'OVERVIEW' && (
            <div className="p-3.5 space-y-3 max-h-[380px] overflow-y-auto">
              <div className="flex items-center justify-between font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Hotspots
                </span>
                <span className="font-bold">{activeIncidents.length} events</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300">
                <button
                  onClick={() => onSelectCategory && onSelectCategory('FLOOD')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left transition-colors cursor-pointer border border-slate-800/80"
                >
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Floods</span>
                  </span>
                  <span className="font-bold text-cyan-400">{floodCount}</span>
                </button>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('TRAFFIC')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left transition-colors cursor-pointer border border-slate-800/80"
                >
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-amber-400" />
                    <span>Congestion</span>
                  </span>
                  <span className="font-bold text-amber-400">{trafficCount}</span>
                </button>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('ACCIDENT')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left transition-colors cursor-pointer border border-slate-800/80"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Accidents</span>
                  </span>
                  <span className="font-bold text-red-400">{accidentCount}</span>
                </button>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('TRANSIT')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left transition-colors cursor-pointer border border-slate-800/80"
                >
                  <span className="flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-purple-400" />
                    <span>Transit</span>
                  </span>
                  <span className="font-bold text-purple-400">{transitCount}</span>
                </button>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('ROAD_CLOSED')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left transition-colors col-span-2 cursor-pointer border border-slate-800/80"
                >
                  <span className="flex items-center gap-1.5">
                    <Construction className="w-3.5 h-3.5 text-orange-400" />
                    <span>Closed Roads</span>
                  </span>
                  <span className="font-bold text-orange-400">{roadClosedCount}</span>
                </button>
              </div>

              <div className="pt-1">
                <a
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/dashboard';
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-center block transition-all text-xs cursor-pointer select-none shadow-sm"
                >
                  Open Operations & Transit Center &rarr;
                </a>
              </div>
            </div>
          )}

          {/* Tab Content 2: Live Feed List */}
          {activeTab === 'FEED' && (
            <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
              {incidents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Radio className="w-8 h-8 text-slate-600 animate-pulse" />
                  <span>No incidents matching active filters</span>
                </div>
              ) : (
                incidents.map((incident) => {
                  const cfg = INCIDENT_CONFIG[incident.type] || INCIDENT_CONFIG.GENERAL;
                  const isSelected = selectedIncident?.id === incident.id;
                  const distanceKm = userCoords
                    ? calculateDistanceKm(userCoords.lat, userCoords.lng, incident.latitude, incident.longitude)
                    : null;

                  return (
                    <div
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-xs ${
                        isSelected
                          ? 'bg-cyan-950/60 border border-cyan-500/50 shadow-md'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div
                        className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: cfg.icon }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${cfg.bgBadge}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                            {formatThaiRelativeTime(incident.createdAt)}
                          </span>
                        </div>

                        <h4 className="font-semibold text-slate-100 truncate text-xs">{incident.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span>{incident.locationName}</span>
                        </p>

                        {distanceKm !== null && (
                          <div className="mt-1 text-[10px] text-cyan-400 font-mono font-medium">
                            {formatDistance(distanceKm)} away
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer Bar */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed Connected
            </span>
            <span className="font-mono">Real-time SSE Sync</span>
          </div>
        </div>
      )}
    </div>
  );
};
