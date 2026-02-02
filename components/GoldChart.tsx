
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
  hourlyData?: HistoryPoint[];
  title?: string;
  showInternalTitle?: boolean;
  externalTimeRange?: TimeRange;
  onTimeRangeChange?: (tr: TimeRange) => void;
  showTimeRanges?: boolean;
  footerNote?: string;
}

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '24h', label: '24h' },
  { key: '1w', label: '1 tuần' },
  { key: '1m', label: '1 tháng' },
  { key: '6m', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
];

const CATEGORIES_CONFIG = [
  { key: 'sjc', label: 'Vàng SJC', productId: 'sjc_1l', color: '#9f224e' },
  { key: 'jewelry', label: 'Nữ trang', productId: 'jewelry_9999', color: '#db2777' },
];

export const GoldChart: React.FC<GoldChartProps> = ({ 
  products, 
  historyData,
  hourlyData = [],
  title,
  showInternalTitle = true,
  externalTimeRange,
  onTimeRangeChange,
  showTimeRanges = true,
  footerNote
}) => {
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>('24h');
  const [activeKeys, setActiveKeys] = useState<string[]>(['sjc']);
  const [showSell, setShowSell] = useState(true);
  const [showBuy, setShowBuy] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Use external timeRange if provided, otherwise fallback to internal
  const timeRange = externalTimeRange || internalTimeRange;
  const setTimeRange = onTimeRangeChange || setInternalTimeRange;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = useMemo(() => {
    if (products.length > 5) {
        return CATEGORIES_CONFIG;
    }
    return products.map((p, idx) => ({
        key: p.id,
        label: p.id === 'world_gold' ? 'Thế giới' : p.name,
        productId: p.id,
        color: p.group === 'world' ? '#64748b' : (idx === 0 ? '#9f224e' : '#16a34a')
    }));
  }, [products]);

  const primaryProductId = products[0]?.id;

  useEffect(() => {
    if (categories.length > 0 && products.length <= 5) {
        const defaultKey = categories[0].key;
        setActiveKeys((prev) => {
            if (prev.length === 1 && prev[0] === defaultKey) {
                return prev;
            }
            return [defaultKey];
        });
    }
  }, [primaryProductId, products.length]); 

  const toggleCategory = (key: string) => {
    setActiveKeys(prev => {
        if (prev.includes(key)) {
            if (prev.length === 1) return prev;
            return prev.filter(k => k !== key);
        }
        return [...prev, key];
    });
  };

  const primaryActiveKey = activeKeys[0];
  const primaryCategory = categories.find(c => c.key === primaryActiveKey);
  const primaryProduct = products.find(p => p.id === primaryCategory?.productId);
  const updateTime = primaryProduct?.updatedAt.split(' ')[1] || new Date().toLocaleDateString('vi-VN');

  const filteredData = useMemo(() => {
    if (timeRange === '24h') return hourlyData;
    
    if (!historyData || historyData.length === 0) return [];
    
    const total = historyData.length;
    let count = total;
    switch (timeRange) {
        case '1w': count = 7; break;
        case '1m': count = 30; break;
        case '6m': count = 180; break;
        case '1y': count = 365; break;
    }
    return historyData.slice(-count);
  }, [historyData, hourlyData, timeRange]);

  const isWorldActive = activeKeys.some(k => k === 'world' || k === 'world_gold');
  
  const isWorldOnly = activeKeys.length === 1 && (activeKeys[0] === 'world' || activeKeys[0] === 'world_gold');
  const shouldOptimizeLayout = isMobile && isWorldOnly;

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
    const padding = (max - min) * 0.05; 
    if (padding === 0) return [min - 1, max + 1];
    return [min - padding, max + padding];
  };

  const vndDomain = useMemo(() => calculateDomain(false), [filteredData, activeKeys, showSell, showBuy]);
  const usdDomain = useMemo(() => calculateDomain(true), [filteredData, activeKeys, showSell, showBuy]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-200 shadow-xl rounded-none text-xs z-50 min-w-[180px] font-sans">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">
            {timeRange === '24h' ? `Thời điểm: ${label}` : label}
          </p>
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

  const CategoryToggles = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center overflow-x-auto no-scrollbar gap-2 ${className}`}>
        {categories.map((cat) => { 
          const isActive = activeKeys.includes(cat.key);
          return (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`shrink-0 flex items-center justify-start gap-1.5 px-3 py-1.5 text-[13px] sm:text-xs font-bold transition-all border select-none font-sans whitespace-nowrap rounded-sm ${
                isActive 
                  ? 'bg-white text-gray-900 border-gray-300 shadow-sm' 
                  : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <span 
                 className={`w-2.5 h-1 transition-colors shrink-0`}
                 style={{ backgroundColor: isActive ? cat.color : '#e5e7eb' }}
              ></span>
              <span>{cat.label}</span>
            </button>
          )
        })}
    </div>
  );

  return (
    <div className={`bg-white rounded-none border-gray-200 flex flex-col font-sans ${showInternalTitle ? 'p-3 sm:py-3 sm:px-4 md:px-5 md:py-5 border' : ''}`}>
      <div className={`flex flex-col gap-4 sm:gap-2 mb-4 sm:mb-2 border-gray-100 ${showInternalTitle ? 'border-b pb-3 sm:pb-2' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {showInternalTitle && (
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <h2 className="text-lg font-serif font-bold text-gray-900">
                  {title || 'Biểu đồ giá vàng'}
                </h2>
                <span className="text-xs text-gray-500 font-medium font-sans border-l border-gray-300 pl-2">
                  Cập nhật: {updateTime}
                </span>
            </div>
          )}

          {!showInternalTitle && categories.length > 1 && (
            <CategoryToggles className="hidden md:flex border border-gray-100 p-0.5" />
          )}

          {showTimeRanges && (
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                <div className="flex border border-gray-200 bg-gray-50/50 p-0.5 w-full sm:w-auto">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.key}
                            onClick={() => setTimeRange(range.key)}
                            className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap font-sans ${
                                timeRange === range.key 
                                ? 'bg-[#9f224e] text-white shadow-md font-bold' 
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>

        {categories.length > 1 && (
            <CategoryToggles className={`${!showInternalTitle ? 'md:hidden' : ''} mb-1`} />
        )}
      </div>

      <div className={`relative w-full text-[10px] ${showInternalTitle ? 'h-[240px] sm:h-[180px]' : 'h-[320px] sm:h-[280px]'}`}>
         {filteredData.length > 0 ? (
           <ResponsiveContainer width="100%" height="100%">
            {/* Added margin right: 25 to prevent last labels like "11:00" from touching the container edge */}
            <LineChart data={filteredData} margin={{ top: 10, right: shouldOptimizeLayout ? 5 : 25, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                minTickGap={timeRange === '24h' ? 20 : 40}
                tick={{ fill: '#64748b', fontSize: 10, dy: 10, fontFamily: 'Arial' }}
              />
              
              <YAxis 
                yAxisId="vnd"
                domain={vndDomain} 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Arial' }}
                tickFormatter={(val) => val.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                width={shouldOptimizeLayout ? 0 : 45}
                hide={shouldOptimizeLayout}
              />

              <YAxis 
                yAxisId="usd"
                orientation={shouldOptimizeLayout ? "left" : "right"}
                domain={usdDomain}
                tickLine={false}
                axisLine={false}
                hide={!isWorldActive}
                tick={{ fill: '#374151', fontSize: 10, fontWeight: 'bold', fontFamily: 'Arial' }}
                tickFormatter={(val) => val.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                width={50}
              />

              <Tooltip content={<CustomTooltip />} />
              
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
                                  strokeWidth={2.5}
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
                                  strokeDasharray="3 3"
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
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 font-sans">
                Đang tải dữ liệu biểu đồ...
            </div>
         )}
      </div>

      <div className="mt-4 sm:mt-2 flex flex-col sm:flex-row items-center border-t border-gray-50 pt-4 sm:pt-3 pb-1 select-none relative">
            {footerNote && (
              <div className="sm:absolute sm:left-0 text-[12px] text-gray-400 font-medium italic mb-3 sm:mb-0">
                {footerNote}
              </div>
            )}

            <div className="flex items-center justify-center gap-8 w-full">
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
    </div>
  );
};
