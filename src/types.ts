export type StockSector = 
  | 'Football & Sports'
  | 'Stores & Retail'
  | 'Aerospace & Aviation'
  | 'Tech & AI'
  | 'Finance'
  | 'Healthcare'
  | 'Consumer & Retail'
  | 'Auto & Energy'
  | 'Industrials & Defense'
  | 'Media & Telecom';

export interface RealStock {
  ticker: string;
  name: string;
  sector: StockSector;
  league?: 'Premier League' | 'NBA' | 'European Football' | 'MLB' | 'Other Sports' | string;
  price: number;
  openPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio?: number;
  dayHigh: number;
  dayLow: number;
  history: number[]; // Last 20 price points for clean sparkline
}

export interface PortfolioPosition {
  ticker: string;
  shares: number;
  averageBuyPrice: number;
  totalCost: number;
}

export interface TradeOrder {
  id: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  timeString: string;
}

export interface MarketNewsItem {
  id: string;
  timeString: string;
  headline: string;
  affectedTicker?: string;
  impactPercent?: number;
  isPositive: boolean;
}

export type MarketSpeed = '1x' | '2x' | '3x';
