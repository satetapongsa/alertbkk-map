'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plane,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Navigation,
  RefreshCw,
  Gauge,
  Radio,
  ExternalLink,
  MapPin,
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
  LayoutGrid,
  Table,
} from 'lucide-react';
import { FlightItem, AirportFlightResponse } from '@/app/api/flights/route';

export function AirportFlightRadarSection() {
  const [data, setData] = useState<AirportFlightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAirport, setSelectedAirport] = useState<'ALL' | 'BKK' | 'DMK'>('ALL');
  const [selectedFlight, setSelectedFlight] = useState<FlightItem | null>(null);
  const [viewMode, setViewMode] = useState<'SCHEDULE_TABLE' | 'CARDS'>('SCHEDULE_TABLE');

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/flights');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load flights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/flights')
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success) {
          setData(json);
        }
      })
      .catch((err) => console.error('Failed to load flights:', err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    const interval = setInterval(() => {
      fetch('/api/flights')
        .then((res) => res.json())
        .then((json) => {
          if (!ignore && json.success) setData(json);
        })
        .catch((err) => console.error(err));
    }, 20000); // 20s poll

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  const bkkFlights = data?.airports.suvarnabhumi.flights || [];
  const dmkFlights = data?.airports.donmueang.flights || [];

  const displayFlights =
    selectedAirport === 'BKK'
      ? bkkFlights
      : selectedAirport === 'DMK'
      ? dmkFlights
      : [...bkkFlights, ...dmkFlights].sort((a, b) => a.distanceToAirportKm - b.distanceToAirportKm);

  return (
    <section id="flights" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Plane className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Live Airport Radar & Flight Schedule
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time ADS-B airspace tracking, routes, and flight timetables for Suvarnabhumi (BKK) & Don Mueang (DMK)
          </p>
        </div>

        {/* Airport Switcher Tabs, View Mode Toggle & Live Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Airport Filter */}
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedAirport('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedAirport === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({data?.totalAirborneInBKKBasin || 0})
            </button>
            <button
              onClick={() => setSelectedAirport('BKK')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedAirport === 'BKK'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BKK ({bkkFlights.length})
            </button>
            <button
              onClick={() => setSelectedAirport('DMK')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedAirport === 'DMK'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DMK ({dmkFlights.length})
            </button>
          </div>

          {/* Table vs Card View Toggle */}
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('SCHEDULE_TABLE')}
              className={`p-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'SCHEDULE_TABLE'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Flight Schedule Timetable"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="ADS-B Telemetry Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchFlights}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Live Flight Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Airport Dual Sector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Suvarnabhumi VTBS Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
              BKK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm">Suvarnabhumi Airport</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  VTBS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Bang Phli, Samut Prakan (Latitude 13.6899° N)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-black text-cyan-300 font-mono">
              {data?.airports.suvarnabhumi.activeFlightsCount || 0}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Sector Inbound/Out</div>
          </div>
        </div>

        {/* Don Mueang VTBD Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm">
              DMK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm">Don Mueang International</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  VTBD
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Don Mueang, Bangkok (Latitude 13.9126° N)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-black text-amber-300 font-mono">
              {data?.airports.donmueang.activeFlightsCount || 0}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Sector Inbound/Out</div>
          </div>
        </div>
      </div>

      {/* Flight Schedule Table / Timetable (Grid Format) */}
      {viewMode === 'SCHEDULE_TABLE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Flight Timetable & Flight Routes ({displayFlights.length})</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Live Airport Terminal FIDS</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Flight / Airline</th>
                  <th className="py-3 px-4">Airport</th>
                  <th className="py-3 px-4">Flight Route Path</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Gate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayFlights.map((f) => {
                  const isBkk = f.airport === 'BKK';
                  const isLanding = f.status === 'LANDING';
                  const isClimbing = f.status === 'CLIMBING';
                  const isGround = f.status === 'ON_GROUND';

                  return (
                    <tr
                      key={f.icao24 + f.callsign}
                      onClick={() => setSelectedFlight(f)}
                      className={`hover:bg-slate-850/80 transition-colors cursor-pointer ${
                        selectedFlight?.icao24 === f.icao24 ? 'bg-slate-800/90' : ''
                      }`}
                    >
                      {/* Callsign & Airline */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Plane className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <div>
                            <span className="font-extrabold text-sm text-white">{f.callsign}</span>
                            <p className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">{f.airline}</p>
                          </div>
                        </div>
                      </td>

                      {/* Airport Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isBkk
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          }`}
                        >
                          {f.airport}
                        </span>
                      </td>

                      {/* Flight Route Path (Origin -> Destination) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                          <span className="text-slate-300">{f.routeOrigin || 'Bangkok'}</span>
                          <ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="text-white">{f.routeDestination || 'Arrival'}</span>
                        </div>
                      </td>

                      {/* Schedule Time */}
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{f.scheduledTime || f.timeFormatted}</span>
                        </div>
                      </td>

                      {/* Gate */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-bold text-[11px]">
                          {f.gate || 'TBA'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            isLanding
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse'
                              : isClimbing
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : isGround
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {isLanding && <ArrowDownRight className="w-3 h-3 text-emerald-400" />}
                          {isClimbing && <ArrowUpRight className="w-3 h-3 text-cyan-400" />}
                          <span>{f.status}</span>
                        </span>
                      </td>

                      {/* Distance */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-cyan-300">{f.distanceToAirportKm} km</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flight Schedule Table / Telemetry Feed (Card Mode) */}
      {viewMode === 'CARDS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Active Airborne Aircraft Trajectories ({displayFlights.length})</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Live ADS-B Radar Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayFlights.map((f) => {
              const isBkk = f.airport === 'BKK';
              const isLanding = f.status === 'LANDING';
              const isClimbing = f.status === 'CLIMBING';
              const isGround = f.status === 'ON_GROUND';

              return (
                <div
                  key={f.icao24 + f.callsign}
                  onClick={() => setSelectedFlight(f)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                    selectedFlight?.icao24 === f.icao24
                      ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {/* Flight Top Row: Callsign & Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isBkk
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {f.airport}
                      </span>
                      <div>
                        <span className="font-extrabold text-sm text-white font-mono tracking-wider">
                          {f.callsign}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{f.airline}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        isLanding
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse'
                          : isClimbing
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : isGround
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {isLanding && <ArrowDownRight className="w-3 h-3 text-emerald-400" />}
                      {isClimbing && <ArrowUpRight className="w-3 h-3 text-cyan-400" />}
                      <span>{f.status}</span>
                    </span>
                  </div>

                  {/* Route Bar */}
                  <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 text-[11px] truncate max-w-[110px]">{f.routeOrigin || 'BKK'}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0 mx-1" />
                    <span className="text-white text-[11px] font-bold truncate max-w-[110px]">{f.routeDestination || 'DMK'}</span>
                    <span className="text-[10px] text-slate-400 ml-1">Gate {f.gate || 'TBA'}</span>
                  </div>

                  {/* Telemetry Metrics: Altitude, Speed, Distance */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800/60 text-center font-mono text-[11px] mb-2">
                    <div>
                      <div className="text-[9px] uppercase text-slate-500">Altitude</div>
                      <div className="font-bold text-slate-200">
                        {f.altitudeFeet.toLocaleString()} <span className="text-[9px] text-slate-500">ft</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-slate-500">Speed</div>
                      <div className="font-bold text-slate-200">
                        {f.speedKmh} <span className="text-[9px] text-slate-500">km/h</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-slate-500">Range</div>
                      <div className="font-bold text-cyan-300">
                        {f.distanceToAirportKm} <span className="text-[9px] text-slate-500">km</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Heading vector & Coordinates */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900 font-mono">
                    <div className="flex items-center gap-1">
                      <Navigation
                        className="w-3 h-3 text-cyan-400"
                        style={{ transform: `rotate(${f.heading}deg)` }}
                      />
                      <span>{f.heading}° Vector</span>
                    </div>
                    <span className="text-slate-500">
                      {f.latitude.toFixed(2)}°N, {f.longitude.toFixed(2)}°E
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Flight Live Radar Drawer */}
      {selectedFlight && (
        <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">
                  Flight {selectedFlight.callsign} &bull; {selectedFlight.airline}
                </h4>
                <p className="text-xs text-slate-400">
                  Target Airport: {selectedFlight.airportName} &bull; Country of Registry: {selectedFlight.originCountry}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/?type=GENERAL`}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-cyan-400 transition-colors"
              >
                <span>View On Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedFlight(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block">Flight ICAO24</span>
              <span className="text-slate-200 font-bold text-sm">{selectedFlight.icao24}</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block">Vertical Velocity</span>
              <span className="text-slate-200 font-bold text-sm">
                {selectedFlight.verticalRateMs > 0 ? `+${selectedFlight.verticalRateMs}` : selectedFlight.verticalRateMs} m/s
              </span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block">Proximity Distance</span>
              <span className="text-cyan-300 font-bold text-sm">{selectedFlight.distanceToAirportKm} km to runway</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block">Radar Squawk</span>
              <span className="text-emerald-400 font-bold text-sm">{selectedFlight.squawk || 'Standard Transponder'}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
