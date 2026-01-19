import React from 'react';
import { ComputedGoldProduct, HistoryPoint, Trend } from '../types';
import { TrendIndicator } from './TrendIndicator';
import { Sparkline } from './Sparkline';

interface GoldTableProps {
  data: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  onRowClick: (product: ComputedGoldProduct) => void;
}

export const GoldTable: React.FC<GoldTableProps> = ({ data, historyData, onRowClick }) => {
  if (data.length === 0) return null;

  const isWorldTable = data.every(p => p.group === 'world');
  const dateParts = data[0]?.updatedAt.split(' ') || [];
  const yesterdayStr = 'Hôm qua'; // Simplified for table header

  const renderRow = (product: ComputedGoldProduct, index: number) => {
    const chartTrend = product.trendSell === Trend.UP ? 'up' : product.trendSell === Trend.DOWN ? 'down' : 'flat';
    
    // Alternating background for better readability
    const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]';

    return (
      <tr 
        key={product.id} 
        onClick={() => onRowClick(product)}
        className={`group border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${rowBg}`}
      >
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
             {/* Simple clean text, maybe bold for emphasis */}
             <div className="flex flex-col">
               <span className="font-bold text-gray-900 text-sm group-hover:text-vne-red transition-colors">
                 {product.name}
               </span>
               <span className="text-[11px] text-gray-500 font-normal">
                 {product.unit}
               </span>
             </div>
          </div>
        </td>

        {/* Buy Price */}
        <td className="px-4 py-3.5 text-right">
          <div className="font-bold text-gray-900 text-sm tabular-nums">
            {product.today.buy.toLocaleString('vi-VN')}
          </div>
          {!isWorldTable && (
            <div className="flex justify-end mt-0.5 opacity-80">
              <TrendIndicator trend={product.trendBuy} value={product.changeBuy} />
            </div>
          )}
        </td>

        {/* Sell Price (Highlighted) */}
        <td className="px-4 py-3.5 text-right relative">
          <div className="font-bold text-gray-900 text-sm tabular-nums">
            {product.today.sell.toLocaleString('vi-VN')}
          </div>
          {!isWorldTable && (
            <div className="flex justify-end mt-0.5 opacity-80">
              <TrendIndicator trend={product.trendSell} value={product.changeSell} />
            </div>
          )}
        </td>
        
        {/* Yesterday Comparison Columns (Hidden on smaller screens, kept for desktop context) */}
        {!isWorldTable && (
          <>
            <td className="px-4 py-3.5 text-right text-gray-500 text-sm tabular-nums hidden lg:table-cell">
              {product.yesterday.buy.toLocaleString('vi-VN')}
            </td>
            <td className="px-4 py-3.5 text-right text-gray-500 text-sm tabular-nums hidden lg:table-cell">
              {product.yesterday.sell.toLocaleString('vi-VN')}
            </td>
          </>
        )}

        <td className="px-4 py-3.5 w-[120px] hidden sm:table-cell">
           <div className="opacity-60 group-hover:opacity-100 transition-opacity">
            <Sparkline 
              data={historyData} 
              dataKey={product.id} 
              trend={chartTrend} 
            />
           </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-600 tracking-wider">Loại vàng</th>
            <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-600 tracking-wider text-right">Mua vào</th>
            <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-600 tracking-wider text-right">Bán ra</th>
            {!isWorldTable && (
              <>
                <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500 tracking-wider text-right hidden lg:table-cell">Mua hôm qua</th>
                <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500 tracking-wider text-right hidden lg:table-cell">Bán hôm qua</th>
              </>
            )}
            <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-600 tracking-wider text-right hidden sm:table-cell w-[120px]">Xu hướng</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((product, i) => renderRow(product, i))}
        </tbody>
      </table>
    </div>
  );
};