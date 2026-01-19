import React, { useState, useMemo } from 'react';
import { ComputedGoldProduct, HistoryPoint } from '../types';
import { ArrowUp, ArrowDown, Info, BarChart2 } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface GoldTableProps {
  data: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  onRowClick: (product: ComputedGoldProduct) => void;
}

type SortKey = 'name' | 'buy' | 'sell' | 'spread' | 'change30d';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const GoldTable: React.FC<GoldTableProps> = ({ data, historyData, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const todayStr = data[0]?.updatedAt.split(' ')[1] || 'Hôm nay';
  const parts = todayStr.split('/');
  const yesterdayStr = parts.length === 3 
    ? `${parseInt(parts[0]) - 1}/${parts[1]}` 
    : 'Hôm qua';

  const get30DayChange = (productId: string) => {
    if (historyData.length < 30) return 0;
    const oldPoint = historyData[historyData.length - 30];
    const oldPrice = parseFloat(oldPoint[productId] as string) || 0;
    const currentProduct = data.find(p => p.id === productId);
    if (!oldPrice || !currentProduct) return 0;
    return ((currentProduct.today.sell - oldPrice) / oldPrice) * 100;
  };

  const sortedData = useMemo(() => {
    const sortableItems = data.map(product => ({
      ...product,
      spread: product.today.sell - product.today.buy,
      change30d: get30DayChange(product.id)
    }));

    return sortableItems.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortConfig.key) {
        case 'name': aValue = a.name; break;
        case 'buy': aValue = a.today.buy; break;
        case 'sell': aValue = a.today.sell; break;
        case 'spread': aValue = a.spread; break;
        case 'change30d': aValue = a.change30d; break;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, historyData]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <div className="flex flex-col ml-1 -space-y-1.5 inline-flex align-middle opacity-50 hover:opacity-100">
        <ArrowUp 
            size={8} 
            className={`${isActive && sortConfig.direction === 'asc' ? 'text-blue-700 font-bold' : 'text-gray-400'}`} 
            strokeWidth={isActive && sortConfig.direction === 'asc' ? 3 : 2}
        />
        <ArrowDown 
            size={8} 
            className={`${isActive && sortConfig.direction === 'desc' ? 'text-blue-700 font-bold' : 'text-gray-400'}`}
            strokeWidth={isActive && sortConfig.direction === 'desc' ? 3 : 2}
        />
      </div>
    );
  };

  const DiffBadge = ({ value }: { value: number }) => {
    if (value === 0) return <span className="text-gray-300 text-[10px] ml-1">-</span>;
    const color = value > 0 ? 'text-trend-up' : 'text-trend-down';
    return (
        <span className={`inline-flex items-center text-[10px] font-bold ml-1 ${color}`}>
            {value > 0 ? '+' : ''}{Math.abs(value).toLocaleString('vi-VN')}
        </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm flex flex-col font-sans">
      <div className="w-full">
        <table className="w-full text-left border-collapse table-fixed md:table-auto">
          <thead>
            {/* Top Header Row: Hidden on Mobile */}
            <tr className="hidden md:table-row bg-gray-100 border-b border-gray-200 text-[10px] uppercase text-gray-600 font-bold tracking-wider">
              <th className="p-2 border-r border-gray-200"></th>
              <th colSpan={3} className="p-2 text-center border-r border-gray-300 bg-[#e5e5e5] text-gray-900">
                Hôm nay ({todayStr})
              </th>
              <th colSpan={2} className="p-2 text-center border-r border-gray-200">
                Hôm qua ({yesterdayStr})
              </th>
              <th colSpan={2} className="p-2 text-center">
                Xu hướng
              </th>
            </tr>
            
            {/* Bottom Header Row: Columns */}
            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase text-gray-500 font-bold tracking-wider">
              <th 
                className="p-2 cursor-pointer hover:bg-gray-100 border-r border-gray-200 w-[140px] sm:w-auto"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center justify-between">
                    Loại vàng <SortIcon columnKey='name' />
                </div>
              </th>
              
              {/* Today Group */}
              <th className="p-2 text-right cursor-pointer hover:bg-gray-100 border-r border-gray-200" onClick={() => requestSort('buy')}>
                <div className="flex items-center justify-end gap-1">
                    Giá Mua <SortIcon columnKey='buy' />
                </div>
              </th>
              <th className="p-2 text-right cursor-pointer hover:bg-gray-100 border-r border-gray-200" onClick={() => requestSort('sell')}>
                 <div className="flex items-center justify-end gap-1">
                    Giá Bán <SortIcon columnKey='sell' />
                </div>
              </th>
              <th className="hidden md:table-cell p-2 text-center cursor-pointer hover:bg-gray-100 border-r border-gray-200 w-[90px]" onClick={() => requestSort('spread')}>
                 <div className="flex items-center justify-center gap-1">
                    Chênh lệch <SortIcon columnKey='spread' />
                </div>
              </th>

              {/* Yesterday Group - Hidden on Mobile */}
              <th className="hidden md:table-cell p-2 text-right text-gray-400 font-medium border-r border-gray-100">Giá Mua</th>
              <th className="hidden md:table-cell p-2 text-right text-gray-400 font-medium border-r border-gray-200">Giá Bán</th>

              {/* Trend Group */}
              <th className="p-2 text-right cursor-pointer hover:bg-gray-100 border-r border-gray-100 w-[90px]" onClick={() => requestSort('change30d')}>
                 <div className="flex items-center justify-end gap-1">
                    % 30 Ngày <SortIcon columnKey='change30d' />
                </div>
              </th>
              <th className="hidden md:table-cell p-2 text-center w-[100px]">Biểu đồ</th>
            </tr>
          </thead>
          
          <tbody className="text-sm">
            {sortedData.map((product, index) => (
              <tr 
                key={product.id} 
                onClick={() => onRowClick(product)}
                className={`border-b border-gray-100 hover:bg-[#fcf0f4] transition-colors cursor-pointer group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
              >
                {/* Column 1: Name */}
                <td className="p-2 align-middle border-r border-gray-100">
                  <div className="font-bold text-gray-900 text-[13px] sm:text-sm leading-tight">{product.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{product.unit}</div>
                  
                  {/* Mobile-only Spread display */}
                  <div className="md:hidden text-[10px] text-gray-400 mt-1 font-medium">
                     CL: {product.spread.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                  </div>
                </td>

                {/* TODAY Buy */}
                <td className="p-2 text-right group-hover:bg-transparent border-r border-gray-100 align-middle">
                  <div className="font-semibold text-gray-700 tabular-nums">
                    {product.today.buy.toLocaleString('vi-VN')}
                  </div>
                  <DiffBadge value={product.changeBuy} />
                  
                  {/* Mobile Yesterday Data */}
                  <div className="md:hidden mt-1 text-[10px] text-gray-400 tabular-nums border-t border-gray-200 pt-0.5">
                     {product.yesterday.buy.toLocaleString('vi-VN')}
                  </div>
                </td>

                {/* TODAY Sell */}
                <td className="p-2 text-right group-hover:bg-transparent border-r border-gray-100 md:border-r-gray-100 align-middle">
                  <div className="font-bold text-gray-900 tabular-nums text-[14px] sm:text-[15px]">
                    {product.today.sell.toLocaleString('vi-VN')}
                  </div>
                  <DiffBadge value={product.changeSell} />

                   {/* Mobile Yesterday Data */}
                   <div className="md:hidden mt-1 text-[10px] text-gray-400 tabular-nums border-t border-gray-200 pt-0.5">
                     {product.yesterday.sell.toLocaleString('vi-VN')}
                  </div>
                </td>

                {/* Spread (Desktop) */}
                <td className="hidden md:table-cell p-2 text-center group-hover:bg-transparent border-r border-gray-100 align-middle">
                    <span className="inline-block text-xs font-bold text-gray-500 tabular-nums bg-gray-50 border border-gray-200 px-1.5 py-0.5 shadow-sm">
                        {product.spread.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                    </span>
                </td>

                {/* YESTERDAY Buy (Desktop) */}
                <td className="hidden md:table-cell p-2 text-right text-gray-500 tabular-nums border-r border-gray-100 text-[13px] align-middle">
                   {product.yesterday.buy.toLocaleString('vi-VN')}
                </td>
                {/* YESTERDAY Sell (Desktop) */}
                <td className="hidden md:table-cell p-2 text-right text-gray-500 tabular-nums border-r border-gray-100 text-[13px] align-middle">
                   {product.yesterday.sell.toLocaleString('vi-VN')}
                </td>

                {/* TREND % */}
                <td className="p-2 text-right border-r border-gray-100 align-middle">
                     <span className={`text-[11px] sm:text-xs font-bold tabular-nums block ${product.change30d >= 0 ? 'text-trend-up' : 'text-trend-down'}`}>
                        {product.change30d > 0 ? '+' : ''}{product.change30d.toFixed(2)}%
                    </span>
                    {/* Mobile Chart Hint */}
                    <div className="md:hidden mt-1 flex justify-end">
                       <BarChart2 size={12} className="text-gray-400" />
                    </div>
                </td>

                {/* Chart (Desktop) */}
                <td className="hidden md:table-cell p-2 w-[100px] relative align-middle">
                    <div className="w-[80px] h-[28px] opacity-60 group-hover:opacity-20 transition-opacity">
                        <Sparkline 
                            data={historyData} 
                            dataKey={product.id} 
                            trend={product.change30d >= 0 ? 'up' : 'down'}
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white border border-gray-300 text-gray-600 shadow-sm p-1.5 hover:bg-[#9f224e] hover:text-white hover:border-[#9f224e] transition-all" title="Xem biểu đồ">
                            <BarChart2 size={16} />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#f7f7f7] p-2 sm:p-3 border-t border-gray-200 text-[10px] text-gray-500 flex flex-wrap gap-x-4 gap-y-2 items-center">
        <div className="flex items-center gap-1">
            <Info size={12} />
            <span className="font-bold">Ghi chú:</span>
        </div>
        <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600"></span>
            <span>Tăng</span>
        </div>
        <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600"></span>
            <span>Giảm</span>
        </div>
        <div className="ml-auto italic hidden sm:block">
            Tự động cập nhật 15p/lần
        </div>
      </div>
    </div>
  );
};