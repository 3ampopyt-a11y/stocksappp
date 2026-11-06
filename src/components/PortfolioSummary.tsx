import React from 'react';
import { RealStock, PortfolioPosition, TradeOrder } from '../types';
import { Briefcase, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';

interface PortfolioSummaryProps {
  positions: Record<string, PortfolioPosition>;
  stocks: RealStock[];
  orders: TradeOrder[];
  cash: number;
  stocksValue: number;
  onSelectStock: (stock: RealStock) => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  positions,
  stocks,
  orders,
  cash,
  stocksValue,
  onSelectStock,
}) => {
  const stockMap = new Map(stocks.map((s) => [s.ticker, s]));
  const activePositions = Object.values(positions).filter((p) => p.shares > 0);

  const totalCost = activePositions.reduce((acc, p) => acc + p.totalCost, 0);
  const totalProfit = stocksValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const isProfitPositive = totalProfit >= 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Your Portfolio Holdings</h3>
            <span className="text-xs text-slate-400">{activePositions.length} active positions</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Unrealized Portfolio P&L</div>
          <div
            className={`font-mono font-bold text-sm flex items-center justify-end gap-1 ${
              isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isProfitPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isProfitPositive ? '+' : ''}${totalProfit.toFixed(2)}</span>
            <span className="text-[11px]">({isProfitPositive ? '+' : ''}{totalProfitPercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      {activePositions.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          <p className="text-sm font-semibold text-slate-400">No stocks owned yet.</p>
          <p className="mt-1 text-slate-500">
            Browse the 100+ equities above and click <strong>Buy 1</strong> or <strong>Buy Max</strong> to invest your cash!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto pr-1">
          {activePositions.map((pos) => {
            const stock = stockMap.get(pos.ticker);
            if (!stock) return null;

            const marketVal = pos.shares * stock.price;
            const profit = marketVal - pos.totalCost;
            const profitPct = pos.totalCost > 0 ? (profit / pos.totalCost) * 100 : 0;
            const isPos = profit >= 0;

            return (
              <div
                key={pos.ticker}
                onClick={() => onSelectStock(stock)}
                className="py-3 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                    {pos.ticker}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{stock.name}</span>
                      <span className="text-[10px] text-slate-400">({stock.sector})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {pos.shares} shares • Avg ${pos.averageBuyPrice.toFixed(2)} • Now ${stock.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-white">
                    ${marketVal.toFixed(2)}
                  </div>
                  <div className={`font-mono text-[11px] font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? '+' : ''}${profit.toFixed(2)} ({isPos ? '+' : ''}{profitPct.toFixed(2)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Orders Log */}
      {orders.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Execution Ledger ({orders.length} trades)</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {orders.slice(0, 8).map((order) => {
              const isBuy = order.type === 'BUY';
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-[11px] bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {order.type}
                    </span>
                    <span className="text-slate-200 font-mono font-bold">{order.ticker}</span>
                    <span className="text-slate-500 font-mono">{order.timeString}</span>
                  </div>

                  <div className="font-mono text-slate-300">
                    {order.shares} sh @ ${order.price.toFixed(2)} (${order.total.toFixed(2)})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
