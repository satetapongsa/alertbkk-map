'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Incident } from '@/types';
import {
  formatThaiRelativeTime,
  INCIDENT_CONFIG,
  formatDistance,
  calculateDistanceKm,
} from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  userCoords,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`transition-all duration-300 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-30 ${
        isExpanded ? 'max-h-[380px] sm:max-h-[460px]' : 'max-h-12'
      }`}
    >
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-900/95 hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <h2 className="font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wider">
            Live Feed
          </h2>
          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-cyan-500/30">
            {incidents.length}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px] hidden sm:inline text-slate-400">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Feed List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {incidents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
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
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-500/50 shadow-md'
                      : 'hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${cfg.bgBadge}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatThaiRelativeTime(incident.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-400">
                      {incident.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className="truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{incident.locationName}</span>
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                        {distanceKm !== null && (
                          <span className="text-amber-400 text-[10px] font-semibold">
                            {formatDistance(distanceKm)}
                          </span>
                        )}
                        <Link
                          href={`/incident/${incident.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-0.5"
                          title="Open full incident report details"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
