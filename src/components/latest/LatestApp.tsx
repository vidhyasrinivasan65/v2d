import React, { useMemo, useState } from 'react';
import { AlertTriangle, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { ZONES_LIST } from '../../data/mockCarparks.ts';
import { AppState, Carpark, ZoneCode } from '../../types.ts';
import { CarparkCard } from '../CarparkCard.tsx';
import { Header } from '../Header.tsx';
import { SearchBar } from '../SearchBar.tsx';
import { StateViews } from '../StateViews.tsx';
import { ZoneSelector } from '../ZoneSelector.tsx';

interface LatestAppProps {
  selectedZone: ZoneCode;
  onSelectZone: (zone: ZoneCode) => void;
  carparks: Carpark[];
  appState: AppState;
  onStateChange: (state: string) => void;
  fetchedAt: string;
  isRefreshing: boolean;
  onRetry: () => void;
  currentTimestampMs: number;
  liveUnavailableBanner: { time: string } | null;
  onDismissBanner: () => void;
}

export const LatestApp: React.FC<LatestAppProps> = ({
  selectedZone,
  onSelectZone,
  carparks,
  appState,
  onStateChange,
  fetchedAt,
  isRefreshing,
  onRetry,
  currentTimestampMs,
  liveUnavailableBanner,
  onDismissBanner,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentZoneInfo = ZONES_LIST.find((z) => z.value === selectedZone) || ZONES_LIST[0];

  function formatSingaporeTime(isoString?: string): string {
    if (!isoString) return '14:32';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return '14:32';
    }
  }

  const updatedTime = formatSingaporeTime(fetchedAt);

  // Filter carparks by name or ID
  const filteredCarparks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return carparks;
    return carparks.filter(
      (cp) =>
        cp.name.toLowerCase().includes(q) ||
        cp.id.toLowerCase().includes(q)
    );
  }, [carparks, searchQuery]);

  return (
    <div
      id="latest-phone-container"
      className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 min-h-[720px] flex flex-col justify-between overflow-hidden text-slate-100 transition-all"
    >
      <div>
        {/* Dark Theme Header with SG Live pulse */}
        <Header />

        {/* Controls & Main Content Area */}
        <main className="px-5 py-4 flex flex-col">
          {/* Live Data Unavailable Banner */}
          {liveUnavailableBanner && (
            <div
              id="live-unavailable-banner"
              role="alert"
              className="mb-3 px-3 py-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-200 shadow-xs animate-in fade-in"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-medium text-[11px] leading-snug">
                  Live data unavailable – showing last known counts from {liveUnavailableBanner.time}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-2 py-1 text-[11px] font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
                <button
                  type="button"
                  onClick={onDismissBanner}
                  className="p-1 text-amber-400 hover:text-amber-200 rounded cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Dark Zone Selector */}
          <ZoneSelector
            selectedZone={selectedZone}
            onSelectZone={onSelectZone}
            updatedTime={updatedTime}
          />

          {/* Refreshing Indicator */}
          {isRefreshing && (
            <div className="mb-2 py-1 px-3 bg-indigo-950/60 border border-indigo-800/60 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Checking live lot counts…</span>
            </div>
          )}

          {/* Search bar with real-time filtering */}
          {appState === 'success' && carparks.length > 0 && (
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder={`Search in ${currentZoneInfo.label}...`}
              totalCount={carparks.length}
              filteredCount={filteredCarparks.length}
            />
          )}

          {/* Carparks List with Navigation, Trends, and Updation */}
          <div id="main-content" className="flex-1 flex flex-col justify-start">
            {appState !== 'success' ? (
              <StateViews state={appState} zoneLabel={currentZoneInfo.label} />
            ) : carparks.length === 0 ? (
              <StateViews state="empty" zoneLabel={currentZoneInfo.label} />
            ) : filteredCarparks.length === 0 ? (
              <div
                id="no-search-results"
                className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-800/40 rounded-2xl border border-slate-800 my-2 animate-in fade-in duration-150"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-2.5">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  No carparks matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                  No carparks in {currentZoneInfo.label} match your search. Check for typos or try another name.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <ul
                id="carparks-list"
                className="flex flex-col gap-2.5 pb-2"
                role="list"
              >
                {filteredCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    allCarparks={carparks}
                    readingTimestamp={fetchedAt}
                    currentTimestampMs={currentTimestampMs}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Demo failure state simulation */}
          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <label
              htmlFor="state-selector"
              className="text-[11px] text-slate-400 font-normal"
            >
              Demo: simulate failure states
            </label>
            <select
              id="state-selector"
              value={liveUnavailableBanner ? 'cached_failure' : appState}
              onChange={(e) => onStateChange(e.target.value)}
              className="text-[11px] text-slate-300 bg-slate-800 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-600 cursor-pointer"
            >
              <option value="success">Normal (Success)</option>
              <option value="loading">loading</option>
              <option value="empty">empty</option>
              <option value="refused">refused</option>
              <option value="unreachable">unreachable</option>
              <option value="stale">demo: stale data (&gt;10 min ago)</option>
              <option value="trend">demo: rapid drop (filling fast)</option>
              <option value="cached_failure">demo: unavailable banner</option>
            </select>
          </div>
        </main>
      </div>

      {/* Dark Footer */}
      <footer className="px-5 py-4 bg-slate-900/60 border-t border-slate-800 text-center mt-6">
        <p className="text-xs font-medium text-slate-500">
          Data from LTA DataMall
        </p>
      </footer>
    </div>
  );
};
