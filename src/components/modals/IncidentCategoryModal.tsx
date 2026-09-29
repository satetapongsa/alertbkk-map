'use client';

import React from 'react';
import { IncidentType, Incident } from '@/types';
import {
  X,
  Layers,
  Zap,
  Droplets,
  Car,
  AlertTriangle,
  Construction,
  Train,
  ShieldAlert,
  MapPin,
  Check,
  Radio,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface IncidentCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: IncidentType | 'ALL';
  onSelectType: (type: IncidentType | 'ALL') => void;
  incidents: Incident[];
}

export const IncidentCategoryModal: React.FC<IncidentCategoryModalProps> = ({
  isOpen,
  onClose,
  selectedType,
  onSelectType,
  incidents,
}) => {
  if (!isOpen) return null;

  const categories: {
    id: IncidentType | 'ALL';
    labelTh: string;
    labelEn: string;
    icon: React.ElementType;
    colorClasses: string;
    activeBg: string;
    count: number;
    description: string;
  }[] = [
    {
      id: 'ALL',
      labelTh: 'เหตุการณ์ทั้งหมด',
      labelEn: 'All Active Incidents',
      icon: Zap,
      colorClasses: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      activeBg: 'bg-cyan-500/20 border-cyan-400 text-white',
      count: incidents.length,
      description: 'แสดงหมุดรายงานสดทุกหมวดหมู่บนแผนที่ กทม.',
    },
    {
      id: 'FLOOD',
      labelTh: 'น้ำท่วมขังรอระบาย',
      labelEn: 'Flood & Drainage',
      icon: Droplets,
      colorClasses: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40',
      activeBg: 'bg-cyan-500/25 border-cyan-400 text-white',
      count: incidents.filter((i) => i.type === 'FLOOD').length,
      description: 'จุดน้ำท่วมผิวจราจร ซอย ชุมชน และแนวคลอง',
    },
    {
      id: 'TRAFFIC',
      labelTh: 'การจราจรติดขัด',
      labelEn: 'Traffic Jam',
      icon: Car,
      colorClasses: 'text-amber-400 bg-amber-500/20 border-amber-400/40',
      activeBg: 'bg-amber-500/25 border-amber-400 text-white',
      count: incidents.filter((i) => i.type === 'TRAFFIC').length,
      description: 'จุดรถติดสะสม ท้ายแถวยาว และเส้นทางชะลอตัว',
    },
    {
      id: 'ACCIDENT',
      labelTh: 'อุบัติเหตุบนท้องถนน',
      labelEn: 'Traffic Accident',
      icon: AlertTriangle,
      colorClasses: 'text-rose-400 bg-rose-500/20 border-rose-400/40',
      activeBg: 'bg-rose-500/25 border-rose-400 text-white',
      count: incidents.filter((i) => i.type === 'ACCIDENT').length,
      description: 'รถเฉี่ยวชน กีดขวางช่องทาง และจุดมีผู้ได้รับบาดเจ็บ',
    },
    {
      id: 'ROAD_CLOSED',
      labelTh: 'ถนนปิด / ก่อสร้าง',
      labelEn: 'Road Closed / Workzone',
      icon: Construction,
      colorClasses: 'text-orange-400 bg-orange-500/20 border-orange-400/40',
      activeBg: 'bg-orange-500/25 border-orange-400 text-white',
      count: incidents.filter((i) => i.type === 'ROAD_CLOSED').length,
      description: 'ปิดเบี่ยงจราจร ซ่อมท่อประปา เทคอนกรีต หรือแนวก่อสร้าง',
    },
    {
      id: 'TRANSIT',
      labelTh: 'ระบบขนส่งมวลชน',
      labelEn: 'Public Transit Alert',
      icon: Train,
      colorClasses: 'text-purple-400 bg-purple-500/20 border-purple-400/40',
      activeBg: 'bg-purple-500/25 border-purple-400 text-white',
      count: incidents.filter((i) => i.type === 'TRANSIT').length,
      description: 'แจ้งเตือนสถานี BTS, MRT, รถไฟชานเมือง และรถเมล์ ขสมก.',
    },
    {
      id: 'EMERGENCY',
      labelTh: 'เหตุฉุกเฉิน / ภัยพิบัติ',
      labelEn: 'Emergency & Disaster',
      icon: ShieldAlert,
      colorClasses: 'text-rose-400 bg-rose-500/25 border-rose-400/50',
      activeBg: 'bg-rose-500/30 border-rose-400 text-white',
      count: incidents.filter((i) => i.type === 'EMERGENCY').length,
      description: 'ไฟไหม้ สารเคมีรั่วไหล ต้นไม้ล้มขวางทาง หรือเหตุรุนแรง',
    },
    {
      id: 'GENERAL',
      labelTh: 'เรื่องทั่วไป',
      labelEn: 'General Notice',
      icon: MapPin,
      colorClasses: 'text-blue-400 bg-blue-500/20 border-blue-400/40',
      activeBg: 'bg-blue-500/25 border-blue-400 text-white',
      count: incidents.filter((i) => i.type === 'GENERAL').length,
      description: 'หมุดบ้าน จุดสังเกต หรือรายงานสถานการณ์ทั่วไป',
    },
  ];

  const handleSelect = (type: IncidentType | 'ALL') => {
    tacticalAudio.playTacticalBeep(880, 0.04);
    onSelectType(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  หมวดหมู่เหตุการณ์สด (Incident Categories)
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>LIVE REAL-TIME</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                เลือกกรองดูเหตุการณ์เฉพาะหมวดหมู่บนแผนที่เรียลไทม์
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

        {/* Categories List */}
        <div className="p-3 sm:p-4 space-y-2 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => {
              const isSelected = selectedType === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? cat.activeBg + ' shadow-lg shadow-cyan-500/15'
                      : 'bg-slate-850/80 border-slate-750 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center ${cat.colorClasses}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          cat.count > 0
                            ? 'bg-slate-800 text-cyan-300 border-cyan-500/30'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        {cat.count} เหตุ
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-xs block text-white group-hover:text-cyan-300 transition-colors">
                      {cat.labelTh}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {cat.labelEn}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] text-slate-400">แสดงผลเฉพาะเหตุการณ์ปัจจุบันที่กำลังเกิดขึ้น (Real-Time Only)</span>
          </div>

          {selectedType !== 'ALL' && (
            <button
              onClick={() => handleSelect('ALL')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
            >
              ดูทั้งหมด ({incidents.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
