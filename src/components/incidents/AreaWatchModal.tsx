'use client';

import React, { useState } from 'react';
import { X, Bell, Check } from 'lucide-react';

interface AreaWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords?: { lat: number; lng: number } | null;
  onSaveWatchArea?: (area: { name: string; radiusKm: number }) => void;
}

export const AreaWatchModal: React.FC<AreaWatchModalProps> = ({
  isOpen,
  onClose,
  userCoords,
  onSaveWatchArea,
}) => {
  const [areaName, setAreaName] = useState('Home / Work Perimeter');
  const [radiusKm, setRadiusKm] = useState(3.0);
  const [notifyFlood, setNotifyFlood] = useState(true);
  const [notifyTraffic, setNotifyTraffic] = useState(true);
  const [notifyAccident, setNotifyAccident] = useState(true);
  const [notifyTransit, setNotifyTransit] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSaveWatchArea) {
      onSaveWatchArea({ name: areaName, radiusKm });
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Area Watch Radius
              </h3>
              <p className="text-[11px] text-slate-400">
                Receive live alerts whenever an incident happens in your vicinity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Watch Perimeter Name
            </label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Alert Radius</span>
              <span className="text-amber-400 font-mono text-sm">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 km</span>
              <span>5 km</span>
              <span>10 km</span>
              <span>15 km</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Notification Incident Types
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyFlood}
                  onChange={(e) => setNotifyFlood(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>💧 Flooding</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyAccident}
                  onChange={(e) => setNotifyAccident(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>🚨 Accidents</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyTraffic}
                  onChange={(e) => setNotifyTraffic(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>🚗 Congestion</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyTransit}
                  onChange={(e) => setNotifyTransit(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>🚇 Transit Delays</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-slate-950" />
                <span>Activate Area Watch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
