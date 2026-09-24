import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="pt-6 pb-4 px-5 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <div
            id="app-logo-badge"
            className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-indigo-950"
          >
            P
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            ParkSG
          </h1>
        </div>

        <span
          id="sg-live-badge"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/80"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          SG Live
        </span>
      </div>

      <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1 leading-snug">
        Live lots in Singapore&apos;s busiest parking zones
      </p>
    </header>
  );
};
