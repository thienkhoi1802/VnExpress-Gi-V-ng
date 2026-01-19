import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GoldChart } from './GoldChart';
import { ComputedGoldProduct, HistoryPoint } from '../types';

interface ChartModalProps {
  product: ComputedGoldProduct | null;
  historyData: HistoryPoint[];
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({ product, historyData, onClose }) => {
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose} // Close when clicking the overlay
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside content from closing modal
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-500">{product.unit}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm border border-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-2 sm:p-4 bg-white">
          <GoldChart 
            products={[product]} 
            historyData={historyData} 
            title="Biểu đồ chi tiết"
          />
        </div>
      </div>
    </div>
  );
};