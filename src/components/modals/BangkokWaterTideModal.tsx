'use client';

import React, { useState } from 'react';
import {
  X,
  Droplets,
  Waves,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokWaterTideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RiverStation {
  id: string;
  name: string;
  district: string;
  currentMsl: number; // เมตร รทก.
  bankLimitMsl: number; // ขอบตลิ่ง
  trend: 'RISING' | 'FALLING' | 'STABLE';
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  updatedAt: string;
}

interface SluiceGate {
  id: string;
  name: string;
  capacityM3s: number;
  operationStatus: string;
  pumpingLevel: string;
}

const RIVER_STATIONS: RiverStation[] = [
  {
    id: 'pak_khlong',
    name: 'สถานีปากคลองตลาด (Pak Khlong Talat)',
    district: 'พระนคร',
    currentMsl: 1.35,
    bankLimitMsl: 2.80,
    trend: 'STABLE',
    status: 'NORMAL',
    updatedAt: '10 นาทีที่แล้ว',
  },
  {
    id: 'saphan_phut',
    name: 'สถานีสะพานพระพุทธยอดฟ้า (Saphan Phut)',
    district: 'ธนบุรี / พระนคร',
    currentMsl: 1.42,
    bankLimitMsl: 2.80,
    trend: 'FALLING',
    status: 'NORMAL',
    updatedAt: '12 นาทีที่แล้ว',
  },
  {
    id: 'bang_na',
    name: 'สถานีกรมอุทกศาสตร์ กองทัพเรือ บางนา (Bang Na)',
    district: 'บางนา',
    currentMsl: 1.28,
    bankLimitMsl: 2.60,
    trend: 'RISING',
    status: 'NORMAL',
    updatedAt: '5 นาทีที่แล้ว',
  },
  {
    id: 'rama_7',
    name: 'สถานีสะพานพระราม 7 (Rama VII / Bang Khen)',
    district: 'บางซื่อ / นนทบุรี',
    currentMsl: 1.55,
    bankLimitMsl: 3.00,
    trend: 'STABLE',
    status: 'NORMAL',
    updatedAt: '8 นาทีที่แล้ว',
  },
];

const SLUICE_GATES: SluiceGate[] = [
  {
    id: 'phra_khanong',
    name: 'สถานีสูบน้ำคลองพระโขนง (Phra Khanong Pumping Station)',
    capacityM3s: 155,
    operationStatus: 'เดินเครื่องสูบ 8 จาก 10 เครื่อง',
    pumpingLevel: 'สูบน้ำออกสู่แม่น้ำเจ้าพระยาอย่างต่อเนื่อง',
  },
  {
    id: 'rama_9_tunnel',
    name: 'อุโมงค์ยักษ์พระราม 9 (Rama IX Giant Drainage Tunnel)',
    capacityM3s: 60,
    operationStatus: 'เปิดระบายน้ำเต็มกำลัง',
    pumpingLevel: 'ดึงน้ำจากบึงพระราม 9 และคลองลาดพร้าวออกสู่เจ้าพระยา',
  },
  {
    id: 'saen_saep',
    name: 'ประตูระบายน้ำคลองแสนแสบ (มีนบุรี - บางกะปิ)',
    capacityM3s: 45,
    operationStatus: 'เปิดบานระบายน้ำ 1.2 เมตร',
    pumpingLevel: 'ควบคุมระดับน้ำคลองรองรับน้ำฝน',
  },
  {
    id: 'prem_prachakon',
    name: 'ประตูระบายน้ำคลองเปรมประชากร (ดอนเมือง - บางซื่อ)',
    capacityM3s: 30,
    operationStatus: 'เดินเครื่องสูบน้ำ 4 เครื่อง',
    pumpingLevel: 'พร่องน้ำลดระดับน้ำขังเขตตอนเหนือ',
  },
];

export const BangkokWaterTideModal: React.FC<BangkokWaterTideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    tacticalAudio.playTacticalBeep(880, 0.05);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  ดัชนีระดับน้ำเจ้าพระยาและประตูระบายน้ำ กทม.
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HYDRO-TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ข้อมูลสถานีวัดน้ำเจ้าพระยาและสถานีสูบน้ำหลักของกรุงเทพมหานคร
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="รีเฟรชข้อมูลโทรมาตร"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Tide Cycle Overview Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>วัฏจักรน้ำขึ้น-น้ำลง อ่าวไทย / แม่น้ำเจ้าพระยา</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">กรมอุทกศาสตร์ กองทัพเรือ</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">น้ำขึ้นสูงสุดรอบวัน (High Tide)</span>
                <span className="font-mono font-bold text-sm text-cyan-300">1.48 ม. รทก.</span>
                <span className="text-[9px] text-slate-500 block">เวลาประมาณ 08:30 น.</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">น้ำลงต่ำสุดรอบวัน (Low Tide)</span>
                <span className="font-mono font-bold text-sm text-emerald-300">0.42 ม. รทก.</span>
                <span className="text-[9px] text-slate-500 block">เวลาประมาณ 19:45 น.</span>
              </div>
            </div>
          </div>

          {/* Chao Phraya Key Stations List */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              สถานีโทรมาตรวัดระดับน้ำแม่น้ำเจ้าพระยา (River Gauges)
            </span>
            <div className="space-y-2">
              {RIVER_STATIONS.map((station) => {
                const marginToBank = (station.bankLimitMsl - station.currentMsl).toFixed(2);
                return (
                  <div
                    key={station.id}
                    className="p-3 rounded-2xl bg-slate-850/80 border border-slate-750 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs text-white">{station.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          {station.district}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>ตลิ่ง: +{station.bankLimitMsl.toFixed(2)} ม.</span>
                        <span className="text-emerald-400 font-semibold">
                          ต่ำกว่าแนวคันกั้นน้ำ: {marginToBank} ม.
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono font-extrabold text-base text-cyan-300">
                          +{station.currentMsl.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">ม. รทก.</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        สถานะปกติ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Giant Drainage Tunnels & Pumping Stations */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ระบบระบายน้ำและสถานีสูบน้ำหลักของกรุงเทพมหานคร (Sluice & Tunnels)
            </span>
            <div className="space-y-2">
              {SLUICE_GATES.map((gate) => (
                <div
                  key={gate.id}
                  className="p-3 rounded-2xl bg-slate-850/80 border border-slate-750 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{gate.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      อัตราสูบ {gate.capacityM3s} ลบ.ม./วินาที
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="text-slate-400">{gate.pumpingLevel}</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 text-[10px]">
                      {gate.operationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>สำนักการระบายน้ำ กรุงเทพมหานคร (BMA Drainage Dept)</span>
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
