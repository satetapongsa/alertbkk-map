'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap,
  X,
  Search,
  Navigation,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';
import { BANGKOK_POWER_SUBSTATIONS, PowerSubstation } from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokPowerGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords: (lat: number, lng: number) => void;
}

export const BangkokPowerGridModal: React.FC<BangkokPowerGridModalProps> = ({
  isOpen,
  onClose,
  onFlyToCoords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSubstations = useMemo(() => {
    return BANGKOK_POWER_SUBSTATIONS.filter((sub) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        sub.name.toLowerCase().includes(q) ||
        sub.meaDistrict.toLowerCase().includes(q) ||
        sub.servicingZone.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const handleWarp = (lat: number, lng: number) => {
    tacticalAudio.playTacticalBeep(880, 0.04);
    onClose();
    onFlyToCoords(lat, lng);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/70 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-wide">
                  Bangkok Power Grid & Electrical Substations
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  MEA TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                สถานะความปลอดภัยสถานีไฟฟ้าแรงสูง กฟน. แนวกั้นน้ำ และระบบตัดไฟฉุกเฉิน
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

        {/* Safety Warning Banner */}
        <div className="px-5 py-3 bg-amber-950/30 border-b border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            หากพบเห็นสายไฟฟ้าขาดตกน้ำ เสาไฟเอียง หรือมีประกายไฟ ห้ามเข้าใกล้ในระยะ 10 เมตร ให้แจ้งการไฟฟ้านครหลวง (กฟน.) ทันทีที่สายด่วน 1130 หรือแจ้งผ่านแอปพลิเคชัน MEA Smart Life
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสถานีไฟฟ้า, เขต, หรือพื้นที่บริการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* List of Substations */}
        <div className="p-4 overflow-y-auto space-y-3">
          {filteredSubstations.map((sub) => {
            const isOnline = sub.status === 'ONLINE';
            return (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm tracking-wide">
                        {sub.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        {sub.voltageKv}
                      </span>
                      {sub.emergencyFeederReady && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          สายป้อนสำรอง รพ. พร้อม
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      พื้นที่ควบคุม: <span className="text-slate-200">{sub.meaDistrict}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                      isOnline
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isOnline ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{sub.statusTh}</span>
                  </span>
                </div>

                {/* Servicing Zone & Safety Advisory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] mb-0.5">พื้นที่บริการจ่ายกระแสไฟ:</span>
                    <span className="text-slate-200 font-medium">{sub.servicingZone}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] mb-0.5">มาตรการป้องกันน้ำท่วมสถานี:</span>
                    <span className="text-amber-300 font-medium">{sub.safetyAdvisoryTh}</span>
                  </div>
                </div>

                {/* Stats Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">คันกั้นน้ำสถานี</span>
                    <span className="text-cyan-400 font-bold">+{sub.floodBarrierMsl.toFixed(1)} ม. รทก.</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">พิกัด GPS</span>
                    <span className="text-slate-300 text-[11px]">{sub.lat.toFixed(3)}, {sub.lng.toFixed(3)}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ศูนย์ควบคุม</span>
                    <span className="text-emerald-400 font-bold">เปิด 24 ชม.</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <a
                    href="tel:1130"
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>แจ้งเหตุด่วน กฟน.: 1130</span>
                  </a>

                  <button
                    onClick={() => handleWarp(sub.lat, sub.lng)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>ส่องพิกัดสถานีไฟฟ้า</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Metropolitan Electricity Authority (MEA) Disaster Resilience Telemetry</span>
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
