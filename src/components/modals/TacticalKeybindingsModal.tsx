'use client';

import React from 'react';
import { X, Keyboard, Command, Shield, Zap } from 'lucide-react';

interface TacticalKeybindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TacticalKeybindingsModal: React.FC<TacticalKeybindingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const keybindings = [
    { key: '?', descTh: 'เปิด/ปิด หน้ารวมคีย์ลัดปฏิบัติการ', descEn: 'Toggle Tactical Keybindings Cheatsheet' },
    { key: 'R', descTh: 'เปิดฟอร์มแจ้งเหตุน้ำท่วม/อุบัติเหตุด่วน', descEn: 'Open Quick Report Incident Modal' },
    { key: 'S', descTh: 'เปิดศูนย์สายด่วนฉุกเฉิน กทม. (SOS 24 ชม.)', descEn: 'Open Bangkok Emergency SOS Hotline' },
    { key: 'C', descTh: 'เปิดตัวกรองหมวดหมู่เหตุการณ์สด 100%', descEn: 'Toggle Live Incident Categories Filter' },
    { key: 'E', descTh: 'เปิดศูนย์ส่งออกพิกัดโทรมาตร GIS (GeoJSON/CSV)', descEn: 'Open Disaster Telemetry GIS Export' },
    { key: 'F', descTh: 'เปิด/ปิด เรดาร์จราจรน่านฟ้าสุวรรณภูมิ/ดอนเมือง', descEn: 'Toggle Airspace Flight Radar Drawer' },
    { key: 'W', descTh: 'เปิดระบบเรดาร์เฝ้าระวังพื้นที่รอบที่พัก (Area Watch)', descEn: 'Open Perimeter Area Watch Radar' },
    { key: 'M', descTh: 'เปิด/ปิด เสียงเอฟเฟกต์ยุทธวิธี (Tactical Audio Mute)', descEn: 'Toggle Tactical Audio Synthesizer' },
    { key: 'Esc', descTh: 'ปิดหน้าต่างโมดอลที่กำลังเปิดอยู่ทั้งหมด', descEn: 'Close Active Modals and Overlays' },
  ];

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                Tactical Keyboard Shortcuts
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  HOTKEYS
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Command center keyboard shortcuts for rapid field dispatching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 space-y-2 overflow-y-auto">
          {keybindings.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200">{item.descTh}</div>
                <div className="text-[10px] text-slate-400">{item.descEn}</div>
              </div>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-650 text-cyan-300 font-mono font-bold text-xs shadow-inner shrink-0">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span>Press anywhere on the map to trigger hotkeys</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
