import React from 'react';
import {
  Cigarette,
  Hourglass,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Heart,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SmokingPlan, SmokeLogEntry } from '../types';
import {
  getAllowedCigarettesToday,
  getCurrentPlanDay,
  getIntervalMinutes,
  formatDuration,
} from '../utils/reductionEngine';
import { sounds } from '../utils/soundAndNotifications';

interface MainTimerScreenProps {
  plan: SmokingPlan;
  isAllowedToSmoke: boolean;
  remainingMs: number;
  formattedCountdown: string;
  onOpenSmokeModal: () => void;
  onAdd15MinDelay: () => void;
  smokeLogs: SmokeLogEntry[];
  extraDelayMinutes: number;
}

export const MainTimerScreen: React.FC<MainTimerScreenProps> = ({
  plan,
  isAllowedToSmoke,
  remainingMs,
  formattedCountdown,
  onOpenSmokeModal,
  onAdd15MinDelay,
  smokeLogs,
  extraDelayMinutes,
}) => {
  const allowedToday = getAllowedCigarettesToday(plan);
  const currentDay = getCurrentPlanDay(plan);
  const intervalMinutes = getIntervalMinutes(plan);

  // Count smokes logged today (midnight to now)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const smokesTodayCount = smokeLogs.filter((l) => l.timestamp >= startOfToday.getTime()).length;

  const handleChallenge15Min = () => {
    sounds.playAllowedChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
    onAdd15MinDelay();
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-5 overflow-y-auto bg-[#0d131a] text-slate-100">
      {/* Top Plan Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30 text-[11px]">
              Day {currentDay} of {plan.totalDurationDays}
            </span>
            <span className="text-slate-400 text-[11px]">
              {plan.baselineCigarettes} → 0 target
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-400">
            Smoked: <span className="text-white font-bold">{smokesTodayCount}</span> / {allowedToday} allowed
          </div>
        </div>

        {/* Progress bar to zero cigarettes */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.round((currentDay / plan.totalDurationDays) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* CENTER STAGE: Dynamic Timer State */}
      <div className="my-auto py-6 flex flex-col items-center text-center">
        {isAllowedToSmoke ? (
          /* ========================================================
             ALLOWED STATE: DISPLAY "YOU CAN SMOKE" WITH NO TIMER
             ======================================================== */
          <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
            {/* Emerald Glowing Icon */}
            <div className="relative mb-5">
              <div className="w-32 h-32 rounded-full bg-emerald-500/15 border-2 border-emerald-400/80 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-950">
                <CheckCircle2 className="w-16 h-16 stroke-[2.2]" />
              </div>
              <div className="absolute -inset-1 rounded-full bg-emerald-400/20 blur-xl -z-10 animate-pulse" />
            </div>

            {/* Crucial Message: "You can smoke" (NO TIMER SHOWN) */}
            <div className="inline-block bg-emerald-500/20 border border-emerald-400/30 px-4 py-1 rounded-full text-xs font-black tracking-widest text-emerald-300 uppercase mb-2">
              Interval Completed
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm mb-1">
              You can smoke
            </h1>

            <p className="text-xs text-slate-300 max-w-[280px] leading-relaxed mb-6">
              Your scheduled interval has passed. You may have a cigarette now or challenge yourself to wait 15 more minutes.
            </p>

            {/* BUTTON 1: "Can you wait another 15 mins?" */}
            <div className="w-full space-y-3">
              <button
                onClick={handleChallenge15Min}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 active:scale-[0.98] transition-all"
              >
                <Clock className="w-5 h-5" />
                <span>Can you wait another 15 mins?</span>
              </button>

              {/* BUTTON 2: Manually add a smoke (prompts confirmation modal) */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenSmokeModal();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#1a2330] hover:bg-[#222d3e] text-slate-200 border border-slate-700/80 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Cigarette className="w-4 h-4 text-rose-400" />
                <span>Log a Smoke Now</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             WAITING STATE: RED COUNTDOWN TIMER WITH -SECONDS
             ======================================================== */
          <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
            {/* Red Glowing Status Badge */}
            <div className="inline-flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 px-3.5 py-1 rounded-full text-xs font-black tracking-widest text-rose-300 uppercase mb-4">
              <Hourglass className="w-3.5 h-3.5 animate-spin text-rose-400" />
              <span>Next Smoke Window</span>
            </div>

            {/* THE RED COUNTDOWN TIMER WITH -SECONDS */}
            <div className="relative my-2">
              {/* Outer pulsing ring */}
              <div className="w-56 h-56 rounded-full bg-rose-950/40 border-2 border-rose-600/80 flex flex-col items-center justify-center p-4 shadow-2xl shadow-rose-950/80">
                <span className="text-[11px] font-bold text-rose-300/80 tracking-widest uppercase mb-1">
                  Time Remaining
                </span>
                {/* Red font with negative seconds */}
                <div className="font-mono text-4xl sm:text-5xl font-black text-rose-400 tracking-tighter drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                  {formattedCountdown}
                </div>
                <span className="text-[11px] font-semibold text-rose-300/70 mt-1">
                  until permitted
                </span>
              </div>
              <div className="absolute -inset-2 rounded-full bg-rose-500/20 blur-2xl -z-10 animate-pulse" />
            </div>

            {extraDelayMinutes > 0 && (
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>+15m Challenge Added (+{extraDelayMinutes}m total)</span>
              </div>
            )}

            <p className="text-xs text-slate-400 max-w-[260px] mt-4 leading-relaxed">
              Spacing intervals allow dopamine and acetylcholine receptors to normalize gently without shock.
            </p>

            {/* Manually add a smoke button (even during wait, prompts confirmation) */}
            <div className="w-full mt-6">
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenSmokeModal();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#161f2a] hover:bg-[#1e2a39] text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Cigarette className="w-4 h-4 text-slate-400" />
                <span>I Smoked Early (Log Smoke)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Card: Spacing & Schedule */}
      <div className="bg-[#141d27] border border-slate-800 rounded-3xl p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-2xl bg-[#0a0f14] border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Allowed Today</div>
            <div className="text-sm font-black text-white mt-0.5">
              {allowedToday} cigs
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-[#0a0f14] border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Current Spacing</div>
            <div className="text-sm font-black text-rose-400 mt-0.5">
              ~{formatDuration(intervalMinutes)}
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-[#0a0f14] border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Pace</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              -{1} / {plan.reductionDaysPerCig}d
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
