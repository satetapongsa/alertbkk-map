'use client';

import React, { useState } from 'react';
import {
  X,
  Car,
  Truck,
  Zap,
  Bike,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Gauge,
  Info,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface VehicleFloodRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VehiclePreset {
  id: string;
  name: string;
  category: string;
  groundClearanceMm: number;
  safeDepthCm: number;
  cautionDepthCm: number;
  dangerDepthCm: number;
  icon: React.ElementType;
  description: string;
  keyRisks: string[];
}

const VEHICLE_PRESETS: VehiclePreset[] = [
  {
    id: 'sedan',
    name: 'Sedan / Eco Car (รถเก๋ง / ซีดาน)',
    category: 'City Cars (City, Yaris, Civic, Mazda 2)',
    groundClearanceMm: 140,
    safeDepthCm: 15,
    cautionDepthCm: 25,
    dangerDepthCm: 35,
    icon: Car,
    description: 'ความสูงใต้ท้องรถมาตรฐาน 135-150 มม. ท่อไอเสียและช่องดูดอากาศเครื่องยนต์อยู่ต่ำ',
    keyRisks: [
      'น้ำท่วมเกิน 20 ซม. คลื่นน้ำจากรถคันอื่นอาจซัดเข้าห้องเครื่อง',
      'เสี่ยงน้ำเข้าท่อไอเสียหากถอนคันเร่งหรือเครื่องยนต์รอบต่ำ',
      'พัดลมหม้อน้ำอาจตีน้ำจนใบพัดหักหรือฟิวส์ขาด',
    ],
  },
  {
    id: 'crossover',
    name: 'Crossover / Compact SUV (รถยกสูงขนาดเล็ก)',
    category: 'CUV (HR-V, Corolla Cross, Kicks, CX-30)',
    groundClearanceMm: 180,
    safeDepthCm: 22,
    cautionDepthCm: 35,
    dangerDepthCm: 45,
    icon: Car,
    description: 'ใต้ท้องรถสูงกว่ารถเก๋ง 175-190 มม. ลุยน้ำขังระดับทางเท้าได้ปานกลาง',
    keyRisks: [
      'หากน้ำท่วมระดับ 30-35 ซม. ยังผ่านได้แต่ต้องรักษารอบเครื่องยนต์สม่ำเสมอ',
      'ระวังคลื่นน้ำกระแทกแผงใต้ท้องรถ',
      'ขับด้วยเกียร์ต่ำ (L หรือ S) และห้ามเปิดแอร์',
    ],
  },
  {
    id: 'pickup_4wd',
    name: 'Pickup / PPV 4WD (กระบะ / รถขับเคลื่อน 4 ล้อ)',
    category: 'High Clearance (Fortuner, D-Max, Hilux, Ranger)',
    groundClearanceMm: 225,
    safeDepthCm: 35,
    cautionDepthCm: 50,
    dangerDepthCm: 65,
    icon: Truck,
    description: 'ความสูงใต้ท้องรถ 215-240 มม. ช่องดักอากาศสูง สามารถลุยน้ำท่วมลึกได้ดี',
    keyRisks: [
      'ลุยน้ำได้ถึงระดับ 45-50 ซม. อย่างปลอดภัยโดยใช้ความเร็วต่ำ',
      'หากน้ำเกิน 65 ซม. รถอาจลอยและเสียการควบคุมจากกระแสน้ำเชี่ยว',
      'หลังลุยน้ำควรเหยียบเบรกย้ำๆ เพื่อไล่น้ำออกจากจานเบรก',
    ],
  },
  {
    id: 'ev',
    name: 'Electric Vehicle / BEV (รถยนต์ไฟฟ้า 100%)',
    category: 'EV (BYD Dolphin, Atto 3, Tesla, ORA)',
    groundClearanceMm: 150,
    safeDepthCm: 20,
    cautionDepthCm: 30,
    dangerDepthCm: 40,
    icon: Zap,
    description: 'แบตเตอรี่มาตรฐานกันน้ำ IP67/IP68 ไม่มีท่อไอเสีย แต่เสี่ยงต่อเซนเซอร์และระบบไฟแรงสูง',
    keyRisks: [
      'แบตเตอรี่ใต้ท้องรถซีลกันน้ำ แต่ไม่ควรแช่น้ำนิ่งเป็นเวลานานเกิน 30 นาที',
      'น้ำท่วมสูงเกิน 30 ซม. เสี่ยงรถลอยตัวเนื่องจากโครงสร้างมีแรงพยุงสูง',
      'หากระบบขึ้นไฟเตือนเตือน High Voltage Fault ให้หยุดรถในที่ปลอดภัยทันที',
    ],
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle / Scooter (รถจักรยานยนต์)',
    category: '2-Wheels (Wave, Scoopy, Click, PCX, NMAX)',
    groundClearanceMm: 130,
    safeDepthCm: 10,
    cautionDepthCm: 18,
    dangerDepthCm: 25,
    icon: Bike,
    description: 'ท่อไอเสียและชุดกรองอากาศอยู่ต่ำมาก ทัศนวิสัยและการทรงตัวต่ำเมื่อมีกระแสน้ำ',
    keyRisks: [
      'น้ำระดับ 15 ซม. ขึ้นไปเสี่ยงน้ำเข้าท่อไอเสียและห้องแคร้งก์สายพานลื่น',
      'มองไม่เห็นฝาท่อระบายน้ำที่เปิดอยู่หรือหลุมใต้น้ำ',
      'หากเครื่องยนต์ดับในน้ำ ห้ามสตาร์ทรถเด็ดขาด ให้เข็นขึ้นที่แห้ง',
    ],
  },
];

export const VehicleFloodRiskModal: React.FC<VehicleFloodRiskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePreset>(VEHICLE_PRESETS[0]);
  const [simulatedDepthCm, setSimulatedDepthCm] = useState<number>(25);

  if (!isOpen) return null;

  // Determine risk level based on simulated depth
  let riskStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (simulatedDepthCm > selectedVehicle.cautionDepthCm) {
    riskStatus = 'DANGER';
  } else if (simulatedDepthCm > selectedVehicle.safeDepthCm) {
    riskStatus = 'CAUTION';
  }

  const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimulatedDepthCm(Number(e.target.value));
  };

  const handleSelectVehicle = (v: VehiclePreset) => {
    setSelectedVehicle(v);
    tacticalAudio.playTacticalBeep(700, 0.04);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                เครื่องคำนวณความเสี่ยงระดับน้ำท่วมตามประเภทรถ
              </h2>
              <p className="text-[11px] text-slate-400">
                ประเมินความปลอดภัยใต้ท้องรถและระบบขับเคลื่อนก่อนลุยน้ำขัง
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Vehicle Category Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              เลือกรุ่น/ประเภทรถของท่าน (Vehicle Category)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VEHICLE_PRESETS.map((v) => {
                const isSelected = selectedVehicle.id === v.id;
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVehicle(v)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-850/80 border-slate-750 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                    </div>
                    <span className="font-bold text-[11px] line-clamp-1">{v.name.split(' (')[0]}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                      ใต้ท้อง: {v.groundClearanceMm} มม.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Depth Slider */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">
                จำลองระดับความลึกของน้ำท่วมบนผิวถนน:
              </span>
              <span className="font-mono text-base font-extrabold px-2.5 py-0.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300">
                {simulatedDepthCm} ซม.
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="70"
              step="1"
              value={simulatedDepthCm}
              onChange={handleDepthChange}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            {/* Depth Markers Visual Ruler */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>5 ซม. (ขังตื้น)</span>
              <span>15 ซม. (ครึ่งล้อเก๋ง)</span>
              <span>30 ซม. (มิดขอบประตู)</span>
              <span>50 ซม. (มิดไฟหน้ารถ)</span>
              <span>70 ซม. (ลอยน้ำ)</span>
            </div>
          </div>

          {/* Real-time Risk Assessment Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              riskStatus === 'SAFE'
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : riskStatus === 'CAUTION'
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-rose-950/50 border-rose-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                  riskStatus === 'SAFE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : riskStatus === 'CAUTION'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
              >
                {riskStatus === 'SAFE' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : riskStatus === 'CAUTION' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-white">
                    สถานะการผ่านทาง: {riskStatus === 'SAFE' ? 'ผ่านได้ปกติ (Passable)' : riskStatus === 'CAUTION' ? 'ระมัดระวังเป็นพิเศษ (Caution)' : 'ห้ามผ่านเด็ดขาด (Impassable)'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      riskStatus === 'SAFE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : riskStatus === 'CAUTION'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    ระดับความลึก {simulatedDepthCm} cm
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {riskStatus === 'SAFE'
                    ? `สำหรับ ${selectedVehicle.name} ระดับน้ำ ${simulatedDepthCm} ซม. ต่ำกว่าระดับเกณฑ์ปลอดภัย (${selectedVehicle.safeDepthCm} ซม.) ขับผ่านได้ปลอดภัยโดยใช้ความเร็วสม่ำเสมอ`
                    : riskStatus === 'CAUTION'
                    ? `ระดับน้ำ ${simulatedDepthCm} ซม. ใกล้ถึงระดับช่องดักอากาศหรือท้องรถ (${selectedVehicle.cautionDepthCm} ซม.) ควรปิดแอร์ ขับช้าๆ รักษารอบเครื่อง ห้ามเร่งเครื่องหรือเบรกกะทันหัน`
                    : `อันตรายสูง! ระดับน้ำ ${simulatedDepthCm} ซม. เกินขีดจำกัดปลอดภัยของ ${selectedVehicle.name} เสี่ยงน้ำเข้าท่อไอเสีย ท่วมห้องเครื่อง หรือรถลอยตัว แนะนำเลี่ยงไปใช้ทางด่วนหรือเส้นทางอื่น`}
                </p>
              </div>
            </div>
          </div>

          {/* Key Risks & Crucial Advice */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>ข้อควรระวังสำคัญสำหรับ {selectedVehicle.name.split(' (')[0]}:</span>
            </span>
            <ul className="space-y-1.5 text-slate-400 text-[11px] pl-1">
              {selectedVehicle.keyRisks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Defensive Driving Rules in Floods */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-750">
              <span className="font-bold text-white block mb-0.5">1. ปิดระบบแอร์รถทันที</span>
              <p className="text-slate-400">เพื่อไม่ให้พัดลมระบายความร้อนพัดน้ำกระจายเข้าห้องเครื่องและฟิวส์ขาด</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-750">
              <span className="font-bold text-white block mb-0.5">2. ใช้เกียร์ต่ำรอบคงที่</span>
              <p className="text-slate-400">ใช้เกียร์ L หรือ 1-2 รักษารอบเครื่อง 1,500-2,000 rpm ไม่ยกคันเร่งกะทันหัน</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-750">
              <span className="font-bold text-white block mb-0.5">3. เครื่องดับห้ามสตาร์ท</span>
              <p className="text-slate-400">หากเครื่องยนต์ดับขณะลุยน้ำ ห้ามบิดสตาร์ทเด็ดขาดเพราะน้ำจะเข้าลูกสูบ</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-mono">
            มาตรฐานวิศวกรรมความปลอดภัยยานยนต์ กทม.
          </span>
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
