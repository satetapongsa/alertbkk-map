'use client';

import React, { useState } from 'react';
import {
  X,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Car,
  Navigation,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokExpresswayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords?: (lat: number, lng: number) => void;
}

interface ExpresswayLine {
  id: string;
  name: string;
  code: string;
  operator: string;
  status: 'CLEAR' | 'CAUTION' | 'CONGESTED';
  statusTh: string;
  colorHex: string;
  keyRamps: {
    name: string;
    condition: string;
    waterLevelCm: number;
    passable: boolean;
    lat: number;
    lng: number;
  }[];
  escapeAdvice: string;
}

const EXPRESSWAY_LINES: ExpresswayLine[] = [
  {
    id: 'chalerm-mahanakhon',
    name: 'ทางพิเศษเฉลิมมหานคร (ทางด่วนขั้นที่ 1)',
    code: 'EXAT Line 1',
    operator: 'การทางพิเศษแห่งประเทศไทย (EXAT)',
    status: 'CAUTION',
    statusTh: 'ระวังน้ำขังทางลงระดับราบ',
    colorHex: '#3b82f6',
    keyRamps: [
      {
        name: 'ทางลงสุขุมวิท 62 (บางจาก)',
        condition: 'ผิวถนนแห้ง ทางลงเชื่อมต่อสุขุมวิทผ่านได้ปกติ',
        waterLevelCm: 0,
        passable: true,
        lat: 13.6961,
        lng: 100.6015,
      },
      {
        name: 'ทางลงพระราม 4 (บ่อนไก่ / คลองเตย)',
        condition: 'มีน้ำรอระบายช่วงทางราบ 5-10 ซม. ชะลอความเร็ว',
        waterLevelCm: 8,
        passable: true,
        lat: 13.7225,
        lng: 100.5482,
      },
      {
        name: 'ทางลงดินแดง (วิภาวดีรังสิต ขาออก)',
        condition: 'การจราจรหนาแน่น ผิวจราจรแห้ง ไม่มีน้ำท่วมขัง',
        waterLevelCm: 0,
        passable: true,
        lat: 13.7668,
        lng: 100.5562,
      },
    ],
    escapeAdvice: 'ใช้เป็นเส้นทางหลักเลี่ยงน้ำท่วมถนนสุขุมวิทตอนล่างและถนนพระราม 3',
  },
  {
    id: 'si-rat',
    name: 'ทางพิเศษศรีรัช (ทางด่วนขั้นที่ 2)',
    code: 'EXAT Line 2 (BEM)',
    operator: 'บมจ. ทางด่วนและรถไฟฟ้ากรุงเทพ (BEM)',
    status: 'CLEAR',
    statusTh: 'ผิวจราจรแห้ง สัญจรคล่องตัว',
    colorHex: '#10b981',
    keyRamps: [
      {
        name: 'ทางลงงามวงศ์วาน (แคราย ขาเข้า/ออก)',
        condition: 'ผิวทางด่วนปกติ แต่ถนนงามวงศ์วานด้านล่างมีน้ำขังบางจุด',
        waterLevelCm: 5,
        passable: true,
        lat: 13.8582,
        lng: 100.5365,
      },
      {
        name: 'ทางลงแจ้งวัฒนะ (ศูนย์ราชการ)',
        condition: 'เปิดใช้งานปกติ ไม่มีน้ำท่วมขัง',
        waterLevelCm: 0,
        passable: true,
        lat: 13.8962,
        lng: 100.5518,
      },
      {
        name: 'ทางลงพระราม 9 (อโศก-ดินแดง)',
        condition: 'คล่องตัว เชื่อมต่อมอเตอร์เวย์ M7 สะดวก',
        waterLevelCm: 0,
        passable: true,
        lat: 13.7548,
        lng: 100.5695,
      },
    ],
    escapeAdvice: 'แนะนำใช้หนีน้ำท่วมถนนพหลโยธินและถนนวิภาวดีรังสิตฝั่งราบ',
  },
  {
    id: 'chalong-rat',
    name: 'ทางพิเศษฉลองรัช (รามอินทรา - อาจณรงค์)',
    code: 'EXAT Ramindra',
    operator: 'การทางพิเศษแห่งประเทศไทย (EXAT)',
    status: 'CLEAR',
    statusTh: 'ทางยกระดับปลอดน้ำท่วม 100%',
    colorHex: '#8b5cf6',
    keyRamps: [
      {
        name: 'ทางลงถนนลาดพร้าว (โชคชัย 4)',
        condition: 'ผิวทางด่วนแห้ง ทางราบลาดพร้าวมีน้ำขังชิดเกาะกลาง',
        waterLevelCm: 6,
        passable: true,
        lat: 13.7925,
        lng: 100.6112,
      },
      {
        name: 'ทางลงถนนเกษตร-นวมินทร์ (ประเสริฐมนูกิจ)',
        condition: 'สัญจรได้คล่องตัว ทางราบไม่มีน้ำท่วม',
        waterLevelCm: 0,
        passable: true,
        lat: 13.8291,
        lng: 100.6285,
      },
      {
        name: 'ทางลงถนนสุขาภิบาล 5 (สายไหม)',
        condition: 'เชื่อมต่อพื้นที่ กทม. ตอนเหนือคล่องตัว',
        waterLevelCm: 0,
        passable: true,
        lat: 13.8925,
        lng: 100.6722,
      },
    ],
    escapeAdvice: 'เส้นทางหนีน้ำที่ปลอดภัยที่สุดเชื่อมระหว่าง กทม. ตะวันออกและใจกลางเมือง',
  },
  {
    id: 'don-mueang-tollway',
    name: 'ทางยกระดับอุตราภิมุข (ดอนเมืองโทลล์เวย์)',
    code: 'DMT Tollway',
    operator: 'บมจ. ทางยกระดับดอนเมือง (DMT)',
    status: 'CLEAR',
    statusTh: 'เส้นทางยกระดับสูงพิเศษ ปลอดภัย',
    colorHex: '#06b6d4',
    keyRamps: [
      {
        name: 'ทางลงท่าอากาศยานดอนเมือง',
        condition: 'เชื่อมเข้าอาคารผู้โดยสาร Terminal 1-2 ปลอดภัย ไม่ท่วม',
        waterLevelCm: 0,
        passable: true,
        lat: 13.9162,
        lng: 100.6015,
      },
      {
        name: 'ทางลงหลักสี่ (แจ้งวัฒนะ)',
        condition: 'ทางลงปกติ ระวังการจราจรสะสมหน้าศูนย์ราชการ',
        waterLevelCm: 0,
        passable: true,
        lat: 13.8858,
        lng: 100.5842,
      },
      {
        name: 'ทางลงรังสิต (ฟิวเจอร์พาร์ค)',
        condition: 'ผิวทางลงปกติ เชื่อมต่อพหลโยธินขาออกคล่องตัว',
        waterLevelCm: 2,
        passable: true,
        lat: 13.9892,
        lng: 100.6178,
      },
    ],
    escapeAdvice: 'เส้นทางสำคัญในการเดินทางไปสนามบินดอนเมืองช่วงฝนตกหนักน้ำท่วมวิภาวดีรังสิต',
  },
];

export const BangkokExpresswayModal: React.FC<BangkokExpresswayModalProps> = ({
  isOpen,
  onClose,
  onFlyToCoords,
}) => {
  const [selectedLine, setSelectedLine] = useState<ExpresswayLine>(EXPRESSWAY_LINES[0]);

  if (!isOpen) return null;

  const handleSelectLine = (line: ExpresswayLine) => {
    setSelectedLine(line);
    tacticalAudio.playTacticalBeep(750, 0.04);
  };

  const handleRampClick = (lat: number, lng: number) => {
    if (onFlyToCoords) {
      tacticalAudio.playRadarPing();
      onFlyToCoords(lat, lng);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  ระบบตรวจสอบโครงข่ายทางด่วน กทม. (EXAT Expressways)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ELEVATED-NET
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                สถานะผิวทางยกระดับ ด่านเก็บค่าผ่านทาง และจุดลงทางด่วนหนีน้ำท่วมถนนข้างล่าง
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Expressway Selector Grid */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              เลือกสายทางพิเศษ (Select Expressway Route)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXPRESSWAY_LINES.map((line) => {
                const isSelected = selectedLine.id === line.id;
                return (
                  <button
                    key={line.id}
                    onClick={() => handleSelectLine(line)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-850/80 border-slate-750 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{line.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{line.code}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
                        line.status === 'CLEAR'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : line.status === 'CAUTION'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {line.statusTh}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Expressway Detail Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{selectedLine.name}</h3>
                <p className="text-[10px] text-slate-400">หน่วยงานกำกับดูแล: {selectedLine.operator}</p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-750 text-cyan-300 font-bold">
                {selectedLine.code}
              </span>
            </div>

            {/* Strategic Flood Bypass Recommendation */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[11px] text-cyan-200 block">
                  คำแนะนำยุทธวิธีเลี่ยงน้ำท่วม (Flood Bypass Strategy):
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {selectedLine.escapeAdvice}
                </p>
              </div>
            </div>

            {/* Key Exit Ramps & Surface Flood Status */}
            <div>
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                สถานะทางลงสำคัญและระดับน้ำผิวถนนข้างล่าง:
              </span>
              <div className="space-y-2">
                {selectedLine.keyRamps.map((ramp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs text-white">{ramp.name}</span>
                        {ramp.waterLevelCm > 0 ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            น้ำขัง {ramp.waterLevelCm} ซม.
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            แห้งปกติ
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">{ramp.condition}</p>
                    </div>

                    {onFlyToCoords && (
                      <button
                        onClick={() => handleRampClick(ramp.lat, ramp.lng)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer flex-shrink-0"
                      >
                        <span>ส่องหมุด</span>
                        <Navigation className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expressway Flood Driving Protocols */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2 text-[10px]">
            <span className="font-bold text-slate-300 block">
              กฎความปลอดภัยการขับขี่บนทางด่วนช่วงฝนตกหนัก กทม.:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-slate-200 block mb-0.5">1. ลดความเร็วเหลือ 60-80 กม./ชม.</strong>
                ป้องกันอาการเหินน้ำ (Hydroplaning) บริเวณรอยต่อสะพานยกระดับ
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-slate-200 block mb-0.5">2. เว้นระยะห่าง 3 คันรถ</strong>
                ระยะเบรกบนทางเปียกลื่นเพิ่มขึ้น 2-3 เท่าจากสภาวะถนนแห้ง
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>ศูนย์ควบคุมการจราจร EXAT Call Center: 1543 (ตลอด 24 ชั่วโมง)</span>
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
