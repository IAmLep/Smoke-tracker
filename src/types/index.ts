export interface SmokingPlan {
  baselineCigarettes: number; // B
  reductionDaysPerCig: number; // typically 4.5 days (4 to 5 days)
  totalDurationDays: number; // B * reductionDaysPerCig
  totalDurationWeeks: number; // W = totalDurationDays / 7
  startDate: string; // ISO string
  targetQuitDate: string; // ISO string
  wakeHoursPerDay: number; // default 16 (7am to 11pm)
  status: 'active' | 'completed' | 'tracking_baseline';
}

export interface SmokeLogEntry {
  id: string;
  timestamp: number;
  allowedTimestamp: number;
  wasExtraWaitApplied: boolean;
  extraWaitMinutes: number;
  note?: string;
}

export interface TrackingEntry {
  id: string;
  timestamp: number;
  note?: string;
}

export interface Tracking24hSession {
  startTime: number;
  endTime: number; // startTime + 24 * 3600 * 1000
  entries: TrackingEntry[];
  isCompleted: boolean;
}

export interface AppState {
  plan: SmokingPlan | null;
  tracking24h: Tracking24hSession | null;
  smokeLogs: SmokeLogEntry[];
  lastSmokeTimestamp: number | null;
  extraDelayMinutes: number; // accumulated +15 min delays
  lastNotificationSentTimestamp: number | null;
  notificationsEnabled: boolean;
  activeScreen: 'app' | 'widget' | 'stats' | 'history' | 'plan_details';
  viewMode: 'device' | 'fullscreen';
}
