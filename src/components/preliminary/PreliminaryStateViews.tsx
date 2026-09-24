import React from 'react';
import { Loader2 } from 'lucide-react';
import { AppState } from '../../types.ts';

interface PreliminaryStateViewsProps {
  state: AppState;
  zoneLabel: string;
}

export const PreliminaryStateViews: React.FC<PreliminaryStateViewsProps> = ({ state, zoneLabel }) => {
  if (state === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700 max-w-xs leading-relaxed">
          Loading carpark data…
        </p>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-14 px-5 text-center bg-slate-50/70 rounded-2xl border border-slate-200/80 my-2">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-3 font-mono font-bold">
          0
        </div>
        <p className="text-sm font-medium text-slate-600 max-w-xs leading-relaxed">
          {`No carparks available for ${zoneLabel}.`}
        </p>
      </div>
    );
  }

  if (state === 'refused') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-14 px-5 text-center bg-amber-50/80 rounded-2xl border border-amber-200/80 my-2">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-3 font-bold text-base">
          !
        </div>
        <p className="text-sm font-medium text-amber-900 max-w-xs leading-relaxed">
          Unable to fetch carpark data. Please try again.
        </p>
      </div>
    );
  }

  if (state === 'unreachable') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-14 px-5 text-center bg-red-50/80 rounded-2xl border border-red-200/80 my-2">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 font-bold text-base">
          ✕
        </div>
        <p className="text-sm font-medium text-red-900 max-w-xs leading-relaxed">
          Feed unreachable. Please check connection.
        </p>
      </div>
    );
  }

  return null;
};
