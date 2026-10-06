import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SmokingPlan,
  SmokeLogEntry,
  Tracking24hSession,
  AppState,
} from './types';
import {
  getNextAllowedTimestamp,
  formatNegativeCountdown,
  getAllowedCigarettesToday,
  getIntervalMinutes,
} from './utils/reductionEngine';
import {
  sounds,
  requestPushNotificationPermission,
  triggerSystemPushNotification,
} from './utils/soundAndNotifications';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { ConfirmSmokeModal } from './components/ConfirmSmokeModal';
import { NotificationToast } from './components/NotificationToast';
import { AndroidHomeScreenWidget } from './components/AndroidHomeScreenWidget';
import { OnboardingView } from './components/OnboardingView';
import { Tracking24hView } from './components/Tracking24hView';
import { MainTimerScreen } from './components/MainTimerScreen';
import { PlanDetailsView } from './components/PlanDetailsView';
import { HistoryLogView } from './components/HistoryLogView';
import { QuickDevToolbar } from './components/QuickDevToolbar';

const STORAGE_KEY_PLAN = 'quittrack_plan_v1';
const STORAGE_KEY_LOGS = 'quittrack_logs_v1';
const STORAGE_KEY_LAST_SMOKE = 'quittrack_last_smoke_v1';
const STORAGE_KEY_EXTRA_DELAY = 'quittrack_extra_delay_v1';
const STORAGE_KEY_TRACKING = 'quittrack_tracking_v1';

export default function App() {
  // Persistent state
  const [plan, setPlan] = useState<SmokingPlan | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAN);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [tracking24h, setTracking24h] = useState<Tracking24hSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRACKING);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [smokeLogs, setSmokeLogs] = useState<SmokeLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastSmokeTimestamp, setLastSmokeTimestamp] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_SMOKE);
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  const [extraDelayMinutes, setExtraDelayMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXTRA_DELAY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // UI state
  const [activeScreen, setActiveScreen] = useState<AppState['activeScreen']>('app');
  const [viewMode, setViewMode] = useState<AppState['viewMode']>('device');
  const [isSmokeModalOpen, setIsSmokeModalOpen] = useState<boolean>(false);
  const [is2HourToastVisible, setIs2HourToastVisible] = useState<boolean>(false);
  const [lastNotificationTargetTimestamp, setLastNotificationTargetTimestamp] = useState<number | null>(null);

  // Live clock tick
  const [now, setNow] = useState<number>(Date.now());
  const [hasPlayedAllowedSound, setHasPlayedAllowedSound] = useState<boolean>(false);

  // Synchronize to localStorage
  useEffect(() => {
    if (plan) {
      localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
    } else {
      localStorage.removeItem(STORAGE_KEY_PLAN);
    }
  }, [plan]);

  useEffect(() => {
    if (tracking24h) {
      localStorage.setItem(STORAGE_KEY_TRACKING, JSON.stringify(tracking24h));
    } else {
      localStorage.removeItem(STORAGE_KEY_TRACKING);
    }
  }, [tracking24h]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(smokeLogs));
  }, [smokeLogs]);

  useEffect(() => {
    if (lastSmokeTimestamp) {
      localStorage.setItem(STORAGE_KEY_LAST_SMOKE, lastSmokeTimestamp.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY_LAST_SMOKE);
    }
  }, [lastSmokeTimestamp]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXTRA_DELAY, extraDelayMinutes.toString());
  }, [extraDelayMinutes]);

  // Tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute intervals and status
  const nextAllowedTimestamp = useMemo(() => {
    if (!plan) return now;
    return getNextAllowedTimestamp(plan, lastSmokeTimestamp, extraDelayMinutes, now);
  }, [plan, lastSmokeTimestamp, extraDelayMinutes, now]);

  const remainingMs = Math.max(0, nextAllowedTimestamp - now);
  const isAllowedToSmoke = remainingMs <= 0;
  const formattedCountdown = formatNegativeCountdown(remainingMs);

  // Play audio feedback once when timer reaches 0
  useEffect(() => {
    if (plan && isAllowedToSmoke && !hasPlayedAllowedSound) {
      sounds.playAllowedChime();
      setHasPlayedAllowedSound(true);
    } else if (!isAllowedToSmoke && hasPlayedAllowedSound) {
      setHasPlayedAllowedSound(false);
    }
  }, [isAllowedToSmoke, hasPlayedAllowedSound, plan]);

  // 2-Hour Notification Trigger logic
  // "There should be a pushed notification a reasonable amount of time after the timer counts down
  // and no cigarette has been added maybe 2 hours after to make sure that they are adding their smokes"
  useEffect(() => {
    if (!plan || !isAllowedToSmoke) return;

    const timeSinceAllowed = now - nextAllowedTimestamp;
    const twoHoursMs = 2 * 60 * 60 * 1000;

    if (
      timeSinceAllowed >= twoHoursMs &&
      lastNotificationTargetTimestamp !== nextAllowedTimestamp &&
      !is2HourToastVisible
    ) {
      setLastNotificationTargetTimestamp(nextAllowedTimestamp);
      setIs2HourToastVisible(true);
      triggerSystemPushNotification(
        'QuitTrack · 2h Check-in',
        "It's been 2 hours since your allowed smoke window. Did you smoke? Remember to log it in the app to keep your plan accurate!"
      );
    }
  }, [now, nextAllowedTimestamp, isAllowedToSmoke, lastNotificationTargetTimestamp, is2HourToastVisible, plan]);

  // Handle logging a smoke
  const handleConfirmSmoke = useCallback(() => {
    const logTime = Date.now();
    const newEntry: SmokeLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: logTime,
      allowedTimestamp: nextAllowedTimestamp,
      wasExtraWaitApplied: extraDelayMinutes > 0,
      extraWaitMinutes: extraDelayMinutes,
    };

    setSmokeLogs((prev) => [newEntry, ...prev]);
    setLastSmokeTimestamp(logTime);
    setExtraDelayMinutes(0);
    setIs2HourToastVisible(false);
    setIsSmokeModalOpen(false);
    setHasPlayedAllowedSound(false);

    // Switch view back to app if on widget
    setActiveScreen('app');
  }, [nextAllowedTimestamp, extraDelayMinutes]);

  // Handle +15 min challenge
  const handleAdd15MinDelay = useCallback(() => {
    setExtraDelayMinutes((prev) => prev + 15);
    setIs2HourToastVisible(false);
    setHasPlayedAllowedSound(false);
  }, []);

  // Handle manual 24-hour tracking start
  const handleStart24hTracking = useCallback(() => {
    const startTime = Date.now();
    const session: Tracking24hSession = {
      startTime,
      endTime: startTime + 24 * 60 * 60 * 1000,
      entries: [],
      isCompleted: false,
    };
    setTracking24h(session);
    setPlan(null);
  }, []);

  // Handle finished 24-hour tracking
  const handleFinish24hTracking = useCallback((newPlan: SmokingPlan) => {
    setPlan(newPlan);
    setTracking24h(null);
    setLastSmokeTimestamp(Date.now());
    setExtraDelayMinutes(0);
    setActiveScreen('app');
    requestPushNotificationPermission();
  }, []);

  // Handle onboarding plan created
  const handlePlanCreated = useCallback((newPlan: SmokingPlan) => {
    setPlan(newPlan);
    setTracking24h(null);
    // Initialize last smoke to now so interval starts fresh
    setLastSmokeTimestamp(Date.now());
    setExtraDelayMinutes(0);
    setActiveScreen('app');
    requestPushNotificationPermission();
  }, []);

  // Simulator tools
  const handleFastForward = (minutes: number) => {
    if (lastSmokeTimestamp) {
      setLastSmokeTimestamp((prev) => (prev ? prev - minutes * 60 * 1000 : null));
    }
  };

  const handleJumpToAllowed = () => {
    if (!plan) return;
    const intervalMin = getIntervalMinutes(plan, now);
    const neededOffset = (intervalMin + extraDelayMinutes + 1) * 60 * 1000;
    setLastSmokeTimestamp(now - neededOffset);
  };

  const handleTrigger2HourAlert = () => {
    if (!plan) return;
    const intervalMin = getIntervalMinutes(plan, now);
    const neededOffset = (intervalMin + extraDelayMinutes + 121) * 60 * 1000;
    setLastSmokeTimestamp(now - neededOffset);
    setIs2HourToastVisible(true);
    triggerSystemPushNotification(
      'QuitTrack · 2h Check-in',
      "It's been 2 hours since your allowed smoke window. Did you smoke? Remember to log it in the app to keep your plan accurate!"
    );
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setPlan(null);
    setTracking24h(null);
    setSmokeLogs([]);
    setLastSmokeTimestamp(null);
    setExtraDelayMinutes(0);
    setIs2HourToastVisible(false);
    setIsSmokeModalOpen(false);
    setActiveScreen('app');
  };

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col font-sans">
      {/* Top Android 12 Developer & Testing Bar */}
      <QuickDevToolbar
        onFastForward={handleFastForward}
        onJumpToAllowed={handleJumpToAllowed}
        onTrigger2HourNotification={handleTrigger2HourAlert}
        onResetAllData={handleResetAllData}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((m) => (m === 'device' ? 'fullscreen' : 'device'))}
        onOpenWidgetView={() => setActiveScreen('widget')}
        activeScreen={activeScreen}
      />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        <div
          className={`w-full transition-all duration-300 relative flex flex-col ${
            viewMode === 'device'
              ? 'max-w-[420px] h-[92vh] max-h-[880px] bg-[#0d131a] rounded-[48px] border-[10px] border-[#1a2330] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-slate-800'
              : 'max-w-2xl h-[94vh] bg-[#0d131a] rounded-none sm:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl overflow-hidden'
          }`}
        >
          {/* Android 12 Status Bar */}
          <AndroidStatusBar notificationsActive={is2HourToastVisible} />

          {/* Android 12 Push Notification Shade Alert */}
          <NotificationToast
            isVisible={is2HourToastVisible}
            onConfirmSmoke={handleConfirmSmoke}
            onDismiss={() => setIs2HourToastVisible(false)}
          />

          {/* Accidental Tap Confirmation Dialog */}
          <ConfirmSmokeModal
            isOpen={isSmokeModalOpen}
            onConfirm={handleConfirmSmoke}
            onCancel={() => setIsSmokeModalOpen(false)}
          />

          {/* Screen Content Switcher */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {!plan && !tracking24h && (
              <OnboardingView
                onPlanCreated={handlePlanCreated}
                onStart24hTracking={handleStart24hTracking}
              />
            )}

            {!plan && tracking24h && (
              <Tracking24hView
                session={tracking24h}
                onUpdateSession={setTracking24h}
                onFinishTracking={handleFinish24hTracking}
                onCancelTracking={() => setTracking24h(null)}
              />
            )}

            {plan && activeScreen === 'app' && (
              <MainTimerScreen
                plan={plan}
                isAllowedToSmoke={isAllowedToSmoke}
                remainingMs={remainingMs}
                formattedCountdown={formattedCountdown}
                onOpenSmokeModal={() => setIsSmokeModalOpen(true)}
                onAdd15MinDelay={handleAdd15MinDelay}
                smokeLogs={smokeLogs}
                extraDelayMinutes={extraDelayMinutes}
              />
            )}

            {plan && activeScreen === 'widget' && (
              <AndroidHomeScreenWidget
                isAllowedToSmoke={isAllowedToSmoke}
                remainingMs={remainingMs}
                formattedCountdown={formattedCountdown}
                onOpenApp={() => setActiveScreen('app')}
                allowedToday={getAllowedCigarettesToday(plan, now)}
                currentIntervalMin={getIntervalMinutes(plan, now)}
              />
            )}

            {plan && activeScreen === 'plan_details' && (
              <PlanDetailsView
                plan={plan}
                smokeLogs={smokeLogs}
                onResetPlan={handleResetAllData}
                onUpdatePlan={(updatedPlan) => setPlan(updatedPlan)}
              />
            )}

            {plan && activeScreen === 'history' && (
              <HistoryLogView
                smokeLogs={smokeLogs}
                plan={plan}
                onDeleteLog={(id) => setSmokeLogs((logs) => logs.filter((l) => l.id !== id))}
              />
            )}
          </div>

          {/* Android 12 Navigation Bar & Gesture Pill */}
          <AndroidNavBar
            activeScreen={activeScreen}
            onSelectScreen={setActiveScreen}
            hasActivePlan={!!plan}
          />
        </div>
      </main>
    </div>
  );
}
