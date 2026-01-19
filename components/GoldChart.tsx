import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Filter } from 'lucide-react';
import { ComputedGoldProduct, HistoryPoint, TimeRange } from '../types';

interface GoldChartProps {
  products: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  title?: string;
}

const COLORS = [
  '#9f224e', // New Brand Color
  '#2563eb', // blue-600
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#9333ea', // purple-600
  '#ea580c', // orange-600
  '#0891b2', // cyan-600
  '#4f46e5', // indigo-600
];

export const GoldChart: React.FC<GoldChartProps> = ({ 
  products, 
  historyData, 
  title = "Biểu đồ biến động" 
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  // Select first 2 products by default or all if less than 2
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      setSelectedProductIds(products.slice(0, 3).map(p => p.id));
    }
  }, [products]);

  // Filter history data based on time range
  const filteredData = useMemo(() => {
    const daysMap: Record<TimeRange, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365,
    };
    const days = daysMap[timeRange];
    // Get the last N items
    return historyData.slice(-days);
  }, [historyData, timeRange]);

  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(id)) {
        // Don't allow unselecting the last one
        if (prev.length === 1) return prev;
        return prev.filter(pid => pid !== id);
      }
      return [...prev, id];
    });
  };

  const hasWorld = products.some(p => p.group === 'world');
  const hasDomestic = products.some(p => p.group !== 'world');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4 mb-3">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-5 bg-gold-500 rounded-full block"></span>
            {title}
          </h2>
          <p className="text-[10px] text-gray-500 ml-3">Dữ liệu tổng hợp {timeRange === '365d' ? '1 năm' : timeRange.replace('d', ' ngày')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg">
            {(['7d', '30d', '90d', '365d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : range === '90d' ? '90 ngày' : '1 năm'}
              </button>
            ))}
          </div>
          
          {/* Mobile Filter Toggle */}
          <button 
            className="md:hidden p-1.5 bg-gray-100 rounded-lg text-gray-600"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Product Selection Chips */}
      <div className={`flex flex-wrap gap-1.5 mb-3 ${isFilterOpen ? 'block' : 'hidden md:flex'}`}>
        {products.map((product, index) => (
          <button
            key={product.id}
            onClick={() => toggleProduct(product.id)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium transition-colors ${
              selectedProductIds.includes(product.id)
                ? 'bg-gold-50 border-gold-200 text-gold-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: selectedProductIds.includes(product.id) ? COLORS[index % COLORS.length] : '#ccc' }}
            ></span>
            {product.name}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="h-[260px] w-full text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              minTickGap={30}
              tick={{ fill: '#6b7280' }}
            />
            
            {/* Left Axis for VND */}
            {hasDomestic && (
              <YAxis 
                yAxisId="left"
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value}`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280' }}
                label={{ value: 'Tr.đ', angle: -90, position: 'insideLeft', fill: '#9ca3af', style: { textAnchor: 'middle' }, offset: 10 }}
              />
            )}
            
            {/* Right Axis for USD (World Gold) */}
            {hasWorld && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value}`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af' }}
                label={{ value: 'USD', angle: 90, position: 'insideRight', fill: '#9ca3af', style: { textAnchor: 'middle' }, offset: 10 }}
              />
            )}

            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', padding: '1px 0' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#111827' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} iconSize={8} />

            {products.map((product, index) => {
              if (!selectedProductIds.includes(product.id)) return null;
              
              // Determine which axis to use
              const isWorld = product.group === 'world';
              const axisId = isWorld ? 'right' : 'left';
              
              return (
                <Line
                  key={product.id}
                  yAxisId={axisId}
                  type="monotone"
                  dataKey={product.id}
                  name={product.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-[10px] text-center text-gray-400 italic">
        * Biểu đồ tự động hiển thị trục giá phù hợp
      </div>
    </div>
  );
};