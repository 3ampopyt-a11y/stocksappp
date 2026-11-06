import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Play, 
  Pause, 
  Clock, 
  DollarSign, 
  Briefcase,
  Zap
} from 'lucide-react';
import { MarketSpeed } from '../types';

interface InvestorHeaderProps {
  cash: number;
  stocksValue: number;
  totalNetWorth: number;
  totalReturn: number;
  totalReturnPercent: number;
  onResetReturn: () => void;
  day: number;
  timeString: string;
  isPaused: boolean;
  onTogglePause: () => void;
  speed: MarketSpeed;
  onSetSpeed: (speed: MarketSpeed) => void;
  onOpenReset: () => void;
}

export const InvestorHeader: React.FC<InvestorHeaderProps> = ({
  cash,
  stocksValue,
  totalNetWorth,
  totalReturn,
  totalReturnPercent,
  onResetReturn,
  day,
  timeString,
  isPaused,
  onTogglePause,
  speed,
  onSetSpeed,
  onOpenReset,
}) => {
  const isPositive = totalReturn >= 0;

  return (
    <header className="relative bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Live Market Clock Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              {!isPaused && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="font-semibold text-slate-200">
              {isPaused ? 'Market Paused' : 'NYSE / NASDAQ Live'}
            </span>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Day {day} • {timeString}</span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Hours advance automatically)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector: 1x, 2x, 3x */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
              <span className="px-1.5 text-slate-500 font-sans font-semibold hidden sm:inline">Speed:</span>
              <button
                onClick={() => onSetSpeed('1x')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  speed === '1x'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="1x Normal Speed (3.5s per hour)"
              >
                1x
              </button>
              <button
                onClick={() => onSetSpeed('2x')}
                className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-0.5 ${
                  speed === '2x'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="2x Faster (1.75s per hour)"
              >
                <span>2x</span>
                <span className="text-[10px]">⚡</span>
              </button>
              <button
                onClick={() => onSetSpeed('3x')}
                className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-0.5 ${
                  speed === '3x'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="3x Ultra Fast (1.0s per hour - no waiting!)"
              >
                <span>3x</span>
                <span className="text-[10px]">🚀</span>
              </button>
            </div>

            {/* Pause / Resume Button */}
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition ${
                isPaused 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title={isPaused ? 'Resume live market' : 'Pause market'}
            >
              {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-emerald-500/20">
                $
              </div>
              <div>
                <h1 className="font-black text-xl text-white tracking-tight leading-none">
                  WallStreet Simulator
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  120+ Real Equities • Airbus, Boeing, Tech & Global Leaders • Start with $1,000
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Metric Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            {/* Cash */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Available Cash
              </span>
              <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                ${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            {/* Stocks Value */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Invested in Stocks
              </span>
              <div className="text-lg sm:text-xl font-mono font-black text-slate-200">
                ${stocksValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            {/* Total Return Button (Resets on Sell or Click) */}
            <button
              onClick={onResetReturn}
              className="text-left group cursor-pointer p-1.5 -m-1.5 rounded-xl hover:bg-slate-900/90 active:scale-95 transition border border-transparent hover:border-slate-800"
              title="Total Return — Resets automatically every time you sell, or click here to reset benchmark"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block group-hover:text-slate-200 transition">
                  Total Return
                </span>
                <span className="text-[9px] text-slate-500 group-hover:text-slate-400 transition flex items-center gap-0.5">
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </span>
              </div>
              <div
                className={`text-sm sm:text-base font-mono font-bold flex items-center gap-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? '+' : ''}${totalReturn.toFixed(2)} ({isPositive ? '+' : ''}{totalReturnPercent.toFixed(1)}%)
                </span>
              </div>
            </button>
          </div>

          {/* Reset Portfolio Button */}
          <div>
            <button
              onClick={onOpenReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Restart simulator balance ($1,000, $5,000, or $100)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Balance</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
