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
      setResult(amountInLuong * product.today.sell * 1_000_000);
    }
  }, [amount, unit, selectedProduct, products]);

  const handleIncrement = () => setAmount(prev => parseFloat((prev + 1).toFixed(1)));
  const handleDecrement = () => setAmount(prev => Math.max(0, parseFloat((prev - 1).toFixed(1))));

  return (
    <div className="bg-[#f0f0f0] border border-gray-300 p-4 sm:p-5 font-sans rounded-sm">
      <div className="mb-4 sm:mb-5 flex items-center justify-between">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
          Tính giá vàng
        </h2>
        <button 
            onClick={() => {setAmount(1); setUnit('luong');}}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-[#9f224e] font-bold transition-colors bg-white px-3 py-1.5 border border-gray-300 rounded shadow-sm"
         >
            <RefreshCcw size={14} /> Đặt lại
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end">
        
        {/* Quantity Group */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-gray-600 mb-2">Số lượng</label>
          <div className="flex h-10 border border-gray-400 bg-white group hover:border-[#9f224e] transition-colors shadow-sm rounded-sm overflow-hidden">
             <button 
               onClick={handleDecrement}
               className="w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 border-r border-gray-300 transition-colors active:bg-gray-300"
               aria-label="Giảm"
             >
               <Minus size={14} strokeWidth={3} />
             </button>
             <input 
              type="number" 
              min="0"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-center font-bold text-gray-900 outline-none h-full bg-white text-sm sm:text-base tabular-nums"
            />
            <button 
               onClick={handleIncrement}
               className="w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 border-l border-gray-300 transition-colors active:bg-gray-300"
               aria-label="Tăng"
             >
               <Plus size={14} strokeWidth={3} />
             </button>
          </div>
        </div>

        {/* Unit Select */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-gray-600 mb-2">Đơn vị</label>
          <div className="h-10 border border-gray-400 bg-white hover:border-[#9f224e] transition-colors relative shadow-sm rounded-sm">
             <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full h-full p-2 bg-transparent text-sm sm:text-base font-bold text-gray-900 outline-none appearance-none cursor-pointer pl-3"
            >
                <option value="luong">Lượng</option>
                <option value="chi">Chỉ</option>
                <option value="phan">Phân</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Product Select */}
        <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-gray-600 mb-2">Loại vàng</label>
            <div className="h-10 border border-gray-400 bg-white hover:border-[#9f224e] transition-colors relative shadow-sm rounded-sm">
                <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full h-full p-2 bg-transparent text-sm font-bold text-gray-900 outline-none appearance-none cursor-pointer pl-3 truncate pr-8"
                >
                    {vndProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                   <ChevronDown size={16} />
                </div>
            </div>
        </div>

        {/* Result Display: Centered and resized font */}
        <div className="md:col-span-5">
             <label className="block text-[11px] font-bold text-gray-600 mb-2 text-left">Thành tiền ước tính</label>
             <div className="h-10 flex items-center justify-center px-3 bg-[#9f224e] border border-[#9f224e] text-white overflow-hidden shadow-md rounded-sm">
                <div className="flex items-baseline truncate w-full justify-center">
                    <span className="text-lg sm:text-xl font-bold tabular-nums tracking-tight truncate">
                        {result.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-white/90 ml-1 underline decoration-dotted underline-offset-2 shrink-0">VNĐ</span>
                </div>
             </div>
        </div>

      </div>
      
      {/* Footer / Context Note */}
      <div className="mt-4 text-xs sm:text-sm text-gray-600 italic text-right border-t border-gray-300 pt-3">
         *Giá trị tính theo giá bán ra tại thời điểm cập nhật
      </div>
    </div>
  );
};