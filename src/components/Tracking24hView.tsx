import React, { useState, useEffect } from 'react';
import {
  Clock,
  Cigarette,
  Plus,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Tracking24hSession, SmokingPlan } from '../types';
import { createSmokingPlan } from '../utils/reductionEngine';
import { sounds } from '../utils/soundAndNotifications';

interface Tracking24hViewProps {
  session: Tracking24hSession;
  onUpdateSession: (session: Tracking24hSession) => void;
  onFinishTracking: (plan: SmokingPlan) => void;
  onCancelTracking: () => void;
}

export const Tracking24hView: React.FC<Tracking24hViewProps> = ({
  session,
  onUpdateSession,
  onFinishTracking,
  onCancelTracking,
}) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingMs = Math.max(0, session.endTime - now);
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const totalElapsedMs = Math.max(1, now - session.startTime);
  const totalElapsedHours = totalElapsedMs / (1000 * 60 * 60);

  // Projected 24-hour baseline based on tracked rate
  const smokeCount = session.entries.length;
  const projected24h = Math.max(
    1,
    Math.round(smokeCount > 0 ? (smokeCount / Math.max(0.5, totalElapsedHours)) * 24 : 15)
  );

  const handleAddSmoke = () => {
    sounds.playClick();
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    onUpdateSession({
      ...session,
      entries: [newEntry, ...session.entries],
    });
  };

  const handleRemoveEntry = (id: string) => {
    sounds.playClick();
    onUpdateSession({
      ...session,
      entries: session.entries.filter((e) => e.id !== id),
    });
  };

  const handleComplete = () => {
    sounds.playAllowedChime();
    // If user tracked at least 1, use either direct count if past 18 hours or projected count
    const baseline = totalElapsedHours >= 20 ? Math.max(1, smokeCount) : projected24h;
    const plan = createSmokingPlan(baseline, 4.5);
    onFinishTracking(plan);
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-5 overflow-y-auto bg-[#0d131a] text-slate-100">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-300">
              24-Hour Baseline Tracker
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onCancelTracking();
            }}
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>

        <h1 className="text-xl font-black text-white">Track Your Natural Habits</h1>
        <p className="text-xs text-slate-400 mt-1">
          Carry on with your normal daily routine. Tap the button every time you have a smoke.
        </p>
      </div>

      {/* Center 24h Countdown & Big Log Button */}
      <div className="my-auto py-4 space-y-4">
        {/* Countdown Card */}
        <div className="bg-[#141d27] border border-indigo-500/30 rounded-3xl p-5 shadow-xl text-center relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-1">
            Tracking Window Remaining
          </div>
          <div className="font-mono text-3xl font-black text-white tracking-tight">
            {String(remainingHours).padStart(2, '0')}:
            {String(remainingMinutes).padStart(2, '0')}:
            {String(remainingSeconds).padStart(2, '0')}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {smokeCount} cigarettes logged so far · Projected {projected24h}/day
          </div>
        </div>

        {/* Big Tactile Log Button */}
        <button
          onClick={handleAddSmoke}
          className="w-full py-6 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-rose-950/80 active:scale-[0.98] transition-all hover:brightness-110"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span>I Just Had a Smoke</span>
        </button>

        {/* Live Entries List */}
        <div className="bg-[#141d27] border border-slate-800 rounded-3xl p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2 px-1">
            <span>Logged Today ({session.entries.length})</span>
            <span className="text-[10px] text-slate-400">Chronological</span>
          </div>

          {session.entries.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center">
              <Cigarette className="w-8 h-8 text-slate-600 mb-1" />
              <span>No smokes logged yet. Tap the button when you smoke.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {session.entries.map((entry, idx) => {
                const date = new Date(entry.timestamp);
                const timeStr = date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#0a0f14] border border-slate-800 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                        #{session.entries.length - idx}
                      </span>
                      <span className="font-mono text-slate-200">{timeStr}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Completion Actions */}
      <div className="pt-2 space-y-2">
        <button
          onClick={handleComplete}
          disabled={session.entries.length === 0}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
            session.entries.length > 0
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 active:scale-[0.99]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {remainingMs <= 0
              ? '24 Hours Reached - Build Reduction Plan'
              : `Finish Early (${projected24h} Projected Base) & Start Plan`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Your reduction plan will decrease 1 cigarette every 4–5 days from this base.</span>
        </div>
      </div>
    </div>
  );
};
