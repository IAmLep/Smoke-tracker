import { SmokingPlan } from '../types';

/**
 * Expected user formula for gradual smoking reduction:
 * const C = (w) => Math.max(0, B - (w * (B / W)));
 *
 * This reduces 1 cigarette every 4-5 days (default: 4.5 days)
 * allowing the body's nicotinic receptors to adapt without severe withdrawal.
 */
export const calculateFormulaC = (w: number, B: number, W: number): number => {
  if (W <= 0) return 0;
  return Math.max(0, B - (w * (B / W)));
};

/**
 * Helper to build a complete plan given baseline and pace
 */
export const createSmokingPlan = (
  baseline: number,
  reductionDaysPerCig: number = 4.5,
  wakeHours: number = 16,
  startDate: Date = new Date()
): SmokingPlan => {
  const B = Math.max(1, Math.round(baseline));
  const totalDays = Math.round(B * reductionDaysPerCig);
  const totalWeeks = totalDays / 7.0;

  const targetQuitDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

  return {
    baselineCigarettes: B,
    reductionDaysPerCig,
    totalDurationDays: totalDays,
    totalDurationWeeks: totalWeeks,
    startDate: startDate.toISOString(),
    targetQuitDate: targetQuitDate.toISOString(),
    wakeHoursPerDay: wakeHours,
    status: 'active',
  };
};

/**
 * Calculates how many cigarettes are permitted today based on elapsed time
 */
export const getAllowedCigarettesToday = (plan: SmokingPlan, currentTime: number = Date.now()): number => {
  const start = new Date(plan.startDate).getTime();
  const elapsedMs = Math.max(0, currentTime - start);
  const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);
  const elapsedWeeks = elapsedDays / 7.0;

  const exactAllowed = calculateFormulaC(
    elapsedWeeks,
    plan.baselineCigarettes,
    plan.totalDurationWeeks
  );

  return Math.max(0, Math.round(exactAllowed));
};

/**
 * Calculates current day number in the plan (e.g. Day 1, Day 14)
 */
export const getCurrentPlanDay = (plan: SmokingPlan, currentTime: number = Date.now()): number => {
  const start = new Date(plan.startDate).getTime();
  const elapsedMs = Math.max(0, currentTime - start);
  return Math.min(plan.totalDurationDays, Math.floor(elapsedMs / (24 * 60 * 60 * 1000)) + 1);
};

/**
 * Calculates minimum spacing interval in minutes between cigarettes.
 * Interval = (Wake Hours * 60) / Cigarettes Allowed Today.
 */
export const getIntervalMinutes = (plan: SmokingPlan, currentTime: number = Date.now()): number => {
  const allowedToday = getAllowedCigarettesToday(plan, currentTime);
  if (allowedToday <= 0) return 0; // Successfully quit
  const totalWakeMinutes = plan.wakeHoursPerDay * 60;
  return Math.max(15, Math.round(totalWakeMinutes / allowedToday));
};

/**
 * Calculates the exact timestamp when the user is next allowed to smoke.
 */
export const getNextAllowedTimestamp = (
  plan: SmokingPlan,
  lastSmokeTimestamp: number | null,
  extraDelayMinutes: number = 0,
  currentTime: number = Date.now()
): number => {
  const intervalMinutes = getIntervalMinutes(plan, currentTime);

  if (!lastSmokeTimestamp) {
    // If no smoke recorded yet today, allow smoke or offset from start
    return currentTime;
  }

  const baseNext = lastSmokeTimestamp + intervalMinutes * 60 * 1000;
  const extraOffsetMs = extraDelayMinutes * 60 * 1000;
  return baseNext + extraOffsetMs;
};

/**
 * Formats negative seconds into an Android countdown format:
 * e.g., -01:42:15 or -14:59
 */
export const formatNegativeCountdown = (remainingMs: number): string => {
  if (remainingMs <= 0) return '00:00';
  
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `-${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `-${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Formats a duration nicely (e.g. "1h 36m", "48 mins")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hours`;
};
