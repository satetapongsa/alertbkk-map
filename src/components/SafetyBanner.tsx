import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/90 border-b border-amber-500/20 px-3 sm:px-4 py-1.5 text-xs text-amber-300/90 flex items-center justify-between gap-2 z-[999] relative backdrop-blur-md">
      <div className="flex items-center gap-2 truncate max-w-[90vw]">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
        <span className="font-semibold text-amber-200">Advisory:</span>
        <span className="text-slate-300 truncate text-[11px] sm:text-xs">
          Community-submitted incident reports are crowdsourced. Verify with official authorities in severe conditions.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 flex-shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Community Verified Network</span>
      </div>
    </div>
  );
};
