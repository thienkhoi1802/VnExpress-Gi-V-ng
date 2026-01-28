import React, { useState, useEffect } from 'react';
import { Minus, Plus, RefreshCcw, ChevronDown } from 'lucide-react';
import { ComputedGoldProduct } from '../types';

interface CalculatorProps {
  products: ComputedGoldProduct[];
}

type Unit = 'luong' | 'chi' | 'phan';

export const Calculator: React.FC<CalculatorProps> = ({ products }) => {
  const [amount, setAmount] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>('luong');
  const [selectedProduct, setSelectedProduct] = useState<string>('sjc_1l');
  const [result, setResult] = useState<number>(0);

  const vndProducts = products.filter(p => p.unit === 'Triệu đồng/lượng');

  useEffect(() => {
    const product = vndProducts.find(p => p.id === selectedProduct);
    if (product) {
      let amountInLuong = amount;
      if (unit === 'chi') amountInLuong = amount / 10;
      else if (unit === 'phan') amountInLuong = amount / 100;
      setResult(amountInLuong * product.today.sell * 1000000);
    }
  }, [amount, unit, selectedProduct, products]);

  const handleIncrement = () => setAmount(prev => parseFloat((prev + 1).toFixed(1)));
  const handleDecrement = () => setAmount(prev => Math.max(0, parseFloat((prev - 1).toFixed(1))));

  return (
    <div className="bg-white border border-gray-200 font-sans rounded-none shadow-sm max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-serif font-bold text-gray-900">
          Tính giá vàng
        </h2>
        <button 
            onClick={() => {setAmount(1); setUnit('luong');}}
            className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-[#9f224e] font-bold transition-all bg-white px-2.5 py-1.5 border border-gray-200 rounded-sm shadow-sm active:scale-95"
         >
            <RefreshCcw size={14} /> Đặt lại
         </button>
      </div>

      <div className="p-4 sm:p-5">
        {/* Layout: Grid on mobile, Flex row with TOP ALIGNMENT (items-start) on desktop */}
        <div className="grid grid-cols-2 md:flex md:flex-row md:items-start gap-3 sm:gap-4">
          
          {/* Quantity Block */}
          <div className="flex flex-col col-span-1 md:w-32">
            <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Số lượng</label>
            <div className="flex h-10 border border-gray-300 bg-white shadow-sm rounded-sm overflow-hidden">
               <button 
                 onClick={handleDecrement}
                 className="w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 border-r border-gray-200 active:bg-gray-200 transition-colors"
               >
                 <Minus size={14} strokeWidth={2.5} />
               </button>
               <input 
                type="number" 
                min="0"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-center font-bold text-gray-900 outline-none h-full bg-white text-base tabular-nums"
              />
              <button 
                 onClick={handleIncrement}
                 className="w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 border-l border-gray-200 active:bg-gray-200 transition-colors"
               >
                 <Plus size={14} strokeWidth={2.5} />
               </button>
            </div>
          </div>

          {/* Unit Block */}
          <div className="flex flex-col col-span-1 md:w-28">
            <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Đơn vị</label>
            <div className="h-10 border border-gray-300 bg-white relative shadow-sm rounded-sm">
               <select 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                  className="w-full h-full p-2 bg-transparent text-sm font-bold text-gray-900 outline-none appearance-none cursor-pointer pl-3"
              >
                  <option value="luong">Lượng</option>
                  <option value="chi">Chỉ</option>
                  <option value="phan">Phân</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Gold Type Block */}
          <div className="flex flex-col col-span-2 md:flex-1">
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Loại vàng</label>
              <div className="h-10 border border-gray-300 bg-white relative shadow-sm rounded-sm">
                  <select 
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full h-full p-2 bg-transparent text-sm font-bold text-gray-900 outline-none appearance-none cursor-pointer pl-3 pr-8 truncate"
                  >
                      {vndProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                     <ChevronDown size={16} />
                  </div>
              </div>
          </div>

          {/* Result Block */}
          <div className="flex flex-col col-span-2 md:w-64">
               <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Thành tiền ước tính</label>
               <div className="h-10 flex items-center justify-end px-4 bg-[#9f224e] text-white shadow-sm rounded-sm">
                  <div className="flex items-baseline gap-1 overflow-hidden">
                      <span className="text-[20px] sm:text-[22px] font-black tabular-nums tracking-tighter truncate leading-none">
                          {result.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-[10px] font-bold text-white/90 border-b border-white/30 leading-none pb-0.5 shrink-0 uppercase">VNĐ</span>
                  </div>
               </div>
               {/* Footer Disclaimer: Right-aligned, attached with 4px margin */}
               <div className="mt-1 text-[11px] text-gray-400 italic text-right font-medium">
                  *Giá trị tính theo giá bán ra tại thời điểm cập nhật
               </div>
          </div>

        </div>
      </div>
    </div>
  );
};