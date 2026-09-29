'use client';

import React from 'react';
import {
  Gauge,
  Waves,
  Plane,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface MapFloatingToolsProps {
  onOpenVehicleSimulator: () => void;
  onOpenWaterTide: () => void;
  onOpenFlightRadar: () => void;
  onOpenHazardScanner: () => void;
}

export const MapFloatingTools: React.FC<MapFloatingToolsProps> = ({
  onOpenVehicleSimulator,
  onOpenWaterTide,
  onOpenFlightRadar,
  onOpenHazardScanner,
}) => {
  const triggerTool = (fn: () => void) => {
    tacticalAudio.playTacticalBeep(880, 0.04);
    fn();
  };

  return (
    <div className="flex flex-col gap-1.5 pointer-events-auto">
      {/* 1. Vehicle Clearance Simulator */}
      <button
        onClick={() => triggerTool(onOpenVehicleSimulator)}
        title="เครื่องคำนวณความเสี่ยงระดับน้ำท่วมตามรุ่นรถ (Vehicle Clearance Calculator)"
        className="group flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-cyan-500/50 p-2 sm:px-3 sm:py-2 rounded-2xl shadow-xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold hidden md:inline">ตรวจน้ำท่วมตามรุ่นรถ</span>
      </button>

      {/* 2. Chao Phraya Tide & Sluice Gates Level */}
      <button
        onClick={() => triggerTool(onOpenWaterTide)}
        title="ระดับน้ำแม่น้ำเจ้าพระยาและประตูระบายน้ำ กทม. (River Tides & Sluice Gates)"
        className="group flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-sky-500/50 p-2 sm:px-3 sm:py-2 rounded-2xl shadow-xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
          <Waves className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold hidden md:inline">ระดับน้ำเจ้าพระยา</span>
      </button>

      {/* 3. Safe Route Hazard Scanner */}
      <button
        onClick={() => triggerTool(onOpenHazardScanner)}
        title="สแกนเส้นทางปลอดภัย เลี่ยงน้ำท่วมและอุบัติเหตุ (Safe Commute Scanner)"
        className="group flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500/50 p-2 sm:px-3 sm:py-2 rounded-2xl shadow-xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold hidden md:inline">สแกนเส้นทางปลอดภัย</span>
      </button>

      {/* 4. Flight Radar (Suvarnabhumi & Don Mueang) */}
      <button
        onClick={() => triggerTool(onOpenFlightRadar)}
        title="เรดาร์เที่ยวบินสนามบินสุวรรณภูมิ/ดอนเมือง (BKK & DMK Live Flights)"
        className="group flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 p-2 sm:px-3 sm:py-2 rounded-2xl shadow-xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
          <Plane className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold hidden md:inline">เรดาร์สายการบิน</span>
      </button>
    </div>
  );
};
