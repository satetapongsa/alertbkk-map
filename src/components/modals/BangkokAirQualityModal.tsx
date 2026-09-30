'use client';

import React from 'react';
import {
  X,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Info,
  Navigation,
  Thermometer,
  Droplets,
  HeartPulse,
} from 'lucide-react';
import { BANGKOK_PM25_STATIONS, AirQualityStation } from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokAirQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords?: (lat: number, lng: number) => void;
}

export const BangkokAirQualityModal: React.FC<BangkokAirQualityModalProps> = ({
  isOpen,
  onClose,
  onFlyToCoords,
}) => {
  if (!isOpen) return null;

  const handleFlyTo = (lat: number, lng: number) => {
    tacticalAudio.playRadarPing();
    if (onFlyToCoords) {
      onFlyToCoords(lat, lng);
      onClose();
    }
  };

  const avgPm25 = (
    BANGKOK_PM25_STATIONS.reduce((sum, s) => sum + s.pm25, 0) / BANGKOK_PM25_STATIONS.length
  ).toFixed(1);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  ดัชนีคุณภาพอากาศและฝุ่น PM2.5 กทม. (AirBKK)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  AIR-TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                สถานีตรวจวัดคุณภาพอากาศ กรมควบคุมมลพิษและกรุงเทพมหานคร
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Citywide Summary Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">ค่าเฉลี่ยฝุ่น PM2.5 ทั่วกรุงเทพมหานคร</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-extrabold text-xl text-emerald-400">{avgPm25}</span>
              <span className="text-[10px] text-slate-400 font-mono">ไมโครกรัม/ลบ.ม. (ug/m3)</span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-block mb-0.5">
              คุณภาพอากาศโดยรวม: ปานกลางถึงดี
            </span>
            <p className="text-[10px] text-slate-400">ประชาชนทั่วไปทำกิจกรรมกลางแจ้งได้ตามปกติ</p>
          </div>
        </div>

        {/* Stations List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          {BANGKOK_PM25_STATIONS.map((station) => {
            const isGood = station.status === 'VERY_GOOD' || station.status === 'GOOD';
            return (
              <div
                key={station.id}
                className="p-3.5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-2 hover:border-teal-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-white">{station.stationName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        เขต{station.district}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{station.healthAdviceTh}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-baseline justify-end gap-1">
                      <span
                        className="font-mono font-extrabold text-base"
                        style={{ color: station.colorHex }}
                      >
                        {station.pm25}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">ug/m3</span>
                    </div>
                    <span
                      className="text-[9px] font-mono font-bold px-2 py-0.2 rounded-full border inline-block"
                      style={{
                        backgroundColor: `${station.colorHex}20`,
                        borderColor: `${station.colorHex}40`,
                        color: station.colorHex,
                      }}
                    >
                      AQI {station.aqi} • {station.statusTh}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400" />
                      <span>{station.temperatureC}°C</span>
                    </span>
                    <span>ความชื้น: {station.humidityPct}%</span>
                    <span>{station.lastUpdated}</span>
                  </div>

                  {onFlyToCoords && (
                    <button
                      onClick={() => handleFlyTo(station.lat, station.lng)}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                      title="ดูพิกัดสถานีตรวจวัดคุณภาพอากาศ"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>ส่องหมุด</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>เกณฑ์มาตรฐาน: PM2.5 ไม่เกิน 37.5 ug/m3 ถือว่าอยู่ในเกณฑ์ปลอดภัย</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
