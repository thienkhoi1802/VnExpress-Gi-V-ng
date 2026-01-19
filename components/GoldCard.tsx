import React from 'react';
import { ComputedGoldProduct, HistoryPoint, Trend } from '../types';
import { Sparkline } from './Sparkline';
import { TrendIndicator } from './TrendIndicator';

interface GoldCardProps {
  product: ComputedGoldProduct;
  historyData: HistoryPoint[];
  onClick?: () => void;
}

export const GoldCard: React.FC<GoldCardProps> = ({ product, historyData, onClick }) => {
  const isWorld = product.group === 'world';
  const chartTrend = product.trendSell === Trend.UP ? 'up' : product.trendSell === Trend.DOWN ? 'down' : 'flat';

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
          {product.name}
        </h3>
        
        <div className="flex items-end gap-6">
          {/* Sell Price (Primary) */}
          <div className="flex flex-col">
             <span className="text-[10px] uppercase text-gray-500 mb-0.5">Bán ra</span>
             <div className="flex items-center gap-2">
                <span className={`text-base font-bold tabular-nums ${product.trendSell === Trend.UP ? 'text-trend-up' : product.trendSell === Trend.DOWN ? 'text-trend-down' : 'text-gray-900'}`}>
                  {product.today.sell.toLocaleString('vi-VN')}
                </span>
                {!isWorld && <TrendIndicator trend={product.trendSell} value={product.changeSell} showValue={false} />}
             </div>
          </div>

          {/* Buy Price (Secondary) */}
          <div className="flex flex-col">
             <span className="text-[10px] uppercase text-gray-500 mb-0.5">Mua vào</span>
             <span className="text-sm font-semibold text-gray-700 tabular-nums">
               {product.today.buy.toLocaleString('vi-VN')}
             </span>
          </div>
        </div>
      </div>

      <div className="w-[70px] h-[35px] shrink-0">
        <Sparkline 
          data={historyData} 
          dataKey={product.id} 
          trend={chartTrend} 
        />
      </div>
    </div>
  );
};