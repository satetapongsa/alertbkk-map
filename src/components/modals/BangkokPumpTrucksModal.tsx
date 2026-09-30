'use client';

import React from 'react';
import {
  X,
  Truck,
  Droplets,
  PhoneCall,
  Activity,
  CheckCircle2,
  Navigation,
  Clock,
  Gauge,
  Waves,
} from 'lucide-react';
import { BANGKOK_PUMP_TRUCKS, PumpTruckUnit } from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokPumpTrucksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords?: (lat: number, lng: number) => void;
}

export const BangkokPumpTrucksModal: React.FC<BangkokPumpTrucksModalProps> = ({
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

  const handleCall = (tel: string) => {
    tacticalAudio.playEmergencyChime();
    window.location.href = `tel:${tel}`;
  };

  const totalCapacityLps = BANGKOK_PUMP_TRUCKS.reduce((sum, p) => sum + p.pumpCapacityLps, 0);
  const activePumpingCount = BANGKOK_PUMP_TRUCKS.filter((p) => p.status === 'PUMPING').length;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  หน่วยสูบน้ำเคลื่อนที่เร็ว กทม. (BMA Mobile Pump Units)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  หน่วยเบสท์ (BEST)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                พิกัดรถสูบน้ำแรงดันสูงเคลื่อนที่เร็วประจำจุดเสี่ยงน้ำท่วมขังกรุงเทพมหานคร
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

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-850 border border-slate-750">
            <span className="text-[10px] text-slate-400 block mb-0.5">ประจำจุดปฏิบัติการ</span>
            <span className="font-mono font-extrabold text-base text-cyan-300">
              {BANGKOK_PUMP_TRUCKS.length} คัน
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-850 border border-slate-750">
            <span className="text-[10px] text-slate-400 block mb-0.5">กำลังเดินเครื่องสูบน้ำ</span>
            <span className="font-mono font-extrabold text-base text-emerald-400">
              {activePumpingCount} คัน
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-850 border border-slate-750">
            <span className="text-[10px] text-slate-400 block mb-0.5">กำลังสูบรวมทั้งหมด</span>
            <span className="font-mono font-extrabold text-base text-sky-300">
              {(totalCapacityLps / 1000).toFixed(1)} ลบ.ม./วินาที
            </span>
          </div>
        </div>

        {/* Mobile Pump Units List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          {BANGKOK_PUMP_TRUCKS.map((unit) => {
            const isPumping = unit.status === 'PUMPING';
            return (
              <div
                key={unit.id}
                className="p-3.5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-2 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-white">{unit.locationName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {unit.unitCode}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      เขต{unit.district} • ระบายลง: <strong className="text-cyan-300">{unit.dischargingTo}</strong>
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border flex-shrink-0 flex items-center gap-1 ${
                      isPumping
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {isPumping && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                    <span>{isPumping ? 'กำลังสูบน้ำ' : 'สแตนด์บายพร้อมสูบ'}</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-3 text-slate-300 font-mono">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>กำลังสูบ: <strong>{unit.pumpCapacityLps}</strong> ลิตร/วินาที</span>
                    </span>
                    <span className="hidden sm:inline text-slate-600">|</span>
                    <span className="hidden sm:inline text-slate-400">{unit.lastUpdated}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCall(unit.contactTel)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                      title="โทรประสานงานหน่วยสูบน้ำประจำจุด"
                    >
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      <span>{unit.contactTel}</span>
                    </button>

                    {onFlyToCoords && (
                      <button
                        onClick={() => handleFlyTo(unit.lat, unit.lng)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                        title="ดูตำแหน่งรถสูบน้ำบนแผนที่"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>ส่องหมุด</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>ศูนย์ควบคุมระบบป้องกันน้ำท่วม สำนักการระบายน้ำ กทม. โทร: 02-248-5115</span>
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
