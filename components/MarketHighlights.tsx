import React from 'react';
import { ComputedGoldProduct, Trend } from '../types';
import { TrendingUp, TrendingDown, Globe, Award } from 'lucide-react';

interface Props {
  data: ComputedGoldProduct[];
}

export const MarketHighlights: React.FC<Props> = ({ data }) => {
  const worldGold = data.find(p => p.group === 'world');
  const sjcGold = data.find(p => p.group === 'sjc'); // Usually the first SJC item is the main one
  
  // Find biggest mover
  const biggestMover = [...data].sort((a, b) => Math.abs(b.percentSell) - Math.abs(a.percentSell))[0];

  const StatCard = ({ title, product, icon: Icon, colorClass }: any) => {
    if (!product) return null;
    const isUp = product.trendSell === Trend.UP;
    
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
            <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')}`} />
          </div>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isUp ? 'bg-green-100 text-green-700' : product.trendSell === Trend.DOWN ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            {isUp ? '+' : ''}{product.percentSell.toFixed(2)}%
          </span>
        </div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{title}</div>
        <div className="text-lg font-black text-gray-900 tabular-nums tracking-tight">
          {product.today.sell.toLocaleString('vi-VN')}
        </div>
        <div className="text-[10px] text-gray-400 mt-1 truncate">
            {product.unit === 'Triệu đồng/lượng' ? 'Tr.đ/lượng' : 'USD/ounce'}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      <StatCard 
        title="Thế giới" 
        product={worldGold} 
        icon={Globe} 
        colorClass="bg-blue-500 text-blue-600" 
      />
      <StatCard 
        title="SJC Bán ra" 
        product={sjcGold} 
        icon={Award} 
        colorClass="bg-gold-500 text-gold-600" 
      />
      <StatCard 
        title="Biến động nhất" 
        product={biggestMover} 
        icon={biggestMover?.trendSell === Trend.UP ? TrendingUp : TrendingDown} 
        colorClass="bg-purple-500 text-purple-600" 
      />
    </div>
  );
};