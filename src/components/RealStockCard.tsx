import React from 'react';
import { RealStock, PortfolioPosition } from '../types';
import { Sparkline } from './Sparkline';
import { TrendingUp, TrendingDown, Plus, Minus, SlidersHorizontal, History, BarChart2 } from 'lucide-react';

interface RealStockCardProps {
  stock: RealStock;
  position?: PortfolioPosition;
  cash: number;
  onBuy: (ticker: string, shares: number) => void;
  onSell: (ticker: string, shares: number) => void;
  onOpenTradeModal: (stock: RealStock) => void;
  priceFlash?: 'up' | 'down';
}

const getSectorBadgeClass = (sector: string) => {
  switch (sector) {
    case 'Football & Sports':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    case 'Stores & Retail':
      return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
    case 'Aerospace & Aviation':
      return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
    case 'Tech & AI':
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    case 'Finance':
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    case 'Healthcare':
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700/50';
  }
};

export const RealStockCard: React.FC<RealStockCardProps> = ({
  stock,
  position,
  cash,
  onBuy,
  onSell,
  onOpenTradeModal,
  priceFlash,
}) => {
  const sharesOwned = position?.shares || 0;
  const positionValue = sharesOwned * stock.price;
  const positionProfit = position ? positionValue - position.totalCost : 0;
  const positionProfitPercent = position && position.totalCost > 0 ? (positionProfit / position.totalCost) * 100 : 0;
  const isStockUp = stock.change >= 0;

  const maxAffordable = Math.floor(cash / stock.price);

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between hover:border-slate-600 shadow-md ${
        priceFlash === 'up'
          ? 'border-emerald-500/80 bg-emerald-950/20 shadow-emerald-950/30'
          : priceFlash === 'down'
          ? 'border-rose-500/80 bg-rose-950/20 shadow-rose-950/30'
          : sharesOwned > 0
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-800'
      }`}
    >
      <div>
        {/* Top: Ticker, Name, Sector Pill, History & Analysis Button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div 
            onClick={() => onOpenTradeModal(stock)}
            className="cursor-pointer group flex-1"
            title="Click to view All-Time History & Financial Research"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-white text-lg tracking-tight font-mono group-hover:text-emerald-400 transition">
                {stock.ticker}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getSectorBadgeClass(stock.sector)}`}>
                {stock.sector}
              </span>
              {stock.league && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {stock.league === 'Premier League' ? '🏆 Premier League' : stock.league === 'NBA' ? '🏀 NBA' : stock.league}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-300 font-medium truncate max-w-[190px]" title={stock.name}>
              {stock.name}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenTradeModal(stock)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 border border-slate-700 shadow-xs"
              title="Inspect All-Time Historical Chart & Investment Analysis"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Big Real Price & Daily Change */}
        <div className="flex items-baseline justify-between mt-3 mb-2">
          <div>
            <div
              className={`font-mono text-2xl font-black transition-colors ${
                priceFlash === 'up'
                  ? 'text-emerald-400'
                  : priceFlash === 'down'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              ${stock.price.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Range: ${stock.dayLow.toFixed(2)} - ${stock.dayHigh.toFixed(2)}
            </div>
          </div>

          <div
            className={`flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
              isStockUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {isStockUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isStockUp ? '+' : ''}${stock.change.toFixed(2)} ({isStockUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Clickable Sparkline Bar for All-Time History Inspection */}
        <div
          onClick={() => onOpenTradeModal(stock)}
          className="py-1.5 px-2.5 flex items-center justify-between border-y border-slate-800/80 my-2.5 bg-slate-950/40 hover:bg-slate-800/60 rounded-xl transition cursor-pointer group"
          title="Click to view interactive All-Time History Chart & Due Diligence"
        >
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-400 group-hover:text-emerald-400 transition" />
            <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-semibold transition">
              All-Time History
            </span>
          </div>
          <Sparkline data={stock.history} isPositive={isStockUp} width={120} height={22} />
          <span className="text-[10px] font-mono text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
            Analyze →
          </span>
        </div>

        {/* Position Summary Banner */}
        <div className="min-h-[42px] mb-3">
          {sharesOwned > 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Position: </span>
                <span className="font-mono font-bold text-white">{sharesOwned} shares</span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  ${positionValue.toFixed(2)} value
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Unrealized P&L</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    positionProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {positionProfit >= 0 ? '+' : ''}${positionProfit.toFixed(2)} ({positionProfitPercent >= 0 ? '+' : ''}{positionProfitPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl py-2 font-mono">
              0 shares in portfolio
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: 1-Click Buy & Sell */}
      <div className="space-y-2 pt-1">
        {/* Buy Actions */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onBuy(stock.ticker, 1)}
            disabled={cash < stock.price}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              cash >= stock.price
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-sm shadow-emerald-950'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
            title={`Buy 1 share for $${stock.price.toFixed(2)}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buy 1 (${stock.price.toFixed(0)})</span>
          </button>

          <button
            onClick={() => onBuy(stock.ticker, maxAffordable)}
            disabled={maxAffordable <= 0}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              maxAffordable > 0
                ? 'bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 active:scale-95'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800/40'
            }`}
            title={maxAffordable > 0 ? `Buy Max affordable: ${maxAffordable} shares` : 'Insufficient cash for 1 share'}
          >
            <span>Buy Max ({maxAffordable})</span>
          </button>
        </div>

        {/* Sell Actions */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onSell(stock.ticker, 1)}
            disabled={sharesOwned < 1}
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
              sharesOwned >= 1
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 active:scale-95'
                : 'bg-slate-900 text-slate-600 border border-slate-800/40 cursor-not-allowed'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Sell 1</span>
          </button>

          <button
            onClick={() => onSell(stock.ticker, sharesOwned)}
            disabled={sharesOwned <= 0}
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
              sharesOwned > 0
                ? 'bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 active:scale-95'
                : 'bg-slate-900 text-slate-600 border border-slate-800/40 cursor-not-allowed'
            }`}
          >
            <span>Sell All ({sharesOwned})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
