'use client';

import React, { useState } from 'react';
import { BANGKOK_50_DISTRICTS, BangkokDistrict } from '@/lib/bkk-environmental-data';
import { Search, X, MapPin, Navigation, Compass } from 'lucide-react';

interface BangkokDistrictsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict?: BangkokDistrict | null;
  onSelectDistrict: (district: BangkokDistrict) => void;
  onClearDistrict?: () => void;
}

export const BangkokDistrictsModal: React.FC<BangkokDistrictsModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  onSelectDistrict,
  onClearDistrict,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = BANGKOK_50_DISTRICTS.filter(
    (d) =>
      d.nameTh.toLowerCase().includes(search.toLowerCase().trim()) ||
      d.nameEn.toLowerCase().includes(search.toLowerCase().trim()) ||
      d.postalCode.includes(search.trim())
  );

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                สำรวจ 50 เขตกรุงเทพมหานคร
              </h2>
              <p className="text-[11px] text-slate-400">
                เลือกเขตเพื่อซูมพิกัดและล้อมรอบด้วยเส้นขอบเขตสี
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

        {/* Selected District Status Banner */}
        {selectedDistrict && (
          <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-400">กำลังแสดงเส้นขอบเขต:</span>
              <span className="font-extrabold text-cyan-300">เขต{selectedDistrict.nameTh} ({selectedDistrict.nameEn})</span>
            </div>
            {onClearDistrict && (
              <button
                onClick={() => {
                  onClearDistrict();
                }}
                className="px-2 py-0.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold transition-colors cursor-pointer"
              >
                ล้างเส้นขอบเขต
              </button>
            )}
          </div>
        )}

        {/* Search Input */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเขต (เช่น สยาม, จตุจักร, สาทร, บางกะปิ)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* District Grid / List */}
        <div className="p-3 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              ไม่พบเขตที่ตรงกับคำค้นหา
            </div>
          ) : (
            filtered.map((district) => {
              const isSelected = selectedDistrict?.id === district.id;
              return (
                <button
                  key={district.id}
                  onClick={() => {
                    onSelectDistrict(district);
                    onClose();
                  }}
                  className={`p-2.5 rounded-2xl text-left transition-all group flex flex-col justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-extrabold text-xs transition-colors ${
                      isSelected ? 'text-cyan-300' : 'text-slate-100 group-hover:text-cyan-300'
                    }`}>
                      เขต{district.nameTh}
                    </span>
                    <Navigation className={`w-3 h-3 transition-all ${
                      isSelected
                        ? 'text-cyan-300'
                        : 'text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5'
                    }`} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{district.nameEn}</span>
                    <span className="text-slate-500">{district.postalCode}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>รวมทั้งสิ้น 50 เขตการปกครอง กทม.</span>
          <span>คลิกเพื่อดูขอบเขตสี</span>
        </div>
      </div>
    </div>
  );
};
