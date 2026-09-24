import React from 'react';
import { Carpark } from '../../types.ts';

interface PreliminaryCardProps {
  carpark: Carpark;
}

export const PreliminaryCard: React.FC<PreliminaryCardProps> = ({ carpark }) => {
  const isFull = carpark.lots === 0;
  const isGreen = carpark.lots > 50;
  const isAmber = carpark.lots >= 1 && carpark.lots <= 50;

  let lotBadgeClasses = 'lot-badge-red-light font-extrabold tracking-wide';
  if (isGreen) {
    lotBadgeClasses = 'lot-badge-green-light font-bold';
  } else if (isAmber) {
    lotBadgeClasses = 'lot-badge-amber-light font-bold';
  }

  return (
    <li
      id={`prelim-carpark-${carpark.id}`}
      className="min-h-[64px] py-3 px-3.5 bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
    >
      {/* Carpark Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
            {carpark.agency}
          </span>
          <span className="text-[11px] text-slate-400 font-mono tracking-tight">
            {carpark.id}
          </span>
        </div>

        <h2 className="text-sm font-semibold text-slate-900 truncate leading-snug">
          {carpark.name}
        </h2>

        <div className="text-[11px] text-slate-400 mt-0.5">
          <span>Agency: {carpark.agency}</span>
        </div>
      </div>

      {/* Lot Count Only (No relative timestamps, no freshness calculations) */}
      <div className="flex-shrink-0 flex items-center">
        <span
          id={`prelim-lot-badge-${carpark.id}`}
          className={`inline-flex items-center justify-center min-w-[58px] min-h-[36px] px-2.5 py-1 rounded-xl text-xs transition-colors ${lotBadgeClasses}`}
        >
          {isFull ? 'FULL' : carpark.lots}
        </span>
      </div>
    </li>
  );
};
