import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { ComputedGoldProduct, HistoryPoint, TimeRange } from '../types';

interface GoldChartProps {
  products: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  title?: string;
}

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '1w', label: '1 tuần' },
  { key: '2w', label: '2 tuần' },
  { key: '3m', label: '3 tháng' },
  { key: '6m', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
  { key: 'all', label: 'toàn bộ' },
];

// Updated Order: SJC | Jewelry | World
const CATEGORIES_CONFIG = [
  { key: 'sjc', label: 'Vàng SJC', productId: 'sjc_1l', color: '#16a34a' }, // Green
  { key: 'jewelry', label: 'Nữ Trang', productId: 'jewelry_9999', color: '#db2777' }, // Pink
  { key: 'world', label: 'Giá vàng thế giới', productId: 'world_gold', color: '#374151' }, // Dark Gray
];

export const GoldChart: React.FC<GoldChartProps> = ({ 
  products, 
  historyData,
  title
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');
  
  // State for Categories: Array of strings for multi-select. Default: ['sjc']
  const [activeKeys, setActiveKeys] = useState<string[]>(['sjc']);

  // Toggles for Buy/Sell lines
  const [showSell, setShowSell] = useState(true);
  const [showBuy, setShowBuy] = useState(true);

  // Determine available categories based on products passed (Modal vs Dashboard)
  const categories = useMemo(() => {
    // If we have many products (Dashboard), use the fixed config
    if (products.length > 5) {
        return CATEGORIES_CONFIG;
    }
    // If Modal (single or few products), map them dynamically
    return products.map((p, idx) => ({
        key: p.id,
        label: p.name,
        productId: p.id,
        color: p.group === 'world' ? '#374151' : (idx === 0 ? '#be123c' : '#16a34a')
    }));
  }, [products]);

  // FIX: Reset or Update active keys when the incoming products change (e.g. Modal Open)
  // We use the ID of the first product to detect if we switched contexts/products
  const primaryProductId = products[0]?.id;

  useEffect(() => {
    if (categories.length > 0 && products.length <= 5) {
        const defaultKey = categories[0].key;
        setActiveKeys((prev) => {
            // Only update if the current active key is different to prevent infinite loops
            if (prev.length === 1 && prev[0] === defaultKey) {
                return prev;
            }
            return [defaultKey];
        });
    }
  }, [primaryProductId, products.length]); 

  // Handler for Multi-select Toggle
  const toggleCategory = (key: string) => {
    setActiveKeys(prev => {
        if (prev.includes(key)) {
            // Prevent unchecking the last item (always keep at least one chart)
            if (prev.length === 1) return prev;
            return prev.filter(k => k !== key);
        }
        return [...prev, key];
    });
  };

  // Helper to get product info for the Header (Use the first active one)
  const primaryActiveKey = activeKeys[0];
  const primaryCategory = categories.find(c => c.key === primaryActiveKey);
  const primaryProduct = products.find(p => p.id === primaryCategory?.productId);
  const updateTime = primaryProduct?.updatedAt.split(' ')[1] || new Date().toLocaleDateString('vi-VN');

  // Filter Data by TimeRange
  const filteredData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    
    const total = historyData.length;
    let count = total;
    switch (timeRange) {
        case '1w': count = 7; break;
        case '2w': count = 14; break;
        case '3m': count = 90; break;
        case '6m': count = 180; break;
        case '1y': count = 365; break;
        case 'all': count = total; break;
    }
    return historyData.slice(-count);
  }, [historyData, timeRange]);

  // Check if "World" is active to determine if we need the Right Y-Axis
  const isWorldActive = activeKeys.some(k => k === 'world' || k === 'world_gold');

  // Manual Domain Calculation to remove empty space
  const calculateDomain = (isUsd: boolean) => {
    let min = Infinity;
    let max = -Infinity;
    
    if (filteredData.length === 0) return ['auto', 'auto'];

    const targetKeys = activeKeys.filter(k => {
        const isWorldKey = k === 'world' || k === 'world_gold';
        return isUsd ? isWorldKey : !isWorldKey;
    });

    if (targetKeys.length === 0) return ['auto', 'auto'];

    filteredData.forEach(point => {
        targetKeys.forEach(key => {
            const cat = categories.find(c => c.key === key);
            if (cat) {
                const sell = point[`${cat.productId}_sell`] as number;
                const buy = point[`${cat.productId}_buy`] as number;
                
                if (showSell && typeof sell === 'number') {
                    min = Math.min(min, sell);
                    max = Math.max(max, sell);
                }
                if (showBuy && typeof buy === 'number') {
                    min = Math.min(min, buy);
                    max = Math.max(max, buy);
                }
            }
        });
    });

    if (min === Infinity || max === -Infinity) return ['auto', 'auto'];

    // Add small padding (2% of range)
    const padding = (max - min) * 0.02;
    // If range is 0 (flat line), add explicit buffer
    if (padding === 0) return [min - 1, max + 1];

    return [min - padding, max + padding];
  };

  const vndDomain = useMemo(() => calculateDomain(false), [filteredData, activeKeys, showSell, showBuy]);
  const usdDomain = useMemo(() => calculateDomain(true), [filteredData, activeKeys, showSell, showBuy]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-200 shadow-xl rounded-none text-xs z-50 min-w-[180px] font-sans">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">{label}</p>
          <div className="flex flex-col gap-2">
            {payload.map((entry: any, index: number) => {
               return (
                <div key={index} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col justify-center h-3 w-3">
                            <span 
                                className="w-full h-[2px]" 
                                style={{ 
                                    backgroundColor: entry.color,
                                    opacity: entry.name.includes('Mua') ? 0.4 : 1,
                                    borderTop: entry.name.includes('Mua') ? '1px dashed' : 'none'
                                }}
                            ></span>
                        </div>
                        <span className="font-medium text-gray-600 truncate max-w-[120px]" title={entry.name}>
                            {entry.name}
                        </span>
                    </div>
                    <span className="font-bold text-gray-900 tabular-nums">
                        {entry.value.toLocaleString()}
                    </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-none border border-gray-200 p-3 sm:p-4 flex flex-col font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 border-b border-gray-100 pb-3">
        <div>
           <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <h2 className="text-lg font-serif font-bold text-gray-900">
                {title || 'Biểu đồ giá vàng'}
              </h2>
              <span className="text-xs text-gray-500 font-medium border-l border-gray-300 pl-2 font-sans">
                Cập nhật: {updateTime}
              </span>
           </div>
        </div>

        {/* Time Tabs */}
        <div className="flex items-center gap-2 shrink-0">
            <div className="flex border border-gray-200 bg-gray-50/50 p-0.5">
                {TIME_RANGES.map((range) => (
                    <button
                        key={range.key}
                        onClick={() => setTimeRange(range.key)}
                        className={`px-2 py-1 text-[10px] font-medium transition-all whitespace-nowrap font-sans ${
                            timeRange === range.key 
                            ? 'bg-white text-[#9f224e] shadow-sm font-bold' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Categories / Filters (Multi-select) */}
      <div className="flex flex-wrap gap-2 mb-4">
         {categories.map((cat) => { 
           const isActive = activeKeys.includes(cat.key);
           return (
             <button
               key={cat.key}
               onClick={() => toggleCategory(cat.key)}
               className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-all border select-none font-sans ${
                 isActive 
                   ? 'bg-white text-gray-900 border-gray-300 shadow-sm ring-1 ring-gray-100' 
                   : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
               }`}
             >
               <span 
                  className={`w-2.5 h-2.5 transition-colors`}
                  style={{ backgroundColor: isActive ? cat.color : '#d1d5db' }}
               ></span>
               {cat.label}
             </button>
           )
         })}
      </div>

      {/* Chart Area - Reduced Height */}
      <div className="relative h-[240px] w-full text-[10px]">
         {filteredData.length > 0 ? (
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                minTickGap={40}
                tick={{ fill: '#64748b', fontSize: 10, dy: 10, fontFamily: 'Arial' }}
              />
              
              {/* Left Axis: For VND Products (Use tight manual domain) */}
              <YAxis 
                yAxisId="vnd"
                domain={vndDomain} 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Arial' }}
                tickFormatter={(val) => Math.round(val).toLocaleString()}
                width={35}
              />

              {/* Right Axis: For World Price (Use tight manual domain) */}
              <YAxis 
                yAxisId="usd"
                orientation="right"
                domain={usdDomain}
                tickLine={false}
                axisLine={false}
                hide={!isWorldActive}
                tick={{ fill: '#374151', fontSize: 10, fontWeight: 'bold', fontFamily: 'Arial' }}
                tickFormatter={(val) => Math.round(val).toLocaleString()}
                width={40}
              />

              <Tooltip content={<CustomTooltip />} />
              
              {/* Render Lines for Active Categories */}
              {categories.map(cat => {
                  if (!activeKeys.includes(cat.key)) return null;
                  const isWorld = cat.key === 'world' || cat.key === 'world_gold';
                  const yAxisId = isWorld ? 'usd' : 'vnd';

                  return (
                      <React.Fragment key={cat.key}>
                          {showSell && (
                              <Line
                                  yAxisId={yAxisId}
                                  type="monotone"
                                  dataKey={`${cat.productId}_sell`}
                                  name={`${cat.label} (Bán)`}
                                  stroke={cat.color}
                                  strokeWidth={2}
                                  dot={false}
                                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: cat.color }}
                                  isAnimationActive={true}
                              />
                          )}
                          {showBuy && (
                              <Line
                                  yAxisId={yAxisId}
                                  type="monotone"
                                  dataKey={`${cat.productId}_buy`}
                                  name={`${cat.label} (Mua)`}
                                  stroke={cat.color}
                                  strokeWidth={2}
                                  strokeOpacity={0.4}
                                  strokeDasharray="3 3" // Dashed for Buy
                                  dot={false}
                                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: cat.color }}
                                  isAnimationActive={true}
                              />
                          )}
                      </React.Fragment>
                  )
              })}
            </LineChart>
          </ResponsiveContainer>
         ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                Đang tải dữ liệu biểu đồ...
            </div>
         )}
      </div>

      {/* Bottom Toggles (Centered) - Compact */}
      <div className="mt-2 flex items-center justify-center gap-8 border-t border-gray-50 pt-3 pb-1 select-none">
            <button 
                onClick={() => setShowSell(!showSell)}
                className={`flex items-center gap-2 text-sm transition-all font-sans ${showSell ? 'text-gray-900 font-bold' : 'text-gray-400 opacity-60'}`}
            >
                <div className="flex items-center justify-center relative">
                     <span className={`w-2 h-2 ${showSell ? 'bg-black' : 'bg-gray-300'}`}></span>
                     <span className={`absolute h-0.5 w-6 ${showSell ? 'bg-black' : 'hidden'}`}></span>
                </div>
                Giá bán
            </button>

            <button 
                onClick={() => setShowBuy(!showBuy)}
                className={`flex items-center gap-2 text-sm transition-all font-sans ${showBuy ? 'text-gray-900 font-bold' : 'text-gray-400 opacity-60'}`}
            >
                <div className="flex items-center justify-center relative">
                     <span className={`w-2 h-2 ${showBuy ? 'bg-gray-400' : 'bg-gray-300'}`}></span>
                     <span className={`absolute h-0.5 w-6 ${showBuy ? 'bg-gray-400' : 'hidden'} border-t border-dashed border-gray-400 w-full top-1/2`}></span>
                </div>
                Giá mua
            </button>
      </div>

    </div>
  );
};