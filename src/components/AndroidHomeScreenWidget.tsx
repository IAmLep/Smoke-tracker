import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Mic,
  Camera,
  MessageSquare,
  Phone,
  Globe,
  ArrowRight,
  Info,
  Maximize2
} from 'lucide-react';
import { sounds } from '../utils/soundAndNotifications';

interface AndroidHomeScreenWidgetProps {
  isAllowedToSmoke: boolean;
  remainingMs: number;
  formattedCountdown: string;
  onOpenApp: () => void;
  allowedToday: number;
  currentIntervalMin: number;
}

export type WidgetSize = '2x1' | '1x1' | '2x2';

export const AndroidHomeScreenWidget: React.FC<AndroidHomeScreenWidgetProps> = ({
  isAllowedToSmoke,
  formattedCountdown,
  onOpenApp,
  allowedToday,
  currentIntervalMin,
}) => {
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('2x1');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleWidgetClick = () => {
    sounds.playClick();
    onOpenApp();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 overflow-y-auto select-none bg-gradient-to-b from-[#1b263b] via-[#0d1b2a] to-[#0a1118]">
      {/* Top At a Glance widget */}
      <div className="pt-2 px-2 text-slate-200">
        <div className="flex items-center space-x-2 text-sm font-medium text-slate-300">
          <span>{currentDate}</span>
          <span>·</span>
          <span>72°F Sunny</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          Android 12 Material You Launcher
        </div>
      </div>

      {/* Main Home Screen Widget Container */}
      <div className="my-auto py-2 flex flex-col items-center">
        {/* Widget Size Selector */}
        <div className="w-full max-w-sm flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Widget Size:
          </span>
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-700/80">
            {(['2x1', '1x1', '2x2'] as WidgetSize[]).map((size) => (
              <button
                key={size}
                onClick={() => {
                  sounds.playClick();
                  setWidgetSize(size);
                }}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                  widgetSize === size
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            THE ADAPTIVE ANDROID 12 WIDGET LAYOUTS
            (Updated per user instructions:
             - "Smoking locked" changed to "You're not ready yet"
             - Stop image REMOVED
             - "not yet no" REMOVED
             - "interval in progress...." REMOVED
             - Timer KEPT and optimized for 2x1 and 1x1)
           ========================================================= */}

        {/* 2x1 SQUEEZED WIDGET LAYOUT */}
        {widgetSize === '2x1' && (
          <div
            onClick={handleWidgetClick}
            role="button"
            tabIndex={0}
            aria-label={isAllowedToSmoke ? "Widget: You can smoke" : "Widget: You're not ready yet"}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWidgetClick();
              }
            }}
            className={`w-full max-w-sm rounded-[28px] p-4 cursor-pointer transition-all duration-300 transform active:scale-95 shadow-xl relative overflow-hidden border ${
              isAllowedToSmoke
                ? 'bg-gradient-to-r from-emerald-950/90 via-[#064e3b] to-emerald-900/80 border-emerald-500/60 shadow-emerald-950/50 hover:border-emerald-400'
                : 'bg-gradient-to-r from-rose-950/90 via-[#3a0614] to-rose-900/80 border-rose-500/60 shadow-rose-950/50 hover:border-rose-400'
            }`}
          >
            {isAllowedToSmoke ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      Window Open
                    </div>
                    <div className="text-lg font-black text-white tracking-tight">
                      YOU CAN SMOKE
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-500/25 px-2.5 py-1.5 rounded-xl border border-emerald-400/30">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  {/* Changed "Smoking Locked" to "You're not ready yet", stop image removed, "not yet no" removed */}
                  <div className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                    You&apos;re not ready yet
                  </div>
                  <div className="text-[10px] text-rose-300/70 font-medium mt-0.5">
                    Tap to open QuitTrack
                  </div>
                </div>

                {/* Live Countdown Timer Kept */}
                <div className="py-2 px-3.5 rounded-2xl bg-black/50 border border-rose-500/40 flex items-center gap-2 text-rose-400 shadow-inner">
                  <Clock className="w-4 h-4 animate-pulse text-rose-400" />
                  <span className="font-mono text-xl font-black tracking-tight text-rose-400">
                    {formattedCountdown}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1x1 COMPACT SQUEEZED WIDGET LAYOUT */}
        {widgetSize === '1x1' && (
          <div
            onClick={handleWidgetClick}
            role="button"
            tabIndex={0}
            aria-label={isAllowedToSmoke ? "Widget: You can smoke" : "Widget: You're not ready yet"}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWidgetClick();
              }
            }}
            className={`w-36 h-36 rounded-[28px] p-3 cursor-pointer transition-all duration-300 transform active:scale-95 shadow-xl relative overflow-hidden border flex flex-col justify-between items-center text-center ${
              isAllowedToSmoke
                ? 'bg-gradient-to-br from-emerald-950 via-[#064e3b] to-emerald-900 border-emerald-500/60 shadow-emerald-950/50 hover:border-emerald-400'
                : 'bg-gradient-to-br from-rose-950 via-[#3a0614] to-rose-900 border-rose-500/60 shadow-rose-950/50 hover:border-rose-400'
            }`}
          >
            {isAllowedToSmoke ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 mt-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-white uppercase leading-tight">
                  You Can Smoke
                </div>
                <div className="text-[9px] text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full mb-1">
                  Open app
                </div>
              </>
            ) : (
              <>
                {/* Changed to "You're not ready yet", stop image removed */}
                <div className="text-[10px] font-black uppercase tracking-tight text-rose-300 mt-1 leading-tight">
                  You&apos;re not ready yet
                </div>
                {/* Timer kept */}
                <div className="py-1 px-2 rounded-xl bg-black/60 border border-rose-500/40 text-rose-400 font-mono text-sm font-black tracking-tight">
                  {formattedCountdown}
                </div>
                <div className="text-[9px] text-rose-300/80 font-semibold mb-1">
                  Tap to open
                </div>
              </>
            )}
          </div>
        )}

        {/* 2x2 STANDARD WIDGET LAYOUT */}
        {widgetSize === '2x2' && (
          <div
            onClick={handleWidgetClick}
            role="button"
            tabIndex={0}
            aria-label={isAllowedToSmoke ? "Widget: You can smoke" : "Widget: You're not ready yet"}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWidgetClick();
              }
            }}
            className={`w-full max-w-sm rounded-[32px] p-6 cursor-pointer transition-all duration-300 transform active:scale-95 shadow-2xl relative overflow-hidden border ${
              isAllowedToSmoke
                ? 'bg-gradient-to-br from-emerald-950/90 via-[#064e3b]/80 to-[#022c22] border-emerald-500/60 shadow-emerald-950/50 hover:border-emerald-400'
                : 'bg-gradient-to-br from-rose-950/90 via-[#3a0614] to-[#1e050b] border-rose-500/60 shadow-rose-950/50 hover:border-rose-400'
            }`}
          >
            {isAllowedToSmoke ? (
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/80 flex items-center justify-center mb-2 text-emerald-300 shadow-lg shadow-emerald-900/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="inline-block bg-emerald-500/25 border border-emerald-400/40 px-3.5 py-0.5 rounded-full text-[10px] font-black tracking-widest text-emerald-200 uppercase mb-1">
                  Window Open
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  YOU CAN SMOKE
                </h2>
                <div className="mt-4 pt-3 border-t border-emerald-500/30 w-full flex items-center justify-between text-[11px] text-emerald-300/80 font-medium">
                  <span>Allowed today: {allowedToday}</span>
                  <span className="flex items-center gap-1 text-emerald-200 font-semibold">
                    Open App <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Changed "Smoking locked" to "You're not ready yet", stop image removed, "not yet no" removed, "interval in progress..." removed */}
                <div className="inline-block bg-rose-500/25 border border-rose-400/40 px-4 py-1.5 rounded-full text-xs font-black tracking-widest text-rose-200 uppercase mb-3">
                  You&apos;re not ready yet
                </div>

                {/* Kept timer */}
                <div className="my-2 py-3 px-6 rounded-2xl bg-black/50 border border-rose-500/40 flex items-center gap-2.5 text-rose-400 shadow-inner">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="font-mono text-2xl font-black tracking-tight">
                    {formattedCountdown}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-500/30 w-full flex items-center justify-between text-[11px] text-rose-300/80 font-medium">
                  <span>Interval: ~{currentIntervalMin}m</span>
                  <span className="flex items-center gap-1 text-rose-200 font-semibold">
                    Open App <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informative Note */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 text-center max-w-xs">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Tap the widget above to launch QuitTrack. Squeezable to 2×1, 1×1, or 2×2.</span>
        </div>
      </div>

      {/* Android 12 Home Screen Bottom Area: Search Bar & App Dock */}
      <div className="w-full max-w-sm mx-auto space-y-3 pb-1">
        {/* Google Pill Search Bar */}
        <div className="w-full bg-slate-800/80 backdrop-blur-md rounded-full px-4 py-2.5 flex items-center justify-between border border-slate-700/60 shadow-md">
          <div className="flex items-center space-x-2 text-slate-400">
            <Search className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-slate-400">Search apps & web...</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <Mic className="w-4 h-4 hover:text-slate-200 cursor-pointer" />
            <Camera className="w-4 h-4 hover:text-slate-200 cursor-pointer" />
          </div>
        </div>

        {/* Favorite App Dock */}
        <div className="flex items-center justify-around px-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 cursor-pointer hover:scale-105 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 cursor-pointer hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 cursor-pointer hover:scale-105 transition-transform">
            <Globe className="w-6 h-6" />
          </div>
          {/* QuitTrack App Icon in Dock */}
          <div
            onClick={handleWidgetClick}
            className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-rose-900/50 relative"
            title="QuitTrack App"
          >
            <Clock className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
