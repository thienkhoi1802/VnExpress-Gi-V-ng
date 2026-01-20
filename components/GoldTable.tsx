import React, { useState, useMemo } from 'react';
import { ComputedGoldProduct, HistoryPoint } from '../types';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, ChevronsUpDown } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface GoldTableProps {
  data: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  onRowClick: (product: ComputedGoldProduct) => void;
}

type SortKey = 'name' | 'todayBuy' | 'todaySell' | 'yesterdayBuy' | 'yesterdaySell' | 'change30d';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const GoldTable: React.FC<GoldTableProps> = ({ data, historyData, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'todaySell', direction: 'desc' });

  // Lấy ngày từ dữ liệu
  const todayStr = data[0]?.updatedAt.split(' ')[1] || '20/01/2026';
  
  // Tính toán ngày hôm qua
  const getYesterdayDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length < 2) return '19/01/2026';
    const day = parseInt(parts[0]);
    return `${(day - 1).toString().padStart(2, '0')}/${parts[1]}/${parts[2] || '2026'}`;
  };
  const yesterdayStr = getYesterdayDate(todayStr);

  const get30DayChange = (productId: string) => {
    if (historyData.length < 30) return 0;
    const oldPoint = historyData[historyData.length - 30];
    const oldPrice = parseFloat(oldPoint[productId] as string) || 0;
    const currentProduct = data.find(p => p.id === productId);
    if (!oldPrice || !currentProduct) return 0;
    return ((currentProduct.today.sell - oldPrice) / oldPrice) * 100;
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedData = useMemo(() => {
    const filteredData = data.filter(p => p.group !== 'world');

    const mappedData = filteredData.map(product => ({
      ...product,
      change30d: get30DayChange(product.id)
    }));

    if (!sortConfig.direction) return mappedData;

    return [...mappedData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name': aValue = a.name; bValue = b.name; break;
        case 'todayBuy': aValue = a.today.buy; bValue = b.today.buy; break;
        case 'todaySell': aValue = a.today.sell; bValue = b.today.sell; break;
        case 'yesterdayBuy': aValue = a.yesterday.buy; bValue = b.yesterday.buy; break;
        case 'yesterdaySell': aValue = a.yesterday.sell; bValue = b.yesterday.sell; break;
        case 'change30d': aValue = a.change30d; bValue = b.change30d; break;
        default: return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, historyData]);

  const ChangeIndicator = ({ value }: { value: number }) => {
    if (value === 0) return null;
    const isUp = value > 0;
    const colorClass = isUp ? 'text-[#007f3f]' : 'text-[#d60000]';
    return (
      <div className={`flex items-center justify-end text-[10px] sm:text-[11px] font-bold ${colorClass} tabular-nums mt-0.5`}>
        {isUp ? <ArrowUp size={9} strokeWidth={3} /> : <ArrowDown size={9} strokeWidth={3} />}
        <span>{Math.abs(value).toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</span>
      </div>
    );
  };

  const SortHeader = ({ label, sortKey, className = "" }: { label: string, sortKey: SortKey, className?: string }) => (
    <th 
      onClick={() => handleSort(sortKey)}
      className={`cursor-pointer group select-none hover:bg-gray-100/80 transition-colors text-right ${className}`}
    >
      <div className="flex items-center justify-end gap-1">
        <span>{label}</span>
        <ChevronsUpDown size={12} className={`shrink-0 transition-opacity ${sortConfig.key === sortKey ? 'opacity-100 text-[#9f224e]' : 'opacity-30 group-hover:opacity-60'}`} />
      </div>
    </th>
  );

  return (
    <div className="bg-white border border-gray-200 shadow-sm flex flex-col font-sans rounded-none w-full overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900 whitespace-nowrap">
            Bảng giá vàng
          </h2>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium border-l border-gray-300 pl-2 font-sans truncate">
            Triệu / lượng
          </span>
        </div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight hidden sm:block font-sans">Sắp xếp theo ý bạn</div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[320px]">
          <thead>
            {/* Tầng 1: Tiêu đề chính */}
            <tr className="bg-[#f8f9fb] border-b border-gray-200 text-[14px] sm:text-[16px] text-gray-600 font-bold">
              <th 
                rowSpan={2} 
                onClick={() => handleSort('name')}
                /* Tăng diện tích cột Loại trên Mobile (w-[40%]) để đọc đầy đủ text */
                className="p-2 sm:p-4 border-r border-gray-200 w-[40%] sm:w-[28%] text-gray-800 cursor-pointer group hover:bg-gray-100/50"
              >
                 <div className="flex items-center gap-1">
                    Loại <ChevronsUpDown size={12} className={sortConfig.key === 'name' ? 'text-[#9f224e]' : 'opacity-30'} />
                 </div>
              </th>
              
              <th colSpan={2} className="p-1 sm:p-3 text-center border-r border-gray-200 bg-white/50">
                <div className="flex flex-col items-center">
                    {/* Rút gọn text cho Mobile: 'Giá vàng' thay vì 'Giá vàng hôm nay' */}
                    <span className="text-[#9f224e] font-black sm:hidden">Giá vàng</span>
                    <span className="text-[#9f224e] font-black hidden sm:block">Giá vàng hôm nay</span>
                    <span className="text-[11px] sm:text-[13px] font-medium text-gray-500 mt-0.5">({todayStr})</span>
                </div>
              </th>

              <th colSpan={2} className="hidden md:table-cell p-1 sm:p-3 text-center border-r border-gray-200">
                <div className="flex flex-col items-center">
                    <span className="text-gray-700">Giá vàng hôm qua</span>
                    <span className="text-[11px] sm:text-[13px] font-medium text-gray-400 mt-0.5">({yesterdayStr})</span>
                </div>
              </th>

              <th 
                rowSpan={2} 
                onClick={() => handleSort('change30d')}
                /* Cột Xu hướng chiếm phần còn lại */
                className="p-2 sm:p-4 text-center w-[20%] sm:w-[150px] cursor-pointer group hover:bg-gray-100/50"
              >
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-800">Xu hướng</span>
                        <ChevronsUpDown size={12} className={sortConfig.key === 'change30d' ? 'text-[#9f224e]' : 'opacity-30'} />
                    </div>
                    {/* Giảm text phụ trên Mobile hoặc đảm bảo 1 dòng */}
                    <span className="text-[10px] sm:text-[12px] font-medium text-gray-400 mt-0.5 whitespace-nowrap">
                        <span className="sm:inline hidden">(Trong 30 ngày)</span>
                        <span className="sm:hidden inline">30 ngày</span>
                    </span>
                </div>
              </th>
            </tr>

            {/* Tầng 2: Mua/Bán - Đã điều chỉnh căn phải justify-end */}
            <tr className="bg-[#f8f9fb] border-b border-gray-200 text-[13px] sm:text-[14px] text-gray-500 font-bold">
              <SortHeader label="Mua" sortKey="todayBuy" className="p-1.5 sm:p-2.5 border-r border-gray-100" />
              <SortHeader label="Bán" sortKey="todaySell" className="p-1.5 sm:p-2.5 border-r border-gray-100" />
              
              <SortHeader label="Mua" sortKey="yesterdayBuy" className="hidden md:table-cell p-1.5 sm:p-2.5 border-r border-gray-100" />
              <SortHeader label="Bán" sortKey="yesterdaySell" className="hidden md:table-cell p-1.5 sm:p-2.5 border-r border-gray-100" />
            </tr>
          </thead>

          <tbody className="text-[15px] sm:text-[16px]">
            {sortedData.map((product, index) => (
              <tr 
                key={product.id} 
                onClick={() => onRowClick(product)}
                className={`border-b border-gray-50 hover:bg-[#fff9fa] transition-colors cursor-pointer group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}
              >
                <td className="px-2 sm:px-4 py-3 sm:py-5 border-r border-gray-100">
                  <div className="font-bold text-gray-900 leading-tight whitespace-normal text-[15px] sm:text-[16px]">
                    {product.name}
                  </div>
                </td>
                
                {/* Hôm nay */}
                <td className="px-1 sm:px-3 py-2.5 sm:py-4 text-right border-r border-gray-50">
                  <div className="flex flex-col items-end">
                      <div className={`font-bold tabular-nums text-[16px] sm:text-[16px] ${sortConfig.key === 'todayBuy' ? 'text-gray-900' : 'text-gray-600'}`}>
                        {product.today.buy.toLocaleString('vi-VN')}
                      </div>
                      <ChangeIndicator value={product.changeBuy} />
                  </div>
                </td>
                <td className="px-1 sm:px-3 py-2.5 sm:py-4 text-right border-r border-gray-200 bg-vne-green/5">
                  <div className="flex flex-col items-end">
                      <div className={`font-black tabular-nums text-[16px] sm:text-[16px] ${sortConfig.key === 'todaySell' ? 'text-vne-green' : 'text-vne-green/90'}`}>
                        {product.today.sell.toLocaleString('vi-VN')}
                      </div>
                      <ChangeIndicator value={product.changeSell} />
                  </div>
                </td>

                {/* Hôm qua (Chỉ Desktop) */}
                <td className="hidden md:table-cell px-1 sm:px-3 py-2.5 sm:py-4 text-right border-r border-gray-50 bg-gray-50/30 text-gray-400">
                  <div className="font-semibold tabular-nums">
                    {product.yesterday.buy.toLocaleString('vi-VN')}
                  </div>
                </td>
                <td className="hidden md:table-cell px-1 sm:px-3 py-2.5 sm:py-4 text-right border-r border-gray-200 bg-gray-50/30 text-gray-400">
                  <div className="font-semibold tabular-nums">
                    {product.yesterday.sell.toLocaleString('vi-VN')}
                  </div>
                </td>

                {/* Xu hướng - Đảm bảo text hiển thị trên 1 dòng */}
                <td className="px-1 sm:px-3 py-2.5 sm:py-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                      <div className={`font-black text-[11px] sm:text-[14px] tabular-nums whitespace-nowrap ${product.change30d >= 0 ? 'text-[#007f3f]' : 'text-[#d60000]'}`}>
                          {product.change30d > 0 ? '+' : ''}{product.change30d.toFixed(1)}%
                      </div>
                      <div className="w-full h-[16px] sm:h-[28px]">
                          <Sparkline 
                              data={historyData} 
                              dataKey={product.id} 
                              trend={product.change30d >= 0 ? 'up' : 'down'}
                          />
                      </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-2.5 sm:p-4 border-t border-gray-100 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] sm:text-xs text-gray-500">
            <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 font-bold text-gray-700 tracking-tight">
                    <TrendingUp size={14} className="text-[#007f3f]" /> <span>Tăng</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-gray-700 tracking-tight">
                    <TrendingDown size={14} className="text-[#d60000]" /> <span>Giảm</span>
                </div>
            </div>
            <div className="italic text-[12px] sm:text-[11px] text-gray-400 font-medium ml-auto">
                Tự động cập nhật: 5 phút/lần
            </div>
        </div>
      </div>
    </div>
  );
};