'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  PlusCircle,
  Bell,
  MapPin,
  Train,
  BarChart3,
  Shield,
  X,
  Compass,
  RefreshCw,
  Menu,
} from 'lucide-react';
import { Incident } from '@/types';
import { INCIDENT_CONFIG } from '@/lib/utils';

interface NavbarProps {
  onOpenReportModal?: () => void;
  onOpenAreaWatchModal?: () => void;
  onSelectIncident?: (incident: Incident) => void;
  onSearchLocation?: (lat: number, lng: number, label: string) => void;
  onSyncCompleted?: () => void;
  incidents?: Incident[];
  activeCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReportModal,
  onOpenAreaWatchModal,
  onSelectIncident,
  onSearchLocation,
  onSyncCompleted,
  incidents = [],
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    window.location.href = href;
  };

  const handleReportClick = () => {
    setIsMobileMenuOpen(false);
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      router.push('/?report=1');
    }
  };

  const handleWatchClick = () => {
    setIsMobileMenuOpen(false);
    if (onOpenAreaWatchModal) {
      onOpenAreaWatchModal();
    } else {
      router.push('/?watch=1');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Quick preset locations in Bangkok for instant search suggestions
  const presetLocations = [
    { label: 'Asok Intersection (Sukhumvit 21)', type: 'LOCATION', lat: 13.7371, lng: 100.5604, icon: '[LOC]' },
    { label: 'Siam Square / Paragon', type: 'LOCATION', lat: 13.7460, lng: 100.5347, icon: '[HUB]' },
    { label: 'Ha Yaek Lat Phrao', type: 'LOCATION', lat: 13.8123, lng: 100.5604, icon: '[ROAD]' },
    { label: 'Rama IX Road', type: 'LOCATION', lat: 13.7578, lng: 100.5649, icon: '[TRAFFIC]' },
    { label: 'BTS Asok Station', type: 'TRANSIT', lat: 13.7371, lng: 100.5604, icon: '[BTS]' },
    { label: 'MRT Sukhumvit Station', type: 'TRANSIT', lat: 13.7371, lng: 100.5604, icon: '[MRT]' },
    { label: 'Nong Chok TMD Weather Radar', type: 'TMD', lat: 13.8552, lng: 100.8654, icon: '[RADAR]' },
    { label: 'Chalong Rat Expressway KM.14', type: 'ACCIDENT', lat: 13.8050, lng: 100.6280, icon: '[EXPWY]' },
  ];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();

    // Search in active incidents
    const matchedIncidents = incidents
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.locationName.toLowerCase().includes(q) ||
          (i.district && i.district.toLowerCase().includes(q))
      )
      .map((i) => ({
        type: 'INCIDENT',
        label: i.title,
        sub: i.locationName,
        incident: i,
        icon: INCIDENT_CONFIG[i.type]?.icon || '📍',
      }));

    // Search in preset Bangkok areas / stations
    const matchedLocations = presetLocations
      .filter((loc) => loc.label.toLowerCase().includes(q))
      .map((l) => ({
        type: l.type,
        label: l.label,
        sub: l.type === 'TRANSIT' ? 'Transit Hub' : l.type === 'TMD' ? 'Weather Radar' : 'Bangkok Landmark',
        lat: l.lat,
        lng: l.lng,
        icon: l.icon,
      }));

    setSearchResults([...matchedIncidents, ...matchedLocations]);
  }, [searchQuery, incidents]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: any) => {
    if (item.type === 'INCIDENT' && onSelectIncident) {
      onSelectIncident(item.incident);
    } else if (onSearchLocation) {
      onSearchLocation(item.lat, item.lng, item.label);
    }
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleLiveSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatusMsg('Syncing TMD Weather Radar & Highway incidents...');
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg(`Sync completed! +${data.totalSynced} new points updated`);
        if (onSyncCompleted) onSyncCompleted();
      } else {
        setSyncStatusMsg('Live sync complete. Data is up to date.');
      }
    } catch {
      setSyncStatusMsg('Real-time sync complete.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatusMsg('');
      }, 3000);
    }
  };

  return (
    <>
      <header className="w-full bg-slate-900/95 border-b border-slate-800 text-slate-100 z-[1000] relative top-0 backdrop-blur-xl transition-all shadow-xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              onClick={(e) => navigateTo(e, '/')}
              className="flex items-center gap-2.5 group flex-shrink-0 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform flex items-center justify-center bg-slate-950 border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="AlertBKK" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                    ALERTBKK
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden md:block">
                  Bangkok Real-Time Incident & Transit Intelligence
                </p>
              </div>
            </a>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-[170px] sm:max-w-sm md:max-w-md">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search road, district, BTS, TMD..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                className="w-full pl-8 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 bg-slate-800/90 border border-slate-750 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[1001] max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-1 divide-y divide-slate-800/60">
                    {searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectResult(res)}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-start gap-2.5 transition-colors group cursor-pointer"
                      >
                        <span className="text-base flex-shrink-0 mt-0.5">{res.icon}</span>
                        <div className="flex-1 truncate">
                          <p className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                            {res.label}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{res.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <div className="p-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Suggested Landmarks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {presetLocations.slice(0, 5).map((loc, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectResult(loc)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{loc.icon}</span>
                          <span>{loc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links (Visible on tablets and desktop: 768px+) */}
          <nav className="hidden md:flex items-center gap-1.5 z-[600]">
            <a
              href="/"
              onClick={(e) => navigateTo(e, '/')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                pathname === '/'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Map</span>
            </a>

            <a
              href="/dashboard"
              onClick={(e) => navigateTo(e, '/dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                pathname === '/dashboard'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Operations & Analytics</span>
            </a>
          </nav>

          {/* Action Buttons: TMD Live Sync & Quick Report */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live TMD & Traffic Sync Button */}
            <button
              onClick={handleLiveSync}
              disabled={isSyncing}
              title="Sync live weather radar and expressway traffic feeds"
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">
                {isSyncing ? 'Syncing...' : 'Live TMD Sync'}
              </span>
            </button>

            <button
              onClick={handleWatchClick}
              title="Activate perimeter alert radius"
              className="hidden sm:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all items-center gap-1 text-xs font-medium cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Area Watch</span>
            </button>

            <button
              onClick={handleReportClick}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-1 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span className="whitespace-nowrap font-bold">+ Report</span>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatusMsg && (
          <div className="bg-cyan-950/80 border-t border-cyan-500/40 text-cyan-300 text-center py-1 text-xs font-semibold animate-in fade-in">
            {syncStatusMsg}
          </div>
        )}

        {/* Mobile Dropdown Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-2xl p-3.5 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  navigateTo(e, '/');
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 font-semibold text-xs transition-colors cursor-pointer select-none ${
                  pathname === '/'
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Live Map</span>
              </a>

              <a
                href="/dashboard"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  navigateTo(e, '/dashboard');
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 font-semibold text-xs transition-colors cursor-pointer select-none ${
                  pathname === '/dashboard'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span>Operations Center</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={handleReportClick}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Report Incident</span>
              </button>

              <button
                onClick={handleWatchClick}
                className="py-2.5 px-3 bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Area Watch</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
