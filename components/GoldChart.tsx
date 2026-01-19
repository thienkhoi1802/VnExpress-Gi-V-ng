import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ComputedGoldProduct, HistoryPoint, TimeRange } from '../types';

interface GoldChartProps {
  products: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  title?: string;
}

// Colors palette excluding Red and Blue (Reserved for SJC and World)
const OTHER_COLORS = [
  '#16a34a', // Green
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#db2777', // Pink
];

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '1w', label: '1 tuần' },
  { key: '2w', label: '2 tuần' },
  { key: '3m', label: '3 tháng' },
  { key: '6m', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
  { key: 'all', label: 'toàn bộ' },
];

export const GoldChart: React.FC<GoldChartProps> = ({ 
  products, 
  historyData, 
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');
  const [visibleProductIds, setVisibleProductIds] = useState<string[]>([]);

  // Identify main product (first one) and world product for comparison
  const worldProduct = products.find(p => p.group === 'world');
  const primaryProduct = products.find(p => p.group !== 'world') || products[0]; 

  // Calculate spread logic: Primary vs World
  const spreadText = useMemo(() => {
    if (!primaryProduct || !worldProduct || primaryProduct.id === worldProduct.id) return null;
    
    const USD_VND_RATE = 25450; 
    const TAEL_TO_OUNCE = 1.20565;
    
    // World price in Million VND/Tael
    const worldInVnd = (worldProduct.today.sell * USD_VND_RATE * TAEL_TO_OUNCE) / 1000000;
    const diff = primaryProduct.today.sell - worldInVnd;
    
    return diff.toFixed(2);
  }, [primaryProduct, worldProduct]);

  const updateTime = primaryProduct?.updatedAt.split(' ')[1] || new Date().toLocaleDateString('vi-VN');

  // Set default active filters
  useEffect(() => {
    if (products.length > 0) {
      // Default Ids: World, SJC 1L, Jewelry 99.99%
      const defaultIds = ['world_gold', 'sjc_1l', 'jewelry_9999'];
      const initialSelection = products
        .filter(p => defaultIds.includes(p.id))
        .map(p => p.id);
      
      // If found defaults, set them, otherwise fall back to all or just primary
      if (initialSelection.length > 0) {
        setVisibleProductIds(initialSelection);
      } else {
        setVisibleProductIds(products.map(p => p.id));
      }
    }
  }, [products]);

  const toggleProduct = (id: string) => {
    setVisibleProductIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; 
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const filteredData = useMemo(() => {
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-200 shadow-xl rounded-none text-xs z-50">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">{label}</p>
          <div className="flex flex-col gap-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2" style={{ backgroundColor: entry.color }}></span>
                  <span className="font-medium text-gray-600">{entry.name}</span>
                </div>
                <span className="font-bold text-gray-900 tabular-nums">
                  {entry.value.toLocaleString()} 
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-none border border-gray-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 border-b border-gray-100 pb-3">
        <div>
           <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <h2 className="text-lg font-serif font-bold text-gray-900">
                Biểu đồ giá vàng
              </h2>
              <span className="text-xs text-gray-500 font-medium border-l border-gray-300 pl-2">
                Cập nhật: {updateTime}
              </span>
           </div>
           
           {/* Spread Indicator */}
           {spreadText && (
             <p className="text-[13px] text-gray-700 font-medium">
               Chênh lệch trong nước/thế giới: <span className="text-vne-red font-bold text-base">{spreadText}</span> <span className="text-gray-500 text-xs">triệu/lượng</span>
             </p>
           )}
        </div>

        {/* Time Tabs */}
        <div className="flex items-center gap-2 shrink-0">
            <div className="flex border border-gray-200 bg-gray-50/50 rounded-sm p-0.5">
                {TIME_RANGES.map((range) => (
                    <button
                        key={range.key}
                        onClick={() => setTimeRange(range.key)}
                        className={`px-2 py-1 text-[10px] font-medium transition-all rounded-sm whitespace-nowrap ${
                            timeRange === range.key 
                            ? 'bg-white text-blue-700 shadow-sm font-bold' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Product Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
         {products.map((p, index) => { 
           const isActive = visibleProductIds.includes(p.id);
           const isWorld = p.group === 'world';
           const isPrimary = index === 0 && !isWorld; 
           
           let color = '#757575';
           if (isWorld) color = '#2563eb';
           else if (isPrimary) color = '#be123c';
           else color = OTHER_COLORS[(index - 1) % OTHER_COLORS.length] || OTHER_COLORS[0];

           return (
             <button
               key={p.id}
               onClick={() => toggleProduct(p.id)}
               className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[11px] font-medium transition-all ${
                 isActive 
                   ? 'bg-gray-50 text-gray-800 border-gray-300 shadow-sm' 
                   : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
               }`}
             >
               <span 
                  className={`w-2.5 h-2.5 rounded-full ${isActive ? '' : 'opacity-30'}`}
                  style={{ backgroundColor: color }}
               ></span>
               {p.name}
             </button>
           )
         })}
      </div>

      {/* Chart Area */}
      <div className="relative h-[300px] w-full text-[10px]">
         <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              minTickGap={40}
              tick={{ fill: '#64748b', fontSize: 10, dy: 10 }}
            />
            
            <YAxis 
              yAxisId="vnd"
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(val) => Math.round(val).toLocaleString()}
            />
            
            <YAxis 
              yAxisId="usd"
              orientation="right"
              domain={['auto', 'auto']}
              hide={!visibleProductIds.some(id => products.find(p => p.id === id)?.group === 'world')}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#2563eb', fontSize: 10, fontWeight: 'bold' }} 
              tickFormatter={(val) => Math.round(val).toLocaleString()}
            />

            <Tooltip content={<CustomTooltip />} />
            
            {products.map((p, index) => {
              if (!visibleProductIds.includes(p.id)) return null;
              
              const isWorld = p.group === 'world';
              const isPrimary = index === 0 && !isWorld;

              let color = '#757575';
              if (isWorld) color = '#2563eb';
              else if (isPrimary) color = '#be123c';
              else color = OTHER_COLORS[(index - 1) % OTHER_COLORS.length] || OTHER_COLORS[0];
              
              return (
                <Line
                  key={p.id}
                  yAxisId={isWorld ? "usd" : "vnd"}
                  type="monotone"
                  dataKey={p.id}
                  name={p.name}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: color }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};