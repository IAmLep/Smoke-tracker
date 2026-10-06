import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Bell } from 'lucide-react';

interface AndroidStatusBarProps {
  notificationsActive?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ notificationsActive = false }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 pt-2 pb-1 text-xs font-semibold text-slate-300 tracking-wide select-none z-30">
      {/* Left: Clock & optional notification icon */}
      <div className="flex items-center space-x-2">
        <span>{timeStr || '12:00'}</span>
        {notificationsActive && (
          <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        )}
      </div>

      {/* Center: Subtle Android 12 camera punch-hole (hidden on full screen) */}
      <div className="w-3.5 h-3.5 rounded-full bg-black/80 border border-slate-700/50 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
      </div>

      {/* Right: 5G, Wi-Fi, Battery */}
      <div className="flex items-center space-x-2 text-slate-300">
        <span className="text-[10px] font-bold text-slate-400">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-0.5">
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] text-slate-400">88%</span>
        </div>
      </div>
    </div>
  );
};
