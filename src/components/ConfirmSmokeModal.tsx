import React from 'react';
import { Cigarette, AlertCircle, Check, X } from 'lucide-react';
import { sounds } from '../utils/soundAndNotifications';

interface ConfirmSmokeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmSmokeModal: React.FC<ConfirmSmokeModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xs bg-[#1a212d] border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 transform transition-all scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <Cigarette className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 id="confirm-dialog-title" className="text-xl font-bold text-center text-white mb-2">
          Did you have a smoke?
        </h3>

        {/* Description */}
        <p className="text-xs text-center text-slate-300 mb-6 leading-relaxed">
          Logging a smoke records your timestamp and restarts your scheduled countdown interval.
        </p>

        {/* Action Buttons: Yes / No */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onCancel();
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" />
            <span>No</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onConfirm();
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-rose-900/40"
          >
            <Check className="w-4 h-4" />
            <span>Yes</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span>Accidental tap protection</span>
        </div>
      </div>
    </div>
  );
};
