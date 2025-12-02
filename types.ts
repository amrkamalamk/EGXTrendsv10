export interface Stock {
  symbol: string;
  name: string;
  sector?: string;
}

export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  vwap?: number;
  rsi?: number;
  macd?: {
    histogram?: number;
    signal?: number;
    macd?: number;
  };
}

export type TimeFrame = 'D' | 'W' | 'M' | '1' | '5' | '15' | '60' | '240';

export type MarketIndex = 'EGX30' | 'EGX70';

export interface DailyStat {
  date: string;
  price: number;
  changePercent: number;
}

export interface AnalysisData {
  stock: Stock;
  history: DailyStat[];
  isSimulated?: boolean;
}