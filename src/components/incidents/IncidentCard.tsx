'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Incident,
} from '@/types';
import {
  formatThaiRelativeTime,
  formatDistance,
  INCIDENT_CONFIG,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  calculateDistanceKm,
} from '@/lib/utils';
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Car,
  Truck,
  Droplets,
  Train,
  Check,
  X,
  Share2,
  Copy,
  Gauge,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface IncidentCardProps {
  incident: Incident;
  userCoords?: { lat: number; lng: number } | null;
  onConfirm?: (incidentId: string) => Promise<void>;
  onDispute?: (incidentId: string) => Promise<void>;
  onClose?: () => void;
  isDetailedView?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  userCoords,
  onConfirm,
  onDispute,
  onClose,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [hasVoted, setHasVoted] = useState<'CONFIRMED' | 'DISPUTED' | null>(null);
  const [copiedSitRep, setCopiedSitRep] = useState(false);

  const cfg = INCIDENT_CONFIG[incident.type] || INCIDENT_CONFIG.GENERAL;
  const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.MEDIUM;
  const stat = STATUS_CONFIG[incident.status] || STATUS_CONFIG.ACTIVE;

  // Calculate distance if user coords available
  const distanceKm = userCoords
    ? calculateDistanceKm(userCoords.lat, userCoords.lng, incident.latitude, incident.longitude)
    : null;

  const handleConfirm = async () => {
    if (hasVoted || isConfirming) return;
    setIsConfirming(true);
    try {
      if (onConfirm) await onConfirm(incident.id);
      setHasVoted('CONFIRMED');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDispute = async () => {
    if (hasVoted || isDisputing) return;
    setIsDisputing(true);
    try {
      if (onDispute) await onDispute(incident.id);
      setHasVoted('DISPUTED');
    } finally {
      setIsDisputing(false);
    }
  };

  const handleShareSitRep = () => {
    tacticalAudio.playTacticalBeep(960, 0.05);
    const waterInfo = incident.floodDetails?.waterLevelCm
      ? `ระดับน้ำท่วม: ${incident.floodDetails.waterLevelCm} ซม. (${incident.floodDetails.smallCarPassable ? 'รถเล็กผ่านได้' : 'รถเก๋งไม่ควรผ่าน'})\n`
      : '';
    const text = `[ALERTBKK SITUATION REPORT]\nประเภทเหตุ: ${cfg.label}\nสถานที่: ${incident.locationName} (${incident.province || 'กทม.'})\n${waterInfo}รายละเอียด: ${incident.description}\nพิกัด GPS: ${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}\nเวลา: ${new Date(incident.createdAt).toLocaleTimeString('th-TH')}\nตรวจสอบแผนที่สด: https://alertbkk-map.vercel.app/incident/${incident.id}`;
    navigator.clipboard.writeText(text);
    setCopiedSitRep(true);
    setTimeout(() => setCopiedSitRep(false), 2500);
  };

  return (
    <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col gap-3 relative backdrop-blur-xl transition-all">
      {/* Top Header: Category, Severity, Status & Close */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: cfg.icon }}
          />
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bgBadge}`}>
            {cfg.label}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${sev.bg} ${sev.border} ${sev.color}`}>
            Severity: {sev.label}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${stat.badge}`}>
            {stat.label}
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Title & Location */}
      <div>
        <Link
          href={`/incident/${incident.id}`}
          className="font-bold text-base sm:text-lg text-slate-100 leading-snug hover:text-cyan-400 transition-colors flex items-center justify-between gap-1 group"
          title="Click to view full incident details"
        >
          <span className="group-hover:underline">{incident.title}</span>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-cyan-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">{incident.locationName}</span>
          </span>
          {incident.district && <span>• {incident.district}</span>}
          {distanceKm !== null && (
            <span className="text-amber-400 font-medium">
              ({formatDistance(distanceKm)} away)
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
        {incident.description}
      </p>

      {/* Category-Specific Custom Badges */}
      {/* 1. FLOOD Details */}
      {incident.type === 'FLOOD' && incident.floodDetails && (
        <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-xl p-2.5 text-xs flex flex-col gap-2 text-cyan-200">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>ระดับน้ำ: <strong className="text-white">{incident.floodDetails.waterLevelCm ? `${incident.floodDetails.waterLevelCm} ซม.` : incident.floodDetails.waterLevelCategory}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-cyan-400" />
              <span>รถเก๋ง: <strong className={incident.floodDetails.smallCarPassable ? 'text-emerald-400' : 'text-red-400'}>{incident.floodDetails.smallCarPassable ? 'ผ่านได้ชะลอตัว' : 'เสี่ยงน้ำเข้าท่อ'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>รถยกสูง/กระบะ: <strong className={incident.floodDetails.largeTruckPassable ? 'text-emerald-400' : 'text-amber-400'}>{incident.floodDetails.largeTruckPassable ? 'ผ่านได้' : 'ควรระวัง'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>สภาพผิวทาง: <strong className={incident.floodDetails.roadBlocked ? 'text-red-400' : 'text-emerald-400'}>{incident.floodDetails.roadBlocked ? 'ปิดการจราจร' : 'เปิดสัญจร'}</strong></span>
            </div>
          </div>

          {/* Vehicle Clearance Risk Indicator Bar */}
          <div className="pt-1.5 border-t border-cyan-800/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">คำแนะนำยานพาหนะ:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md ${
              !incident.floodDetails.smallCarPassable
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {!incident.floodDetails.smallCarPassable ? 'เฉพาะรถยกสูง / SUV / 4WD' : 'รถทุกประเภทสัญจรได้'}
            </span>
          </div>
        </div>
      )}

      {/* 2. TRAFFIC Details */}
      {incident.type === 'TRAFFIC' && incident.trafficDetails && (
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-2.5 text-xs grid grid-cols-2 gap-2 text-amber-200">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>Speed: <strong className="text-white">{incident.trafficDetails.speedKmh ? `${incident.trafficDetails.speedKmh} km/h` : '-'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Tailback: <strong className="text-white">{incident.trafficDetails.queueLengthKm ? `${incident.trafficDetails.queueLengthKm} km` : '-'}</strong></span>
          </div>
          {incident.trafficDetails.cause && (
            <div className="col-span-2 text-slate-300">
              Cause: <span className="text-amber-300">{incident.trafficDetails.cause}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. TRANSIT Details */}
      {incident.type === 'TRANSIT' && incident.transitDetails && (
        <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-2.5 text-xs flex flex-col gap-1.5 text-purple-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1">
              <Train className="w-4 h-4 text-purple-400" />
              {incident.transitDetails.lineName}
            </span>
            <span className="text-amber-400 font-bold">
              Delayed ~{incident.transitDetails.delayMinutes || 10} mins
            </span>
          </div>
          {incident.transitDetails.stationName && (
            <p className="text-slate-300 text-[11px]">
              Affected Station: {incident.transitDetails.stationName}
            </p>
          )}
        </div>
      )}

      {/* Photo Gallery (thumbnails) */}
      {incident.images && incident.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-1">
          {incident.images.map((img, idx) => (
            <div
              key={idx}
              className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700 relative group cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption || 'Incident Photo'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
          ))}
          {incident.images.length > 2 && (
            <div className="flex items-center justify-center w-12 text-xs text-slate-400 font-medium">
              +{incident.images.length - 2} photos
            </div>
          )}
        </div>
      )}

      {/* Time & Verification Trust Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Reported {formatThaiRelativeTime(incident.createdAt)}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Updated {formatThaiRelativeTime(incident.updatedAt)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            👥 {incident.confirmCount} Verified
          </span>
          {incident.disputeCount > 0 && (
            <span className="text-amber-400 flex items-center gap-1">
              ⚠️ {incident.disputeCount} Disputed
            </span>
          )}
        </div>
      </div>

      {/* Trust Community Badge */}
      {incident.confirmCount >= 5 && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Multiple citizen verifications recorded</span>
        </div>
      )}

      {/* Action Buttons: Confirm / Dispute / View Details */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={handleConfirm}
          disabled={hasVoted !== null || isConfirming}
          className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            hasVoted === 'CONFIRMED'
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 active:scale-95'
          }`}
          title="Confirm that incident is currently active"
        >
          {hasVoted === 'CONFIRMED' ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Confirmed</span>
            </>
          ) : (
            <>
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Still Active</span>
            </>
          )}
        </button>

        <button
          onClick={handleDispute}
          disabled={hasVoted !== null || isDisputing}
          className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            hasVoted === 'DISPUTED'
              ? 'bg-red-600 text-white cursor-default'
              : 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 active:scale-95'
          }`}
          title="Report that incident is cleared or inaccurate"
        >
          {hasVoted === 'DISPUTED' ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Recorded</span>
            </>
          ) : (
            <>
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Cleared</span>
            </>
          )}
        </button>

        <Link
          href={`/incident/${incident.id}`}
          className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
        >
          <span>Timeline</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {/* Tactical SitRep Copy / Share Button */}
        <button
          onClick={handleShareSitRep}
          className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            copiedSitRep
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700/80 text-slate-300 hover:text-white'
          }`}
          title="คัดลอกรายงานสรุปสถานการณ์ (Copy Situation Report for LINE / Twitter)"
        >
          {copiedSitRep ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedSitRep ? 'คัดลอกแล้ว' : 'แชร์'}</span>
        </button>
      </div>
    </div>
  );
};
