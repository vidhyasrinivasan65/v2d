import React from 'react';
import { ZONES_LIST } from '../../data/mockCarparks.ts';
import { AppState, Carpark, ZoneCode } from '../../types.ts';
import { PreliminaryCard } from './PreliminaryCard.tsx';
import { PreliminaryStateViews } from './PreliminaryStateViews.tsx';

interface PreliminaryAppProps {
  selectedZone: ZoneCode;
  onSelectZone: (zone: ZoneCode) => void;
  carparks: Carpark[];
  appState: AppState;
}

export const PreliminaryApp: React.FC<PreliminaryAppProps> = ({
  selectedZone,
  onSelectZone,
  carparks,
  appState,
}) => {
  const currentZoneInfo = ZONES_LIST.find((z) => z.value === selectedZone) || ZONES_LIST[0];

  return (
    <div
      id="preliminary-phone-container"
      className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 min-h-[720px] flex flex-col justify-between overflow-hidden text-slate-900 transition-all"
    >
      <div>
        {/* Original Light Header */}
        <header className="pt-6 pb-4 px-5 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-indigo-200">
                P
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                ParkSG
              </h1>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              SG Live
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 leading-snug">
            Live lots in Singapore&apos;s busiest parking zones
          </p>
        </header>

        {/* Content Area */}
        <main className="px-5 py-4 flex flex-col">
          {/* Light Zone Selector */}
          <section aria-label="Parking Zones" className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              {ZONES_LIST.map((zone) => {
                const isSelected = zone.value === selectedZone;
                return (
                  <button
                    key={zone.value}
                    type="button"
                    onClick={() => onSelectZone(zone.value)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center text-center transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                    }`}
                  >
                    {zone.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-3 pb-1 border-b border-slate-100 font-medium">
              <span>LTA DataMall</span>
              <span className="text-[11px] font-semibold text-slate-400">
                Zone: {currentZoneInfo.label}
              </span>
            </div>
          </section>

          {/* Carparks List: Notice NO Search Bar, NO Freshness Labels, NO Navigation */}
          <div className="flex-1 flex flex-col justify-start">
            {appState !== 'success' ? (
              <PreliminaryStateViews state={appState} zoneLabel={currentZoneInfo.label} />
            ) : carparks.length === 0 ? (
              <PreliminaryStateViews state="empty" zoneLabel={currentZoneInfo.label} />
            ) : (
              <ul className="flex flex-col gap-2.5 pb-2" role="list">
                {carparks.map((cp) => (
                  <PreliminaryCard key={cp.id} carpark={cp} />
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>

      {/* Light Footer */}
      <footer className="px-5 py-4 bg-slate-50 border-t border-slate-100 text-center mt-6">
        <p className="text-xs font-medium text-slate-500">
          Data from LTA DataMall
        </p>
      </footer>
    </div>
  );
};
