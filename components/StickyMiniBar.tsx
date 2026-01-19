import React, { useEffect, useState } from 'react';
import { ComputedGoldProduct, Trend } from '../types';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  sjc?: ComputedGoldProduct;
  world?: ComputedGoldProduct;
  updatedAt?: string;
}

export const StickyMiniBar: React.FC<Props> = ({ sjc, world, updatedAt }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the snapshot area (~300px)
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const PriceItem = ({ label, product }: { label: string, product?: ComputedGoldProduct }) => {
    if (!product) return null;
    const isUp = product.trendSell === Trend.UP;
    const ColorIcon = isUp ? ArrowUp : product.trendSell === Trend.DOWN ? ArrowDown : null;
    const colorClass = isUp ? 'text-trend-up' : product.trendSell === Trend.DOWN ? 'text-trend-down' : 'text-gray-500';

    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-gray-500 uppercase text-[10px] font-bold">{label}</span>
        <span className={`font-bold tabular-nums ${colorClass}`}>
          {product.today.sell.toLocaleString('vi-VN')}
        </span>
        {ColorIcon && <ColorIcon size={12} className={colorClass} />}
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-md z-50 transform transition-transform duration-300 animate-in slide-in-from-top">
      <div className="max-w-[760px] mx-auto px-4 h-10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <PriceItem label="SJC Bán" product={sjc} />
          <div className="h-3 w-px bg-gray-200"></div>
          <PriceItem label="Thế giới" product={world} />
        </div>
        
        <div className="hidden sm:flex text-[10px] text-gray-400 font-medium">
           Cập nhật: {updatedAt?.split(' ')[0]}
        </div>
      </div>
    </div>
  );
};