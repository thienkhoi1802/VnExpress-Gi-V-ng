import React, { useEffect, useState } from 'react';
import { ComputedGoldProduct, Trend } from '../types';
import { ArrowUp, ArrowDown, BellRing, Bell } from 'lucide-react';

interface Props {
  sjc?: ComputedGoldProduct;
  world?: ComputedGoldProduct;
  updatedAt?: string;
  onOpenAlerts: () => void;
  hasActiveAlerts: boolean;
}

export const StickyMiniBar: React.FC<Props> = ({ sjc, world, updatedAt, onOpenAlerts, hasActiveAlerts }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
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
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-md z-[60] transform transition-transform duration-300 animate-in slide-in-from-top">
      <div className="max-w-[760px] mx-auto px-4 h-11 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
          <PriceItem label="SJC Bán" product={sjc} />
          <div className="h-3 w-px bg-gray-200 shrink-0"></div>
          <PriceItem label="Thế giới" product={world} />
        </div>
        
        <div className="flex items-center gap-3 ml-2">
           <div className="hidden md:flex text-[10px] text-gray-400 font-medium whitespace-nowrap">
              Cập nhật: {updatedAt?.split(' ')[1] || updatedAt?.split(' ')[0]}
           </div>
           
           <button 
              onClick={onOpenAlerts}
              className={`flex items-center gap-1.5 px-2 py-1 border transition-all rounded-sm shadow-sm group ${hasActiveAlerts ? 'bg-vne-red/5 border-vne-red/30 text-vne-red' : 'bg-gray-50 border-gray-200 text-gray-700 hover:text-vne-red'}`}
            >
               <div className="relative">
                 {hasActiveAlerts ? (
                   <>
                    <BellRing size={14} className="text-vne-red animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-vne-red rounded-full border border-white"></span>
                   </>
                 ) : (
                   <Bell size={14} className="group-hover:text-vne-red" />
                 )}
               </div>
               <span className="text-[10px] font-bold uppercase whitespace-nowrap hidden sm:inline">Cảnh báo</span>
            </button>
        </div>
      </div>
    </div>
  );
};
