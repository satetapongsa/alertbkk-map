'use client';

import React from 'react';
import {
  X,
  Package,
  PhoneCall,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
} from 'lucide-react';
import { BANGKOK_RELIEF_DEPOTS, DistrictReliefDepot } from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokSandbagDepotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords?: (lat: number, lng: number) => void;
}

export const BangkokSandbagDepotModal: React.FC<BangkokSandbagDepotModalProps> = ({
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

  const totalSandbags = BANGKOK_RELIEF_DEPOTS.reduce((sum, d) => sum + d.sandbagStock, 0);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  จุดแจกกระสอบทรายและศูนย์ช่วยเหลือประจำเขต กทม.
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SANDBAG-DEPOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                จุดรับกระสอบทรายฟรีกั้นน้ำเข้าบ้านและบริการช่วยเหลือผู้ประสบภัย 50 เขต
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

        {/* Notice Info Card */}
        <div className="p-3.5 bg-amber-950/20 border-b border-amber-500/30 flex items-start gap-2.5 text-xs">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-200 block mb-0.5">
              ข้อกำหนดการขอรับกระสอบทรายป้องกันน้ำท่วม กทม.:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ประชาชนที่มีที่อยู่อาศัยในจุดเสี่ยงริมน้ำหรือน้ำท่วมขัง สามารถนำบัตรประจำตัวประชาชนไปติดต่อขอรับได้ฟรี ณ ฝ่ายโยธา สำนักงานเขตของท่าน (เฉลี่ยหลังคาเรือนละ 10-20 กระสอบ)
            </p>
          </div>
        </div>

        {/* Depots List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          {BANGKOK_RELIEF_DEPOTS.map((depot) => {
            const isAvailable = depot.sandbagStatus === 'AVAILABLE';
            return (
              <div
                key={depot.id}
                className="p-3.5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-2 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-white">{depot.officeName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">เขต{depot.district}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border flex-shrink-0 ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    คงเหลือ {depot.sandbagStock.toLocaleString()} ใบ
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {depot.services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px]"
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    สถานะ: <strong className={isAvailable ? 'text-emerald-400' : 'text-amber-400'}>{depot.sandbagStatusTh}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCall(depot.contactTel)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                      title="โทรสอบถามสำนักงานเขต"
                    >
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      <span>{depot.contactTel}</span>
                    </button>

                    {onFlyToCoords && (
                      <button
                        onClick={() => handleFlyTo(depot.lat, depot.lng)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                        title="ดูพิกัดสำนักงานเขตบนแผนที่"
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
          <span>รวมยอดกระสอบทรายพร้อมแจกจ่ายในระบบ: {totalSandbags.toLocaleString()} ใบ</span>
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
