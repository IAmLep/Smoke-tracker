import React, { useState } from 'react';
import {
  Wrench,
  FastForward,
  CheckCircle2,
  BellRing,
  RotateCcw,
  Smartphone,
  Maximize2,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';
import { sounds } from '../utils/soundAndNotifications';

interface QuickDevToolbarProps {
  onFastForward: (minutes: number) => void;
  onJumpToAllowed: () => void;
  onTrigger2HourNotification: () => void;
  onResetAllData: () => void;
  viewMode: 'device' | 'fullscreen';
  onToggleViewMode: () => void;
  onOpenWidgetView: () => void;
  activeScreen: string;
}

export const QuickDevToolbar: React.FC<QuickDevToolbarProps> = ({
  onFastForward,
  onJumpToAllowed,
  onTrigger2HourNotification,
  onResetAllData,
  viewMode,
  onToggleViewMode,
  onOpenWidgetView,
  activeScreen,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="w-full bg-[#111822] border-b border-slate-800 text-xs z-30 select-none">
      {/* Top Banner / Accordion header */}
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-rose-400" />
            Android 12 Simulation Controls
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleViewMode();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] font-semibold border border-slate-700"
            title="Toggle Device Frame / Fullscreen"
          >
            {viewMode === 'device' ? (
              <>
                <Maximize2 className="w-3 h-3 text-teal-400" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-rose-400" />
                <span className="hidden sm:inline">Pixel Frame</span>
              </>
            )}
          </button>

          {/* Widget Quick Link */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenWidgetView();
            }}
            className={`p-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-colors ${
              activeScreen === 'widget'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span className="hidden sm:inline">Widget</span>
          </button>

          {/* Expand / Collapse test tools */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
            title="Expand Test Controls"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Tools for Instant Verification of Prompts */}
      {isExpanded && (
        <div className="bg-[#0b0f16] border-t border-slate-800/80 px-4 py-3">
          <div className="max-w-md mx-auto space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Instant Feature Verification
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {/* Jump to Allowed 0s */}
              <button
                onClick={() => {
                  sounds.playAllowedChime();
                  onJumpToAllowed();
                }}
                className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center justify-center gap-1 text-center transition-colors"
                title="Immediately reach 0 to see 'You can smoke' with no timer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Jump to 0 (Allowed)</span>
              </button>

              {/* Fast forward 15 mins */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onFastForward(15);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <FastForward className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>+15m Elapsed</span>
              </button>

              {/* Trigger 2-Hour Notification */}
              <button
                onClick={() => {
                  onTrigger2HourNotification();
                }}
                className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-semibold flex items-center justify-center gap-1 text-center transition-colors"
                title="Simulate 2 hours elapsed without smoke to trigger push alert"
              >
                <BellRing className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Test +2h Push Alert</span>
              </button>

              {/* Reset Data */}
              <button
                onClick={() => {
                  sounds.playClick();
                  if (confirm('Reset all app data and return to onboarding?')) {
                    onResetAllData();
                  }
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reset All Data</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
              <span>Android 12 Target: API 31+ · Gradual Physiological Taper</span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
