import React, { useState } from 'react';
import {
  TrendingDown,
  Calendar,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  CalendarCheck,
  Sliders,
  Check
} from 'lucide-react';
import { SmokingPlan, SmokeLogEntry } from '../types';
import {
  calculateFormulaC,
  getAllowedCigarettesToday,
  getCurrentPlanDay,
  getIntervalMinutes,
  formatDuration,
  createSmokingPlan
} from '../utils/reductionEngine';
import { sounds } from '../utils/soundAndNotifications';

interface PlanDetailsViewProps {
  plan: SmokingPlan;
  smokeLogs: SmokeLogEntry[];
  onResetPlan: () => void;
  onUpdatePlan: (updatedPlan: SmokingPlan) => void;
}

export const PlanDetailsView: React.FC<PlanDetailsViewProps> = ({
  plan,
  smokeLogs,
  onResetPlan,
  onUpdatePlan,
}) => {
  const currentDay = getCurrentPlanDay(plan);
  const allowedToday = getAllowedCigarettesToday(plan);
  const intervalMin = getIntervalMinutes(plan);

  // Local state for manually adjusting target quit date
  const [selectedQuitDate, setSelectedQuitDate] = useState<string>(
    new Date(plan.targetQuitDate).toISOString().split('T')[0]
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Calculate days difference from plan startDate to the selected quit date
  const startDateMs = new Date(plan.startDate).getTime();
  const selectedDateMs = new Date(`${selectedQuitDate}T23:59:59`).getTime();
  const calculatedDays = Math.max(1, Math.round((selectedDateMs - startDateMs) / (1000 * 60 * 60 * 24)));
  const calculatedPace = Number((calculatedDays / plan.baselineCigarettes).toFixed(1));

  // Today ISO string for min date (cannot pick a quit date in the past)
  const todayStr = new Date().toISOString().split('T')[0];

  const handleApplyNewDate = () => {
    sounds.playAllowedChime();
    const updatedPlan: SmokingPlan = {
      ...plan,
      reductionDaysPerCig: calculatedPace,
      totalDurationDays: calculatedDays,
      totalDurationWeeks: calculatedDays / 7.0,
      targetQuitDate: new Date(`${selectedQuitDate}T23:59:59`).toISOString(),
    };
    onUpdatePlan(updatedPlan);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleApplyPreset = (pace: number) => {
    sounds.playClick();
    const newTotalDays = Math.round(plan.baselineCigarettes * pace);
    const newTargetDate = new Date(startDateMs + newTotalDays * 24 * 60 * 60 * 1000);
    const dateStr = newTargetDate.toISOString().split('T')[0];
    setSelectedQuitDate(dateStr);

    const updatedPlan: SmokingPlan = {
      ...plan,
      reductionDaysPerCig: pace,
      totalDurationDays: newTotalDays,
      totalDurationWeeks: newTotalDays / 7.0,
      targetQuitDate: newTargetDate.toISOString(),
    };
    onUpdatePlan(updatedPlan);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Generate milestone days
  const milestones: { day: number; allowed: number }[] = [];
  const stepDays = Math.max(1, Math.round(plan.reductionDaysPerCig));
  for (let d = 0; d <= plan.totalDurationDays; d += stepDays * 2) {
    const w = d / 7.0;
    const allowed = Math.max(0, Math.round(calculateFormulaC(w, plan.baselineCigarettes, plan.totalDurationWeeks)));
    milestones.push({ day: d, allowed });
  }
  if (milestones[milestones.length - 1].day < plan.totalDurationDays) {
    milestones.push({ day: plan.totalDurationDays, allowed: 0 });
  }

  // Real-world scientifically sorted body healing milestones (WHO / CDC / AHA data)
  const healingMilestones = [
    {
      time: '20 Minutes',
      title: 'Pulse & Blood Pressure Normalize',
      desc: 'Heart rate and blood pressure drop back down to resting baseline. Peripheral blood vessels relax, restoring normal circulation to hands and feet.',
      badge: 'Immediate',
    },
    {
      time: '8 Hours',
      title: 'Carbon Monoxide Drops & Oxygen Restores',
      desc: 'Carbon monoxide blood saturation drops by over 50%. Blood oxygen levels climb back to healthy, non-smoker levels.',
      badge: 'Day 1',
    },
    {
      time: '24 Hours',
      title: 'Heart Attack Risk Drops & Lungs Clear',
      desc: 'Carbon monoxide is completely evacuated from the bloodstream. Lungs begin clearing out stagnant mucus and inhaled smoking residue.',
      badge: 'Day 1',
    },
    {
      time: '48 Hours',
      title: 'Nicotine Cleared & Senses Sharpen',
      desc: 'Nicotine metabolites are 100% eliminated from body tissues. Nerve endings begin to regenerate, noticeably sharpening taste and smell.',
      badge: 'Day 2',
    },
    {
      time: '72 Hours',
      title: 'Airways Relax & Lung Capacity Expands',
      desc: 'Bronchial breathing passages relax, reducing wheezing and shortness of breath. Overall cellular energy increases.',
      badge: 'Day 3',
    },
    {
      time: '2 to 12 Weeks',
      title: 'Circulation & Lung Function Surge',
      desc: 'Blood circulation substantially improves. Walking and strenuous aerobic exercise feel significantly easier as lung capacity increases up to 30%.',
      badge: 'Weeks 2–12',
    },
    {
      time: '1 to 9 Months',
      title: 'Cilia Regrowth & Coughing Subsides',
      desc: 'Bronchial cilia completely regrow, regaining the ability to clean lungs and handle mucus. Sinus congestion and shortness of breath diminish.',
      badge: 'Months 1–9',
    },
    {
      time: '1 Year',
      title: 'Coronary Disease Risk Halved',
      desc: 'Excess risk of coronary heart disease drops by 50% compared to a continuing smoker.',
      badge: '1 Year',
    },
    {
      time: '5 to 10 Years',
      title: 'Stroke & Cancer Risk Drops by 50%',
      desc: 'Stroke risk matches that of a lifetime non-smoker. Risk of fatal lung cancer falls to approximately half that of an active smoker.',
      badge: 'Long-term',
    },
  ];

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-5 overflow-y-auto bg-[#0d131a] text-slate-100 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <TrendingDown className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wider uppercase text-indigo-300">
            Physiological Reduction Plan
          </span>
        </div>
        <h1 className="text-xl font-black text-white">Your Reduction Schedule</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tapering your daily consumption gradually to let your body adapt without severe withdrawal.
        </p>
      </div>

      {/* Manual Quit Date Adjuster with Recommendations Underneath (Formula removed per user instructions) */}
      <div className="bg-[#141d27] border border-indigo-500/30 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
            Set Target Quit Date
          </span>
          {saveSuccess && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
              <Check className="w-3 h-3" /> Updated
            </span>
          )}
        </div>

        {/* Date input and save */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            min={todayStr}
            value={selectedQuitDate}
            onChange={(e) => setSelectedQuitDate(e.target.value)}
            className="flex-1 bg-[#0a0f14] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleApplyNewDate}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-950"
          >
            Apply Date
          </button>
        </div>

        {/* Current calculated schedule info */}
        <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
          <span>Total: <strong className="text-white">{calculatedDays} days</strong></span>
          <span>Pace: <strong className="text-rose-400">1 cig / {calculatedPace} days</strong></span>
        </div>

        {/* Recommendation Underneath Similar to App Start */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] text-slate-300 leading-snug">
            <span className="text-amber-300 font-semibold">Recommendation: </span>
            We recommend reducing 1 cigarette every <strong>4 to 5 days</strong> (4.5 days balanced) so your body&apos;s nicotinic receptors adapt slowly without harsh withdrawal or anxiety.
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { pace: 4.0, label: 'Steady', desc: '1 / 4d' },
              { pace: 4.5, label: 'Recommended', desc: '1 / 4.5d', rec: true },
              { pace: 5.0, label: 'Gentle', desc: '1 / 5d' },
            ].map((p) => (
              <button
                key={p.pace}
                onClick={() => handleApplyPreset(p.pace)}
                className={`py-1.5 px-2 rounded-xl text-left border transition-all ${
                  plan.reductionDaysPerCig === p.pace
                    ? 'bg-indigo-500/20 border-indigo-400 text-white font-bold'
                    : 'bg-[#0a0f14] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-200">{p.label}</div>
                <div className="text-[9px] text-slate-400">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[#141d27] rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-400">Current Progress</div>
          <div className="text-base font-black text-white mt-0.5">
            Day {currentDay} of {plan.totalDurationDays}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {Math.round((currentDay / plan.totalDurationDays) * 100)}% completed
          </div>
        </div>

        <div className="p-3 bg-[#141d27] rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-400">Target Quit Date</div>
          <div className="text-sm font-black text-rose-300 mt-0.5">
            {new Date(plan.targetQuitDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zero cigarettes</div>
        </div>
      </div>

      {/* Milestone Roadmap */}
      <div className="bg-[#141d27] border border-slate-800 rounded-3xl p-4 space-y-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-rose-400" />
          Milestones & Daily Allowances
        </h2>

        <div className="space-y-2">
          {milestones.map((m, idx) => {
            const isCurrent = currentDay >= m.day && (idx === milestones.length - 1 || currentDay < milestones[idx + 1].day);
            return (
              <div
                key={m.day}
                className={`flex items-center justify-between p-2.5 px-3 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-rose-500/15 border-rose-500/60 text-white font-bold'
                    : 'bg-[#0a0f14] border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-rose-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>{m.day === 0 ? 'Starting Day' : `Day ${m.day}`}</span>
                  {isCurrent && (
                    <span className="text-[10px] bg-rose-500 text-white px-1.5 rounded-full font-bold">
                      TODAY
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold">{m.allowed} cigs/day</span>
                  <span className="text-[10px] text-slate-400">
                    (~{formatDuration(m.allowed > 0 ? Math.round((plan.wakeHoursPerDay * 60) / m.allowed) : 0)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body Healing Milestones - Sorted by Real World Medical Data */}
      <div className="bg-[#141d27] border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-emerald-400" />
            Body Healing Milestones (Real World Data)
          </h2>
          <span className="text-[10px] text-slate-400">WHO / CDC Clinical</span>
        </div>

        <div className="space-y-3 pt-1">
          {healingMilestones.map((h, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-[#0a0f14] border border-slate-800/80 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {h.time}
                </span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {h.badge}
                </span>
              </div>
              <div className="text-xs font-bold text-white pt-0.5">{h.title}</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset / Recalibrate button */}
      <div className="pt-2">
        <button
          onClick={() => {
            sounds.playClick();
            if (confirm('Are you sure you want to reset your plan? You will be returned to onboarding.')) {
              onResetPlan();
            }
          }}
          className="w-full py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset or Recalibrate Plan</span>
        </button>
      </div>
    </div>
  );
};
