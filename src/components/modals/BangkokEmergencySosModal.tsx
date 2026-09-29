'use client';

import React, { useState } from 'react';
import {
  BANGKOK_EMERGENCY_HOTLINES,
  EmergencyHotline,
} from '@/lib/bkk-environmental-data';
import {
  PhoneCall,
  X,
  AlertOctagon,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Shield,
  Ambulance,
  Flame,
  Radio,
} from 'lucide-react';

interface BangkokEmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
}

export const BangkokEmergencySosModal: React.FC<BangkokEmergencySosModalProps> = ({
  isOpen,
  onClose,
  userCoords,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const currentCoordsText = userCoords
    ? `${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}`
    : '13.75630, 100.50180 (Bangkok Center)';

  const mapLink = userCoords
    ? `https://maps.google.com/?q=${userCoords.lat},${userCoords.lng}`
    : 'https://maps.google.com/?q=13.7563,100.5018';

  const handleCopyLocation = () => {
    const textToCopy = `พิกัดฉุกเฉิน กทม.: ${currentCoordsText} \nแผนที่: ${mapLink}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredHotlines =
    selectedCategory === 'ALL'
      ? BANGKOK_EMERGENCY_HOTLINES
      : BANGKOK_EMERGENCY_HOTLINES.filter((h) => h.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MEDICAL':
        return <Ambulance className="w-4 h-4 text-emerald-400" />;
      case 'DISASTER':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'POLICE':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <Radio className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shadow-lg shadow-rose-500/20">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                <span>สายด่วนฉุกเฉินและกู้ภัย กทม.</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  SOS 24 HR
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Bangkok Emergency & Disaster Quick Response
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

        {/* Current GPS Coordinates Quick Readout Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-300">
                  พิกัดสำหรับแจ้งเจ้าหน้าที่ปลายสาย:
                </span>
                <p className="font-mono font-bold text-xs sm:text-sm text-cyan-300 tracking-wider select-all">
                  {currentCoordsText}
                </p>
                <span className="text-[10px] text-slate-400">
                  อ่านตัวเลขชุดนี้ให้เจ้าหน้าที่เพื่อระบุตำแหน่งทันที
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyLocation}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'คัดลอกแล้ว' : 'คัดลอกพิกัด'}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'MEDICAL', label: 'กู้ชีพ / การแพทย์' },
            { id: 'DISASTER', label: 'ดับเพลิง / กู้ภัย' },
            { id: 'TRAFFIC', label: 'จราจร' },
            { id: 'MUNICIPAL', label: 'สายด่วน กทม.' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Hotlines Contact List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 divide-y divide-slate-800/60">
          {filteredHotlines.map((hotline) => (
            <div
              key={hotline.number}
              className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getCategoryIcon(hotline.category)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {hotline.agencyTh}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                    {hotline.descriptionTh}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {hotline.availableHours}
                  </span>
                </div>
              </div>

              {/* Direct Dial Call Button */}
              <a
                href={`tel:${hotline.number}`}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all flex-shrink-0 cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>โทร {hotline.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>ในกรณีเหตุฉุกเฉิน ให้ตั้งสติและแจ้งสถานที่เกิดเหตุให้ชัดเจน</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
