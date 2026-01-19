import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GoldChart } from './GoldChart';
import { ComputedGoldProduct, HistoryPoint } from '../types';

interface ChartModalProps {
  product: ComputedGoldProduct | null;
  worldProduct?: ComputedGoldProduct;
  historyData: HistoryPoint[];
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({ product, worldProduct, historyData, onClose }) => {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (product) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  // If the selected product is World, we don't need to add World again.
  // Otherwise, create a list [Selected, World] to pass to the chart
  const productsToShow = [product];
  if (worldProduct && product.id !== worldProduct.id) {
    productsToShow.push(worldProduct);
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f7f7f7]">
          <div>
            <h3 className="font-serif font-bold text-gray-900 text-lg">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">So sánh với giá thế giới</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-none hover:bg-[#9f224e] hover:text-white transition-colors border border-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 bg-white flex-1 overflow-y-auto">
          <GoldChart 
            products={productsToShow} 
            historyData={historyData} 
            title="Biểu đồ chi tiết"
          />
        </div>
      </div>
    </div>
  );
};