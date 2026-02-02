
import { GoldProduct, ComputedGoldProduct, Trend, HistoryPoint } from '../types';

// Helper to get formatted time string
const getFormattedTime = (date: Date = new Date()) => {
  return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

// --- DATA SOURCE CONFIGURATION ---
const SHEET_A_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFknfHc1PzpA2BwTh4XtiKCl91VkeOf8ZIwp4BGaurggUAFk8jYDVazTmWWn0oseC1TVpPxhY1Axl1/pub?gid=1051355078&single=true&output=tsv";
const SHEET_B_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFknfHc1PzpA2BwTh4XtiKCl91VkeOf8ZIwp4BGaurggUAFk8jYDVazTmWWn0oseC1TVpPxhY1Axl1/pub?gid=1664628255&single=true&output=tsv";

// Initial Mock Data (Reflecting 2026 Price Levels)
const INITIAL_DATA: GoldProduct[] = [
  {
    id: 'world_gold',
    name: 'Giá vàng thế giới',
    group: 'world',
    unit: 'USD/ounce',
    today: { buy: 5720.50, sell: 5721.50 },
    yesterday: { buy: 5705.20, sell: 5706.20 }, 
    updatedAt: getFormattedTime()
  },
  {
    id: 'sjc_1l',
    name: 'SJC 1L, 10L, 1KG',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 178.00, sell: 181.00 },
    yesterday: { buy: 186.60, sell: 189.60 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'sjc_5c',
    name: 'SJC 5c',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 181.00, sell: 178.00 },
    yesterday: { buy: 189.60, sell: 186.60 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'sjc_2c',
    name: 'SJC 2c, 1C, 5 phân',
    group: 'sjc',
    unit: 'Triệu đồng/lượng',
    today: { buy: 181.02, sell: 178.00 },
    yesterday: { buy: 189.62, sell: 186.60 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'jewelry_9999',
    name: 'Nữ Trang 99.99% SJC',
    group: 'jewelry',
    unit: 'Triệu đồng/lượng',
    today: { buy: 177.000, sell: 180.000 },
    yesterday: { buy: 186.300, sell: 189.300 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'jewelry_99',
    name: 'Nữ Trang 99% SJC',
    group: 'jewelry',
    unit: 'Triệu đồng/lượng',
    today: { buy: 177.000, sell: 180.000 },
    yesterday: { buy: 186.300, sell: 189.300 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'hcm_sjc',
    name: 'TPHCM SJC',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 178.00, sell: 181.00 },
    yesterday: { buy: 178.00, sell: 181.00 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'hcm_pnj',
    name: 'TPHCM PNJ',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 178.00, sell: 181.00 },
    yesterday: { buy: 178.00, sell: 181.00 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'hanoi_sjc',
    name: 'Hà Nội SJC',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 178.00, sell: 181.00 },
    yesterday: { buy: 178.00, sell: 181.00 },
    updatedAt: getFormattedTime()
  },
  {
    id: 'hanoi_pnj',
    name: 'Hà Nội PNJ',
    group: 'regional',
    unit: 'Triệu đồng/lượng',
    today: { buy: 178.00, sell: 181.00 },
    yesterday: { buy: 178.00, sell: 181.00 },
    updatedAt: getFormattedTime()
  },
];

let currentDataStore: GoldProduct[] = JSON.parse(JSON.stringify(INITIAL_DATA));

const determineTrend = (change: number): Trend => {
  if (change > 0) return Trend.UP;
  if (change < 0) return Trend.DOWN;
  return Trend.FLAT;
};

// --- TSV PARSING HELPERS ---

const parseValue = (val: string): number => {
  if (!val || val.trim() === '') return 0;
  let cleanVal = val.trim();
  
  // Remove thousand separator dot
  cleanVal = cleanVal.replace(/\./g, '');
  // Convert comma to dot for float
  cleanVal = cleanVal.replace(/,/g, '.');
  
  let num = parseFloat(cleanVal);
  if (isNaN(num)) return 0;

  // Logic: Nếu số quá lớn (như 178.000.000), chia cho 1 triệu để lấy đơn vị "Triệu đồng"
  // Nếu là số nhỏ (như 178), giữ nguyên. 
  // Nếu nằm giữa (như 180.000), có thể là do định dạng sai từ Sheet, cần chuẩn hóa
  if (num >= 1000000) return num / 1000000;
  if (num >= 100000) return num / 1000; // Case where 180.000 means 180 triệu

  return num;
};

const fetchTSV = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  const text = await response.text();
  return text.split(/\r?\n/).map(line => line.split('\t'));
};

// --- DATA FETCHING LOGIC ---

// 1. Fetch Sheet A (SJC History)
const fetchSheetA = async () => {
  try {
    const rows = await fetchTSV(SHEET_A_URL);
    if (rows.length < 2) return; 

    const headers = rows[0].map(h => h.toLowerCase());
    const findIndex = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    const mapping = [
      { id: 'sjc_1l', keywords: ['1l', '10l', '1kg'], fallbackIdx: 1 },
      { id: 'sjc_5c', keywords: ['5c'], fallbackIdx: 3 }, 
      { id: 'sjc_2c', keywords: ['2c', '1c', '5 phân'], fallbackIdx: 5 },
      { id: 'jewelry_9999', keywords: ['99.99%', '99,99%'], fallbackIdx: 7 },
      { id: 'jewelry_99', keywords: ['99%'], fallbackIdx: 9 },
    ];

    const validRows = rows.filter(r => r.length > 1 && r[0].trim() !== '');
    if (validRows.length < 2) return;

    const todayRow = validRows[validRows.length - 1];
    const yesterdayRow = validRows[validRows.length - 2];
    
    mapping.forEach(m => {
      const colIdx = findIndex(m.keywords);
      const buyIdx = colIdx !== -1 ? colIdx : m.fallbackIdx;
      const sellIdx = buyIdx + 1; 

      const productIdx = currentDataStore.findIndex(p => p.id === m.id);
      if (productIdx !== -1) {
        if (todayRow[buyIdx] && todayRow[sellIdx]) {
            currentDataStore[productIdx].today.buy = parseValue(todayRow[buyIdx]);
            currentDataStore[productIdx].today.sell = parseValue(todayRow[sellIdx]);
            currentDataStore[productIdx].updatedAt = getFormattedTime();
        }
        if (yesterdayRow[buyIdx] && yesterdayRow[sellIdx]) {
            currentDataStore[productIdx].yesterday.buy = parseValue(yesterdayRow[buyIdx]);
            currentDataStore[productIdx].yesterday.sell = parseValue(yesterdayRow[sellIdx]);
        }
      }
    });

  } catch (error) {
    console.error("Error fetching Sheet A:", error);
  }
};

// 2. Fetch Sheet B (Regional - Date based)
const fetchSheetB = async () => {
  try {
    const rows = await fetchTSV(SHEET_B_URL);
    if (rows.length < 2) return;

    // Header row mapping: Col A (Date), B (TPHCM PNJ), C (TPHCM SJC), E (Hà Nội SJC), F? (Hà Nội PNJ)
    // Looking for headers to be safe
    const headers = rows[0].map(h => h.toLowerCase());
    
    const validRows = rows.filter(r => r.length > 1 && r[0].trim() !== '');
    if (validRows.length < 2) return;

    // Get today and yesterday based on the last two rows of this sheet
    const todayRow = validRows[validRows.length - 1];
    const yesterdayRow = validRows[validRows.length - 2];

    const findCol = (keyword: string) => headers.findIndex(h => h.includes(keyword));

    const mapping = [
      { id: 'hcm_pnj', col: findCol('tphcm pnj') !== -1 ? findCol('tphcm pnj') : 1 },
      { id: 'hcm_sjc', col: findCol('tphcm sjc') !== -1 ? findCol('tphcm sjc') : 2 },
      { id: 'hanoi_sjc', col: findCol('hà nội sjc') !== -1 ? findCol('hà nội sjc') : 4 },
      { id: 'hanoi_pnj', col: findCol('hà nội - pnj') !== -1 ? findCol('hà nội - pnj') : 5 },
    ];

    mapping.forEach(m => {
      const productIdx = currentDataStore.findIndex(p => p.id === m.id);
      if (productIdx !== -1) {
        // Today
        const todayVal = parseValue(todayRow[m.col]);
        if (todayVal > 0) {
            currentDataStore[productIdx].today.buy = todayVal;
            currentDataStore[productIdx].today.sell = todayVal; // Regional often only provides one price or same price for both in simple sheets
        }
        // Yesterday
        const yesterdayVal = parseValue(yesterdayRow[m.col]);
        if (yesterdayVal > 0) {
            currentDataStore[productIdx].yesterday.buy = yesterdayVal;
            currentDataStore[productIdx].yesterday.sell = yesterdayVal;
        }
        currentDataStore[productIdx].updatedAt = getFormattedTime();
      }
    });

  } catch (error) {
    console.error("Error fetching Sheet B:", error);
  }
};

// 3. Fetch World Price
const fetchWorldGold = async () => {
    try {
        const response = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
            method: 'GET',
            headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
            cache: 'no-store'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                const spotPrice = item.xauPrice;
                const closePrice = item.xauClose;
                const SPREAD = 0.8;
                const worldIndex = currentDataStore.findIndex(p => p.group === 'world');
                if (worldIndex !== -1) {
                    currentDataStore[worldIndex].today.buy = spotPrice;
                    currentDataStore[worldIndex].today.sell = spotPrice + SPREAD;
                    if (!isNaN(closePrice) && closePrice > 0) {
                        currentDataStore[worldIndex].yesterday.sell = closePrice;
                        currentDataStore[worldIndex].yesterday.buy = closePrice - SPREAD; 
                    }
                    currentDataStore[worldIndex].updatedAt = getFormattedTime();
                }
            }
        }
    } catch (error) {
        console.error("API Error world gold", error);
    }
};

// --- PUBLIC EXPORTS ---

export const getGoldData = (): ComputedGoldProduct[] => {
  return currentDataStore.map(product => {
    const changeBuy = product.today.buy - product.yesterday.buy;
    const changeSell = product.today.sell - product.yesterday.sell;
    
    const percentBuy = product.yesterday.buy > 0 ? (changeBuy / product.yesterday.buy) * 100 : 0;
    const percentSell = product.yesterday.sell > 0 ? (changeSell / product.yesterday.sell) * 100 : 0;

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

export const fetchAllGoldPrices = async (): Promise<ComputedGoldProduct[]> => {
    await Promise.all([
        fetchWorldGold(),
        fetchSheetA(),
        fetchSheetB()
    ]);
    return getGoldData();
};

export const fetchWorldGoldPrice = fetchAllGoldPrices;

// --- REALISTIC RANDOM WALK GENERATION ---

// Helper to generate a realistic random walk series backwards from today
// volatility is the max percentage change per step
const generateWalk = (startPrice: number, steps: number, volatility: number, trendBias: number = 0): number[] => {
    const series = [startPrice];
    let currentPrice = startPrice;

    for (let i = 0; i < steps; i++) {
        // Random change between -volatility and +volatility
        const changePercent = (Math.random() - 0.5) * 2 * volatility;
        // Add a small trend bias (e.g., slight drift downwards as we go back in time implies upward trend)
        const totalChange = changePercent - trendBias; 
        
        currentPrice = currentPrice * (1 - totalChange); // Reverse calculation: prev = current / (1+change) roughly approx to current * (1-change)
        series.push(currentPrice);
    }
    return series; // series[0] is today, series[1] is -1 step, etc.
};

export const getHistoryData = (): HistoryPoint[] => {
  const history: HistoryPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pre-calculate price series for each product
  const productSeries: Record<string, number[]> = {};
  
  INITIAL_DATA.forEach(p => {
    // Determine volatility based on product type
    const isWorld = p.group === 'world';
    const vol = isWorld ? 0.015 : 0.008; // World gold is more volatile (1.5%), SJC less (0.8%)
    const trend = isWorld ? 0.0005 : 0.0008; // SJC has had a stronger upward trend over the year
    
    productSeries[p.id] = generateWalk(p.today.sell, 365, vol, trend);
  });

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
      // Index in our generated series is 'i' because we generated backwards but loop 365 -> 0
      // Actually, generateWalk returns series[0] = today.
      // So if i=0 (today), we need series[0]. If i=365 (year ago), we need series[365].
      const price = productSeries[p.id][i];
      const currentSpread = p.today.sell - p.today.buy;

      dataPoint[p.id] = parseFloat(price.toFixed(2));
      dataPoint[`${p.id}_sell`] = parseFloat(price.toFixed(2));
      // Assume spread stays roughly proportional or constant
      dataPoint[`${p.id}_buy`] = parseFloat((price - currentSpread).toFixed(2));
    });

    history.push(dataPoint);
  }

  return history;
};

export const getHourlyData = (): HistoryPoint[] => {
  const hourly: HistoryPoint[] = [];
  const now = new Date();
  // Align to nearest 30 min
  const minutes = now.getMinutes();
  const roundedMinutes = minutes >= 30 ? 30 : 0;
  now.setMinutes(roundedMinutes, 0, 0);

  // Generate 48 points (24 hours * 2 points per hour)
  const POINTS = 48;
  const productSeries: Record<string, number[]> = {};

  INITIAL_DATA.forEach(p => {
    const isWorld = p.group === 'world';
    // Hourly volatility is much lower
    const vol = isWorld ? 0.002 : 0.001; 
    productSeries[p.id] = generateWalk(p.today.sell, POINTS, vol, 0);
  });

  for (let i = POINTS - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMinutes(now.getMinutes() - (i * 30));
    
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const hourStr = `${hours}:${mins}`;
    const fullDateStr = date.toISOString();

    const dataPoint: HistoryPoint = {
      date: hourStr,
      fullDate: fullDateStr,
      isHourly: true
    };

    INITIAL_DATA.forEach(p => {
      const price = productSeries[p.id][i];
      const currentSpread = p.today.sell - p.today.buy;

      dataPoint[p.id] = parseFloat(price.toFixed(2));
      dataPoint[`${p.id}_sell`] = parseFloat(price.toFixed(2));
      dataPoint[`${p.id}_buy`] = parseFloat((price - currentSpread).toFixed(2));
    });

    hourly.push(dataPoint);
  }
  
  return hourly;
};

// --- FORMATTER HELPER ---
export const formatGoldPrice = (price: number, group: string) => {
  if (price === 0) return "0";
  
  if (group === 'jewelry') {
    // Jewelry: Always 3 decimals (e.g., 170,233)
    return price.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }
  if (group === 'world') {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  // SJC & Regional: Flexible (e.g., 178 or 181,2)
  // Logic: Nếu là số nguyên thì không hiện số 0 thập phân. Nếu có lẻ thì hiện tối đa 2 số.
  return price.toLocaleString('vi-VN', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  });
};
