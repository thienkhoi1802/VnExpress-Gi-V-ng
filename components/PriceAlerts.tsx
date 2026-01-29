
import React, { useState } from 'react';
import { Bell, BellPlus, X, Trash2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Pencil } from 'lucide-react';
import { ComputedGoldProduct, PriceAlert } from '../types';

interface PriceAlertsProps {
  products: ComputedGoldProduct[];
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => void;
  onUpdateAlert?: (alert: PriceAlert) => void;
  onRemoveAlert: (id: string) => void;
  hideHeader?: boolean;
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({ products, alerts, onAddAlert, onUpdateAlert, onRemoveAlert, hideHeader = true }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [type, setType] = useState<'above' | 'below'>('above');
  const [priceType, setPriceType] = useState<'sell' | 'buy'>('sell');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const unitLabel = selectedProduct?.unit === 'USD/ounce' ? 'USD' : 'Triệu đồng';

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermissionStatus(result);
  };

  const handleEdit = (alert: PriceAlert) => {
    setEditingAlertId(alert.id);
    setSelectedProductId(alert.productId);
    setType(alert.type);
    setPriceType(alert.priceType);
    setTargetPrice(alert.targetPrice.toString());
    setIsAdding(true);
  };

  const handleAddOrUpdate = () => {
    const price = parseFloat(targetPrice);
    if (!price || !selectedProductId) return;

    if (editingAlertId && onUpdateAlert) {
      const existingAlert = alerts.find(a => a.id === editingAlertId);
      if (existingAlert) {
        onUpdateAlert({
          ...existingAlert,
          productId: selectedProductId,
          productName: selectedProduct?.name || 'Vàng',
          type,
          priceType,
          targetPrice: price,
          isActive: true // Reactivate when edited
        });
      }
    } else {
      onAddAlert({
        productId: selectedProductId,
        productName: selectedProduct?.name || 'Vàng',
        type,
        priceType,
        targetPrice: price
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setTargetPrice('');
    setEditingAlertId(null);
    setIsAdding(false);
  };

  return (
    <div className="bg-white font-sans overflow-hidden">
      {!hideHeader && (
        <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Bell size={18} className="text-vne-red" />
             <h2 className="text-lg font-serif font-bold text-gray-900">Cảnh báo giá</h2>
          </div>
        </div>
      )}

      <div className="p-4">
        {!isAdding && (
           <button 
             onClick={() => setIsAdding(true)}
             className="w-full mb-4 flex items-center justify-center gap-1.5 px-3 py-3 border-2 border-dashed border-gray-200 text-gray-500 text-xs font-bold hover:border-vne-red hover:text-vne-red transition-all rounded-sm"
           >
             <BellPlus size={16} /> <span>Thêm ngưỡng cảnh báo mới</span>
           </button>
        )}

        {permissionStatus === 'default' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[12px] text-blue-800 font-medium">Bật thông báo trình duyệt để nhận cập nhật ngay lập tức.</p>
              <button 
                onClick={requestPermission}
                className="mt-1 text-[11px] font-bold text-blue-700 underline hover:text-blue-900"
              >
                Cho phép nhận thông báo
              </button>
            </div>
          </div>
        )}

        {isAdding && (
          <div className="mb-6 p-4 border border-vne-red/20 bg-[#fffcfd] relative animate-in fade-in slide-in-from-top-2">
            <button onClick={resetForm} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
            <h3 className="text-[12px] font-bold text-vne-red mb-3 uppercase tracking-wide">
              {editingAlertId ? 'Chỉnh sửa ngưỡng giá' : 'Thiết lập ngưỡng giá'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Loại vàng</label>
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-10 px-2 border border-gray-300 text-[14px] font-bold text-gray-900 outline-none focus:border-vne-red bg-white"
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kiểu giá</label>
                  <div className="flex border border-gray-300 rounded-sm overflow-hidden h-10">
                    <button 
                      onClick={() => setPriceType('sell')}
                      className={`flex-1 text-[13px] font-bold whitespace-nowrap transition-all ${priceType === 'sell' ? 'bg-[#9f224e] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >Bán ra</button>
                    <button 
                      onClick={() => setPriceType('buy')}
                      className={`flex-1 text-[13px] font-bold whitespace-nowrap border-l border-gray-300 transition-all ${priceType === 'buy' ? 'bg-[#9f224e] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >Mua vào</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Điều kiện</label>
                  <div className="flex border border-gray-300 rounded-sm overflow-hidden h-10">
                    <button 
                      onClick={() => setType('above')}
                      className={`flex-1 flex items-center justify-center text-[13px] font-bold whitespace-nowrap transition-all ${type === 'above' ? 'bg-green-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                      Tăng<span className="hidden sm:inline"> lên</span>
                    </button>
                    <button 
                      onClick={() => setType('below')}
                      className={`flex-1 flex items-center justify-center text-[13px] font-bold border-l border-gray-300 whitespace-nowrap transition-all ${type === 'below' ? 'bg-red-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                      Giảm<span className="hidden sm:inline"> xuống</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Giá mục tiêu ({unitLabel})</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="Nhập giá..."
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full h-10 pl-3 pr-20 border border-gray-300 text-sm font-bold text-gray-900 outline-none focus:border-vne-red"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase pointer-events-none bg-white pl-1">
                    {unitLabel}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
               <button onClick={resetForm} className="px-4 py-1.5 text-[12px] font-bold text-gray-500">Hủy</button>
               <button onClick={handleAddOrUpdate} className="px-6 py-1.5 bg-vne-red text-white text-[12px] font-bold shadow-sm active:scale-95">
                 {editingAlertId ? 'Lưu thay đổi' : 'Thêm'}
               </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {alerts.length === 0 ? (
            <div className="py-6 sm:py-10 flex flex-col items-center justify-center text-gray-400">
                <Bell size={24} strokeWidth={1.5} className="mb-2 opacity-30 sm:size-32 sm:mb-3" />
                <p className="text-[14px] sm:text-[17px] font-bold text-gray-500 text-center px-4">Chưa có cảnh báo nào được thiết lập</p>
                <p className="text-[11px] sm:text-[13px] text-gray-400 mt-0.5 text-center px-6 leading-tight">Hệ thống sẽ gửi thông báo khi giá chạm ngưỡng bạn mong muốn</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-100 hover:border-gray-200 transition-colors group bg-white shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-full ${alert.type === 'above' ? 'bg-green-50 text-vne-green' : 'bg-red-50 text-[#bd0000]'}`}>
                    {alert.type === 'above' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[17px] sm:text-[19px] font-black text-gray-900 leading-tight">{alert.productName}</span>
                       <span className="text-[12px] px-2 py-0.5 bg-gray-100 text-gray-600 font-bold uppercase rounded-sm">
                         {alert.priceType === 'sell' ? 'Bán ra' : 'Mua vào'}
                       </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                       <span className="text-[14px] sm:text-[15px] font-medium text-gray-400">{alert.type === 'above' ? 'Tăng trên' : 'Giảm dưới'}</span>
                       <span className="text-[22px] sm:text-[24px] font-black text-gray-900 tabular-nums leading-none tracking-tight">
                         {alert.targetPrice.toLocaleString()}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEdit(alert)}
                    className="p-2 text-gray-300 hover:text-vne-red transition-colors"
                    title="Sửa"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => onRemoveAlert(alert.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {alerts.length > 0 && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2.5">
           <CheckCircle2 size={16} className="text-green-600" />
           <span className="text-[15px] font-normal text-gray-600">Hệ thống đang theo dõi giá trực tuyến</span>
        </div>
      )}
    </div>
  );
};
