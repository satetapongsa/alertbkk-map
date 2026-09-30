'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
  X,
  Search,
  Navigation,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
} from 'lucide-react';
import { BANGKOK_PET_SHELTERS, PetRescueShelter } from '@/lib/bkk-environmental-data';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokPetRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToCoords: (lat: number, lng: number) => void;
}

export const BangkokPetRescueModal: React.FC<BangkokPetRescueModalProps> = ({
  isOpen,
  onClose,
  onFlyToCoords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredShelters = useMemo(() => {
    return BANGKOK_PET_SHELTERS.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.acceptedAnimals.some((a) => a.toLowerCase().includes(q))
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
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-wide">
                  Bangkok Pet & Animal Flood Evacuation Shelters
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  PET RESCUE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ศูนย์พักพิงสัตว์เลี้ยงช่วงน้ำท่วม หน่วยกู้ภัยสัตว์ และทีมสัตวแพทย์ฉุกเฉิน กทม.
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

        {/* Pet Survival 72h Checklist Banner */}
        <div className="p-3 bg-amber-950/30 border-b border-amber-500/30 text-xs text-amber-200">
          <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />
            <span>กระเป๋าฉุกเฉินสัตว์เลี้ยง 72 ชม. (Pet Flood Bag):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-amber-200/90 font-mono">
            <div>- กรง/กระเป๋าเดินทางกันน้ำ</div>
            <div>- อาหารแห้ง/เปียก 7 วัน</div>
            <div>- สายจูงและปลอกคอเบอร์โทร</div>
            <div>- ยาประจำตัวและสมุดวัคซีน</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อศูนย์พักพิงสัตว์, เขต, สุนัข/แมว/สัตว์พิเศษ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* List of Pet Shelters */}
        <div className="p-4 overflow-y-auto space-y-3">
          {filteredShelters.map((shelter) => {
            const isOpenStatus = shelter.intakeStatus === 'OPEN';
            return (
              <div
                key={shelter.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm tracking-wide">
                        {shelter.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {shelter.organization}
                      </span>
                      {shelter.vetOnDuty && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          สัตวแพทย์ประจำจุด
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      เขตพื้นที่: <span className="text-slate-200">{shelter.district}</span>
                      <span className="mx-2 text-slate-600">|</span>
                      สัตว์ที่รองรับ: <span className="text-amber-300 font-medium">{shelter.acceptedAnimals.join(', ')}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                      isOpenStatus
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isOpenStatus ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{shelter.intakeStatusTh}</span>
                  </span>
                </div>

                {/* Requirements & Checklist */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                  <span className="text-slate-400 block text-[10px] mb-0.5">สิ่งที่ต้องเตรียมมาด้วย:</span>
                  <span className="text-slate-200 font-medium">{shelter.requirements.join(' • ')}</span>
                </div>

                {/* Actions & Capacity */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <a
                    href={`tel:${shelter.contactTel}`}
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>โทรประสานงาน: {shelter.contactTel}</span>
                  </a>

                  <button
                    onClick={() => handleWarp(shelter.lat, shelter.lng)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>ส่องพิกัดศูนย์</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Bangkok Metropolitan Administration Veterinary & Pet Rescue Operations</span>
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
