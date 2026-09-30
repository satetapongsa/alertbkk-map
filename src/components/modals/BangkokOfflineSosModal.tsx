'use client';

import React, { useState, useMemo } from 'react';
import {
  Radio,
  X,
  Copy,
  Check,
  Send,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Users,
  Waves,
  ZapOff,
  Battery,
  ShieldAlert,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface BangkokOfflineSosModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords?: { lat: number; lng: number } | null;
}

export const BangkokOfflineSosModal: React.FC<BangkokOfflineSosModalProps> = ({
  isOpen,
  onClose,
  userCoords,
}) => {
  const [copied, setCopied] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [vulnerableCount, setVulnerableCount] = useState(0);
  const [waterDepthCm, setWaterDepthCm] = useState(45);
  const [powerCut, setPowerCut] = useState(true);
  const [medicalUrgent, setMedicalUrgent] = useState(false);
  const [customLocationName, setCustomLocationName] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const lat = userCoords?.lat ?? 13.7563;
  const lng = userCoords?.lng ?? 100.5018;

  const beaconMessage = useMemo(() => {
    const totalPeople = adultCount + childCount + vulnerableCount;
    const items: string[] = [
      `[SOS BKK FLOOD] ขอความช่วยเหลือด่วนน้ำท่วม`,
      `พิกัด GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      `แผนที่: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`,
      customLocationName ? `สถานที่: ${customLocationName}` : '',
      `ผู้ประสบภัย: รวม ${totalPeople} คน (ผู้ใหญ่ ${adultCount}, เด็ก ${childCount}, ผู้สูงอายุ/ผู้ป่วยติดเตียง ${vulnerableCount})`,
      `ระดับน้ำท่วมขัง: ${waterDepthCm} ซม.`,
      `สถานะไฟฟ้า: ${powerCut ? 'ตัดไฟเมนแล้ว (ปลอดภัยจากไฟรั่ว)' : 'ยังไม่ได้ตัดไฟ (เสี่ยงไฟรั่ว)'}`,
      medicalUrgent ? `การแพทย์ฉุกเฉิน: ต้องการความช่วยเหลือทางการแพทย์เร่งด่วน` : '',
      customNotes ? `เพิ่มเติม: ${customNotes}` : '',
      `เวลาส่ง: ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`,
    ];
    return items.filter(Boolean).join('\n');
  }, [lat, lng, adultCount, childCount, vulnerableCount, waterDepthCm, powerCut, medicalUrgent, customLocationName, customNotes]);

  if (!isOpen) return null;

  const handleCopyBeacon = async () => {
    try {
      await navigator.clipboard.writeText(beaconMessage);
      setCopied(true);
      tacticalAudio.playTacticalBeep(880, 0.1);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSmsLink = (recipientNumber: string) => {
    tacticalAudio.playTacticalBeep(650, 0.08);
    const encodedBody = encodeURIComponent(beaconMessage);
    window.open(`sms:${recipientNumber}?body=${encodedBody}`, '_self');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/70 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-wide">
                  Emergency Offline SOS Beacon
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  LOW-BANDWIDTH MODE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบสร้างรหัสสัญญาณขอความช่วยเหลือฉุกเฉินผ่าน SMS / ดาวเทียม แม้เน็ตมือถือดับ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Status Alert */}
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200 leading-relaxed">
              ในกรณีเสาสัญญาณ 4G/5G ขัดข้อง ข้อความสั้น SMS และระบบขอความช่วยเหลือฉุกเฉินยังสามารถส่งผ่านโครงข่ายโทรศัพท์พื้นฐาน 2G/GSM ได้ทันที กดปุ่มส่ง SMS หรือคัดลอกข้อความเพื่อส่งต่อ
            </div>
          </div>

          {/* Incident Telemetry Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* GPS Telemetry */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>พิกัดระบุตำแหน่งปัจจุบัน (GPS Fix)</span>
              </div>
              <div className="font-mono text-xs text-cyan-300 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                LAT {lat.toFixed(5)}, LNG {lng.toFixed(5)}
              </div>
              <input
                type="text"
                placeholder="ระบุจุดสังเกต เช่น หมู่บ้าน/ซอย/ชั้นอาคาร"
                value={customLocationName}
                onChange={(e) => setCustomLocationName(e.target.value)}
                className="mt-2 w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Trapped Occupants */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>จำนวนผู้ประสบภัยติดค้าง</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">ผู้ใหญ่</span>
                  <div className="flex items-center justify-center gap-1 bg-slate-900 rounded p-1 border border-slate-800">
                    <button
                      onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      -
                    </button>
                    <span className="text-white font-bold w-4">{adultCount}</span>
                    <button
                      onClick={() => setAdultCount(adultCount + 1)}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">เด็กเล็ก</span>
                  <div className="flex items-center justify-center gap-1 bg-slate-900 rounded p-1 border border-slate-800">
                    <button
                      onClick={() => setChildCount(Math.max(0, childCount - 1))}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      -
                    </button>
                    <span className="text-white font-bold w-4">{childCount}</span>
                    <button
                      onClick={() => setChildCount(childCount + 1)}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">ผู้ป่วย/สูงวัย</span>
                  <div className="flex items-center justify-center gap-1 bg-slate-900 rounded p-1 border border-slate-800">
                    <button
                      onClick={() => setVulnerableCount(Math.max(0, vulnerableCount - 1))}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      -
                    </button>
                    <span className="text-white font-bold w-4">{vulnerableCount}</span>
                    <button
                      onClick={() => setVulnerableCount(vulnerableCount + 1)}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Water Depth Gauge */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span className="flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  ระดับน้ำท่วมจุดที่ติดค้าง
                </span>
                <span className="font-mono text-cyan-400 font-bold">{waterDepthCm} ซม.</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={waterDepthCm}
                onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>10 ซม. (ข้อเท้า)</span>
                <span>50 ซม. (หัวเข่า)</span>
                <span>120 ซม. (เอว)</span>
                <span>200+ ซม.</span>
              </div>
            </div>

            {/* Safety & Medical Switches */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="flex items-center gap-2 text-slate-300">
                  <ZapOff className="w-3.5 h-3.5 text-emerald-400" />
                  ตัดเบรกเกอร์ไฟฟ้าแล้ว
                </span>
                <input
                  type="checkbox"
                  checked={powerCut}
                  onChange={(e) => setPowerCut(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="flex items-center gap-2 text-rose-300 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  มีผู้ป่วยวิกฤต/ต้องการแพทย์ด่วน
                </span>
                <input
                  type="checkbox"
                  checked={medicalUrgent}
                  onChange={(e) => setMedicalUrgent(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Generated Low-Bandwidth Beacon Payload */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 tracking-wider">
                SMS DISTRESS PAYLOAD (รหัสส่งสัญญาณ)
              </span>
              <button
                onClick={handleCopyBeacon}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>คัดลอกข้อความ</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-900/90 p-2.5 rounded border border-slate-800 select-all">
              {beaconMessage}
            </pre>
          </div>

          {/* Emergency Dispatch SMS Launchers */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              ส่งสัญญาณ SMS ฉุกเฉินตรงไปยังศูนย์สั่งการ (Direct Emergency SMS Dispatch):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleSmsLink('199')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-rose-400" />
                <span>ส่ง SMS หา 199 (กู้ภัย กทม.)</span>
              </button>

              <button
                onClick={() => handleSmsLink('1669')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/40 text-blue-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>ส่ง SMS หา 1669 (แพทย์ฉุกเฉิน)</span>
              </button>

              <button
                onClick={() => handleSmsLink('191')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>ส่ง SMS หา 191 (ตำรวจ)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AlertBKK Satellite & Low-Bandwidth Protocol</span>
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
