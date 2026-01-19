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
    <div className="bg-[#f0f0f0] border border-gray-300 p-5 font-sans rounded-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-gray-900">
          Tính giá vàng
        </h2>
        <button 
            onClick={() => {setAmount(1); setUnit('luong');}}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#9f224e] font-bold transition-colors bg-white px-3 py-1.5 border border-gray-300 rounded shadow-sm"
         >
            <RefreshCcw size={14} /> Đặt lại
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        
        {/* Quantity Group: Input + Stepper - Minimum height 48px for Seniors */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Số lượng</label>
          <div className="flex h-12 border border-gray-400 bg-white group hover:border-[#9f224e] transition-colors shadow-sm rounded-sm overflow-hidden">
             <button 
               onClick={handleDecrement}
               className="w-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 border-r border-gray-300 transition-colors active:bg-gray-300"
               aria-label="Giảm"
             >
               <Minus size={20} strokeWidth={2.5} />
             </button>
             <input 
              type="number" 
              min="0"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-center font-bold text-gray-900 outline-none h-full bg-white text-lg"
            />
            <button 
               onClick={handleIncrement}
               className="w-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 border-l border-gray-300 transition-colors active:bg-gray-300"
               aria-label="Tăng"
             >
               <Plus size={20} strokeWidth={2.5} />
             </button>
          </div>
        </div>

        {/* Unit Select - Height 48px */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Đơn vị</label>
          <div className="h-12 border border-gray-400 bg-white hover:border-[#9f224e] transition-colors relative shadow-sm rounded-sm">
             <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full h-full p-2 bg-transparent text-base font-bold text-gray-900 outline-none appearance-none cursor-pointer pl-4"
            >
                <option value="luong">Lượng</option>
                <option value="chi">Chỉ</option>
                <option value="phan">Phân</option>
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Product Select - Height 48px */}
        <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Loại vàng</label>
            <div className="h-12 border border-gray-400 bg-white hover:border-[#9f224e] transition-colors relative shadow-sm rounded-sm">
                <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full h-full p-2 bg-transparent text-base font-bold text-gray-900 outline-none appearance-none cursor-pointer pl-4 truncate pr-8"
                >
                    {vndProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                   <ChevronDown size={20} />
                </div>
            </div>
        </div>

        {/* Result Display - High contrast, Very Large */}
        <div className="md:col-span-3">
             <label className="block text-xs font-bold text-gray-600 uppercase mb-2 text-right md:text-left">Thành tiền ước tính</label>
             <div className="h-12 flex items-center justify-end px-4 bg-[#9f224e] border border-[#9f224e] text-white overflow-hidden whitespace-nowrap shadow-md rounded-sm">
                <span className="text-2xl font-bold tabular-nums tracking-tight">
                    {result.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-medium text-white/90 ml-2 underline decoration-dotted underline-offset-2">VNĐ</span>
             </div>
        </div>

      </div>
      
      {/* Footer / Context Note */}
      <div className="mt-4 text-sm text-gray-600 italic text-right border-t border-gray-300 pt-3">
         *Giá trị tính theo giá bán ra tại thời điểm cập nhật
      </div>
    </div>
  );
};
import { ChevronDown } from 'lucide-react';