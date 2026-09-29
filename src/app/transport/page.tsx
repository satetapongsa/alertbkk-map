'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { PageNavigationTabs } from '@/components/PageNavigationTabs';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AirportFlightRadarSection } from '@/components/transit/AirportFlightRadarSection';
import { TransportLine } from '@/types';
import { BANGKOK_TRANSIT_LINES } from '@/lib/transit-data';
import {
  Train,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  MapPin,
} from 'lucide-react';

export default function TransportPage() {
  const [lines, setLines] = useState<TransportLine[]>(BANGKOK_TRANSIT_LINES);
  const [filterType, setFilterType] = useState<'ALL' | 'BTS' | 'MRT' | 'ARL' | 'SRT' | 'BUS'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/transport');
      const data = await res.json();
      if (data.success && data.data) {
        setLines(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredLines =
    filterType === 'ALL' ? lines : lines.filter((l) => l.type === filterType);

  const delayedCount = lines.filter((l) => l.status === 'DELAYED' || l.status === 'SERVICE_DISRUPTION').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-6 space-y-5 flex-1">
        {/* Universal Page Switcher Navigation Tabs (Desktop / Tablet) */}
        <div className="hidden md:block">
          <PageNavigationTabs />
        </div>

        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                <Train className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Bangkok Mass Rapid Transit Operations
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Live status, technical delays, and service updates across BTS Skytrain, MRT Subway, ARL, and SRT lines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer select-none"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View On Map</span>
            </a>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Monitored Lines</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{lines.length} Lines</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Train className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Normal Operations</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {lines.length - delayedCount} Lines
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Delayed / Disrupted</p>
              <p className="text-xl font-extrabold text-amber-400 mt-0.5">{delayedCount} Lines</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['ALL', 'BTS', 'MRT', 'ARL', 'SRT', 'BUS'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {t === 'ALL' ? 'All Networks' : t === 'BUS' ? 'City Bus Routes' : `${t} Lines`}
            </button>
          ))}
        </div>

        {/* Lines Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLines.map((line) => {
            const isDelayed = line.status === 'DELAYED';
            const isDisrupted = line.status === 'SERVICE_DISRUPTION';

            return (
              <div
                key={line.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 shadow-xl ${
                  isDelayed
                    ? 'bg-amber-950/20 border-amber-700/50'
                    : isDisrupted
                    ? 'bg-red-950/20 border-red-700/50'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-8 rounded-full"
                        style={{ backgroundColor: line.colorCode }}
                      />
                      <div>
                        <h3 className="font-bold text-base text-white">{line.nameEn || line.name}</h3>
                        <p className="text-xs text-slate-400">{line.name}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isDelayed
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                          : isDisrupted
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isDelayed ? 'Delayed Service' : isDisrupted ? 'Disrupted' : 'Normal'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                    {line.statusDetail || 'Train operations are running on scheduled timetable.'}
                  </p>

                  {line.affectedStations && line.affectedStations.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Affected Stations: <strong>{line.affectedStations.join(' ➔ ')}</strong></span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1" suppressHydrationWarning>
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Last Updated: {new Date(line.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <Link
                    href={`/?type=TRANSIT`}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <span>View Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Airport Flight Schedule & Airspace Radar (Suvarnabhumi BKK & Don Mueang DMK) */}
        <AirportFlightRadarSection />
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
