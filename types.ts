export enum Trend {
  UP = 'UP',
  DOWN = 'DOWN',
  FLAT = 'FLAT',
}

export interface PriceDetail {
  buy: number;
  sell: number;
}

export interface GoldProduct {
  id: string;
  name: string;
  group: 'world' | 'sjc' | 'jewelry' | 'regional';
  unit: 'USD/ounce' | 'Triệu đồng/lượng';
  today: PriceDetail;
  yesterday: PriceDetail;
  updatedAt: string;
}

export interface ComputedGoldProduct extends GoldProduct {
  changeBuy: number;
  changeSell: number;
  percentBuy: number;
  percentSell: number;
  trendBuy: Trend;
  trendSell: Trend;
}

// Map key is product ID, value is price
export interface HistoryPoint {
  date: string;
  fullDate: string; // ISO or full string for sorting/tooltip
  [key: string]: string | number; 
}

export type TimeRange = '1w' | '1m' | '6m' | '1y' | 'all';