import React from 'react';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { AppState } from '../types.ts';

interface StateViewsProps {
  state: AppState;
  zoneLabel: string;
}

export const StateViews: React.FC<StateViewsProps> = ({ state, zoneLabel }) => {
  if (state === 'loading') {
    return (
      <div
        id="state-loading-view"
        className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300 max-w-xs leading-relaxed">
          Checking live lot counts…
        </p>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div
        id="state-empty-view"
        className="flex-1 flex flex-col items-center justify-center py-14 px-5 text-center bg-slate-800/40 rounded-2xl border border-slate-800 my-2"
      >
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-3 font-mono font-bold">
          0
        </div>
        <p className="text-sm font-medium text-slate-300 max-w-xs leading-relaxed">
          {`No live counts for ${zoneLabel} at the moment. LTA carparks in this zone may not be reporting right now — try another zone.`}
        </p>
      </div>
    );
  }

  if (state === 'refused') {
    return (
      <div
        id="state-refused-view"
        className="flex-1 flex flex-col items-center justify-center py-14 px-5 text-center bg-amber-950/40 rounded-2xl border border-amber-800/60 my-2"
      >
        <div className="w-10 h-10 rounded-full bg-amber-900/60 border border-amber-700/60 flex items-center justify-center text-amber-300 mb-3 font-bold text-base">
          !
        </div>
        <p className="text-sm font-medium text-amber-200 max-w-xs leading-relaxed">
          {"LTA turned down our request. This is on our side — we're looking at it. Try again in a minute."}
        </p>
      </div>
    );
  }

  if (state === 'unreachable') {
    return (
      <div
        id="state-unreachable-view"
        className="flex-1 flex flex-col items-center justify-center py-14 px-5 text-center bg-red-950/40 rounded-2xl border border-red-800/60 my-2"
      >
        <div className="w-10 h-10 rounded-full bg-red-900/60 border border-red-700/60 flex items-center justify-center text-red-300 mb-3 font-bold text-base">
          ✕
        </div>
        <p className="text-sm font-medium text-red-200 max-w-xs leading-relaxed">
          {"We can't reach LTA DataMall right now. Nothing's wrong with your connection — the feed itself is down."}
        </p>
      </div>
    );
  }

  return null;
};
