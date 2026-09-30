'use client';

import React, { useState, useMemo } from 'react';
import {
  Ship,
  X,
  Search,
  Navigation,
  Waves,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Anchor,
} from 'lucide-react';
import { BANGKOK_WATERWAYS, WaterwayPier } from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokWaterwaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords: (lat: number, lng: number) => void;
}

export const BangkokWaterwaysModal: React.FC<BangkokWaterwaysModalProps> = ({
  isOpen,
  onClose,
  onFlyToCoords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<'ALL' | 'CHAO_PHRAYA_EXPRESS' | 'KHLONG_SAEN_SAEP' | 'KHLONG_PHADUNG'>('ALL');

  if (!isOpen) return null;

  const filteredPiers = useMemo(() => {
    return BANGKOK_WATERWAYS.filter((pier) => {
      const matchesType = activeType === 'ALL' || pier.waterwayType === activeType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pier.name.toLowerCase().includes(q) ||
        pier.waterwayName.toLowerCase().includes(q) ||
        pier.district.toLowerCase().includes(q) ||
        pier.connectingTransit.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [searchQuery, activeType]);

  const handleWarp = (lat: number, lng: number) => {
    tacticalAudio.playTacticalBeep(880, 0.04);
    onClose();
    onFlyToCoords(lat, lng);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-sky-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/70 border-b border-sky-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-wide">
                  Bangkok Waterways & Public Boat Telemetry
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                  RIVER TRANSIT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                สถานะท่าเรือโดยสารแม่น้ำเจ้าพระยา คลองแสนแสบ และเรือไฟฟ้าคลองผดุงฯ ช่วงน้ำหลาก
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

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อท่าเรือ, คลอง, หรือสถานีเชื่อมต่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setActiveType('ALL')}
              className={`px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium whitespace-nowrap ${
                activeType === 'ALL'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              ทั้งหมด ({BANGKOK_WATERWAYS.length})
            </button>
            <button
              onClick={() => setActiveType('CHAO_PHRAYA_EXPRESS')}
              className={`px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium whitespace-nowrap ${
                activeType === 'CHAO_PHRAYA_EXPRESS'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              เจ้าพระยา
            </button>
            <button
              onClick={() => setActiveType('KHLONG_SAEN_SAEP')}
              className={`px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium whitespace-nowrap ${
                activeType === 'KHLONG_SAEN_SAEP'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              คลองแสนแสบ
            </button>
            <button
              onClick={() => setActiveType('KHLONG_PHADUNG')}
              className={`px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium whitespace-nowrap ${
                activeType === 'KHLONG_PHADUNG'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              เรือไฟฟ้า EV
            </button>
          </div>
        </div>

        {/* List of Waterway Piers */}
        <div className="p-4 overflow-y-auto space-y-3">
          {filteredPiers.map((pier) => {
            const isNormal = pier.serviceStatus === 'NORMAL';
            return (
              <div
                key={pier.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm tracking-wide">
                        {pier.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {pier.waterwayName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      เขตพื้นที่: <span className="text-slate-200">{pier.district}</span>
                      <span className="mx-2 text-slate-600">|</span>
                      เชื่อมต่อ: <span className="text-cyan-300 font-medium">{pier.connectingTransit}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                      isNormal
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isNormal ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{pier.serviceStatusTh}</span>
                  </span>
                </div>

                {/* Hydro & Wave Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] mb-0.5">สภาพคลื่นและทุ่นเทียบเรือ:</span>
                    <span className="text-slate-200 font-medium">{pier.currentWaveConditionTh}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] mb-0.5">ข้อแนะนำความปลอดภัย:</span>
                    <span className="text-sky-300 font-medium">{pier.safetyAdviceTh}</span>
                  </div>
                </div>

                {/* Actions & Hours */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>เวลาเดินเรือ: {pier.operatingHours}</span>
                  </span>

                  <button
                    onClick={() => handleWarp(pier.lat, pier.lng)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    <span>ส่องพิกัดท่าเรือ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Marine Department & Bangkok Waterway Telemetry</span>
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
