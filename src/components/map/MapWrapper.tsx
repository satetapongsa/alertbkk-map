'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Incident } from '@/types';
import { Compass } from 'lucide-react';

interface MapWrapperProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  userCoords?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  watchArea?: { lat: number; lng: number; radiusKm: number } | null;
  onLocateUser?: (coords: { lat: number; lng: number }) => void;
}

const DynamicLeafletMap = dynamic(
  () => import('./LeafletMap').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center animate-spin">
          <Compass className="w-6 h-6 text-cyan-400" />
        </div>
        <p className="text-xs font-medium text-slate-400 tracking-wide">
          กำลังโหลดแผนที่สถานการณ์เรียลไทม์...
        </p>
      </div>
    ),
  }
);

export const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  return <DynamicLeafletMap {...props} />;
};
