import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
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

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
      
      {/* Inputs Group */}
      <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Quantity */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số lượng</label>
          <div className="flex bg-white rounded border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-vne-red focus-within:border-vne-red transition-all">
            <input 
              type="number" 
              min="0"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-2 text-sm font-bold text-gray-900 outline-none"
            />
            <div className="border-l border-gray-200 bg-gray-50">
                <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Unit)}
                    className="h-full p-2 bg-transparent text-xs font-semibold text-gray-600 outline-none cursor-pointer"
                >
                    <option value="luong">Lượng</option>
                    <option value="chi">Chỉ</option>
                    <option value="phan">Phân</option>
                </select>
            </div>
          </div>
        </div>

        {/* Product Select */}
        <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Loại vàng</label>
            <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 bg-white text-sm text-gray-900 font-medium outline-none focus:ring-1 focus:ring-vne-red focus:border-vne-red h-[38px]"
            >
                {vndProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Result Group */}
      <div className="w-full md:w-auto flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm md:min-w-[280px]">
         <div className="bg-vne-red/10 p-2 rounded-full text-vne-red hidden md:block">
            <ArrowRight size={18} />
         </div>
         <div className="flex-1 text-right md:text-left">
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Thành tiền ước tính</div>
            <div className="text-xl font-black text-vne-red tabular-nums leading-none mt-1">
                {result.toLocaleString('vi-VN')}
                <span className="text-sm font-medium text-gray-400 ml-1">₫</span>
            </div>
         </div>
         
         {/* Reset Button (Optional visual aid) */}
         <button 
            onClick={() => {setAmount(1); setUnit('luong');}}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors md:hidden"
         >
            <RotateCcw size={16} />
         </button>
      </div>
    </div>
  );
};