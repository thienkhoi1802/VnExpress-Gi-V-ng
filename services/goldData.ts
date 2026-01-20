import { GoldProduct, ComputedGoldProduct, Trend, HistoryPoint } from '../types';

// Mock data with mixed trends to demonstrate UI states
const RAW_DATA: GoldProduct[] = [
  {
    id: 'world_gold',
    name: 'Giá vàng thế giới',
    group: 'world',
    unit: 'USD/ounce',
    today: { buy: 4625.5, sell: 4628.5 },
    yesterday: { buy: 4600.0, sell: 4602.0 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'sjc_1l',
    name: 'SJC 1L, 10L, 1KG',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 158.5, sell: 160.5 },
    yesterday: { buy: 160.8, sell: 162.8 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'sjc_5c',
    name: 'SJC 5c',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 160.8, sell: 162.82 },
    yesterday: { buy: 160.8, sell: 162.82 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'sjc_2c',
    name: 'SJC 2c, 1C, 5 phân',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 160.5, sell: 162.5 },
    yesterday: { buy: 160.8, sell: 162.83 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'jewelry_9999',
    name: 'Nữ Trang 99.99%',
    group: 'jewelry',
    unit: 'Triệu đồng/lượng',
    today: { buy: 156.2, sell: 159.2 },
    yesterday: { buy: 155.7, sell: 158.7 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'jewelry_99',
    name: 'Nữ Trang 99%',
    group: 'jewelry',
    unit: 'Triệu đồng/lượng',
    today: { buy: 153.5, sell: 159.5 },
    yesterday: { buy: 151.128, sell: 157.128 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'hcm_pnj',
    name: 'TPHCM PNJ',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 160.0, sell: 158.0 },
    yesterday: { buy: 161.0, sell: 158.0 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'hcm_sjc',
    name: 'TPHCM SJC',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 163.0, sell: 160.0 },
    yesterday: { buy: 162.8, sell: 160.8 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'hanoi_pnj',
    name: 'Hà Nội PNJ',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 161.0, sell: 158.0 },
    yesterday: { buy: 161.0, sell: 158.0 },
    updatedAt: '09:15 16/01/2026'
  },
  {
    id: 'hanoi_sjc',
    name: 'Hà Nội SJC',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 161.5, sell: 159.5 },
    yesterday: { buy: 162.8, sell: 160.8 },
    updatedAt: '09:15 16/01/2026'
  },
];

export const getGoldData = (): ComputedGoldProduct[] => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const updatedString = `${timeString} ${dateString}`;

  return RAW_DATA.map(product => {
    const changeBuy = product.today.buy - product.yesterday.buy;
    const changeSell = product.today.sell - product.yesterday.sell;
    
    const percentBuy = (changeBuy / product.yesterday.buy) * 100;
    const percentSell = (changeSell / product.yesterday.sell) * 100;

    const determineTrend = (change: number): Trend => {
      if (change > 0) return Trend.UP;
      if (change < 0) return Trend.DOWN;
      return Trend.FLAT;
    };

    return {
      ...product,
      updatedAt: updatedString,
      changeBuy,
      changeSell,
      percentBuy,
      percentSell,
      trendBuy: determineTrend(changeBuy),
      trendSell: determineTrend(changeSell)
    };
  });
};

export const getHistoryData = (): HistoryPoint[] => {
  const history: HistoryPoint[] = [];
  const today = new Date();
  
  const getRandomChange = (basePrice: number, volatility: number) => {
    return (Math.random() - 0.5) * volatility * basePrice;
  };

  const currentPrices: Record<string, number> = {};
  RAW_DATA.forEach(p => {
    currentPrices[p.id] = p.today.sell * 0.85; 
  });

  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const fullDateStr = date.toISOString();

    const dataPoint: HistoryPoint = {
      date: dayStr,
      fullDate: fullDateStr,
    };

    RAW_DATA.forEach(p => {
      const trend = p.today.sell * 0.0005; 
      const noise = getRandomChange(currentPrices[p.id], 0.01);
      
      let newSellPrice = currentPrices[p.id] + trend + noise;
      if (i < 5) {
        const diff = p.today.sell - newSellPrice;
        newSellPrice += diff / (i + 1);
      }
      
      const currentSpread = p.today.sell - p.today.buy;
      const newBuyPrice = newSellPrice - currentSpread;

      currentPrices[p.id] = newSellPrice;
      const fixedDigits = p.group === 'world' ? 1 : 2;
      
      dataPoint[p.id] = parseFloat(newSellPrice.toFixed(fixedDigits));
      dataPoint[`${p.id}_sell`] = parseFloat(newSellPrice.toFixed(fixedDigits));
      dataPoint[`${p.id}_buy`] = parseFloat(newBuyPrice.toFixed(fixedDigits));
    });

    history.push(dataPoint);
  }

  return history;
};