'use client';

import React, { useMemo } from 'react';
import { Incident } from '@/types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  MapPin,
  Navigation,
  Car,
  Droplets,
  Construction,
  Compass,
} from 'lucide-react';

interface SafeRouteHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
  targetCoords: { lat: number; lng: number } | null;
  incidents: Incident[];
  onFlyToIncident: (lat: number, lng: number) => void;
}

export const SafeRouteHazardModal: React.FC<SafeRouteHazardModalProps> = ({
  isOpen,
  onClose,
  userCoords,
  targetCoords,
  incidents,
  onFlyToIncident,
}) => {
  if (!isOpen) return null;

  // Origin & Target
  const origin = userCoords || { lat: 13.7563, lng: 100.5018, label: 'ใจกลาง กทม. (จุดเริ่มต้น)' };
  const destination = targetCoords || { lat: 13.7371, lng: 100.5604, label: 'หมุดปลายทาง (บ้าน / ที่ทำงาน)' };

  // Calculate hazards in bounding corridor
  const hazards = useMemo(() => {
    const minLat = Math.min(origin.lat, destination.lat) - 0.035;
    const maxLat = Math.max(origin.lat, destination.lat) + 0.035;
    const minLng = Math.min(origin.lng, destination.lng) - 0.035;
    const maxLng = Math.max(origin.lng, destination.lng) + 0.035;

    return incidents.filter(
      (inc) =>
        (inc.status === 'ACTIVE' || inc.status === 'MONITORING') &&
        inc.latitude >= minLat &&
        inc.latitude <= maxLat &&
        inc.longitude >= minLng &&
        inc.longitude <= maxLng
    );
  }, [origin, destination, incidents]);

  const floodCount = hazards.filter((h) => h.type === 'FLOOD').length;
  const accidentCount = hazards.filter((h) => h.type === 'ACCIDENT').length;
  const roadClosedCount = hazards.filter((h) => h.type === 'ROAD_CLOSED').length;

  let riskLevel: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (roadClosedCount > 0 || floodCount >= 2 || hazards.length >= 4) {
    riskLevel = 'DANGER';
  } else if (hazards.length > 0) {
    riskLevel = 'CAUTION';
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            riskLevel === 'DANGER'
              ? 'bg-rose-950/70 border-rose-500/40'
              : riskLevel === 'CAUTION'
              ? 'bg-amber-950/60 border-amber-500/40'
              : 'bg-emerald-950/60 border-emerald-500/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold border ${
                riskLevel === 'DANGER'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  : riskLevel === 'CAUTION'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              }`}
            >
              {riskLevel === 'SAFE' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : riskLevel === 'CAUTION' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  วิเคราะห์เส้นทางปลอดภัย (Safe Commute Scan)
                </h2>
              </div>
              <p className="text-[11px] text-slate-300">
                {riskLevel === 'SAFE'
                  ? 'เส้นทางราบรื่น ไม่พบจุดเสี่ยงน้ำท่วมหรืออุบัติเหตุขวางทาง'
                  : riskLevel === 'CAUTION'
                  ? 'พบจุดชะลอตัวหรือแจ้งเตือนในแนวเส้นทาง ควรขับขี่ด้วยความระมัดระวัง'
                  : 'พบจุดน้ำท่วมสูงหรือถนนปิดขวางทาง แนะนำเลี่ยงไปใช้ทางด่วน'}
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

        {/* Origin to Destination Summary */}
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
            <span className="text-slate-400 truncate">
              จาก: <strong className="text-slate-200">{userCoords ? 'ตำแหน่งปัจจุบัน' : 'สยาม/ใจกลาง กทม.'}</strong>
            </span>
          </div>

          <span className="text-slate-600">➔</span>

          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-slate-400 truncate">
              ถึง: <strong className="text-amber-300">{targetCoords ? 'หมุดที่ปักไว้' : 'หมุดปลายทาง'}</strong>
            </span>
          </div>
        </div>

        {/* Hazard Metrics Badges */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/30 border-b border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>น้ำท่วม</span>
            </span>
            <span className="font-mono font-bold text-sm text-cyan-300 mt-0.5">
              {floodCount} จุด
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Construction className="w-3 h-3 text-orange-400" />
              <span>ถนนปิด</span>
            </span>
            <span className="font-mono font-bold text-sm text-orange-300 mt-0.5">
              {roadClosedCount} จุด
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Car className="w-3 h-3 text-amber-400" />
              <span>อุบัติเหตุ</span>
            </span>
            <span className="font-mono font-bold text-sm text-amber-300 mt-0.5">
              {accidentCount} จุด
            </span>
          </div>
        </div>

        {/* Hazards List */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1 divide-y divide-slate-800/60">
          {hazards.length === 0 ? (
            <div className="py-10 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-sm text-emerald-300">
                ไม่มีรายงานสิ่งกีดขวางในแนวเส้นทาง
              </p>
              <p className="text-xs text-slate-400 mt-1">
                การเดินทางปลอดภัย สามารถใช้เส้นทางปกติได้
              </p>
            </div>
          ) : (
            hazards.map((h) => (
              <div
                key={h.id}
                onClick={() => {
                  onFlyToIncident(h.latitude, h.longitude);
                  onClose();
                }}
                className="pt-2 first:pt-0 p-2 rounded-2xl hover:bg-slate-800/80 transition-all cursor-pointer group flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {h.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      {h.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{h.locationName}</p>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-cyan-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <span>ส่องดู</span>
                  <Navigation className="w-3 h-3" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Advice */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>คำแนะนำ: ตรวจสอบข้อมูลสดสม่ำเสมอในชั่วโมงเร่งด่วน</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};
