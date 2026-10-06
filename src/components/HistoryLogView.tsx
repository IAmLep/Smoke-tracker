import React from 'react';
import { History, Cigarette, Clock, Sparkles, Trash2, Award } from 'lucide-react';
import { SmokeLogEntry, SmokingPlan } from '../types';
import { getAllowedCigarettesToday } from '../utils/reductionEngine';
import { sounds } from '../utils/soundAndNotifications';

interface HistoryLogViewProps {
  smokeLogs: SmokeLogEntry[];
  plan: SmokingPlan;
  onDeleteLog: (id: string) => void;
}

export const HistoryLogView: React.FC<HistoryLogViewProps> = ({
  smokeLogs,
  plan,
  onDeleteLog,
}) => {
  const allowedToday = getAllowedCigarettesToday(plan);

  // Group past smokes by Date string
  const groupedPastEntries: { [dateStr: string]: SmokeLogEntry[] } = {};
  smokeLogs.forEach((entry) => {
    const d = new Date(entry.timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (!groupedPastEntries[d]) groupedPastEntries[d] = [];
    groupedPastEntries[d].push(entry);
  });

  const totalExtraMinutes = smokeLogs.reduce(
    (acc, entry) => acc + (entry.extraWaitMinutes || 0),
    0
  );

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-5 overflow-y-auto bg-[#0d131a] text-slate-100 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 mb-1">
          <History className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
            Past Activity & Achievements
          </span>
        </div>
        <h1 className="text-xl font-black text-white">Your Past Activity</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Every delay and past smoke recorded to help reprogram habitual triggers.
        </p>
      </div>

      {/* Extra Delay Achievement Card */}
      {totalExtraMinutes > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-[#1f1912] to-amber-950/30 border border-amber-500/40 rounded-3xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-200">
              {totalExtraMinutes} Minutes of Extra Delay Won!
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Every time you pressed &quot;Can you wait 15 mins?&quot;, your brain strengthened impulse control.
            </div>
          </div>
        </div>
      )}

      {/* Past activity list */}
      <div className="space-y-4">
        {Object.keys(groupedPastEntries).length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center bg-[#141d27] rounded-3xl p-6 border border-slate-800">
            <Cigarette className="w-10 h-10 text-slate-600 mb-2" />
            <span className="font-semibold text-slate-300">No past smokes recorded yet</span>
            <span className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              When you record a smoke from the timer screen, it will appear here in your past activity.
            </span>
          </div>
        ) : (
          Object.entries(groupedPastEntries).map(([dateStr, entries]) => (
            <div key={dateStr} className="bg-[#141d27] border border-slate-800 rounded-3xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1 border-b border-slate-800/80 pb-2">
                <span>{dateStr}</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {entries.length} past smokes
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {entries.map((entry) => {
                  const time = new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-2 px-3 rounded-2xl bg-[#0a0f14] border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <Cigarette className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono text-white font-bold">{time}</div>
                          {entry.wasExtraWaitApplied && (
                            <div className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                              <Sparkles className="w-3 h-3" />
                              +{entry.extraWaitMinutes}m delayed
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          onDeleteLog(entry.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                        title="Remove past entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
