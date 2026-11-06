import React, { useState } from 'react';
import { RealStock, PortfolioPosition } from '../types';
import { StockHistoryChart } from './StockHistoryChart';
import { getStockFundamentals } from '../utils/stockHistory';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  ShieldCheck, 
  Target, 
  HelpCircle, 
  Building2, 
  ArrowUpRight,
  BarChart3,
  Percent,
  CheckCircle2
} from 'lucide-react';

interface RealTradeModalProps {
  stock: RealStock | null;
  position?: PortfolioPosition;
  cash: number;
  onClose: () => void;
  onBuy: (ticker: string, shares: number) => void;
  onSell: (ticker: string, shares: number) => void;
}

export const RealTradeModal: React.FC<RealTradeModalProps> = ({
  stock,
  position,
  cash,
  onClose,
  onBuy,
  onSell,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'analysis' | 'trade'>('chart');
  const [sharesInput, setSharesInput] = useState('1');

  if (!stock) return null;

  const fundamentals = getStockFundamentals(stock);
  const sharesOwned = position?.shares || 0;
  const isStockUp = stock.change >= 0;
  const parsedShares = Math.max(1, parseInt(sharesInput) || 1);
  const totalCost = Number((parsedShares * stock.price).toFixed(2));
  const maxAffordable = Math.floor(cash / stock.price);

  // 52-week slider calculation
  const week52Spread = fundamentals.week52High - fundamentals.week52Low || 1;
  const week52Percent = Math.min(100, Math.max(0, ((stock.price - fundamentals.week52Low) / week52Spread) * 100));

  // Potential upside calculation to analyst target
  const upsidePercent = ((fundamentals.analystTargetPrice - stock.price) / stock.price) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Compact, Non-Obtrusive Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/70">
          {/* Left: Ticker & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-black text-sm sm:text-base text-emerald-400 shrink-0">
              {stock.ticker.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white font-mono leading-tight">
                  {stock.ticker}
                </h2>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {stock.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[170px] sm:max-w-xs md:max-w-md">
                {stock.name}
              </p>
            </div>
          </div>

          {/* Right: Price, Change & Close Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-base sm:text-xl font-mono font-black text-white leading-tight">
                ${stock.price.toFixed(2)}
              </div>
              <div
                className={`text-[11px] font-mono font-bold flex items-center justify-end gap-0.5 ${
                  isStockUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isStockUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isStockUp ? '+' : ''}${stock.change.toFixed(2)} ({isStockUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Close Button cleanly positioned without covering elements */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0 border border-transparent hover:border-slate-700"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs - Compact & Non-Obtrusive */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'chart'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>All-Time History & Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-950 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Investment Analysis & Research</span>
          </button>

          <button
            onClick={() => setActiveTab('trade')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'trade'
                ? 'bg-slate-700 text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Trade / Buy / Sell</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {/* TAB 1: ALL-TIME HISTORY & INTERACTIVE CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-3.5">
              <StockHistoryChart stock={stock} initialTimeframe="ALL" height={195} />

              {/* Quick Investment Decision Snapshot */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Wall Street Analyst Recommendation:</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {fundamentals.analystConsensus} ({fundamentals.analystBuyPercent}% Buy)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">12-Mo Target</span>
                    <span className="font-mono font-bold text-white">${fundamentals.analystTargetPrice.toFixed(2)}</span>
                    <span className={`text-[10px] block font-mono ${upsidePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {upsidePercent >= 0 ? '+' : ''}{upsidePercent.toFixed(1)}% upside
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">All-Time High</span>
                    <span className="font-mono font-bold text-white">${fundamentals.allTimeHigh.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">{fundamentals.allTimeHighDate}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">All-Time Low</span>
                    <span className="font-mono font-bold text-white">${fundamentals.allTimeLow.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">{fundamentals.allTimeLowDate}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Lifetime Return</span>
                    <span className="font-mono font-bold text-emerald-400">+{fundamentals.allTimeReturnPercent}%</span>
                    <span className="text-[10px] text-slate-400 block">Since {fundamentals.ipoYear} IPO</span>
                  </div>
                </div>

                {/* 52-Week Range Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                    <span>52W Low: ${fundamentals.week52Low.toFixed(2)}</span>
                    <span className="text-slate-300 font-bold">52-Week Price Position</span>
                    <span>52W High: ${fundamentals.week52High.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full"
                      style={{ width: `${week52Percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IN-DEPTH INVESTMENT ANALYSIS & DUE DILIGENCE */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              {/* Company Profile & Business Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Company Overview & Business Model</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {fundamentals.description}
                </p>
              </div>

              {/* Key Valuation Ratios */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  <span>Valuation & Fundamentals Checklist</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Market Cap</span>
                    <span className="text-base font-mono font-black text-white">{stock.marketCap}</span>
                    <span className="text-[10px] text-slate-500 block">Total enterprise size</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">P/E Ratio</span>
                    <span className="text-base font-mono font-black text-white">
                      {stock.peRatio ? `${stock.peRatio}x` : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Price to earnings multiple</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Dividend Yield</span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      {fundamentals.dividendYield > 0 ? `${fundamentals.dividendYield}%` : '0.00%'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Annual cash return</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Volatility (Beta)</span>
                    <span className="text-base font-mono font-black text-white">{fundamentals.beta}</span>
                    <span className="text-[10px] text-slate-500 block">Market sensitivity</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Public Since</span>
                    <span className="text-base font-mono font-black text-white">{fundamentals.ipoYear}</span>
                    <span className="text-[10px] text-slate-500 block">Initial public offering</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Analyst Rating</span>
                    <span className="text-base font-mono font-black text-indigo-400">{fundamentals.analystConsensus}</span>
                    <span className="text-[10px] text-slate-500 block">{fundamentals.analystBuyPercent}% buy consensus</span>
                  </div>
                </div>
              </div>

              {/* Due Diligence Checklist */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Why Invest in {stock.ticker}?</span>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Established sector leader with {stock.marketCap} market capitalization and liquidity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Strong historical compounding: +{fundamentals.allTimeReturnPercent}% all-time return.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Wall Street 12-month target price of ${fundamentals.analystTargetPrice.toFixed(2)} represents {upsidePercent.toFixed(1)}% upside potential.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TRADING / ORDER EXECUTION */}
          {activeTab === 'trade' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 mb-2">Selected Asset</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-black text-white">{stock.ticker} — {stock.name}</span>
                  <span className="font-mono text-lg font-black text-emerald-400">${stock.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Position & Cash Bar */}
          <div className="flex items-center justify-between text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Current Position:</span>
              <strong className="text-white font-mono">
                {sharesOwned} shares (${(sharesOwned * stock.price).toFixed(2)})
              </strong>
            </div>
            <div className="text-slate-400 font-mono">
              Available Cash: <strong className="text-emerald-400">${cash.toFixed(2)}</strong>
            </div>
          </div>

          {/* Shares Input & Quick Buttons */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">Order Shares:</label>
              <input
                type="number"
                min="1"
                max="999999"
                value={sharesInput}
                onChange={(e) => setSharesInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:outline-none focus:border-emerald-500 font-bold"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSharesInput('1')}
                  className="px-2.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  1
                </button>
                <button
                  onClick={() => setSharesInput('5')}
                  className="px-2.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  5
                </button>
                <button
                  onClick={() => setSharesInput('10')}
                  className="px-2.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  10
                </button>
                <button
                  onClick={() => setSharesInput(maxAffordable.toString())}
                  disabled={maxAffordable <= 0}
                  className="px-3 py-2 text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl cursor-pointer"
                >
                  Max ({maxAffordable})
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 px-1 font-mono pt-1">
              <span>Estimated Order Total:</span>
              <span className="font-bold text-white text-base">${totalCost.toFixed(2)}</span>
            </div>

            {/* Action Buttons: Buy & Sell */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onBuy(stock.ticker, parsedShares);
                  onClose();
                }}
                disabled={cash < totalCost}
                className={`py-3 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  cash >= totalCost
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Buy {parsedShares} Shares (${totalCost.toFixed(2)})
              </button>

              <button
                onClick={() => {
                  onSell(stock.ticker, Math.min(parsedShares, sharesOwned));
                  onClose();
                }}
                disabled={sharesOwned < 1}
                className={`py-3 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  sharesOwned >= 1
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Sell {Math.min(parsedShares, sharesOwned)} Shares
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
