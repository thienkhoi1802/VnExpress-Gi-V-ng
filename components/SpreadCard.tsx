import React from 'react';
import { ComputedGoldProduct } from '../types';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface Props {
  data: ComputedGoldProduct[];
}

export const SpreadCard: React.FC<Props> = ({ data }) => {
  const sjc = data.find(p => p.group === 'sjc');
  const world = data.find(p => p.group === 'world');

  if (!sjc || !world) return null;

  const USD_VND_RATE = 25400;
  const TAEL_TO_OUNCE = 1.20565;
  
  const worldPriceInVndTael = (world.today.sell * USD_VND_RATE * TAEL_TO_OUNCE) / 1000000;
  const diff = sjc.today.sell - worldPriceInVndTael;

  return (
    <div className="bg-orange-50 border border-orange-100 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      
      {/* Dòng 1: Tiêu đề + Giá trị */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-orange-800 shrink-0">
          <div className="bg-white p-1 shadow-sm">
             <TrendingUp size={14} className="text-orange-600" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-tight">Chênh lệch SJC / Thế giới:</span>
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className="text-base font-black text-vne-red tabular-nums leading-none">
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
          </span>
          <span className="text-[10px] font-semibold text-gray-500">tr.đ/lượng</span>
        </div>
      </div>

      {/* Dòng 2: Link Lịch sử only */}
      <div className="flex items-center justify-end gap-3 flex-1 min-w-0 border-t sm:border-t-0 border-orange-200/50 pt-1.5 sm:pt-0">
         <button className="flex items-center gap-1 text-[10px] text-blue-700 font-bold hover:text-blue-800 hover:underline whitespace-nowrap ml-auto sm:ml-0">
            Lịch sử <ArrowRight size={10} />
         </button>
      </div>
    </div>
  );
};