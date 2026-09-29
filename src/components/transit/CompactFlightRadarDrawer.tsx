'use client';

import React, { useState } from 'react';
import { FlightItem, AirportFlightResponse } from '@/app/api/flights/route';
import {
  Plane,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Navigation,
  RefreshCw,
  Gauge,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface CompactFlightRadarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  flightData: AirportFlightResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectFlight: (flight: FlightItem) => void;
}

export const CompactFlightRadarDrawer: React.FC<CompactFlightRadarDrawerProps> = ({
  isOpen,
  onClose,
  flightData,
  loading,
  onRefresh,
  onSelectFlight,
}) => {
  const [selectedAirport, setSelectedAirport] = useState<'ALL' | 'BKK' | 'DMK'>('ALL');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'ARRIVAL' | 'DEPARTURE'>('ALL');

  if (!isOpen) return null;

  const bkkFlights = flightData?.airports.suvarnabhumi.flights || [];
  const dmkFlights = flightData?.airports.donmueang.flights || [];

  let activeFlights =
    selectedAirport === 'BKK'
      ? bkkFlights
      : selectedAirport === 'DMK'
      ? dmkFlights
      : [...bkkFlights, ...dmkFlights];

  if (filterDirection !== 'ALL') {
    activeFlights = activeFlights.filter((f) => f.direction === filterDirection);
  }

  // Sort by distance to airport
  activeFlights.sort((a, b) => a.distanceToAirportKm - b.distanceToAirportKm);

  return (
    <div className="absolute bottom-20 sm:bottom-24 right-3 sm:right-16 z-[700] w-full max-w-[340px] sm:max-w-md bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Plane className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-xs text-white tracking-wide">
                Airspace Flight Radar
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              BKK & DMK Live ADS-B Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Live Flight Telemetry"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Airport Switcher Tabs */}
      <div className="px-3 pt-2.5 pb-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-1.5 text-[11px]">
        <div className="flex gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedAirport('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedAirport === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({flightData?.totalAirborneInBKKBasin || 0})
          </button>
          <button
            onClick={() => setSelectedAirport('BKK')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedAirport === 'BKK'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BKK ({bkkFlights.length})
          </button>
          <button
            onClick={() => setSelectedAirport('DMK')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedAirport === 'DMK'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DMK ({dmkFlights.length})
          </button>
        </div>

        <div className="flex gap-1 text-[10px]">
          <button
            onClick={() => setFilterDirection(filterDirection === 'ARRIVAL' ? 'ALL' : 'ARRIVAL')}
            className={`px-2 py-0.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              filterDirection === 'ARRIVAL'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            Arr
          </button>
          <button
            onClick={() => setFilterDirection(filterDirection === 'DEPARTURE' ? 'ALL' : 'DEPARTURE')}
            className={`px-2 py-0.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              filterDirection === 'DEPARTURE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            Dep
          </button>
        </div>
      </div>

      {/* Flight List Content */}
      <div className="p-2 space-y-1.5 overflow-y-auto flex-1 divide-y divide-slate-800/40">
        {loading && activeFlights.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-cyan-400" />
            <span>กำลังดึงข้อมูลเรดาร์การบินสด...</span>
          </div>
        ) : activeFlights.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <span>ไม่พบเที่ยวบินในรัศมีที่เลือกขณะนี้</span>
          </div>
        ) : (
          activeFlights.map((flight) => {
            const isArrival = flight.direction === 'ARRIVAL';
            const isBkk = flight.airport === 'BKK';

            return (
              <div
                key={flight.icao24 + flight.callsign}
                onClick={() => onSelectFlight(flight)}
                className="pt-1.5 first:pt-0 p-2 rounded-2xl hover:bg-slate-900/90 border border-transparent hover:border-slate-700/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isBkk ? 'bg-blue-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-mono font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                      {flight.callsign}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {flight.airline}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 flex-shrink-0 ${
                      isArrival
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isArrival ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                    <span>{flight.status}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-1 font-medium">
                    <span>{flight.routeOrigin || 'BKK'}</span>
                    <span className="text-slate-500">➔</span>
                    <span>{flight.routeDestination || 'Arrival'}</span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({flight.airport})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    <span>{flight.altitudeFeet.toLocaleString()} ft</span>
                    <span>•</span>
                    <span>{flight.speedKmh} km/h</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>คลิกเที่ยวบินเพื่อส่องกล้องพิกัด</span>
        <span>ADS-B OpenSky Feed</span>
      </div>
    </div>
  );
};
