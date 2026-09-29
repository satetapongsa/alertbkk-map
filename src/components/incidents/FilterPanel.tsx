'use client';

import React from 'react';
import { IncidentType, TimeFilter, Incident } from '@/types';
import {
  Clock,
  History,
  Train,
  BarChart3,
  Zap,
  Droplets,
  Car,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Construction
} from 'lucide-react';

interface FilterPanelProps {
  selectedType: IncidentType | 'ALL';
  onSelectType: (type: IncidentType | 'ALL') => void;
  selectedTime: TimeFilter;
  onSelectTime: (time: TimeFilter) => void;
  showHistorical: boolean;
  onToggleHistorical: (show: boolean) => void;
  incidents: Incident[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedType,
  onSelectType,
  selectedTime,
  onSelectTime,
  showHistorical,
  onToggleHistorical,
  incidents,
}) => {
  const categories: { id: IncidentType | 'ALL'; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'ALL', label: 'All Incidents', icon: <Zap className="w-3.5 h-3.5" />, count: incidents.length },
    {
      id: 'FLOOD',
      label: 'Flood',
      icon: <Droplets className="w-3.5 h-3.5 text-cyan-400" />,
      count: incidents.filter((i) => i.type === 'FLOOD').length,
    },
    {
      id: 'TRAFFIC',
      label: 'Traffic Jam',
      icon: <Car className="w-3.5 h-3.5 text-amber-400" />,
      count: incidents.filter((i) => i.type === 'TRAFFIC').length,
    },
    {
      id: 'ACCIDENT',
      label: 'Accident',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
      count: incidents.filter((i) => i.type === 'ACCIDENT').length,
    },
    {
      id: 'ROAD_CLOSED',
      label: 'Road Closed',
      icon: <Construction className="w-3.5 h-3.5 text-orange-400" />,
      count: incidents.filter((i) => i.type === 'ROAD_CLOSED').length,
    },
    {
      id: 'TRANSIT',
      label: 'Transit Alert',
      icon: <Train className="w-3.5 h-3.5 text-purple-400" />,
      count: incidents.filter((i) => i.type === 'TRANSIT').length,
    },
    {
      id: 'EMERGENCY',
      label: 'Emergency',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      count: incidents.filter((i) => i.type === 'EMERGENCY').length,
    },
    {
      id: 'GENERAL',
      label: 'General',
      icon: <MapPin className="w-3.5 h-3.5 text-blue-400" />,
      count: incidents.filter((i) => i.type === 'GENERAL').length,
    },
  ];

  const timeOptions: { id: TimeFilter; label: string }[] = [
    { id: 'LIVE', label: 'LIVE' },
    { id: '1H', label: '1H' },
    { id: '3H', label: '3H' },
    { id: '6H', label: '6H' },
    { id: 'TODAY', label: 'Today' },
    { id: '24H', label: '24H' },
    { id: '7D', label: '7D' },
  ];

  return (
    <div className="flex flex-col gap-2 z-30">
      {/* Category Pills Bar (Horizontal scrollable on small screens) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isActive = selectedType === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectType(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 backdrop-blur-xl shadow-lg ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-750/70 hover:border-slate-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time Filter & Historical Toggle */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-2.5 py-1.5 rounded-xl shadow-xl w-fit max-w-full overflow-x-auto">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {timeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectTime(opt.id)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                selectedTime === opt.id
                  ? 'bg-slate-700/90 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="h-3 w-[1px] bg-slate-800 mx-1 flex-shrink-0" />

        <button
          onClick={() => onToggleHistorical(!showHistorical)}
          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition-colors flex-shrink-0 cursor-pointer ${
            showHistorical
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle resolved & past incidents"
        >
          <History className="w-3 h-3" />
          <span>Archive</span>
        </button>
      </div>
    </div>
  );
};
