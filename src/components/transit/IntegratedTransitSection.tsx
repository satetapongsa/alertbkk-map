'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TransportLine } from '@/types';
import { BANGKOK_TRANSIT_LINES } from '@/lib/transit-data';
import {
  Train,
  Bus,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
} from 'lucide-react';

export function IntegratedTransitSection() {
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
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Train className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Metropolitan Rapid Transit & City Bus Network
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Live operational status across BTS Skytrain, MRT Subway, SRT Red Lines, Airport Rail Link, and BMTA bus corridors
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isRefreshing}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          <span>{isRefreshing ? 'Updating...' : 'Sync Timetable'}</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Monitored Routes</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{lines.length} Lines</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Normal Operation</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{lines.length - delayedCount} Lines</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Delayed Service</p>
            <p className="text-xl font-extrabold text-amber-400 mt-0.5">{delayedCount} Lines</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['ALL', 'BTS', 'MRT', 'ARL', 'SRT', 'BUS'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === t
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            {t === 'BUS' ? <Bus className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
            <span>{t === 'ALL' ? 'All Networks' : t === 'BUS' ? 'City Bus Routes' : `${t} Lines`}</span>
          </button>
        ))}
      </div>

      {/* Line Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredLines.map((line) => {
          const isDelayed = line.status === 'DELAYED';
          const isDisrupted = line.status === 'SERVICE_DISRUPTION';
          const isBus = line.type === 'BUS';

          return (
            <div
              key={line.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-lg ${
                isDelayed
                  ? 'bg-amber-950/20 border-amber-700/50'
                  : isDisrupted
                  ? 'bg-red-950/20 border-red-700/50'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-7 rounded-full flex-shrink-0"
                      style={{ backgroundColor: line.colorCode }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white">{line.nameEn || line.name}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {line.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{line.name}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isDelayed
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        : isDisrupted
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isDelayed ? 'Delayed' : isDisrupted ? 'Disrupted' : 'Normal'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  {line.statusDetail || 'Vehicles running on regular timetable schedule.'}
                </p>

                {line.affectedStations && line.affectedStations.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Affected Stations: <strong>{line.affectedStations.join(' ➔ ')}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1" suppressHydrationWarning>
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Updated: {new Date(line.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <Link
                  href={`/?type=TRANSIT`}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-xs"
                >
                  <span>Track on Map</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
