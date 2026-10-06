import React from 'react';
import { Bell, Cigarette, Check, X, Clock } from 'lucide-react';
import { sounds } from '../utils/soundAndNotifications';

interface NotificationToastProps {
  isVisible: boolean;
  onConfirmSmoke: () => void;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  isVisible,
  onConfirmSmoke,
  onDismiss,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-12 inset-x-3 z-50 flex justify-center animate-slide-down pointer-events-auto">
      <div className="w-full max-w-sm bg-[#1e2736]/95 backdrop-blur-xl border border-rose-500/40 rounded-3xl p-4 shadow-2xl text-slate-100 shadow-rose-950/50">
        {/* Android 12 Notification Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <Cigarette className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200">QuitTrack</span>
            <span className="text-[10px] text-rose-400 font-medium bg-rose-500/20 px-1.5 py-0.5 rounded-full">
              2h Check-in
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Now
          </span>
        </div>

        {/* Notification Body */}
        <div className="mb-3 pl-1">
          <p className="text-xs font-semibold text-white">
            Did you have a smoke in the last 2 hours?
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            Your timer reached 0 over 2 hours ago. Keep your reduction plan accurate by logging your smoke.
          </p>
        </div>

        {/* Android Notification Action Chips */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
          <button
            onClick={() => {
              sounds.playClick();
              onConfirmSmoke();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md shadow-rose-900/30"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Yes, log smoke</span>
          </button>
          
          <button
            onClick={() => {
              sounds.playClick();
              onDismiss();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all border border-slate-700"
          >
            <X className="w-3.5 h-3.5" />
            <span>Still waiting</span>
          </button>
        </div>
      </div>
    </div>
  );
};
