import React, { useState } from 'react';
import {
  Cigarette,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { createSmokingPlan, calculateFormulaC } from '../utils/reductionEngine';
import { SmokingPlan } from '../types';
import { sounds } from '../utils/soundAndNotifications';

interface OnboardingViewProps {
  onPlanCreated: (plan: SmokingPlan) => void;
  onStart24hTracking: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onPlanCreated,
  onStart24hTracking,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [baselineCigs, setBaselineCigs] = useState<number>(20);
  const [paceDays, setPaceDays] = useState<number>(4.5); // 4.5 days per cigarette
  const [wakeHours, setWakeHours] = useState<number>(16);

  // Calculate dynamic metrics using user's formula
  const totalDays = Math.round(baselineCigs * paceDays);
  const totalWeeks = totalDays / 7.0;
  const targetQuitDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
  const initialIntervalMin = Math.round((wakeHours * 60) / baselineCigs);

  // Generate milestone curve
  const sampleWeeks = [0, 0.25, 0.5, 0.75, 1.0].map((fraction) => {
    const w = fraction * totalWeeks;
    const allowed = Math.max(0, Math.round(calculateFormulaC(w, baselineCigs, totalWeeks)));
    const day = Math.round(fraction * totalDays);
    return { day, allowed };
  });

  const handleFinishOnboarding = () => {
    sounds.playAllowedChime();
    const plan = createSmokingPlan(baselineCigs, paceDays, wakeHours);
    onPlanCreated(plan);
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-5 overflow-y-auto bg-[#0d131a] text-slate-100">
      {/* Header Banner */}
      <div className="pt-2">
        <div className="flex items-center space-x-2 text-rose-400 mb-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <Cigarette className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-rose-300">
            Gradual Smoke Reduction
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
          {step === 1 ? 'Assess Your Baseline' : 'Customize Your Pace'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {step === 1
            ? 'A scientific, pressure-free program that reduces one cigarette every 4–5 days to let your body adapt without severe withdrawal.'
            : 'Review your personalized schedule calculated using gradual physiological tapering.'}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="my-4 space-y-4">
        {step === 1 ? (
          <>
            {/* Question 1: How much do you smoke a day? */}
            <div className="bg-[#141d27] border border-slate-800 rounded-3xl p-5 shadow-lg">
              <label htmlFor="baseline-cigs-input" className="block text-sm font-bold text-slate-200 mb-1">
                How many cigarettes do you smoke a day?
              </label>
              <p className="text-xs text-slate-400 mb-4">
                Be honest. Your reduction plan starts from this baseline.
              </p>

              {/* Number Stepper & Direct Input */}
              <div className="flex items-center justify-between bg-[#0a0f14] border border-slate-700/80 rounded-2xl p-2 px-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setBaselineCigs((c) => Math.max(1, c - 1));
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xl flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <div className="text-center">
                  <input
                    id="baseline-cigs-input"
                    type="number"
                    min="1"
                    max="100"
                    value={baselineCigs}
                    onChange={(e) => setBaselineCigs(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-3xl font-black text-center text-white bg-transparent outline-none"
                  />
                  <div className="text-[11px] font-semibold text-slate-400">cigs / day</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setBaselineCigs((c) => Math.min(80, c + 1));
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xl flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>

              {/* Quick Selectors */}
              <div className="flex items-center justify-between gap-1.5">
                {[10, 15, 20, 25, 30].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setBaselineCigs(val);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      baselineCigs === val
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Alternative: If you don't know your exact amount */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-[#161c28] to-[#111722] border border-indigo-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-indigo-200">
                    Not sure how much you smoke?
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Start a 24-hour tracking window. Simply tap a button every time you have a smoke, and we will calculate your true baseline automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onStart24hTracking();
                    }}
                    className="mt-3 inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-950 transition-all"
                  >
                    <span>Start 24-Hour Baseline Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Pace selection & Formula Preview */}
            <div className="bg-[#141d27] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-1">
                  Reduction Pace
                </label>
                <p className="text-xs text-slate-400">
                  Select how frequently your daily allowance drops by 1 cigarette.
                </p>
              </div>

              {/* Pace Options */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 4.0, label: 'Steady', desc: '1 cig / 4 days' },
                  { days: 4.5, label: 'Balanced', desc: '1 cig / 4.5 days', popular: true },
                  { days: 5.0, label: 'Gentle', desc: '1 cig / 5 days' },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPaceDays(opt.days);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between relative ${
                      paceDays === opt.days
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-950'
                        : 'bg-[#0d131a] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {opt.popular && (
                      <span className="absolute -top-2 right-2 text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                        REC
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-200">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {/* Waking Hours */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    Waking Hours Per Day
                  </span>
                  <span className="text-xs font-bold text-white">{wakeHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="18"
                  value={wakeHours}
                  onChange={(e) => setWakeHours(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>12h (Short day)</span>
                  <span>16h (Typical 7am-11pm)</span>
                  <span>18h (Long day)</span>
                </div>
              </div>
            </div>

            {/* Generated Plan Summary Card */}
            <div className="bg-[#141d27] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Calculated Reduction Schedule
                </span>
                <span className="text-slate-400">{totalDays} Total Days</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0b1016] p-3 rounded-2xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Initial Spacing</div>
                  <div className="text-base font-bold text-rose-400 mt-0.5">
                    ~{initialIntervalMin} mins
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Between smokes</div>
                </div>

                <div className="bg-[#0b1016] p-3 rounded-2xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Target Quit Date</div>
                  <div className="text-sm font-bold text-emerald-300 mt-0.5">
                    {targetQuitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Smoke-free life</div>
                </div>
              </div>

              {/* Reduction Schedule Progression */}
              <div className="bg-[#0b1016] p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300">
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  {sampleWeeks.map((s, idx) => (
                    <div key={idx} className="text-center px-1">
                      <div className="text-[10px] font-medium text-slate-400">
                        {s.day === 0 ? 'Starting Day' : `Day ${s.day}`}
                      </div>
                      <div className="font-bold text-white text-xs mt-0.5">{s.allowed} cigs</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA Bar */}
      <div className="pt-2">
        {step === 1 ? (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setStep(2);
            }}
            className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-950 transition-all active:scale-[0.99]"
          >
            <span>Continue to Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStep(1);
              }}
              className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Reduction Plan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
