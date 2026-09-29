'use client';

import React, { useEffect, useState } from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Satellite,
  Radio,
  Compass,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { WeatherTelemetry } from '@/app/api/weather/route';

export function SatelliteWeatherBar() {
  const [telemetry, setTelemetry] = useState<WeatherTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/weather');
      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load weather telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto refresh every 3 minutes
    const interval = setInterval(fetchWeather, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!telemetry && loading) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-cyan-900/30 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span className="font-mono text-[11px] text-cyan-300">ESTABLISHING SATELLITE TELEMETRY UPLINK...</span>
        </div>
      </div>
    );
  }

  if (!telemetry) return null;

  const isRainHigh = telemetry.precipProbability >= 60;
  const isRainModerate = telemetry.precipProbability >= 35 && telemetry.precipProbability < 60;

  return (
    <div className="relative z-40 bg-slate-950/95 border-b border-cyan-500/20 backdrop-blur-md text-slate-200 select-none shadow-lg shadow-cyan-950/20">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-3 text-xs">
        {/* Left: Satellite Orbit & Station Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <Satellite className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold tracking-wider hidden sm:inline">HIMAWARI-9 ORBIT</span>
            <span className="font-semibold tracking-wider sm:hidden">RADAR</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>TMD / BMA Doppler Live</span>
          </div>
        </div>

        {/* Center: Live Met Metrics (Temperature, Sky, Humidity, Wind, Rain Probability) */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar font-mono text-[11px] sm:text-xs">
          {/* Temperature */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white text-[13px]">{telemetry.temperature}°C</span>
            <span className="text-[10px] text-slate-400 hidden lg:inline">({telemetry.apparentTemperature}° feels)</span>
          </div>

          {/* Condition / Sky */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800/80">
            <span className="text-white font-medium">{telemetry.condition}</span>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800/80">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-medium">{telemetry.humidity}%</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">RH</span>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800/80">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-300 font-medium">{telemetry.windSpeed}</span>
            <span className="text-[10px] text-slate-500">km/h</span>
          </div>

          {/* Rain / Precip Probability with colored warning */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${
              isRainHigh
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : isRainModerate
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                : 'bg-cyan-950/40 border-cyan-800/40 text-cyan-300'
            }`}
          >
            <CloudRain className={`w-3.5 h-3.5 ${isRainHigh ? 'animate-bounce text-rose-400' : ''}`} />
            <span>Rain {telemetry.precipProbability}%</span>
          </div>
        </div>

        {/* Right: Expand details toggle & Quick Sync */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 transition-colors"
            title="Toggle Detailed Meteorological Diagnostics"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">{isExpanded ? 'Hide Radar' : 'Telemetry Detail'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={fetchWeather}
            disabled={loading}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
            title="Refresh Weather Telemetry"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Meteorological Diagnostics Drawer */}
      {isExpanded && (
        <div className="border-t border-cyan-900/40 bg-slate-950/98 px-4 py-3 text-xs animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Box 1: Doppler Echo Status */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-cyan-900/40">
              <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
                <span>Doppler Radar Echo</span>
                <span className="text-[9px] text-emerald-400">ONLINE</span>
              </div>
              <p className="font-medium text-slate-200 text-xs mb-1">{telemetry.radarEchoStatus}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{telemetry.tmdRadarStation}</p>
            </div>

            {/* Box 2: Satellite Cloud Cover & Sky Condition */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-cyan-900/40">
              <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 mb-1">
                Cloud Strata & Condition
              </div>
              <p className="font-medium text-slate-200 text-xs mb-1">{telemetry.conditionDescription}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Cloud Cover:</span>
                <span className="font-mono text-cyan-300 font-semibold">{telemetry.cloudCover}%</span>
              </div>
            </div>

            {/* Box 3: Wind Vector & Velocity */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-cyan-900/40">
              <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
                <span>Surface Wind Vector</span>
                <Compass className="w-3 h-3 text-cyan-400" />
              </div>
              <p className="font-medium text-slate-200 text-xs mb-1">
                {telemetry.windSpeed} km/h @ {telemetry.windDirection}° Azimuth
              </p>
              <p className="text-[11px] text-slate-400">Southern Monsoon flow across Chao Phraya basin</p>
            </div>

            {/* Box 4: Early Storm Warning & Telemetry Source */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-cyan-900/40">
              <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
                <span>Satellite Source</span>
                <span className="text-[9px] text-slate-400 font-mono">UTC+7</span>
              </div>
              <p className="font-medium text-slate-200 text-xs mb-1">{telemetry.satelliteOrbit}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                Updated: {telemetry.updatedAt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
