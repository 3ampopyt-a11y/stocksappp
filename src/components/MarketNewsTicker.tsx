import React from 'react';
import { MarketNewsItem } from '../types';
import { Radio, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketNewsTickerProps {
  currentNews: MarketNewsItem | null;
}

export const MarketNewsTicker: React.FC<MarketNewsTickerProps> = ({ currentNews }) => {
  if (!currentNews) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Bloomberg / Reuters Wire: Markets trading in active session. All 100+ equities actively monitored.</span>
        </div>
      </div>
    );
  }

  const isPos = currentNews.isPositive;

  return (
    <div
      className={`border rounded-xl px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm transition-all ${
        isPos
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          {currentNews.timeString}
        </span>
        <span className="font-semibold text-slate-100">{currentNews.headline}</span>
      </div>

      {currentNews.affectedTicker && currentNews.impactPercent && (
        <div
          className={`flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
            isPos ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}
        >
          {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>
            {currentNews.affectedTicker} {isPos ? '+' : ''}{(currentNews.impactPercent * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};
