'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MapPin, Train, BarChart3, PlusCircle } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenReport?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenReport }) => {
  const pathname = usePathname();

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    window.location.href = href;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-6 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
      {/* 1. Map Tab */}
      <a
        href="/"
        onClick={(e) => handleNavigate(e, '/')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer select-none ${
          pathname === '/'
            ? 'text-cyan-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-lg ${pathname === '/' ? 'bg-cyan-500/20' : ''}`}>
          <MapPin className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5">Map</span>
      </a>

      {/* 2. Center Floating Report Action Button */}
      {onOpenReport ? (
        <button
          onClick={onOpenReport}
          className="flex flex-col items-center justify-center -mt-5 py-1 px-2 group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 border-2 border-slate-950 group-hover:scale-105 transition-all">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-cyan-300 mt-0.5">Report</span>
        </button>
      ) : (
        <a
          href="/?report=1"
          className="flex flex-col items-center justify-center -mt-5 py-1 px-2 group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 border-2 border-slate-950 group-hover:scale-105 transition-all">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-cyan-300 mt-0.5">Report</span>
        </a>
      )}

      {/* 3. All-in-One Dashboard Tab */}
      <a
        href="/dashboard"
        onClick={(e) => handleNavigate(e, '/dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer select-none ${
          pathname === '/dashboard'
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-lg ${pathname === '/dashboard' ? 'bg-emerald-500/20' : ''}`}>
          <BarChart3 className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5">Dashboard</span>
      </a>
    </nav>
  );
};
