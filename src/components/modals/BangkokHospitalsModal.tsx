'use client';

import React, { useState, useMemo } from 'react';
import {
  Hospital,
  X,
  Search,
  PhoneCall,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Bed,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { BANGKOK_HOSPITALS, HospitalReadiness } from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokHospitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords: (lat: number, lng: number) => void;
}

export const BangkokHospitalsModal: React.FC<BangkokHospitalsModalProps> = ({
  isOpen,
  onClose,
  onFlyToCoords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrauma, setFilterTrauma] = useState<'ALL' | 'LEVEL_1' | 'LEVEL_2'>('ALL');

  if (!isOpen) return null;

  const filteredHospitals = useMemo(() => {
    return BANGKOK_HOSPITALS.filter((hosp) => {
      const matchesTrauma = filterTrauma === 'ALL' || hosp.traumaLevel === filterTrauma;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        hosp.name.toLowerCase().includes(q) ||
        hosp.district.toLowerCase().includes(q) ||
        hosp.accessStatusTh.toLowerCase().includes(q);
      return matchesTrauma && matchesSearch;
    });
  }, [searchQuery, filterTrauma]);

  const handleWarp = (lat: number, lng: number) => {
    tacticalAudio.playTacticalBeep(880, 0.04);
    onClose();
    onFlyToCoords(lat, lng);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/70 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-wide">
                  Bangkok Trauma Hospitals & Flood Accessibility
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  TRAUMA NET
                </span>
              </div>
              <p className="text-xs text-slate-400">
                สถานะห้องฉุกเฉิน เส้นทางรถพยาบาลเข้าถึง และระบบสำรองไฟ 7 โรงพยาบาลหลัก กทม.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโรงพยาบาล, เขต, หรือเส้นทางเข้าถึง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            <button
              onClick={() => setFilterTrauma('ALL')}
              className={`px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium ${
                filterTrauma === 'ALL'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              ทั้งหมด ({BANGKOK_HOSPITALS.length})
            </button>
            <button
              onClick={() => setFilterTrauma('LEVEL_1')}
              className={`px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium ${
                filterTrauma === 'LEVEL_1'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              ศูนย์อุบัติเหตุระดับ 1
            </button>
          </div>
        </div>

        {/* List of Hospitals */}
        <div className="p-4 overflow-y-auto space-y-3">
          {filteredHospitals.map((hosp) => {
            const isAvailable = hosp.erBedStatus === 'AVAILABLE';
            return (
              <div
                key={hosp.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm tracking-wide">
                        {hosp.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {hosp.traumaLevel === 'LEVEL_1' ? 'ศูนย์อุบัติเหตุระดับ 1' : 'ศูนย์อุบัติเหตุระดับ 2'}
                      </span>
                      {hosp.helipadReady && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          ลานจอด ฮ. พร้อม
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      เขตพื้นที่: <span className="text-slate-200">{hosp.district}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isAvailable ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{hosp.erBedStatusTh}</span>
                  </span>
                </div>

                {/* Access Route & Safety Telemetry */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                  <div className="text-slate-400 mb-1">สถานะเส้นทางรถพยาบาลเข้าสู่โรงพยาบาล:</div>
                  <div className="text-emerald-300 font-medium">{hosp.accessStatusTh}</div>
                </div>

                {/* Stats Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">คันกั้นน้ำ รทก.</span>
                    <span className="text-cyan-400 font-bold">+{hosp.floodBarrierMsl.toFixed(1)} ม.</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ไฟสำรองฉุกเฉิน</span>
                    <span className="text-emerald-400 font-bold">{hosp.generatorBackupHours} ชั่วโมง</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ออกซิเจนสำรอง</span>
                    <span className="text-indigo-400 font-bold">{hosp.oxygenSupplyDays} วัน</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">พิกัด GPS</span>
                    <span className="text-slate-300 text-[11px]">{hosp.lat.toFixed(3)}, {hosp.lng.toFixed(3)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <a
                    href={`tel:${hosp.emergencyTel}`}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>สายด่วนฉุกเฉิน: {hosp.emergencyTel}</span>
                  </a>

                  <button
                    onClick={() => handleWarp(hosp.lat, hosp.lng)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ส่องพิกัดแผนที่</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Bangkok Emergency Medical Services & BMA Hospital Telemetry</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
