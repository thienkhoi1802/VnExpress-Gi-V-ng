import React from 'react';
import { Globe, Flag, DollarSign } from 'lucide-react';

export const ContextModule: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      
      {/* Ticket 4: Reduced Cognitive Load - 3 Specific Bullets */}
      <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
        <h3 className="font-serif font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">
          Điều gì đang xảy ra?
        </h3>
        <ul className="space-y-3">
             <li className="flex gap-3 items-start">
               <div className="mt-0.5 min-w-[20px]"><Globe size={16} className="text-blue-600" /></div>
               <span className="text-[13px] text-gray-800 leading-snug font-medium">
                 Vàng thế giới chịu áp lực bán tháo kỹ thuật khi USD phục hồi nhẹ.
               </span>
             </li>
             <li className="flex gap-3 items-start">
               <div className="mt-0.5 min-w-[20px]"><Flag size={16} className="text-vne-red" /></div>
               <span className="text-[13px] text-gray-800 leading-snug font-medium">
                 Nhu cầu vàng nhẫn trong nước tăng đột biến dịp cận Tết.
               </span>
             </li>
             <li className="flex gap-3 items-start">
               <div className="mt-0.5 min-w-[20px]"><DollarSign size={16} className="text-green-600" /></div>
               <span className="text-[13px] text-gray-800 leading-snug font-medium">
                 Tỷ giá ngân hàng ổn định, chênh lệch thị trường tự do thu hẹp.
               </span>
             </li>
        </ul>
      </div>

    </div>
  );
};