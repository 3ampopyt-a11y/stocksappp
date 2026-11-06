import React, { useState } from 'react';
import { RealStock, PortfolioPosition } from '../types';
import { getStockFundamentals } from '../utils/stockHistory';
import { StockHistoryChart } from './StockHistoryChart';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  ShieldCheck, 
  Target, 
  BarChart3, 
  DollarSign, 
  Building2, 
  Briefcase, 
  ArrowUpRight,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

interface StockDetailsModalProps {
  stock: RealStock;
  position?: PortfolioPosition;
  cash: number;
  onClose: () => void;
  onTrade: (stock: RealStock, action: 'BUY' | 'SELL') => void;
}

export const StockDetailsModal: React.FC<StockDetailsModalProps> = ({
  stock,
  position,
  cash,
  onClose,
  onTrade,
}) => {
  const fundamentals = getStockFundamentals(stock);
  const isPositiveDay = stock.change >= 0;
  const userShares = position ? position.shares : 0;
  const userPositionValue = userShares * stock.price;

  // Potential upside based on analyst target
  const priceTargetUpside = ((fundamentals.analystTargetPrice - stock.price) / stock.price) * 100;
  const isTargetUpside = priceTargetUpside >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center font-mono font-black text-indigo-300 text-lg">
              {stock.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{stock.name}</h2>
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  {stock.ticker}
                </span>
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded-md hidden sm:inline">
                  {stock.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                All-Time Historical Analysis & Investment Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Price & Live Return Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Current Market Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-mono font-black text-white">
                  ${stock.price.toFixed(2)}
                </span>
                <span
                  className={`text-sm sm:text-base font-mono font-bold flex items-center gap-1 ${
                    isPositiveDay ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositiveDay ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isPositiveDay ? '+' : ''}${stock.change.toFixed(2)} ({isPositiveDay ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Quick All-Time ROI badge */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-4 py-2 text-right">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide block">
                All-Time Total Return
              </span>
              <span className="font-mono font-black text-xl text-emerald-400">
                +{fundamentals.allTimeReturnPercent.toLocaleString()}%
              </span>
            </div>
          </div>

          {/* All-Time Interactive Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">
                  Historical Price Trajectory
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Select <span className="text-indigo-400 font-bold">ALL TIME</span> to inspect full growth from IPO
              </span>
            </div>

            <StockHistoryChart stock={stock} initialTimeframe="ALL" />
          </div>

          {/* All-Time Historical Milestones Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                All-Time High (ATH)
              </span>
              <div className="text-base sm:text-lg font-mono font-bold text-white mt-1">
                ${fundamentals.allTimeHigh.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Peak in {fundamentals.allTimeHighDate}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                All-Time Low (ATL)
              </span>
              <div className="text-base sm:text-lg font-mono font-bold text-slate-300 mt-1">
                ${fundamentals.allTimeLow.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Recorded {fundamentals.allTimeLowDate}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                52-Week Range
              </span>
              <div className="text-xs sm:text-sm font-mono font-bold text-slate-200 mt-1">
                ${fundamentals.week52Low.toFixed(2)} - ${fundamentals.week52High.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Past 12 months</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                IPO / Listing Year
              </span>
              <div className="text-base sm:text-lg font-mono font-bold text-indigo-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{fundamentals.ipoYear}</span>
              </div>
              <span className="text-[10px] text-slate-400">Public market tenure</span>
            </div>
          </div>

          {/* Wall Street Investment Verdict & Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Analyst Consensus Box */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                    Analyst Consensus
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {fundamentals.analystConsensus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block">12-Mo Target Price</span>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    ${fundamentals.analystTargetPrice.toFixed(2)}
                  </div>
                  <span className={`text-xs font-bold font-mono ${isTargetUpside ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isTargetUpside ? '+' : ''}{priceTargetUpside.toFixed(1)}% Potential
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Buy Rating %</span>
                  <div className="text-lg font-mono font-black text-indigo-400 mt-0.5">
                    {fundamentals.analystBuyPercent}%
                  </div>
                  <span className="text-xs text-slate-400">of institutional analysts</span>
                </div>
              </div>
            </div>

            {/* Key Valuation Numbers */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                  Valuation & Risk Profile
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block">Market Cap</span>
                  <div className="text-base font-mono font-bold text-white mt-0.5">
                    {stock.marketCap}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">P/E Ratio</span>
                  <div className="text-base font-mono font-bold text-white mt-0.5">
                    {stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Dividend Yield</span>
                  <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                    {fundamentals.dividendYield > 0 ? `${fundamentals.dividendYield}%` : 'N/A (Growth)'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Beta (Volatility)</span>
                  <div className="text-base font-mono font-bold text-slate-200 mt-0.5">
                    {fundamentals.beta}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Business Profile */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Building2 className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                About {stock.name} ({stock.ticker})
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {fundamentals.description}
            </p>
          </div>

          {/* User's Position in this stock */}
          {userShares > 0 && (
            <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-300">You Own {userShares} Shares</div>
                  <div className="text-xs text-slate-400">
                    Current value: <span className="font-mono text-white font-bold">${userPositionValue.toFixed(2)}</span> • Avg cost: <span className="font-mono">${(position?.averageBuyPrice ?? stock.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Your Unrealized Profit</span>
                <span className={`font-mono font-bold text-sm ${position && (stock.price - position.averageBuyPrice) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {position && (stock.price - position.averageBuyPrice) >= 0 ? '+' : ''}${position ? ((stock.price - position.averageBuyPrice) * userShares).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-slate-400">
            Available Cash: <span className="font-mono font-bold text-emerald-400">${cash.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-3">
            {userShares > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onTrade(stock, 'SELL');
                }}
                className="px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 hover:text-white rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                Sell Shares ({userShares})
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onTrade(stock, 'BUY');
              }}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>Invest in {stock.ticker}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
