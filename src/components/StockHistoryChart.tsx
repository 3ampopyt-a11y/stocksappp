import React, { useState } from 'react';
import { RealStock } from '../types';
import { getStockHistory, HistoricalDataPoint } from '../utils/stockHistory';
import { TrendingUp, TrendingDown, Calendar, BarChart2 } from 'lucide-react';

interface StockHistoryChartProps {
  stock: RealStock;
  initialTimeframe?: '1D' | '1W' | '1M' | '1Y' | '5Y' | 'ALL';
  height?: number;
}

export const StockHistoryChart: React.FC<StockHistoryChartProps> = ({
  stock,
  initialTimeframe = 'ALL',
  height = 220,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y' | 'ALL'>(initialTimeframe);
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalDataPoint | null>(null);

  const historyPoints = getStockHistory(stock, timeframe);
  
  if (!historyPoints || historyPoints.length === 0) {
    return null;
  }

  const prices = historyPoints.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const startPrice = historyPoints[0].price;
  const currentDisplayedPrice = hoveredPoint ? hoveredPoint.price : historyPoints[historyPoints.length - 1].price;
  const displayChange = currentDisplayedPrice - startPrice;
  const displayChangePercent = startPrice > 0 ? (displayChange / startPrice) * 100 : 0;
  const isGain = displayChange >= 0;

  // Chart Dimensions
  const svgWidth = 640;
  const svgHeight = height;
  const paddingX = 20;
  const paddingY = 25;

  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Calculate coordinates
  const coords = historyPoints.map((pt, i) => {
    const x = paddingX + (i / (historyPoints.length - 1)) * chartW;
    const normY = (pt.price - minPrice) / priceRange;
    const y = svgHeight - paddingY - normY * chartH;
    return { x, y, pt };
  });

  const linePath = coords.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${svgHeight - paddingY} L ${coords[0].x.toFixed(1)} ${svgHeight - paddingY} Z`;

  const timeframes: ('1D' | '1W' | '1M' | '1Y' | '5Y' | 'ALL')[] = ['1D', '1W', '1M', '1Y', '5Y', 'ALL'];

  return (
    <div className="bg-slate-950/80 rounded-2xl border border-slate-800/90 p-3 sm:p-4 space-y-2.5">
      {/* Sleek, space-efficient chart toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            {timeframe === 'ALL' ? 'All-Time Inception' : `${timeframe} Trend`}
          </span>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base sm:text-lg font-black text-white">
              ${currentDisplayedPrice.toFixed(2)}
            </span>
            <span
              className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                isGain ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isGain ? '+' : ''}${displayChange.toFixed(2)} ({isGain ? '+' : ''}{displayChangePercent.toFixed(1)}%)
            </span>
          </div>

          {hoveredPoint && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-semibold">
              {hoveredPoint.date}
            </span>
          )}
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 sm:p-1 rounded-xl border border-slate-800 shrink-0">
          {timeframes.map((tf) => {
            const isActive = timeframe === tf;
            const isAll = tf === 'ALL';
            return (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  setHoveredPoint(null);
                }}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer ${
                  isActive
                    ? isAll
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                      : 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : isAll
                    ? 'text-indigo-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tf === 'ALL' ? 'ALL TIME' : tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div 
        className="relative w-full select-none"
        style={{ height }}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${stock.ticker}-${timeframe}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isGain ? '#10b981' : '#f43f5e'} stopOpacity="0.38" />
              <stop offset="100%" stopColor={isGain ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
          />
          <line
            x1={paddingX}
            y1={svgHeight / 2}
            x2={svgWidth - paddingX}
            y2={svgHeight / 2}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
          />

          {/* Area Fill */}
          <path
            d={areaPath}
            fill={`url(#grad-${stock.ticker}-${timeframe})`}
          />

          {/* Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke={isGain ? '#10b981' : '#f43f5e'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Nodes */}
          {coords.map((c, idx) => {
            const isSelected = hoveredPoint?.date === c.pt.date;
            return (
              <g key={idx}>
                {/* Invisible wide touch/hover target */}
                <rect
                  x={c.x - chartW / (coords.length * 2)}
                  y={0}
                  width={chartW / coords.length}
                  height={svgHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredPoint(c.pt)}
                />

                {isSelected && (
                  <>
                    <line
                      x1={c.x}
                      y1={paddingY}
                      x2={c.x}
                      y2={svgHeight - paddingY}
                      stroke="#818cf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="5"
                      fill="#818cf8"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-900/95 border border-indigo-500/50 rounded-lg px-3 py-1.5 shadow-xl pointer-events-none text-xs flex items-center gap-3 animate-in fade-in">
            <div>
              <div className="text-slate-400 text-[10px]">Date / Period</div>
              <div className="font-bold text-white">{hoveredPoint.date}</div>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <div className="text-slate-400 text-[10px]">Price</div>
              <div className="font-mono font-bold text-emerald-400">
                ${hoveredPoint.price.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time axis labels */}
      <div className="flex justify-between text-[11px] font-mono text-slate-400 px-2 pt-1 border-t border-slate-800/60">
        <span>{historyPoints[0].date}</span>
        {historyPoints.length > 2 && (
          <span className="hidden sm:inline text-slate-400">
            {historyPoints[Math.floor(historyPoints.length / 2)].date}
          </span>
        )}
        <span>{historyPoints[historyPoints.length - 1].date}</span>
      </div>
    </div>
  );
};
