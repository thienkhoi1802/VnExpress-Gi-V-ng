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

  const updateTime = data[0]?.updatedAt.split(' ')[1] || 'Hôm nay';
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
    const filteredData = data.filter(p => p.group !== 'world');

    const sortableItems = filteredData.map(product => ({
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
            size={10} 
            className={`${isActive && sortConfig.direction === 'asc' ? 'text-gray-900 font-bold' : 'text-gray-400'}`} 
            strokeWidth={isActive && sortConfig.direction === 'asc' ? 3 : 2}
        />
        <ArrowDown 
            size={10} 
            className={`${isActive && sortConfig.direction === 'desc' ? 'text-gray-900 font-bold' : 'text-gray-400'}`}
            strokeWidth={isActive && sortConfig.direction === 'desc' ? 3 : 2}
        />
      </div>
    );
  };

  const DiffBadge = ({ value }: { value: number }) => {
    if (value === 0) return <span className="text-gray-400 text-[10px] font-medium mt-0.5">-</span>;
    // Darker colors for better contrast
    const color = value > 0 ? 'text-[#007f3f]' : 'text-[#d60000]'; 
    return (
        <span className={`inline-flex items-center text-[11px] font-bold mt-0.5 ${color}`}>
            {value > 0 ? '+' : ''}{Math.abs(value).toLocaleString('vi-VN')}
        </span>
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm flex flex-col font-sans overflow-x-auto rounded-sm">
      {/* Header Section Inside Box - Matching GoldChart Style */}
      <div className="px-3 sm:px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between sticky left-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900">Bảng giá chi tiết</h2>
               <span className="text-xs sm:text-sm text-gray-600 font-medium sm:border-l sm:border-gray-400 sm:pl-2 font-sans">
                 Cập nhật: {updateTime}
              </span>
          </div>
      </div>

      <div className="w-full font-sans min-w-[360px] md:min-w-0">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            {/* Top Header Row: Hidden on Mobile */}
            <tr className="hidden md:table-row bg-gray-100 border-b border-gray-300 text-sm text-gray-700 font-bold tracking-wider">
              <th className="p-3 border-r border-gray-300"></th>
              <th colSpan={3} className="p-3 text-center border-r border-gray-400 bg-[#e0e0e0] text-gray-900">
                Hôm nay ({todayStr})
              </th>
              <th colSpan={2} className="p-3 text-center border-r border-gray-300">
                Hôm qua ({yesterdayStr})
              </th>
              <th colSpan={2} className="p-3 text-center">
                Xu hướng
              </th>
            </tr>
            
            {/* Bottom Header Row: Columns */}
            <tr className="bg-gray-50 border-b border-gray-300 text-[11px] sm:text-sm text-gray-700 font-bold tracking-wider">
              {/* Name Column */}
              <th 
                className="px-2 sm:px-3 py-2 sm:py-3 cursor-pointer hover:bg-gray-200 border-r border-gray-300 w-auto min-w-[80px] md:min-w-[180px]"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center justify-between gap-1">
                    Loại vàng <SortIcon columnKey='name' />
                </div>
              </th>
              
              {/* Today Group */}
              <th className="px-1 sm:px-3 py-2 sm:py-3 text-right cursor-pointer hover:bg-gray-200 border-r border-gray-300 min-w-[75px]" onClick={() => requestSort('buy')}>
                <div className="flex items-center justify-end gap-1">
                    Mua <span className="hidden sm:inline">vào</span> <SortIcon columnKey='buy' />
                </div>
              </th>
              <th className="px-1 sm:px-3 py-2 sm:py-3 text-right cursor-pointer hover:bg-gray-200 border-r border-gray-300 min-w-[75px]" onClick={() => requestSort('sell')}>
                 <div className="flex items-center justify-end gap-1">
                    Bán <span className="hidden sm:inline">ra</span> <SortIcon columnKey='sell' />
                </div>
              </th>
              <th className="hidden md:table-cell px-1 py-3 text-center cursor-pointer hover:bg-gray-200 border-r border-gray-300 w-[50px]" onClick={() => requestSort('spread')}>
                 <div className="flex items-center justify-center gap-1">
                    CL <SortIcon columnKey='spread' />
                </div>
              </th>

              {/* Yesterday Group - Hidden on Mobile */}
              <th className="hidden md:table-cell px-1.5 py-3 text-right text-gray-500 font-medium border-r border-gray-200">Giá mua</th>
              <th className="hidden md:table-cell px-1.5 py-3 text-right text-gray-500 font-medium border-r border-gray-300">Giá bán</th>

              {/* Trend Group */}
              <th className="px-1 sm:px-3 py-2 sm:py-3 text-right cursor-pointer hover:bg-gray-200 border-r border-gray-200 w-[50px] md:w-[75px]" onClick={() => requestSort('change30d')}>
                 <div className="flex items-center justify-end gap-1">
                    <span className="sm:hidden">+/-</span><span className="hidden sm:inline">% 30N</span> <SortIcon columnKey='change30d' />
                </div>
              </th>
              <th className="hidden md:table-cell px-2 py-3 text-center w-[85px]">Biểu đồ</th>
            </tr>
          </thead>
          
          <tbody className="text-sm sm:text-base">
            {sortedData.map((product, index) => (
              <tr 
                key={product.id} 
                onClick={() => onRowClick(product)}
                className={`border-b border-gray-200 hover:bg-[#ffeef2] transition-colors cursor-pointer group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Column 1: Name */}
                <td className="px-2 sm:px-3 py-2 sm:py-3 align-middle border-r border-gray-200">
                  <div className="font-bold text-gray-900 text-[12px] sm:text-base leading-snug break-words md:whitespace-nowrap">
                    {product.name}
                  </div>
                </td>

                {/* TODAY Buy: Stacked (Price Top, Trend Bottom) */}
                <td className="px-1 sm:px-3 py-2 sm:py-3 text-right group-hover:bg-transparent border-r border-gray-200 align-middle">
                  <div className="flex flex-col items-end">
                      {/* Buy Price: Dark Blue/Gray */}
                      <div className="font-bold text-[#1e3a8a] tabular-nums text-[13px] sm:text-[17px] tracking-tight leading-none">
                        {product.today.buy.toLocaleString('vi-VN')}
                      </div>
                      <div className="flex justify-end">
                         <DiffBadge value={product.changeBuy} />
                      </div>
                  </div>
                </td>

                {/* TODAY Sell: Stacked (Price Top, Trend Bottom) */}
                <td className="px-1 sm:px-3 py-2 sm:py-3 text-right group-hover:bg-transparent border-r border-gray-200 md:border-r-gray-200 align-middle">
                  <div className="flex flex-col items-end">
                      {/* Sell Price: Red - Same size as Buy */}
                      <div className="font-black text-[#bd0000] tabular-nums text-[13px] sm:text-[17px] tracking-tight leading-none">
                        {product.today.sell.toLocaleString('vi-VN')}
                      </div>
                      <div className="flex justify-end">
                         <DiffBadge value={product.changeSell} />
                      </div>
                  </div>
                </td>

                {/* Spread (Desktop) */}
                <td className="hidden md:table-cell px-1 py-3 text-center group-hover:bg-transparent border-r border-gray-200 align-middle">
                    <span className="inline-block text-sm font-bold text-gray-600 tabular-nums bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded shadow-sm">
                        {product.spread.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                    </span>
                </td>

                {/* YESTERDAY Data (Desktop) */}
                <td className="hidden md:table-cell px-1.5 py-3 text-right text-gray-600 tabular-nums border-r border-gray-200 text-sm align-middle">
                   {product.yesterday.buy.toLocaleString('vi-VN')}
                </td>
                <td className="hidden md:table-cell px-1.5 py-3 text-right text-gray-600 tabular-nums border-r border-gray-200 text-sm align-middle">
                   {product.yesterday.sell.toLocaleString('vi-VN')}
                </td>

                {/* TREND % */}
                <td className="px-1 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200 align-middle">
                     <span className={`text-[11px] sm:text-sm font-bold tabular-nums block whitespace-nowrap ${product.change30d >= 0 ? 'text-[#007f3f]' : 'text-[#d60000]'}`}>
                        {product.change30d > 0 ? '+' : ''}{product.change30d.toFixed(1)}%
                    </span>
                </td>

                {/* Chart (Desktop) */}
                <td className="hidden md:table-cell px-2 py-3 w-[85px] relative align-middle">
                    <div className="w-[70px] h-[32px] opacity-70 group-hover:opacity-30 transition-opacity mx-auto">
                        <Sparkline 
                            data={historyData} 
                            dataKey={product.id} 
                            trend={product.change30d >= 0 ? 'up' : 'down'}
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white border border-gray-400 text-gray-700 shadow p-1.5 hover:bg-[#9f224e] hover:text-white hover:border-[#9f224e] transition-all rounded" title="Xem biểu đồ">
                            <BarChart2 size={16} />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#f0f0f0] p-3 sm:p-4 border-t border-gray-300 text-xs sm:text-sm text-gray-600 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 items-center font-sans sticky left-0">
        <div className="flex items-center gap-2">
            <Info size={14} />
            <span className="font-bold text-gray-900">Ghi chú:</span>
        </div>
        
        <div className="font-medium text-gray-800">Đơn vị: Triệu đồng/lượng</div>
        <div className="hidden sm:block w-px h-4 bg-gray-400"></div>

        <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-700 border border-green-800"></span>
            <span>Tăng</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-700 border border-red-800"></span>
            <span>Giảm</span>
        </div>
        <div className="ml-auto italic hidden sm:block font-medium">
            Tự động cập nhật 15p/lần
        </div>
      </div>
    </div>
  );
};