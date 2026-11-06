import React from 'react';
import { X, RotateCcw, DollarSign } from 'lucide-react';

interface ResetBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (startingCash: number) => void;
}

export const ResetBalanceModal: React.FC<ResetBalanceModalProps> = ({ isOpen, onClose, onReset }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white">Reset Simulator</h3>
          <p className="text-xs text-slate-400 mt-1">
            Choose your starting portfolio cash balance:
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onReset(1000)}
            className="w-full text-left p-4 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/50 hover:border-emerald-400 transition group cursor-pointer shadow-md shadow-emerald-950/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>Standard Starting Balance ($1,000)</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                    Default
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Start with exactly $1,000 to trade 120+ real companies like Airbus and Boeing.
                </div>
              </div>
              <span className="font-mono text-emerald-400 font-black text-lg">$1,000</span>
            </div>
          </button>

          <button
            onClick={() => onReset(5000)}
            className="w-full text-left p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500 transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">
                  Fund Manager ($5,000)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Ample capital to take large positions across multiple sectors.
                </div>
              </div>
              <span className="font-mono text-indigo-400 font-black text-base">$5,000</span>
            </div>
          </button>

          <button
            onClick={() => onReset(100)}
            className="w-full text-left p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500 transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">
                  Micro Trader ($100)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Start small with a $100 budget to practice precision investing.
                </div>
              </div>
              <span className="font-mono text-amber-400 font-black text-base">$100</span>
            </div>
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
