import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { RealStock, PortfolioPosition, TradeOrder, MarketNewsItem, MarketSpeed } from './types';
import { INITIAL_REAL_STOCKS, REAL_MARKET_NEWS } from './data/realStocks';
import { InvestorHeader } from './components/InvestorHeader';
import { RealStockCard } from './components/RealStockCard';
import { MarketNewsTicker } from './components/MarketNewsTicker';
import { RealTradeModal } from './components/RealTradeModal';
import { PortfolioSummary } from './components/PortfolioSummary';
import { ResetBalanceModal } from './components/ResetBalanceModal';
import { Search, CheckCircle2, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const MARKET_HOURS = [
  '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', 
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

export default function App() {
  // Cash balance - default $1,000 for realistic investing
  const [cash, setCash] = useState<number>(() => {
    const saved = localStorage.getItem('ws_invest_v3_cash');
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) return parsed;
    }
    const prevSaved = localStorage.getItem('real_invest_cash');
    if (prevSaved !== null) {
      const parsed = parseFloat(prevSaved);
      if (!isNaN(parsed)) return parsed;
    }
    return 1000.00;
  });

  // Day counter
  const [day, setDay] = useState<number>(() => {
    const saved = localStorage.getItem('ws_invest_v3_day') || localStorage.getItem('real_invest_day');
    return saved !== null ? parseInt(saved) : 1;
  });

  // Time index within market day (0 = 09:30 AM, 13 = 04:00 PM)
  const [timeIndex, setTimeIndex] = useState<number>(() => {
    const saved = localStorage.getItem('ws_invest_v3_time_idx') || localStorage.getItem('real_invest_time_idx');
    return saved !== null ? parseInt(saved) : 0;
  });

  // Stocks: merge with INITIAL_REAL_STOCKS so AIRBUS, Boeing, and newly added stocks are always loaded!
  const [stocks, setStocks] = useState<RealStock[]>(() => {
    const saved = localStorage.getItem('ws_invest_v3_stocks') || localStorage.getItem('real_invest_stocks');
    if (saved) {
      try {
        const parsed: RealStock[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingMap = new Map(parsed.map((s) => [s.ticker, s]));
          // Merge to ensure all current stocks (like AIRBUS and BA) are included with up-to-date metadata
          return INITIAL_REAL_STOCKS.map((initStock) => {
            const existing = existingMap.get(initStock.ticker);
            return existing
              ? {
                  ...initStock,
                  ...existing,
                  name: initStock.name,
                  sector: initStock.sector,
                  league: initStock.league,
                  marketCap: initStock.marketCap,
                }
              : initStock;
          });
        }
      } catch (e) {}
    }
    return INITIAL_REAL_STOCKS;
  });

  // Portfolio positions
  const [positions, setPositions] = useState<Record<string, PortfolioPosition>>(() => {
    const saved = localStorage.getItem('ws_invest_v3_positions') || localStorage.getItem('real_invest_positions');
    return saved ? JSON.parse(saved) : {};
  });

  // Trade History
  const [orders, setOrders] = useState<TradeOrder[]>(() => {
    const saved = localStorage.getItem('ws_invest_v3_orders') || localStorage.getItem('real_invest_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Current Market News
  const [currentNews, setCurrentNews] = useState<MarketNewsItem | null>(() => {
    const saved = localStorage.getItem('ws_invest_v3_news') || localStorage.getItem('real_invest_news');
    return saved ? JSON.parse(saved) : null;
  });

  // Simulation controls: auto-clock is ALWAYS running by default
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<MarketSpeed>(() => {
    const saved = localStorage.getItem('ws_invest_v3_speed') as MarketSpeed;
    if (saved === '1x' || saved === '2x' || saved === '3x') return saved;
    return '1x';
  });

  // Return benchmark - tracks net worth baseline for return calculation
  // Resets on:
  // 1. Initial load / balance reset ($100, $1,000, $5,000)
  // 2. Every time an investment is sold (handleSell)
  // 3. User clicks the Total Return button in the header
  const [returnBaseline, setReturnBaseline] = useState<number>(() => {
    const saved = localStorage.getItem('ws_invest_v3_baseline');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const savedCash = localStorage.getItem('ws_invest_v3_cash');
    if (savedCash) {
      const parsedCash = parseFloat(savedCash);
      if (!isNaN(parsedCash) && parsedCash > 0) return parsedCash;
    }
    return 1000;
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'marketCap' | 'gainers' | 'losers' | 'priceAsc' | 'priceDesc'>('marketCap');

  // Modal states
  const [tradeModalStock, setTradeModalStock] = useState<RealStock | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('ws_invest_v3_speed', speed);
  }, [speed]);

  useEffect(() => {
    localStorage.setItem('ws_invest_v3_baseline', returnBaseline.toString());
  }, [returnBaseline]);

  useEffect(() => {
    localStorage.setItem('ws_invest_v3_cash', cash.toString());
  }, [cash]);

  useEffect(() => {
    localStorage.setItem('ws_invest_v3_day', day.toString());
  }, [day]);

  useEffect(() => {
    localStorage.setItem('ws_invest_v3_time_idx', timeIndex.toString());
  }, [timeIndex]);

  useEffect(() => {
    localStorage.setItem('ws_invest_v3_stocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('ws_invest_v3_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('ws_invest_v3_orders', JSON.stringify(orders.slice(0, 40)));
  }, [orders]);

  useEffect(() => {
    if (currentNews) {
      localStorage.setItem('ws_invest_v3_news', JSON.stringify(currentNews));
    }
  }, [currentNews]);

  // Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calculate total stock holdings value
  const stocksValue = useMemo(() => {
    const map = new Map(stocks.map((s) => [s.ticker, s]));
    return Object.values(positions).reduce((acc, pos) => {
      const s = map.get(pos.ticker);
      return acc + pos.shares * (s ? s.price : pos.averageBuyPrice);
    }, 0);
  }, [stocks, positions]);

  const totalNetWorth = Number((cash + stocksValue).toFixed(2));
  const currentTimeString = MARKET_HOURS[timeIndex] || '09:30 AM';

  // Total Return calculation:
  // When no stocks are held (stocksValue === 0), return is automatically 0!
  // When stocks are held, return measures performance against returnBaseline.
  const { totalReturn, totalReturnPercent } = useMemo(() => {
    if (stocksValue <= 0) {
      return { totalReturn: 0, totalReturnPercent: 0 };
    }
    const ret = Number((totalNetWorth - returnBaseline).toFixed(2));
    const pct = returnBaseline > 0 ? Number(((ret / returnBaseline) * 100).toFixed(2)) : 0;
    return { totalReturn: ret, totalReturnPercent: pct };
  }, [totalNetWorth, returnBaseline, stocksValue]);

  // Click handler to manually reset the Total Return button / baseline
  const handleResetReturn = () => {
    setReturnBaseline(totalNetWorth);
    showToast('Total return reset to +$0.00 (0.0%)');
  };

  // Buy stock
  const handleBuy = (ticker: string, shares: number) => {
    if (shares <= 0) return;
    const stock = stocks.find((s) => s.ticker === ticker);
    if (!stock) return;

    const totalCost = Number((shares * stock.price).toFixed(2));
    if (totalCost > cash) {
      showToast('❌ Insufficient cash to execute trade');
      return;
    }

    // If opening an investment from zero stocks, sync baseline so active return starts fresh
    if (stocksValue <= 0) {
      setReturnBaseline(cash);
    }

    setCash((prev) => Number((prev - totalCost).toFixed(2)));

    setPositions((prev) => {
      const existing = prev[ticker] || {
        ticker,
        shares: 0,
        averageBuyPrice: 0,
        totalCost: 0,
      };

      const newShares = existing.shares + shares;
      const newTotalCost = Number((existing.totalCost + totalCost).toFixed(2));
      const newAverage = Number((newTotalCost / newShares).toFixed(2));

      return {
        ...prev,
        [ticker]: {
          ticker,
          shares: newShares,
          averageBuyPrice: newAverage,
          totalCost: newTotalCost,
        },
      };
    });

    const newOrder: TradeOrder = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ticker,
      type: 'BUY',
      shares,
      price: stock.price,
      total: totalCost,
      timeString: `Day ${day} • ${currentTimeString}`,
    };
    setOrders((prev) => [newOrder, ...prev]);

    showToast(`Bought ${shares} shares of ${ticker} at $${stock.price.toFixed(2)}`);
  };

  // Sell stock
  const handleSell = (ticker: string, shares: number) => {
    if (shares <= 0) return;
    const stock = stocks.find((s) => s.ticker === ticker);
    const existing = positions[ticker];
    if (!stock || !existing || existing.shares < shares) return;

    const proceeds = Number((shares * stock.price).toFixed(2));
    const costBasisDeduction = (existing.totalCost / existing.shares) * shares;
    const nextCash = Number((cash + proceeds).toFixed(2));

    setCash(nextCash);

    let nextStocksValue = 0;
    const stockMap = new Map(stocks.map((s) => [s.ticker, s]));

    setPositions((prev) => {
      const copy = { ...prev };
      const remaining = existing.shares - shares;
      if (remaining <= 0) {
        delete copy[ticker];
      } else {
        copy[ticker] = {
          ticker,
          shares: remaining,
          averageBuyPrice: existing.averageBuyPrice,
          totalCost: Number((existing.totalCost - costBasisDeduction).toFixed(2)),
        };
      }

      nextStocksValue = Object.values(copy).reduce((acc, pos) => {
        const s = stockMap.get(pos.ticker);
        return acc + pos.shares * (s ? s.price : pos.averageBuyPrice);
      }, 0);

      return copy;
    });

    // Reset return benchmark every time an investment is sold!
    // "every time i invest in soemthing and i sell it the tottal return button should reset"
    const nextNetWorth = Number((nextCash + nextStocksValue).toFixed(2));
    setReturnBaseline(nextNetWorth);

    const newOrder: TradeOrder = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ticker,
      type: 'SELL',
      shares,
      price: stock.price,
      total: proceeds,
      timeString: `Day ${day} • ${currentTimeString}`,
    };
    setOrders((prev) => [newOrder, ...prev]);

    showToast(`Sold ${shares} shares of ${ticker} for $${proceeds.toFixed(2)}`);
  };

  // Automated Clock & Price Engine: advances hours automatically without buttons!
  const advanceMarketTick = useCallback(() => {
    // 1. Advance Time
    setTimeIndex((prevIdx) => {
      if (prevIdx >= MARKET_HOURS.length - 1) {
        // Market close, roll over to next day open
        setDay((d) => d + 1);
        return 0;
      }
      return prevIdx + 1;
    });

    // 2. Chance of breaking market news
    let activeNews: typeof REAL_MARKET_NEWS[0] | null = null;
    if (Math.random() > 0.65) {
      activeNews = REAL_MARKET_NEWS[Math.floor(Math.random() * REAL_MARKET_NEWS.length)];
      setCurrentNews({
        id: `news-${Date.now()}`,
        timeString: `Day ${day} • ${currentTimeString}`,
        headline: activeNews.headline,
        affectedTicker: activeNews.ticker,
        impactPercent: activeNews.impact,
        isPositive: activeNews.impact > 0,
      });
    }

    const flashes: Record<string, 'up' | 'down'> = {};

    // 3. Smooth, slower, realistic price movements
    setStocks((prevStocks) => {
      return prevStocks.map((stock) => {
        // Gentle realistic variation: ±0.15% to ±0.5%
        const rand = (Math.random() - 0.49) * 0.006;
        let percentChange = rand;

        if (activeNews && activeNews.ticker === stock.ticker) {
          percentChange += activeNews.impact;
        }

        let newPrice = Number((stock.price * (1 + percentChange)).toFixed(2));
        if (newPrice < 1.00) newPrice = 1.00;

        const change = Number((newPrice - stock.openPrice).toFixed(2));
        const changePercent = Number(((change / stock.openPrice) * 100).toFixed(2));

        if (Math.abs(newPrice - stock.price) > 0.05) {
          flashes[stock.ticker] = newPrice >= stock.price ? 'up' : 'down';
        }

        const history = [...stock.history.slice(-19), newPrice];
        const dayHigh = Math.max(stock.dayHigh, newPrice);
        const dayLow = Math.min(stock.dayLow, newPrice);

        return {
          ...stock,
          price: newPrice,
          change,
          changePercent,
          dayHigh,
          dayLow,
          history,
        };
      });
    });

    setPriceFlashes(flashes);
    const flashDuration = speed === '3x' ? 450 : speed === '2x' ? 650 : 800;
    setTimeout(() => setPriceFlashes({}), flashDuration);
  }, [day, currentTimeString, speed]);

  // Automated market loop: interval runs by itself
  useEffect(() => {
    if (isPaused) {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      return;
    }

    // Speeds:
    // 1x = 3500ms (standard realistic pacing)
    // 2x = 1750ms (2x faster)
    // 3x = 1100ms (3.2x faster, ~1 sec per hour - no waiting!)
    const intervalMs = speed === '3x' ? 1100 : speed === '2x' ? 1750 : 3500;
    clockIntervalRef.current = setInterval(() => {
      advanceMarketTick();
    }, intervalMs);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [isPaused, speed, advanceMarketTick]);

  // Reset simulator
  const handleReset = (startingCash: number) => {
    setCash(startingCash);
    setReturnBaseline(startingCash);
    setDay(1);
    setTimeIndex(0);
    setPositions({});
    setOrders([]);
    setStocks(INITIAL_REAL_STOCKS);
    setCurrentNews({
      id: 'news-init',
      timeString: 'Day 1 • 09:30 AM',
      headline: `Trading account reset to $${startingCash.toLocaleString()}. Real equity market active.`,
      isPositive: true,
    });
    setIsResetModalOpen(false);
    showToast(`Account reset to $${startingCash.toLocaleString()}!`);
  };

  // Filter & Search stocks
  const sectors = useMemo(() => {
    return [
      'All',
      'Stores & Retail',
      'Tech & AI',
      'Aerospace & Aviation',
      'Finance',
      'Healthcare',
      'Consumer & Retail',
      'Auto & Energy',
      'Industrials & Defense',
      'Media & Telecom',
      'Football & Sports',
    ];
  }, []);

  const filteredStocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let list = stocks.filter((stock) => {
      let matchesSearch = true;
      if (query) {
        const isFootballQuery = query.includes('football') || query.includes('soccer') || query.includes('premier') || query.includes('epl') || query.includes('team') || query.includes('club') || query.includes('nba') || query.includes('basketball');
        const isStoreQuery = query.includes('store') || query.includes('supermarket') || query.includes('grocery') || query.includes('retail') || query.includes('shop');

        matchesSearch =
          stock.ticker.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query) ||
          stock.sector.toLowerCase().includes(query) ||
          (Boolean(stock.league) && stock.league!.toLowerCase().includes(query)) ||
          (isFootballQuery && stock.sector === 'Football & Sports') ||
          (isStoreQuery && stock.sector === 'Stores & Retail') ||
          (stock.ticker === 'AIRBUS' && (query.includes('air') || query.includes('airbus') || query.includes('eadsy'))) ||
          (stock.ticker === 'BA' && (query.includes('boeing') || query.includes('plane') || query.includes('aerospace'))) ||
          (stock.ticker === 'WMT' && (query.includes('walmart') || query.includes('walamart') || query.includes('supercenter'))) ||
          (stock.ticker === 'TGT' && (query.includes('target') || query.includes('tarjay'))) ||
          (stock.ticker === 'COST' && (query.includes('costco') || query.includes('kirkland'))) ||
          (stock.ticker === 'MANU' && (query.includes('man') || query.includes('utd') || query.includes('united') || query.includes('trafford'))) ||
          (stock.ticker === 'ARS' && (query.includes('arsenal') || query.includes('gunners') || query.includes('emirates'))) ||
          (stock.ticker === 'MCI' && (query.includes('mancity') || query.includes('etihad') || query.includes('city'))) ||
          (stock.ticker === 'LIV' && (query.includes('liverpool') || query.includes('anfield'))) ||
          (stock.ticker === 'CHE' && (query.includes('chelsea') || query.includes('stamford') || query.includes('blues'))) ||
          (stock.ticker === 'TOT' && (query.includes('tottenham') || query.includes('spurs'))) ||
          (stock.ticker === 'NEW' && (query.includes('newcastle') || query.includes('st james'))) ||
          (stock.ticker === 'NYK' && (query.includes('knicks') || query.includes('msg') || query.includes('new york'))) ||
          (stock.ticker === 'GSW' && (query.includes('warriors') || query.includes('curry') || query.includes('golden state'))) ||
          (stock.ticker === 'LAL' && (query.includes('lakers') || query.includes('lebron') || query.includes('los angeles'))) ||
          (stock.ticker === 'BOS' && (query.includes('celtics') || query.includes('boston')));
      }

      let matchesSector = false;
      if (query) {
        matchesSector = selectedSector === 'All' 
          ? true 
          : (selectedSector === 'Football & Sports'
              ? stock.sector === 'Football & Sports' && (selectedLeague === 'All' || stock.league === selectedLeague)
              : stock.sector === selectedSector);
      } else if (selectedSector === 'All') {
        // "not in the all": standard equities view contains companies and stores, NOT sports!
        matchesSector = stock.sector !== 'Football & Sports';
      } else if (selectedSector === 'Football & Sports') {
        matchesSector = stock.sector === 'Football & Sports' && (selectedLeague === 'All' || stock.league === selectedLeague);
      } else {
        matchesSector = stock.sector === selectedSector;
      }

      return matchesSearch && matchesSector;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'gainers') return b.changePercent - a.changePercent;
      if (sortBy === 'losers') return a.changePercent - b.changePercent;
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      // Default: market cap ranking (original order)
      return 0;
    });

    return list;
  }, [stocks, searchQuery, selectedSector, selectedLeague, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Non-sticky Investor Header */}
      <InvestorHeader
        cash={cash}
        stocksValue={stocksValue}
        totalNetWorth={totalNetWorth}
        totalReturn={totalReturn}
        totalReturnPercent={totalReturnPercent}
        onResetReturn={handleResetReturn}
        day={day}
        timeString={currentTimeString}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        speed={speed}
        onSetSpeed={(newSpeed) => {
          setSpeed(newSpeed);
          showToast(`Market speed set to ${newSpeed}${newSpeed === '3x' ? ' (3x Ultra Fast)' : newSpeed === '2x' ? ' (2x Fast)' : ' (1x Normal)'}`);
        }}
        onOpenReset={() => setIsResetModalOpen(true)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-in fade-in slide-in-from-top-3 pointer-events-none">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        {/* Market News Ticker */}
        <MarketNewsTicker currentNews={currentNews} />

        {/* Top Market Category Navigation Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setSelectedSector('All');
              setSelectedLeague('All');
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
              selectedSector === 'All'
                ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span>🏛️</span>
                <span>Stock Market Equities</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Airbus, Boeing, Apple, Microsoft, Tech & Blue Chips
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Equities
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSector('Football & Sports');
              setSelectedLeague('All');
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
              selectedSector === 'Football & Sports'
                ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <span>⚽</span>
                <span>Football & NBA Sports Arena</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Premier League, NBA Franchises & European Clubs
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Sports Hub
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSector('Stores & Retail');
              setSelectedLeague('All');
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
              selectedSector === 'Stores & Retail'
                ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm">
                <span>🛒</span>
                <span>Stores & Supermarkets</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Walmart, Target, Costco, Kroger, Dollar General
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Retail
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 140+ equities (e.g. Premier League, NBA, Walmart, Airbus, Boeing)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
              >
                <option value="marketCap">Market Cap (Default)</option>
                <option value="gainers">Top Gainers (%)</option>
                <option value="losers">Top Decliners (%)</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="priceAsc">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Sub-navigation for Football & NBA Sports Arena */}
          {selectedSector === 'Football & Sports' && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <span>🏆</span>
                  <span>League Filter:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'All', label: 'All Leagues' },
                    { id: 'Premier League', label: '🏆 Premier League' },
                    { id: 'NBA', label: '🏀 NBA Basketball' },
                    { id: 'European Football', label: '🇪🇺 European Football' },
                    { id: 'MLB', label: '⚾ MLB' },
                  ].map((lg) => (
                    <button
                      key={lg.id}
                      onClick={() => setSelectedLeague(lg.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        selectedLeague === lg.id
                          ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      {lg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-amber-400/90 font-mono">
                Dedicated Sports Franchise Arena
              </div>
            </div>
          )}

          {/* Sector Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {sectors.map((sector) => {
              const isFootball = sector === 'Football & Sports';
              const isStore = sector === 'Stores & Retail';
              return (
                <button
                  key={sector}
                  onClick={() => {
                    setSelectedSector(sector);
                    if (isFootball) setSelectedLeague('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedSector === sector
                      ? isFootball
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : isStore
                        ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-emerald-500 text-slate-950 shadow-sm'
                      : isFootball
                      ? 'bg-slate-950 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400'
                      : isStore
                      ? 'bg-slate-950 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {isFootball && <span>⚽</span>}
                  {isStore && <span>🛒</span>}
                  <span>{sector}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Heading & Counter */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-lg text-white flex items-center gap-2">
              {selectedSector === 'Football & Sports' ? (
                <>
                  <span className="text-amber-400">⚽ Football & NBA Sports Arena</span>
                  {selectedLeague !== 'All' && (
                    <span className="text-xs font-bold text-amber-200 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                      {selectedLeague}
                    </span>
                  )}
                </>
              ) : selectedSector === 'Stores & Retail' ? (
                <span className="text-cyan-400">🛒 Stores & Supermarket Chains</span>
              ) : (
                <span>Stock Market Equities</span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {selectedSector === 'Football & Sports'
                ? `Showing ${filteredStocks.length} sports clubs & franchises across ${selectedLeague === 'All' ? 'all leagues' : selectedLeague}.`
                : selectedSector === 'Stores & Retail'
                ? `Showing ${filteredStocks.length} retail stores & supermarket chains like Walmart and Target.`
                : `Showing ${filteredStocks.length} public companies. Real Wall Street equities (sports franchises located in Sports Arena).`}
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Prices move at realistic intervals • S&P 500 / Nasdaq
          </div>
        </div>

        {/* Stock Cards Grid (100+ real companies) */}
        {filteredStocks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-base font-semibold">No companies match "{searchQuery}" in {selectedSector}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('All');
              }}
              className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stock) => (
              <RealStockCard
                key={stock.ticker}
                stock={stock}
                position={positions[stock.ticker]}
                cash={cash}
                onBuy={handleBuy}
                onSell={handleSell}
                onOpenTradeModal={(s) => setTradeModalStock(s)}
                priceFlash={priceFlashes[stock.ticker]}
              />
            ))}
          </div>
        )}

        {/* Portfolio Holdings Summary */}
        <PortfolioSummary
          positions={positions}
          stocks={stocks}
          orders={orders}
          cash={cash}
          stocksValue={stocksValue}
          onSelectStock={(s) => setTradeModalStock(s)}
        />
      </main>

      {/* Trade & Detail Modal */}
      <RealTradeModal
        stock={tradeModalStock}
        position={tradeModalStock ? positions[tradeModalStock.ticker] : undefined}
        cash={cash}
        onClose={() => setTradeModalStock(null)}
        onBuy={handleBuy}
        onSell={handleSell}
      />

      {/* Reset Modal */}
      <ResetBalanceModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onReset={handleReset}
      />
    </div>
  );
}
