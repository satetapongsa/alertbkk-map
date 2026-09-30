'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Grid,
  Layers,
  Gauge,
  Waves,
  Car,
  Plane,
  ShieldAlert,
  ShieldCheck,
  Compass,
  AlertOctagon,
  Bell,
  Camera,
  CloudRain,
  MapPin,
  ExternalLink,
  ChevronRight,
  Radio,
  PlusCircle,
  Truck,
  Package,
  Wind,
} from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface FeatureItem {
  id: string;
  titleTh: string;
  titleEn: string;
  category: 'FLOOD' | 'TRAFFIC' | 'EMERGENCY' | 'RECON';
  categoryTh: string;
  icon: React.ElementType;
  colorClasses: string;
  borderClasses: string;
  description: string;
  badge?: string;
  onLaunch: () => void;
}

interface AllFeaturesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCategories: () => void;
  onOpenVehicleSimulator: () => void;
  onOpenWaterTide: () => void;
  onOpenExpressway: () => void;
  onOpenFlightRadar: () => void;
  onOpenHazardScanner: () => void;
  onOpenDistricts: () => void;
  onOpenSos: () => void;
  onOpenSurvivalGuide: () => void;
  onOpenAreaWatch: () => void;
  onOpenReport: () => void;
  onOpenPumpTrucks?: () => void;
  onOpenSandbagDepot?: () => void;
  onOpenAirQuality?: () => void;
  onOpenOfflineSos?: () => void;
}

export const AllFeaturesHubModal: React.FC<AllFeaturesHubModalProps> = ({
  isOpen,
  onClose,
  onOpenCategories,
  onOpenVehicleSimulator,
  onOpenWaterTide,
  onOpenExpressway,
  onOpenFlightRadar,
  onOpenHazardScanner,
  onOpenDistricts,
  onOpenSos,
  onOpenSurvivalGuide,
  onOpenAreaWatch,
  onOpenReport,
  onOpenPumpTrucks,
  onOpenSandbagDepot,
  onOpenAirQuality,
  onOpenOfflineSos,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'FLOOD' | 'TRAFFIC' | 'EMERGENCY' | 'RECON'>('ALL');

  if (!isOpen) return null;

  const features: FeatureItem[] = [
    {
      id: 'categories',
      titleTh: 'หมวดหมู่เหตุการณ์สด 100%',
      titleEn: 'Real-Time Incident Categories',
      category: 'RECON',
      categoryTh: 'สำรวจและเฝ้าระวัง',
      icon: Layers,
      colorClasses: 'text-cyan-400 bg-cyan-500/15',
      borderClasses: 'border-cyan-500/40 hover:border-cyan-400',
      description: 'เลือกกรองดูเหตุการณ์เฉพาะหมวดหมู่ เช่น น้ำท่วม รถติด อุบัติเหตุ ถนนปิด ขนส่งมวลชน',
      badge: 'LIVE',
      onLaunch: onOpenCategories,
    },
    {
      id: 'vehicle-sim',
      titleTh: 'คำนวณน้ำท่วมตามรุ่นรถ',
      titleEn: 'Vehicle Flood Clearance Simulator',
      category: 'FLOOD',
      categoryTh: 'น้ำท่วมและสภาพอากาศ',
      icon: Gauge,
      colorClasses: 'text-sky-400 bg-sky-500/15',
      borderClasses: 'border-sky-500/40 hover:border-sky-400',
      description: 'จำลองระดับน้ำท่วมผิวถนนเทียบกับความสูงใต้ท้องรถเก๋ง, SUV, กระบะ 4WD, EV และมอเตอร์ไซค์',
      badge: 'POPULAR',
      onLaunch: onOpenVehicleSimulator,
    },
    {
      id: 'water-tide',
      titleTh: 'ระดับน้ำเจ้าพระยาและอุโมงค์ยักษ์',
      titleEn: 'Chao Phraya Hydro-Telemetry & Sluice Gates',
      category: 'FLOOD',
      categoryTh: 'น้ำท่วมและสภาพอากาศ',
      icon: Waves,
      colorClasses: 'text-cyan-400 bg-cyan-500/15',
      borderClasses: 'border-cyan-500/40 hover:border-cyan-400',
      description: 'ติดตาม 4 สถานีวัดน้ำเจ้าพระยา (ปากคลองตลาด, สะพานพุทธ, บางนา, พระราม 7) และอุโมงค์ยักษ์พระราม 9',
      badge: 'TELEMETRY',
      onLaunch: onOpenWaterTide,
    },
    {
      id: 'expressway',
      titleTh: 'โครงข่ายทางด่วน กทม.',
      titleEn: 'Bangkok Expressways Network & Ramps',
      category: 'TRAFFIC',
      categoryTh: 'จราจรและการเดินทาง',
      icon: Car,
      colorClasses: 'text-blue-400 bg-blue-500/15',
      borderClasses: 'border-blue-500/40 hover:border-blue-400',
      description: 'เช็กสภาพผิวทางยกระดับ ทางด่วนขั้น 1, ศรีรัช, ฉลองรัช, โทลล์เวย์ และจุดลงหนีน้ำท่วม',
      badge: 'BYPASS',
      onLaunch: onOpenExpressway,
    },
    {
      id: 'flight-radar',
      titleTh: 'เรดาร์เที่ยวบินสด สุวรรณภูมิ/ดอนเมือง',
      titleEn: 'Live Airspace ADS-B Flight Radar',
      category: 'TRAFFIC',
      categoryTh: 'จราจรและการเดินทาง',
      icon: Plane,
      colorClasses: 'text-indigo-400 bg-indigo-500/15',
      borderClasses: 'border-indigo-500/40 hover:border-indigo-400',
      description: 'ตรวจจับสถานะเที่ยวบินขึ้น-ลงรอบน่านฟ้ากรุงเทพมหานครแบบเรียลไทม์',
      badge: 'RADAR',
      onLaunch: onOpenFlightRadar,
    },
    {
      id: 'hazard-scan',
      titleTh: 'สแกนเส้นทางปลอดภัย',
      titleEn: 'Safe Commute Corridor Scanner',
      category: 'TRAFFIC',
      categoryTh: 'จราจรและการเดินทาง',
      icon: ShieldCheck,
      colorClasses: 'text-emerald-400 bg-emerald-500/15',
      borderClasses: 'border-emerald-500/40 hover:border-emerald-400',
      description: 'สแกนแนวเส้นทางกลับบ้าน/ที่ทำงาน เพื่อตรวจสอบจุดกีดขวาง น้ำท่วม และอุบัติเหตุขวางทาง',
      badge: 'SAFETY',
      onLaunch: onOpenHazardScanner,
    },
    {
      id: 'sos',
      titleTh: 'สายด่วนฉุกเฉินและกู้ภัย กทม.',
      titleEn: '24-Hour Emergency SOS Hotlines',
      category: 'EMERGENCY',
      categoryTh: 'ความปลอดภัยและฉุกเฉิน',
      icon: AlertOctagon,
      colorClasses: 'text-rose-400 bg-rose-500/15',
      borderClasses: 'border-rose-500/40 hover:border-rose-400',
      description: 'รวมเบอร์โทรฉุกเฉิน 24 ชั่วโมง ดับเพลิง (199), กู้ชีพ (1669), ศูนย์กทม. (1555), ไฟฟ้ารั่ว (1130)',
      badge: '24 HR',
      onLaunch: onOpenSos,
    },
    {
      id: 'survival',
      titleTh: 'คู่มือเอาตัวรอด & ตัดไฟฟ้ารั่ว',
      titleEn: 'Electrical Flood Safety & Survival Guide',
      category: 'EMERGENCY',
      categoryTh: 'ความปลอดภัยและฉุกเฉิน',
      icon: ShieldAlert,
      colorClasses: 'text-amber-400 bg-amber-500/15',
      borderClasses: 'border-amber-500/40 hover:border-amber-400',
      description: 'กฎเหล็กความปลอดภัยการตัดเบรกเกอร์ชั้นล่าง การสังเกตไฟฟ้ารั่วในน้ำ และจัดกระเป๋า 72 ชม.',
      badge: 'GUIDE',
      onLaunch: onOpenSurvivalGuide,
    },
    {
      id: 'districts',
      titleTh: 'สำรวจพิกัด 50 เขต กทม.',
      titleEn: 'Bangkok 50 Districts Explorer',
      category: 'RECON',
      categoryTh: 'สำรวจและเฝ้าระวัง',
      icon: Compass,
      colorClasses: 'text-cyan-400 bg-cyan-500/15',
      borderClasses: 'border-cyan-500/40 hover:border-cyan-400',
      description: 'ค้นหาและวาร์ปกล้องแผนที่ไปยัง 50 เขตทั่วกรุงเทพฯ พร้อมรหัสไปรษณีย์และพิกัดศูนย์กลางเขต',
      badge: 'BKK',
      onLaunch: onOpenDistricts,
    },
    {
      id: 'area-watch',
      titleTh: 'เฝ้าระวังรอบพิกัดบ้าน (Area Watch)',
      titleEn: 'Perimeter Alert & Radius Watch',
      category: 'RECON',
      categoryTh: 'สำรวจและเฝ้าระวัง',
      icon: Bell,
      colorClasses: 'text-yellow-400 bg-yellow-500/15',
      borderClasses: 'border-yellow-500/40 hover:border-yellow-400',
      description: 'กำหนดรัศมีวงกลมเฝ้าระวังรอบบ้านหรือที่ทำงาน (1-10 กม.) เพื่อรับการเตือนภัยก่อนใคร',
      badge: 'WATCH',
      onLaunch: onOpenAreaWatch,
    },
    {
      id: 'report-incident',
      titleTh: 'แจ้งเหตุและเตือนภัยชุมชน',
      titleEn: 'Citizen Incident Reporting Tool',
      category: 'EMERGENCY',
      categoryTh: 'ความปลอดภัยและฉุกเฉิน',
      icon: PlusCircle,
      colorClasses: 'text-emerald-400 bg-emerald-500/15',
      borderClasses: 'border-emerald-500/40 hover:border-emerald-400',
      description: 'ส่งรายงานน้ำท่วม รถติด หรืออุบัติเหตุพร้อมระบุพิกัด GPS เพื่อแจ้งเตือนผู้อื่นแบบเรียลไทม์',
      badge: 'REPORT',
      onLaunch: onOpenReport,
    },
    {
      id: 'pump-trucks',
      titleTh: 'หน่วยสูบน้ำเคลื่อนที่เร็ว (หน่วยเบสท์ กทม.)',
      titleEn: 'BMA Mobile Pump Truck Units',
      category: 'FLOOD',
      categoryTh: 'น้ำท่วมและสภาพอากาศ',
      icon: Truck,
      colorClasses: 'text-cyan-400 bg-cyan-500/15',
      borderClasses: 'border-cyan-500/40 hover:border-cyan-400',
      description: 'ตรวจพิกัดรถสูบน้ำแรงดันสูงประจำจุดเสี่ยงน้ำท่วม พร้อมสถานะเดินเครื่องและเบอร์นายช่างประจำจุด',
      badge: 'BEST UNIT',
      onLaunch: onOpenPumpTrucks || onOpenWaterTide,
    },
    {
      id: 'sandbag-depots',
      titleTh: 'จุดแจกกระสอบทราย & ศูนย์บรรเทาภัย 50 เขต',
      titleEn: 'Sandbag Distribution & Relief Depots',
      category: 'EMERGENCY',
      categoryTh: 'ความปลอดภัยและฉุกเฉิน',
      icon: Package,
      colorClasses: 'text-amber-400 bg-amber-500/15',
      borderClasses: 'border-amber-500/40 hover:border-amber-400',
      description: 'ตรวจสอบจุดขอรับกระสอบทรายฟรีกั้นน้ำเข้าบ้าน ณ สำนักงานเขต 50 เขต พร้อมยอดคงเหลือ',
      badge: 'FREE',
      onLaunch: onOpenSandbagDepot || onOpenSos,
    },
    {
      id: 'air-quality',
      titleTh: 'ดัชนีคุณภาพอากาศ & ฝุ่น PM2.5 กทม.',
      titleEn: 'AirBKK PM2.5 & Air Quality Telemetry',
      category: 'RECON',
      categoryTh: 'สำรวจและเฝ้าระวัง',
      icon: Wind,
      colorClasses: 'text-teal-400 bg-teal-500/15',
      borderClasses: 'border-teal-500/40 hover:border-teal-400',
      description: 'ตรวจวัดระดับฝุ่น PM2.5 และดัชนี AQI รายเขต พร้อมคำแนะนำการสวมหน้ากากอนามัย N95',
      badge: 'AIR QUALITY',
      onLaunch: onOpenAirQuality || onOpenDistricts,
    },
    {
      id: 'offline-sos',
      titleTh: 'ขอความช่วยเหลือฉุกเฉินผ่าน SMS / ดาวเทียม',
      titleEn: 'Emergency Offline SOS Satellite Beacon',
      category: 'EMERGENCY',
      categoryTh: 'ความปลอดภัยและฉุกเฉิน',
      icon: Radio,
      colorClasses: 'text-rose-400 bg-rose-500/15',
      borderClasses: 'border-rose-500/40 hover:border-rose-400',
      description: 'สร้างรหัสพิกัดขอความช่วยเหลือฉุกเฉิน ส่งผ่าน SMS และโครงข่ายสัญญาณต่ำ เมื่อเน็ตมือถือดับหรือติดค้างในน้ำท่วมสูง',
      badge: 'OFFLINE SOS',
      onLaunch: onOpenOfflineSos || onOpenSos,
    },
  ];

  const filteredFeatures = useMemo(() => {
    return features.filter((item) => {
      const matchesTab = activeTab === 'ALL' || item.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.titleTh.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryTh.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [features, activeTab, searchQuery]);

  const handleLaunch = (fn: () => void) => {
    tacticalAudio.playTacticalBeep(880, 0.04);
    onClose();
    fn();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  ศูนย์รวมเครื่องมือและฟีเจอร์ AlertBKK (Command Hub)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {features.length} เครื่องมือ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                รวมทุกฟังก์ชันการรายงานน้ำท่วม การจราจร โครงข่ายทางด่วน และการกู้ภัย กทม.
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

        {/* Search Bar & Category Filter Tabs */}
        <div className="p-3 sm:p-4 bg-slate-950/60 border-b border-slate-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเครื่องมือ เช่น น้ำท่วม, ทางด่วน, เรดาร์, ตัดไฟ, สายด่วน, รถไฟฟ้า..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Segmented Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'FLOOD', label: 'น้ำท่วม & สภาพอากาศ' },
              { id: 'TRAFFIC', label: 'จราจร & ทางด่วน' },
              { id: 'EMERGENCY', label: 'ฉุกเฉิน & กู้ภัย' },
              { id: 'RECON', label: 'สำรวจ & 50 เขต' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleLaunch(item.onLaunch)}
                  className={`p-3.5 rounded-2xl bg-slate-850/80 border ${item.borderClasses} hover:bg-slate-800 transition-all cursor-pointer group flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${item.colorClasses}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.categoryTh}
                        </span>
                      </div>

                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {item.titleTh}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">
                      {item.titleEn}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 group-hover:text-cyan-300">
                    <span className="font-medium">เปิดใช้งานเครื่องมือ</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">ไม่พบเครื่องมือที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400">ระบบเชื่อมต่อสัญญาณโทรมาตรเรียลไทม์ 24 ชม.</span>
          </div>
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
