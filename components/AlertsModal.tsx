import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { PriceAlerts } from './PriceAlerts';
import { ComputedGoldProduct, PriceAlert } from '../types';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ComputedGoldProduct[];
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => void;
  onUpdateAlert: (alert: PriceAlert) => void;
  onRemoveAlert: (id: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ 
  isOpen, 
  onClose, 
  products, 
  alerts, 
  onAddAlert, 
  onUpdateAlert,
  onRemoveAlert 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f7f7f7]">
          <h3 className="font-serif font-bold text-gray-900 text-lg">Quản lý cảnh báo giá</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto">
          <PriceAlerts 
            products={products}
            alerts={alerts}
            onAddAlert={onAddAlert}
            onUpdateAlert={onUpdateAlert}
            onRemoveAlert={onRemoveAlert}
          />
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
           <button 
             onClick={onClose}
             className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold shadow-sm active:scale-95"
           >
             Đóng
           </button>
        </div>
      </div>
    </div>
  );
};