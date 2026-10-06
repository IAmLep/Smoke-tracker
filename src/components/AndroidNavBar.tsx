import React from 'react';
import { Timer, BarChart2, History } from 'lucide-react';
import { AppState } from '../types';
import { sounds } from '../utils/soundAndNotifications';

interface AndroidNavBarProps {
  activeScreen: AppState['activeScreen'];
  onSelectScreen: (screen: AppState['activeScreen']) => void;
  hasActivePlan: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeScreen,
  onSelectScreen,
  hasActivePlan,
}) => {
  const handleNav = (screen: AppState['activeScreen']) => {
    sounds.playClick();
    onSelectScreen(screen);
  };

  return (
    <nav aria-label="Bottom Navigation" className="w-full bg-[#121820]/95 backdrop-blur-md border-t border-slate-800/80 px-4 pt-2 pb-5 z-20 flex flex-col items-center">
      {/* Navigation Buttons: Timer | Plan | Past */}
      <div className="w-full max-w-sm flex items-center justify-around mb-2">
        <button
          onClick={() => handleNav('app')}
          className={`flex flex-col items-center py-1.5 px-4 rounded-2xl transition-all ${
            activeScreen === 'app'
              ? 'text-rose-400 bg-rose-500/15 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Timer className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Timer</span>
        </button>

        {hasActivePlan && (
          <>
            <button
              onClick={() => handleNav('plan_details')}
              className={`flex flex-col items-center py-1.5 px-4 rounded-2xl transition-all ${
                activeScreen === 'plan_details'
                  ? 'text-indigo-400 bg-indigo-500/15 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] tracking-tight">Plan</span>
            </button>

            <button
              onClick={() => handleNav('history')}
              className={`flex flex-col items-center py-1.5 px-4 rounded-2xl transition-all ${
                activeScreen === 'history'
                  ? 'text-amber-400 bg-amber-500/15 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] tracking-tight">Past</span>
            </button>
          </>
        )}
      </div>

      {/* Android 12 Home Gesture Pill Bar */}
      <div className="w-32 h-1 rounded-full bg-slate-500/50 mt-1"></div>
    </nav>
  );
};
