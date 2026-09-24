import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Columns2, Moon, RefreshCw, Smartphone, Sun } from 'lucide-react';
import { LatestApp } from './components/latest/LatestApp.tsx';
import { PreliminaryApp } from './components/preliminary/PreliminaryApp.tsx';
import { ZONES_LIST } from './data/mockCarparks.ts';
import { AppState, Carpark, ZoneCode, ZoneData } from './types.ts';
import { STALE_THRESHOLD_MINUTES } from './utils/constants.ts';
import { recordCarparkReading, seedSimulatedTrend } from './utils/trend.ts';

/**
 * Single data-fetching function.
 */
export async function loadCarparks(zone: ZoneCode | string): Promise<ZoneData> {
  const res = await fetch(`/api/carparks?zone=${zone}`);
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    (error as unknown as { status: number }).status = res.status;
    throw error;
  }
  return res.json();
}

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

export default function App() {
  const [viewMode, setViewMode] = useState<'both' | 'left' | 'right'>('both');
  const [syncZones, setSyncZones] = useState<boolean>(true);

  const [leftZone, setLeftZone] = useState<ZoneCode>('Orchard');
  const [rightZone, setRightZone] = useState<ZoneCode>('Orchard');

  const [carparksByZone, setCarparksByZone] = useState<Record<string, Carpark[]>>({});
  const [fetchedAt, setFetchedAt] = useState<string>(new Date().toISOString());
  const [appState, setAppState] = useState<AppState>('success');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveUnavailableBanner, setLiveUnavailableBanner] = useState<{ time: string } | null>(null);

  // Live relative-time timestamp tick (refreshes labels every 30s without refetching)
  const [currentTimestampMs, setCurrentTimestampMs] = useState<number>(Date.now());
  const lastKnownDataRef = useRef<Record<string, { carparks: Carpark[]; fetchedAt: string }>>({});

  // Periodic 30-second interval to refresh relative-time labels
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestampMs(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Allow test automation or developer console to flip state and call loadCarparks
  useEffect(() => {
    (window as unknown as { appState: AppState }).appState = appState;
    (window as unknown as { setAppState: (state: AppState) => void }).setAppState = setAppState;
    (window as unknown as { loadCarparks: typeof loadCarparks }).loadCarparks = loadCarparks;
  }, [appState]);

  const fetchZoneData = useCallback(async (zone: ZoneCode) => {
    setIsRefreshing(true);
    try {
      const data = await loadCarparks(zone);
      const readingTimestamp = data.fetchedAt || new Date().toISOString();
      setFetchedAt(readingTimestamp);

      const sorted = [...(data.carparks || [])].sort((a, b) => b.lots - a.lots);
      setCarparksByZone((prev) => ({ ...prev, [zone]: sorted }));

      // Record reading history in memory for trend detection
      const nowMs = Date.now();
      sorted.forEach((cp) => {
        recordCarparkReading(cp.id, cp.lots, nowMs);
      });

      lastKnownDataRef.current[zone] = {
        carparks: sorted,
        fetchedAt: readingTimestamp,
      };

      setLiveUnavailableBanner(null);

      if (sorted.length === 0 || data.count === 0) {
        setAppState('empty');
      } else {
        setAppState('success');
      }
      return sorted;
    } catch (err: unknown) {
      const cached = lastKnownDataRef.current[zone];
      if (cached && cached.carparks.length > 0) {
        setCarparksByZone((prev) => ({ ...prev, [zone]: cached.carparks }));
        setFetchedAt(cached.fetchedAt);
        setLiveUnavailableBanner({
          time: formatSingaporeTime(cached.fetchedAt),
        });
        setAppState('success');
        return cached.carparks;
      } else {
        if (err && typeof (err as { status?: unknown }).status === 'number') {
          setAppState('refused');
        } else {
          setAppState('unreachable');
        }
        return [];
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Fetch initial zones
  useEffect(() => {
    fetchZoneData(leftZone);
    if (rightZone !== leftZone) {
      fetchZoneData(rightZone);
    }
  }, [leftZone, rightZone, fetchZoneData]);

  const handleLeftZoneChange = (zone: ZoneCode) => {
    setLeftZone(zone);
    if (syncZones) {
      setRightZone(zone);
    }
    fetchZoneData(zone);
  };

  const handleRightZoneChange = (zone: ZoneCode) => {
    setRightZone(zone);
    if (syncZones) {
      setLeftZone(zone);
    }
    fetchZoneData(zone);
  };

  const handleStateChange = (newState: string) => {
    if (newState === 'stale') {
      const staleTime = new Date(Date.now() - (STALE_THRESHOLD_MINUTES + 4) * 60 * 1000).toISOString();
      setFetchedAt(staleTime);
      setAppState('success');
      return;
    }

    if (newState === 'trend') {
      const currentCarparks = carparksByZone[rightZone] || [];
      if (currentCarparks.length > 0) {
        const targetCp = currentCarparks[0];
        seedSimulatedTrend(targetCp.id, targetCp.lots + 40, targetCp.lots, 8);
        setCurrentTimestampMs(Date.now());
      }
      setAppState('success');
      return;
    }

    if (newState === 'cached_failure') {
      setLiveUnavailableBanner({
        time: formatSingaporeTime(fetchedAt),
      });
      setAppState('success');
      return;
    }

    setAppState(newState as AppState);
    if (newState === 'success') {
      setLiveUnavailableBanner(null);
      fetchZoneData(rightZone);
    }
  };

  const leftCarparks = carparksByZone[leftZone] || [];
  const rightCarparks = carparksByZone[rightZone] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Comparison Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand & Comparison Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-indigo-950">
                P
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>ParkSG</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Side-by-Side Comparison
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Preliminary v1.0 (Light, No Navigation/Search) vs Latest v2.0 (Dark, Search, GPS Nav, Freshness)
                </p>
              </div>
            </div>

            {/* Quick Refresh Button for mobile */}
            <button
              type="button"
              onClick={() => {
                fetchZoneData(leftZone);
                if (rightZone !== leftZone) fetchZoneData(rightZone);
              }}
              disabled={isRefreshing}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700"
              aria-label="Refresh Data"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>

          {/* Controls: View Mode & Sync Toggle */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Sync Zones Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !syncZones;
                setSyncZones(next);
                if (next) setRightZone(leftZone);
              }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                syncZones
                  ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Synchronize selected parking zone between both versions"
            >
              <span className={`w-2 h-2 rounded-full ${syncZones ? 'bg-indigo-400' : 'bg-slate-500'}`} />
              <span>Sync Zones: {syncZones ? 'On' : 'Off'}</span>
            </button>

            {/* View Mode Segmented Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'both'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View both side by side"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('left')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'left'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View Preliminary Version"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>v1.0 Preliminary</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('right')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'right'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View Latest Version"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>v2.0 Latest</span>
              </button>
            </div>

            {/* Desktop Refresh Button */}
            <button
              type="button"
              onClick={() => {
                fetchZoneData(leftZone);
                if (rightZone !== leftZone) fetchZoneData(rightZone);
              }}
              disabled={isRefreshing}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Refresh live carpark lot counts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Comparison Stage */}
      <main className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div
          className={`grid gap-8 items-start justify-items-center w-full ${
            viewMode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'
          }`}
        >
          {/* LEFT: Old Preliminary Version */}
          {(viewMode === 'both' || viewMode === 'left') && (
            <section
              aria-label="Preliminary Version (v1.0)"
              className="w-full flex flex-col items-center animate-in fade-in duration-200"
            >
              {/* Header Label Card */}
              <div className="w-full max-w-md mb-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
                  <span className="font-bold text-slate-200">
                    Preliminary Version (v1.0)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span>Light Theme</span>
                  <span>·</span>
                  <span>No Search</span>
                  <span>·</span>
                  <span>No Nav</span>
                </div>
              </div>

              {/* Preliminary App View */}
              <PreliminaryApp
                selectedZone={leftZone}
                onSelectZone={handleLeftZoneChange}
                carparks={leftCarparks}
                appState={appState}
              />
            </section>
          )}

          {/* RIGHT: Latest Updated Version */}
          {(viewMode === 'both' || viewMode === 'right') && (
            <section
              aria-label="Latest Version (v2.0)"
              className="w-full flex flex-col items-center animate-in fade-in duration-200"
            >
              {/* Header Label Card */}
              <div className="w-full max-w-md mb-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400/50" />
                  <span className="font-bold text-indigo-300">
                    Latest Version (v2.0)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-300/80 font-medium">
                  <span>Dark Theme</span>
                  <span>·</span>
                  <span>Search Bar</span>
                  <span>·</span>
                  <span>GPS Nav</span>
                  <span>·</span>
                  <span>Freshness</span>
                </div>
              </div>

              {/* Latest App View */}
              <LatestApp
                selectedZone={rightZone}
                onSelectZone={handleRightZoneChange}
                carparks={rightCarparks}
                appState={appState}
                onStateChange={handleStateChange}
                fetchedAt={fetchedAt}
                isRefreshing={isRefreshing}
                onRetry={() => fetchZoneData(rightZone)}
                currentTimestampMs={currentTimestampMs}
                liveUnavailableBanner={liveUnavailableBanner}
                onDismissBanner={() => setLiveUnavailableBanner(null)}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
