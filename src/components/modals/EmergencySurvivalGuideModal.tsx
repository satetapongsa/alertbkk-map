'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Zap,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bug,
  HeartPulse,
  Flame,
  Droplets,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface EmergencySurvivalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySurvivalGuideModal: React.FC<EmergencySurvivalGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ELECTRIC' | 'DISEASE' | 'CHECKLIST'>('ELECTRIC');

  if (!isOpen) return null;

  const handleTabChange = (tab: 'ELECTRIC' | 'DISEASE' | 'CHECKLIST') => {
    setActiveTab(tab);
    tacticalAudio.playTacticalBeep(800, 0.04);
  };

  const handleCall = (tel: string) => {
    tacticalAudio.playEmergencyChime();
    window.location.href = `tel:${tel}`;
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  คู่มือเอาตัวรอดน้ำท่วมและป้องกันไฟฟ้ารั่ว กทม.
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  SURVIVAL-PROTOCOLS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                แนวทางปฏิบัติมาตรฐานสากลด้านความปลอดภัยชีวิตและระบบไฟฟ้า
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-950/60 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => handleTabChange('ELECTRIC')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ELECTRIC'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>ไฟฟ้ารั่ว & ช็อต</span>
          </button>

          <button
            onClick={() => handleTabChange('DISEASE')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'DISEASE'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>สัตว์มีพิษ & โรค</span>
          </button>

          <button
            onClick={() => handleTabChange('CHECKLIST')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'CHECKLIST'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>เช็กลิสต์จัดของ</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Tab 1: Electrical Safety Protocols */}
          {activeTab === 'ELECTRIC' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>3 กฎเหล็กความปลอดภัยระบบไฟฟ้า (MEA Standards)</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  น้ำเป็นตัวนำกระแสไฟฟ้าที่ดีมาก เมื่อน้ำท่วมสูงถึงระดับปลั๊กไฟหรือเครื่องใช้ไฟฟ้า
                  กระแสไฟจะรั่วลงสู่น้ำเป็นวงกว้างในรัศมี 2-5 เมตร
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-850/80 border border-slate-750 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white text-xs block mb-0.5">
                      ตัดเบรกเกอร์วงจรชั้นล่าง (Separate Floor Breakers)
                    </strong>
                    <p className="text-[11px] text-slate-400">
                      หากน้ำเริ่มเอ่อท่วมพื้นบ้าน ให้สับคัตเอาต์หรือเบรกเกอร์เฉพาะชั้น 1 ลงทันที
                      เพื่อป้องกันไฟฟ้ารั่วข้ามวงจรและยังคงใช้ไฟฟ้าบนชั้น 2 ได้อย่างปลอดภัย
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-850/80 border border-slate-750 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white text-xs block mb-0.5">
                      เว้นระยะห่างจากเสาไฟฟ้า ป้ายไฟ และตู้ไฟอย่างน้อย 3 เมตร
                    </strong>
                    <p className="text-[11px] text-slate-400">
                      อย่าเดินลุยน้ำเข้าใกล้เสาไฟฟ้า ป้ายโฆษณาไฟส่องสว่าง หรือตู้ไฟจราจร
                      เนื่องจากฉนวนอาจเสื่อมสภาพและมีกระแสไฟรั่วลงน้ำ
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-850/80 border border-slate-750 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white text-xs block mb-0.5">
                      สังเกตอาการไฟรั่ว: รู้สึกเหน็บชาหรือขนลุกตามขา
                    </strong>
                    <p className="text-[11px] text-slate-400">
                      หากกำลังเดินลุยน้ำแล้วรู้สึกเหน็บชา กล้ามเนื้อเกร็ง หรือขนลุกชัน ห้ามก้าวต่อไปข้างหน้า
                      ให้รีบถอยหลังกลับทางเดิมทันที เพราะเป็นสัญญาณเตือนสนามไฟฟ้าในน้ำ
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Call Quick Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleCall('1130')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer text-amber-300 font-bold"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>กฟน. แจ้งไฟรั่ว: 1130</span>
                </button>
                <button
                  onClick={() => handleCall('1669')}
                  className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/40 flex items-center justify-center gap-2 cursor-pointer text-rose-300 font-bold"
                >
                  <PhoneCall className="w-4 h-4 text-rose-400" />
                  <span>กู้ชีพฉุกเฉิน: 1669</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Poisonous Animals & Waterborne Diseases */}
          {activeTab === 'DISEASE' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                <span className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-rose-400" />
                  <span>สัตว์มีพิษหนีน้ำท่วม (งู ตะขาบ แมงป่อง)</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  สัตว์เลื้อยคลานจะหนีน้ำขึ้นมาหลบซ่อนตัวในรองเท้า ตู้เสื้อผ้า ใต้เตียง และกองผ้า
                  ควรใช้ไฟฉายส่องตรวจสอบทุกครั้งและเคาะรองเท้าก่อนสวมใส่
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-850/80 border border-slate-750">
                  <strong className="text-white text-xs block mb-0.5">
                    โรคฉี่หนู (Leptospirosis)
                  </strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    เชื้อโรคเข้าสู่ร่างกายผ่านทางบาดแผล ผิวหนังเปื่อย หรือเยื่อบุตา
                    หากจำเป็นต้องลุยน้ำขังให้สวมรองเท้าบูทยาง หากมีบาดแผลให้ล้างด้วยสบู่และน้ำสะอาดทันที
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-850/80 border border-slate-750">
                  <strong className="text-white text-xs block mb-0.5">
                    โรคน้ำกัดเท้าและเชื้อรา
                  </strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    หลังลุยน้ำต้องเช็ดเท้าให้แห้งสนิทโดยเฉพาะซอกนิ้วเท้า โรยแป้งเพื่อลดความชื้น
                    และห้ามเกาแผลเพื่อป้องกันการติดเชื้อแบคทีเรียแทรกซ้อน
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleCall('199')}
                className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer text-slate-200 font-bold"
              >
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span>สายด่วนดับเพลิงและกู้ภัย (จับสัตว์เลื้อยคลาน กทม.): 199</span>
              </button>
            </div>
          )}

          {/* Tab 3: Emergency Go-Bag Checklist */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
                <span className="font-bold text-xs text-cyan-300 block mb-1">
                  กระเป๋าฉุกเฉิน 72 ชั่วโมง (72-Hour Flood Go-Bag)
                </span>
                <p className="text-[11px] text-slate-300">
                  สิ่งของจำเป็นที่ควรบรรจุใส่ถุงซิปล็อกกันน้ำและวางไว้ในจุดหยิบง่ายบนชั้น 2:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
                  <span className="font-bold text-white block">1. น้ำดื่มและอาหารแห้ง</span>
                  <p className="text-slate-400">น้ำดื่มสะอาดอย่างน้อย 3 ลิตร/คน/วัน, อาหารกระป๋อง, ขนมปังกรอบ</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
                  <span className="font-bold text-white block">2. แสงสว่างและการสื่อสาร</span>
                  <p className="text-slate-400">ไฟฉายกันน้ำ, พาวเวอร์แบงก์ชาร์จเต็ม, นกหวีดขอความช่วยเหลือ</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
                  <span className="font-bold text-white block">3. ยารักษาโรคและปฐมพยาบาล</span>
                  <p className="text-slate-400">ยาประจำตัว, พาราเซตามอล, ยาใส่แผล, ผงเกลือแร่ ORS</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
                  <span className="font-bold text-white block">4. เอกสารสำคัญและเงินสด</span>
                  <p className="text-slate-400">บัตรประชาชน, สำเนาทะเบียนบ้าน, กรมธรรม์ บรรจุในถุงกันน้ำ</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>ศูนย์บัญชาการเหตุการณ์ กทม. 24 ชั่วโมง</span>
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
