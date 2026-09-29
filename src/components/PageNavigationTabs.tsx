'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MapPin, Train, BarChart3 } from 'lucide-react';

export const PageNavigationTabs: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    {
      href: '/',
      label: 'Live Map',
      icon: MapPin,
      activeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-semibold',
      iconColor: 'text-cyan-400',
    },
    {
      href: '/transport',
      label: 'Transit Status',
      icon: Train,
      activeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20 font-semibold',
      iconColor: 'text-purple-400',
    },
    {
      href: '/dashboard',
      label: 'Analytics',
      icon: BarChart3,
      activeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-semibold',
      iconColor: 'text-emerald-400',
    },
  ];

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    window.location.href = href;
  };

  return (
    <nav className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/90 rounded-2xl w-fit max-w-full overflow-x-auto shadow-2xl backdrop-blur-xl flex-shrink-0 z-[600]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <a
            key={tab.href}
            href={tab.href}
            onClick={(e) => handleNavigate(e, tab.href)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border cursor-pointer select-none ${
              isActive
                ? tab.activeColor
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 active:bg-slate-800'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? tab.iconColor : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
};
