
import React, { useState, useMemo } from 'react';
import { ComputedGoldProduct, HistoryPoint } from '../types';
import { TrendingUp, TrendingDown, ChevronsUpDown } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { formatGoldPrice } from '../services/goldData';

interface GoldTableProps {
  data: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  onRowClick: (product: ComputedGoldProduct) => void;
}

type SortKey = 'name' | 'todayBuy' | 'todaySell' | 'yesterdayBuy' | 'yesterdaySell' | 'change7d';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const TriangleUp = ({ size = 10, className = "" }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 10 8" fill="currentColor" className={className}>
    <path d="M5 0L10 8H0L5 0Z" />
  </svg>
);

const TriangleDown = ({ size = 10, className = "" }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 10 8" fill="currentColor" className={className}>
    <path d="M5 8L0 0H10L5 8Z" />
  </svg>
);

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

  const get7DayChange = (productId: string) => {
    if (historyData.length < 7) return 0;
    const oldPoint = historyData[historyData.length - 7];
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
      change7d: get7DayChange(product.id)
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
        case 'change7d': aValue = a.change7d; bValue = b.change7d; break;
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
        {isUp ? <TriangleUp size={8} /> : <TriangleDown size={8} />}
        <span className="ml-1">{Math.abs(value).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</span>
      </div>
    );
  };

  const SortHeader = ({ label, sortKey, className = "" }: { label: string, sortKey: SortKey, className?: string }) => (
    <th 
      onClick={() => handleSort(sortKey)}
      className={`cursor-pointer group select-none hover:bg-gray-100/80 transition-colors text-right ${className}`}
    >
      <div className="flex items-center justify-end gap-1.5">
        <span>{label}</span>
        <ChevronsUpDown 
          size={15} 
          className={`shrink-0 transition-all ${sortConfig.key === sortKey ? 'opacity-100 text-[#9f224e] scale-110' : 'opacity-40 group-hover:opacity-80'}`} 
          strokeWidth={2.5}
        />
      </div>
    </th>
  );

  return (
    <div className="bg-white border border-gray-200 shadow-sm flex flex-col font-sans rounded-none w-full overflow-hidden">
      <div className="p-3 sm:p-3 md:px-5 md:py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900 whitespace-nowrap">
            Bảng giá vàng
          </h2>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium border-l border-gray-300 pl-2 font-sans truncate">
            Triệu / lượng
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[320px]">
          <thead>
            {/* Tầng 1: Tiêu đề chính */}
            <tr className="bg-[#f8f9fb] border-b border-gray-200 text-[14px] sm:text-[15px] text-gray-600 font-bold">
              <th 
                rowSpan={2} 
                onClick={() => handleSort('name')}
                className="p-2 sm:p-2 md:pl-5 border-r border-gray-200 w-[33%] sm:w-[28%] text-gray-800 cursor-pointer group hover:bg-gray-100/50"
              >
                 <div className="flex items-center gap-1.5">
                    Loại <ChevronsUpDown size={15} strokeWidth={2.5} className={sortConfig.key === 'name' ? 'text-[#9f224e] opacity-100 scale-110' : 'opacity-40 group-hover:opacity-80'} />
                 </div>
              </th>
              
              <th colSpan={2} className="p-1 sm:p-1.5 text-center border-r border-gray-200 bg-white/50">
                <div className="flex flex-col items-center">
                    <span className="text-[#9f224e] font-black">Hôm nay</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-gray-500 mt-0.5">({todayStr})</span>
                </div>
              </th>

              <th colSpan={2} className="hidden md:table-cell p-1 sm:p-1.5 text-center border-r border-gray-200">
                <div className="flex flex-col items-center">
                    <span className="text-gray-700">Hôm qua</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-gray-400 mt-0.5">({yesterdayStr})</span>
                </div>
              </th>

              <th 
                rowSpan={2} 
                onClick={() => handleSort('change7d')}
                className="p-2 sm:p-2 md:pr-5 text-center w-[20%] sm:w-[150px] cursor-pointer group hover:bg-gray-100/50"
              >
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-800">Xu hướng</span>
                        <ChevronsUpDown size={15} strokeWidth={2.5} className={sortConfig.key === 'change7d' ? 'text-[#9f224e] opacity-100 scale-110' : 'opacity-40 group-hover:opacity-80'} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 mt-0.5 whitespace-nowrap">
                        <span className="sm:inline hidden">(Trong 7 ngày)</span>
                        <span className="sm:hidden inline">7 ngày</span>
                    </span>
                </div>
              </th>
            </tr>

            {/* Tầng 2: Mua/Bán */}
            <tr className="bg-[#f8f9fb] border-b border-gray-200 text-[13px] sm:text-[14px] text-gray-500 font-bold">
              <SortHeader label="Mua" sortKey="todayBuy" className="p-1.5 sm:p-1.5 border-r border-gray-100" />
              <SortHeader label="Bán" sortKey="todaySell" className="p-1.5 sm:p-1.5 border-r border-gray-100" />
              
              <SortHeader label="Mua" sortKey="yesterdayBuy" className="hidden md:table-cell p-1.5 sm:p-1.5 border-r border-gray-100" />
              <SortHeader label="Bán" sortKey="yesterdaySell" className="hidden md:table-cell p-1.5 sm:p-1.5 border-r border-gray-100" />
            </tr>
          </thead>

          <tbody className="text-[15px] sm:text-[16px]">
            {sortedData.map((product, index) => (
              <tr 
                key={product.id} 
                onClick={() => onRowClick(product)}
                className={`border-b border-gray-50 hover:bg-[#fff9fa] transition-colors cursor-pointer group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}
              >
                <td className="px-2 sm:px-4 md:pl-5 py-3 sm:py-1.5 border-r border-gray-100">
                  <div className="font-bold text-gray-900 leading-tight whitespace-normal text-[15px] sm:text-[16px]">
                    {product.name}
                  </div>
                </td>
                
                <td className="px-1 sm:px-3 py-2.5 sm:py-1 text-right border-r border-gray-50">
                  <div className="flex flex-col items-end">
                      <div className={`font-bold tabular-nums text-[15px] sm:text-[16px] ${sortConfig.key === 'todayBuy' ? 'text-gray-900' : 'text-gray-600'}`}>
                        {formatGoldPrice(product.today.buy, product.group)}
                      </div>
                      <ChangeIndicator value={product.changeBuy} />
                  </div>
                </td>
                <td className="px-1 sm:px-3 py-2.5 sm:py-1 text-right border-r border-gray-200 bg-vne-green/5">
                  <div className="flex flex-col items-end">
                      <div className={`font-black tabular-nums text-[15px] sm:text-[16px] ${sortConfig.key === 'todaySell' ? 'text-vne-green' : 'text-vne-green/90'}`}>
                        {formatGoldPrice(product.today.sell, product.group)}
                      </div>
                      <ChangeIndicator value={product.changeSell} />
                  </div>
                </td>

                <td className="hidden md:table-cell px-1 sm:px-3 py-2.5 sm:py-1 text-right border-r border-gray-50 bg-gray-50/30 text-gray-400">
                  <div className="font-semibold tabular-nums text-[14px]">
                    {formatGoldPrice(product.yesterday.buy, product.group)}
                  </div>
                </td>
                <td className="hidden md:table-cell px-1 sm:px-3 py-2.5 sm:py-1 text-right border-r border-gray-200 bg-gray-50/30 text-gray-400">
                  <div className="font-semibold tabular-nums text-[14px]">
                    {formatGoldPrice(product.yesterday.sell, product.group)}
                  </div>
                </td>

                <td className="px-1 sm:px-3 md:pr-5 py-2.5 sm:py-1">
                  <div className="flex flex-col items-center justify-center gap-1">
                      <div className={`text-[13px] sm:text-[14px] tabular-nums whitespace-nowrap ${product.change7d >= 0 ? 'text-[#007f3f]' : 'text-[#d60000]'}`}>
                          {product.change7d > 0 ? '+' : ''}{product.change7d.toFixed(1)}%
                      </div>
                      <div className="w-full h-[16px] sm:h-[18px]">
                          <Sparkline 
                              data={historyData} 
                              dataKey={product.id} 
                              trend={product.change7d >= 0 ? 'up' : 'down'}
                          />
                      </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Bảng giá vàng */}
      <div className="bg-white p-2.5 sm:p-2 md:px-5 md:py-3 border-t border-gray-100 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-[12px] text-gray-600">
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-1.5 font-bold tracking-tight">
                    <TriangleUp size={10} className="text-[#007f3f]" /> 
                    <span>Tăng <span className="hidden sm:inline">so với ngày trước</span></span>
                </div>
                <div className="flex items-center gap-1.5 font-bold tracking-tight">
                    <TriangleDown size={10} className="text-[#d60000]" /> 
                    <span>Giảm <span className="hidden sm:inline">so với ngày trước</span></span>
                </div>
                {/* Chú thích riêng cho Mobile: So với ngày trước nằm ngang */}
                <div className="sm:hidden text-gray-400 font-medium border-l border-gray-200 pl-3">
                    So với ngày trước
                </div>
            </div>
            {/* Ẩn dòng chữ Tự động cập nhật hoàn toàn trên Mobile */}
            <div className="italic text-[12px] sm:text-[11px] text-gray-400 font-medium ml-auto hidden sm:block">
                Tự động cập nhật: 5 phút/lần
            </div>
        </div>
      </div>
    </div>
  );
};
