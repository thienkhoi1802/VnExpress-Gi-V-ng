import React, { useState, useEffect } from 'react';
import { Minus, Plus, RefreshCcw } from 'lucide-react';
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
    <div className="bg-[#f7f7f7] border border-[#e5e5e5] p-4 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-gray-900">
          Tính giá vàng
        </h2>
        <button 
            onClick={() => {setAmount(1); setUnit('luong');}}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#9f224e] font-medium transition-colors"
         >
            <RefreshCcw size={12} /> Đặt lại
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Quantity Group: Input + Stepper */}
        <div className="md:col-span-3">
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số lượng</label>
          <div className="flex h-10 border border-[#bdbdbd] bg-white group hover:border-gray-400 transition-colors">
             <button 
               onClick={handleDecrement}
               className="w-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 border-r border-[#e5e5e5] transition-colors"
             >
               <Minus size={14} />
             </button>
             <input 
              type="number" 
              min="0"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-center font-bold text-gray-900 outline-none h-full"
            />
            <button 
               onClick={handleIncrement}
               className="w-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 border-l border-[#e5e5e5] transition-colors"
             >
               <Plus size={14} />
             </button>
          </div>
        </div>

        {/* Unit Select */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Đơn vị</label>
          <div className="h-10 border border-[#bdbdbd] bg-white hover:border-gray-400 transition-colors relative">
             <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full h-full p-2 bg-transparent text-sm font-semibold text-gray-900 outline-none appearance-none cursor-pointer pl-3"
            >
                <option value="luong">Lượng</option>
                <option value="chi">Chỉ</option>
                <option value="phan">Phân</option>
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Product Select */}
        <div className="md:col-span-4">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Loại vàng</label>
            <div className="h-10 border border-[#bdbdbd] bg-white hover:border-gray-400 transition-colors relative">
                <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full h-full p-2 bg-transparent text-sm font-semibold text-gray-900 outline-none appearance-none cursor-pointer pl-3"
                >
                    {vndProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>

        {/* Result Display - Matches Input Height */}
        <div className="md:col-span-3">
             <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 text-right md:text-left">Thành tiền ước tính</label>
             <div className="h-10 flex items-center justify-end px-3 bg-[#9f224e] border border-[#9f224e] text-white overflow-hidden whitespace-nowrap shadow-sm">
                <span className="text-lg font-bold tabular-nums tracking-tight">
                    {result.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-medium text-white/80 ml-1 underline decoration-dotted underline-offset-2">đ</span>
             </div>
        </div>

      </div>
      
      {/* Footer / Context Note */}
      <div className="mt-3 text-[11px] text-gray-500 italic text-right border-t border-gray-200 pt-2">
         *Giá trị tính theo giá bán ra tại thời điểm cập nhật
      </div>
    </div>
  );
};