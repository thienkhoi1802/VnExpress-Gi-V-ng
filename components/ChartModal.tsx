import React, { useEffect, useState } from 'react';
import { X, Bell, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { GoldChart } from './GoldChart';
import { ComputedGoldProduct, HistoryPoint, PriceAlert } from '../types';

interface ChartModalProps {
  product: ComputedGoldProduct | null;
  worldProduct?: ComputedGoldProduct;
  historyData: HistoryPoint[];
  hourlyData?: HistoryPoint[];
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => void;
  onRemoveAlert: (id: string) => void;
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({ 
  product, 
  worldProduct, 
  historyData, 
  hourlyData,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onClose 
}) => {
  const [showQuickAlert, setShowQuickAlert] = useState(false);
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [priceType, setPriceType] = useState<'sell' | 'buy'>('sell');
  const [targetPrice, setTargetPrice] = useState<string>('');

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

  const productsToShow = [product];
  if (worldProduct && product.id !== worldProduct.id) {
    productsToShow.push(worldProduct);
  }

  const updateDate = product.updatedAt.includes(' ') 
    ? product.updatedAt.split(' ')[1] 
    : product.updatedAt;

  const activeAlertForProduct = alerts.find(a => a.productId === product.id && a.isActive);

  const handleAddQuickAlert = () => {
    const price = parseFloat(targetPrice);
    if (!price) return;

    onAddAlert({
      productId: product.id,
      productName: product.name,
      type: alertType,
      priceType: priceType,
      targetPrice: price
    });
    
    setTargetPrice('');
    setShowQuickAlert(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matched to screenshot style */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-serif font-bold text-gray-900 text-[22px] sm:text-[24px] truncate">{product.name}</h3>
              <button 
                onClick={() => setShowQuickAlert(!showQuickAlert)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${activeAlertForProduct || showQuickAlert ? 'bg-vne-red text-white border-vne-red' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
              >
                <Bell size={18} className={activeAlertForProduct ? "animate-pulse" : ""} />
                <span className="text-[12px] font-bold uppercase hidden sm:inline">Thông báo giá</span>
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mt-1 font-sans">Cập nhật: {updateDate}</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-4 p-2 bg-white rounded-none hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Improved Alert Setup UI */}
        {showQuickAlert && (
          <div className="p-4 sm:p-6 bg-[#fff9fa] border-b border-vne-red/10 animate-in slide-in-from-top-2 font-sans">
            <div className="flex items-center gap-2 mb-4">
               <AlertCircle size={18} className="text-vne-red" />
               <h4 className="text-[14px] font-bold text-vne-red uppercase tracking-wider">Thiết lập ngưỡng báo giá</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Buy/Sell Selector */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Kiểu giá</label>
                <div className="flex border border-gray-300 bg-white h-10 rounded-sm overflow-hidden">
                   <button 
                    onClick={() => setPriceType('sell')}
                    className={`flex-1 text-[12px] font-bold transition-all ${priceType === 'sell' ? 'bg-[#9f224e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                   >Bán ra</button>
                   <button 
                    onClick={() => setPriceType('buy')}
                    className={`flex-1 text-[12px] font-bold border-l border-gray-300 transition-all ${priceType === 'buy' ? 'bg-[#9f224e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                   >Mua vào</button>
                </div>
              </div>

              {/* Condition Selector */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Điều kiện</label>
                <div className="flex border border-gray-300 bg-white h-10 rounded-sm overflow-hidden">
                    <button 
                      onClick={() => setAlertType('above')}
                      className={`flex-1 flex items-center justify-center gap-1 text-[12px] font-bold transition-all ${alertType === 'above' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <TrendingUp size={14} /> Tăng trên
                    </button>
                    <button 
                      onClick={() => setAlertType('below')}
                      className={`flex-1 flex items-center justify-center gap-1 text-[12px] font-bold border-l border-gray-300 transition-all ${alertType === 'below' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <TrendingDown size={14} /> Giảm dưới
                    </button>
                </div>
              </div>

              {/* Target Price Input */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Giá mục tiêu (Triệu đồng)</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Nhập giá..."
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 text-sm font-bold text-gray-900 outline-none focus:border-vne-red shadow-inner"
                />
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex gap-2">
                 <button onClick={handleAddQuickAlert} className="flex-1 h-10 bg-vne-red text-white text-[13px] font-bold shadow-md active:scale-95 transition-all">Thiết lập</button>
              </div>
            </div>

            {activeAlertForProduct && (
              <div className="mt-4 flex items-center justify-between text-[14px] bg-white p-3 rounded-sm border border-vne-red/20 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2">
                   <div className={`p-1 rounded-full ${activeAlertForProduct.type === 'above' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {activeAlertForProduct.type === 'above' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                   </div>
                   <span className="text-gray-700 font-medium">
                     Đang theo dõi: <strong>Giá {activeAlertForProduct.priceType === 'sell' ? 'Bán ra' : 'Mua vào'}</strong> {activeAlertForProduct.type === 'above' ? 'tăng trên' : 'giảm dưới'} <strong className="text-vne-red text-[16px]">{activeAlertForProduct.targetPrice.toLocaleString()}</strong>
                   </span>
                </div>
                <button onClick={() => onRemoveAlert(activeAlertForProduct.id)} className="text-vne-red font-bold hover:underline text-[13px] px-3">Hủy thông báo</button>
              </div>
            )}
          </div>
        )}
        
        <div className="p-4 bg-white flex-1 overflow-y-auto no-scrollbar">
          <GoldChart 
            products={productsToShow} 
            historyData={historyData} 
            hourlyData={hourlyData}
            title={product.name}
            showInternalTitle={false}
          />
        </div>
      </div>
    </div>
  );
};