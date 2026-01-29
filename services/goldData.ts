
import { GoldProduct, ComputedGoldProduct, Trend, HistoryPoint } from '../types';

// Helper to get formatted time string
const getFormattedTime = (date: Date = new Date()) => {
  return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

// Initial Mock Data
const INITIAL_DATA: GoldProduct[] = [
  {
    id: 'world_gold',
    name: 'Giá vàng thế giới',
    group: 'world',
    unit: 'USD/ounce',
    today: { buy: 5272.62, sell: 5274.62 }, 
    yesterday: { buy: 5179.60, sell: 5181.60 }, 
    updatedAt: getFormattedTime()
  },
  {
    id: 'sjc_1l',
    name: 'SJC 1L, 10L, 1KG',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 162.50, sell: 165.50 },
    yesterday: { buy: 160.00, sell: 163.00 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'sjc_5c',
    name: 'SJC 5c',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 162.50, sell: 165.52 },
    yesterday: { buy: 160.00, sell: 163.02 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'sjc_2c',
    name: 'SJC 2c, 1C, 5 phân',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 162.50, sell: 165.53 },
    yesterday: { buy: 160.00, sell: 163.03 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'jewelry_9999',
    name: 'Nữ Trang 99.99% SJC',
    group: 'jewelry',
    unit: 'Triệu đồng/lượng',
    today: { buy: 158.80, sell: 161.60 },
    yesterday: { buy: 156.50, sell: 159.30 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'jewelry_99',
    name: 'Nữ Trang 99% SJC',
    group: 'jewelry',
    unit: 'Triệu đồng/lượng',
    today: { buy: 155.50, sell: 158.80 },
    yesterday: { buy: 153.20, sell: 156.50 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'hcm_pnj',
    name: 'TPHCM PNJ',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 159.90, sell: 162.50 },
    yesterday: { buy: 159.90, sell: 162.50 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'hcm_sjc',
    name: 'TPHCM SJC',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 162.50, sell: 165.50 },
    yesterday: { buy: 160.00, sell: 163.00 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'hanoi_pnj',
    name: 'Hà Nội PNJ',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 159.90, sell: 162.50 },
    yesterday: { buy: 159.90, sell: 162.50 },
    updatedAt: '14:27 28/01/2026'
  },
  {
    id: 'hanoi_sjc',
    name: 'Hà Nội SJC',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 162.50, sell: 165.50 },
    yesterday: { buy: 160.00, sell: 163.00 },
    updatedAt: '14:27 28/01/2026'
  },
];

let currentDataStore: GoldProduct[] = JSON.parse(JSON.stringify(INITIAL_DATA));

const determineTrend = (change: number): Trend => {
  if (change > 0) return Trend.UP;
  if (change < 0) return Trend.DOWN;
  return Trend.FLAT;
};

export const getGoldData = (): ComputedGoldProduct[] => {
  return currentDataStore.map(product => {
    const changeBuy = product.today.buy - product.yesterday.buy;
    const changeSell = product.today.sell - product.yesterday.sell;
    
    const percentBuy = (changeBuy / product.yesterday.buy) * 100;
    const percentSell = (changeSell / product.yesterday.sell) * 100;

    return {
      ...product,
      changeBuy,
      changeSell,
      percentBuy,
      percentSell,
      trendBuy: determineTrend(changeBuy),
      trendSell: determineTrend(changeSell)
    };
  });
};

export const fetchWorldGoldPrice = async (): Promise<ComputedGoldProduct[]> => {
    try {
        const response = await fetch("https://www.goldapi.io/api/XAU/USD", {
            method: 'GET',
            headers: {
                "x-access-token": "goldapi-1g7qh19mkxkc3eh-io",
                "Content-Type": "application/json"
            },
            redirect: 'follow'
        });
        
        if (response.ok) {
            const data = await response.json();
            const bid = parseFloat(data.bid);
            const ask = parseFloat(data.ask);
            const prevClose = parseFloat(data.prev_close_price);
            const timestamp = parseInt(data.timestamp);

            if (!isNaN(bid) && !isNaN(ask)) {
                updateWorldStore(bid, ask, prevClose, timestamp);
            }
        } else {
            simulateLivePrice();
        }
    } catch (error) {
        simulateLivePrice();
    }
    
    return getGoldData();
};

const updateWorldStore = (bid: number, ask: number, prevClose: number, timestamp?: number) => {
    const worldIndex = currentDataStore.findIndex(p => p.group === 'world');
    if (worldIndex !== -1) {
        currentDataStore[worldIndex].today.buy = bid;
        currentDataStore[worldIndex].today.sell = ask;
        
        if (!isNaN(prevClose)) {
            currentDataStore[worldIndex].yesterday.buy = prevClose - (ask - bid); 
            currentDataStore[worldIndex].yesterday.sell = prevClose;
        }

        if (timestamp) {
                currentDataStore[worldIndex].updatedAt = getFormattedTime(new Date(timestamp * 1000));
        } else {
                currentDataStore[worldIndex].updatedAt = getFormattedTime();
        }
    }
};

const simulateLivePrice = () => {
    const worldIndex = currentDataStore.findIndex(p => p.group === 'world');
    if (worldIndex !== -1) {
        const currentAsk = currentDataStore[worldIndex].today.sell;
        const change = (Math.random() * 1) - 0.5;
        
        const newAsk = parseFloat((currentAsk + change).toFixed(2));
        const newBid = parseFloat((newAsk - 2.0).toFixed(2)); 

        currentDataStore[worldIndex].today.buy = newBid;
        currentDataStore[worldIndex].today.sell = newAsk;
        currentDataStore[worldIndex].updatedAt = getFormattedTime();
    }
};

export const getHistoryData = (): HistoryPoint[] => {
  const history: HistoryPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daySeed = today.getTime() / 100000;

  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const fullDateStr = date.toISOString();

    const dataPoint: HistoryPoint = {
      date: dayStr,
      fullDate: fullDateStr,
      isHourly: false
    };

    INITIAL_DATA.forEach(p => {
      const pHash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const wave = Math.sin((i + pHash + daySeed) * 0.2) * 1.5; 
      const longTrend = Math.sin((i + pHash) * 0.05) * 5.0; 
      
      let basePrice = p.today.sell;
      let historyPrice = basePrice + wave + longTrend;

      if (i === 0) {
        historyPrice = p.today.sell;
      }

      const currentSpread = p.today.sell - p.today.buy;

      dataPoint[p.id] = parseFloat(historyPrice.toFixed(2));
      dataPoint[`${p.id}_sell`] = parseFloat(historyPrice.toFixed(2));
      dataPoint[`${p.id}_buy`] = parseFloat((historyPrice - currentSpread).toFixed(2));
    });

    history.push(dataPoint);
  }

  return history;
};

/**
 * Cung cấp 24 điểm dữ liệu cho bộ lọc 24h
 */
export const getHourlyData = (): HistoryPoint[] => {
  const hourly: HistoryPoint[] = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(now.getHours() - i, 0, 0, 0);
    
    const hourStr = `${date.getHours().toString().padStart(2, '0')}:00`;
    const fullDateStr = date.toISOString();

    const dataPoint: HistoryPoint = {
      date: hourStr,
      fullDate: fullDateStr,
      isHourly: true
    };

    INITIAL_DATA.forEach(p => {
      const pHash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Biến động nhẹ theo giờ
      const wave = Math.sin((i + pHash) * 0.5) * 0.3; 
      
      let historyPrice = p.today.sell + wave;
      if (i === 0) historyPrice = p.today.sell;

      const currentSpread = p.today.sell - p.today.buy;

      dataPoint[p.id] = parseFloat(historyPrice.toFixed(2));
      dataPoint[`${p.id}_sell`] = parseFloat(historyPrice.toFixed(2));
      dataPoint[`${p.id}_buy`] = parseFloat((historyPrice - currentSpread).toFixed(2));
    });

    hourly.push(dataPoint);
  }
  
  return hourly;
};
