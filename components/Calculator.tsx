
import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCcw, ChevronDown, ChevronUp, Calculator as CalcIcon, Plus, Trash2, Wallet, X } from 'lucide-react';
import { ComputedGoldProduct } from '../types';

interface CalculatorProps {
  products: ComputedGoldProduct[];
}

interface PortfolioItem {
  id: string;
  productId: string;
  qtyLuong: number;
  qtyChi: number;
  qtyPhan: number;
}

const InputField = ({ 
  label, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  placeholder: string
}) => (
  <div className="flex flex-col relative group">
    <label className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-[#9f224e] transition-colors">
      {label}
    </label>
    <input 
      type="number" 
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3 border border-gray-300 rounded-sm font-bold text-gray-900 outline-none focus:border-[#9f224e] focus:ring-1 focus:ring-[#9f224e] placeholder-gray-300 transition-all bg-white shadow-sm tabular-nums text-[15px]"
    />
  </div>
);

export const Calculator: React.FC<CalculatorProps> = ({ products }) => {
  // Input States
  const [luong, setLuong] = useState<string>('');
  const [chi, setChi] = useState<string>('');
  const [phan, setPhan] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('sjc_1l');
  // Default to collapsed for mobile view
  const [isPortfolioCollapsed, setIsPortfolioCollapsed] = useState(true);
  
  // Portfolio State - Strictly use LocalStorage
  const [items, setItems] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('vne_gold_portfolio');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load portfolio", e);
      return [];
    }
  });

  // Save to LocalStorage whenever items change
  useEffect(() => {
    localStorage.setItem('vne_gold_portfolio', JSON.stringify(items));
  }, [items]);

  const vndProducts = products.filter(p => p.unit === 'Triệu đồng/lượng');

  // Calculate value for current input preview
  const currentProduct = vndProducts.find(p => p.id === selectedProductId);
  const currentPreviewValue = useMemo(() => {
    if (!currentProduct) return 0;
    const l = parseFloat(luong) || 0;
    const c = parseFloat(chi) || 0;
    const p = parseFloat(phan) || 0;
    const totalLuong = l + (c / 10) + (p / 100);
    return totalLuong * currentProduct.today.sell * 1000000;
  }, [luong, chi, phan, currentProduct]);

  // Derived Assets with Live Prices
  const assets = useMemo(() => {
    return items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const price = product ? product.today.sell : 0;
      const productName = product ? product.name : 'Sản phẩm không tồn tại';
      
      const totalLuong = item.qtyLuong + (item.qtyChi / 10) + (item.qtyPhan / 100);
      const totalValue = totalLuong * price * 1000000;

      return {
        ...item,
        productName,
        price,
        totalValue
      };
    });
  }, [items, products]);

  // Total Portfolio Value
  const grandTotal = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.totalValue, 0);
  }, [assets]);

  const handleAddAsset = () => {
    const l = parseFloat(luong) || 0;
    const c = parseFloat(chi) || 0;
    const p = parseFloat(phan) || 0;

    if (l === 0 && c === 0 && p === 0) return;

    const newItem: PortfolioItem = {
      id: Math.random().toString(36).substring(2, 11),
      productId: selectedProductId,
      qtyLuong: l,
      qtyChi: c,
      qtyPhan: p
    };

    setItems(prev => [newItem, ...prev]);
    setLuong('');
    setChi('');
    setPhan('');
    // Expand portfolio if it was collapsed when adding
    setIsPortfolioCollapsed(false);
  };

  const handleRemoveAsset = (id: string) => {
    setItems(prev => prev.filter(a => a.id !== id));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh mục?')) {
        setItems([]);
        localStorage.removeItem('vne_gold_portfolio');
        setLuong('');
        setChi('');
        setPhan('');
    }
  };

  const formatQuantity = (l: number, c: number, p: number) => {
    const parts = [];
    if (l > 0) parts.push(`${l}L`);
    if (c > 0) parts.push(`${c}C`);
    if (p > 0) parts.push(`${p}P`);
    return parts.join(' ');
  };

  return (
    <div className="bg-white border border-gray-200 font-sans rounded-none shadow-sm max-w-full overflow-hidden flex flex-col relative">
       
       {/* Main Title Header */}
       <div className="p-3 sm:p-4 md:px-5 md:py-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            Quản lý danh mục tài sản
          </h2>
       </div>

       <div className="flex flex-col md:flex-row">
          {/* LEFT PANEL: Input Form */}
          <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="p-3 sm:p-4 md:h-[56px] border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                 <h2 className="text-[16px] font-serif font-bold text-gray-900">
                   Nhập tài sản
                 </h2>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="w-full">
                  <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Chọn loại vàng</label>
                  <div className="h-10 border border-gray-300 bg-white relative shadow-sm rounded-sm group hover:border-gray-400 transition-colors">
                      <select 
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full h-full p-2 bg-transparent text-[14px] font-bold text-gray-900 outline-none appearance-none cursor-pointer pl-3 pr-8 truncate"
                      >
                          {vndProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.today.sell.toLocaleString('vi-VN')} tr)</option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-gray-600">
                         <ChevronDown size={16} />
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <InputField label="Lượng" value={luong} onChange={setLuong} placeholder="0" />
                 <InputField label="Chỉ" value={chi} onChange={setChi} placeholder="0" />
                 <InputField label="Phân" value={phan} onChange={setPhan} placeholder="0" />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleAddAsset}
                  disabled={currentPreviewValue === 0}
                  style={{ fontSize: '12pt', fontFamily: 'Arial, sans-serif' }}
                  className={`w-full h-10 flex items-center justify-center gap-2 font-bold rounded-sm shadow-sm transition-all ${
                    currentPreviewValue > 0 
                    ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={18} /> Thêm vào danh mục
                </button>
                {currentPreviewValue > 0 && (
                   <div className="mt-2 text-center text-[12px] text-gray-500 font-medium">
                      Tạm tính: <span className="font-bold text-[#9f224e]">{currentPreviewValue.toLocaleString('vi-VN', {maximumFractionDigits: 0})} VNĐ</span>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Portfolio List - Optimized min-height */}
          <div className="flex-1 bg-[#fffcfc] flex flex-col md:min-h-[240px]">
            <div className="p-3 sm:p-4 md:h-[56px] border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                 <h2 className="text-[16px] font-serif font-bold text-gray-900">
                   Danh mục
                 </h2>
                 {items.length > 0 && (
                   <span className="text-[11px] font-bold text-[#9f224e] bg-[#9f224e]/5 px-1.5 py-0.5 rounded-sm">
                     {items.length}
                   </span>
                 )}
              </div>
              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button 
                      onClick={handleReset}
                      className="hidden md:flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-600 font-bold transition-colors px-2 py-1 hover:bg-red-50 rounded-sm"
                  >
                      <Trash2 size={13} /> Xóa toàn bộ
                  </button>
                )}
                {/* Collapse/Expand Toggle for Mobile */}
                <button 
                  onClick={() => setIsPortfolioCollapsed(!isPortfolioCollapsed)}
                  className="md:hidden flex items-center gap-1 text-[12px] text-gray-600 font-bold border border-gray-200 px-3 py-1.5 rounded-sm bg-white active:bg-gray-50 transition-colors"
                >
                  {isPortfolioCollapsed ? (
                    <><ChevronDown size={14} /> Mở rộng</>
                  ) : (
                    <><ChevronUp size={14} /> Thu gọn</>
                  )}
                </button>
              </div>
            </div>

            <div className={`flex-1 p-0 overflow-y-auto max-h-[300px] no-scrollbar ${isPortfolioCollapsed ? 'hidden md:block' : 'block'}`}>
              {assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-400 py-6 sm:py-8 md:py-10 px-6 opacity-60">
                   <p className="text-[15px] font-bold text-gray-500 text-center">Chưa có tài sản nào</p>
                   <p className="text-[13px] text-center mt-1 leading-tight">
                     Hãy thêm loại vàng bạn đang sở hữu từ bảng <span className="md:hidden">phía trên</span><span className="hidden md:inline">bên trái</span>
                   </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-3 sm:px-4 sm:py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between group animate-in slide-in-from-left-2 duration-300">
                       <div className="flex-1 min-w-0 pr-2">
                          <div className="text-[15px] font-bold text-gray-900 truncate">{asset.productName}</div>
                          <div className="text-[12px] text-gray-500 font-medium mt-0.5">
                             SL: <span className="text-gray-900 font-bold">{formatQuantity(asset.qtyLuong, asset.qtyChi, asset.qtyPhan)}</span>
                             <span className="mx-1.5 opacity-30">|</span>
                             Giá: {asset.price.toLocaleString()} tr
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-[17px] font-bold text-[#9f224e] tabular-nums">
                            {asset.totalValue.toLocaleString('vi-VN', {maximumFractionDigits: 0})}
                          </div>
                          <button 
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="text-[11px] text-red-500 hover:text-red-700 underline font-bold mt-1 md:opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Xóa
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Total - Optimized for Mobile and Desktop space */}
            <div className={`p-3 md:py-3 md:px-4 bg-white border-t border-gray-100 ${isPortfolioCollapsed && assets.length > 0 ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] md:text-[11px] font-bold text-gray-500 uppercase tracking-tight">Tổng giá trị ước tính</span>
                  {assets.length > 0 && (
                    <button 
                        onClick={handleReset}
                        className="text-[11px] md:text-[11px] text-[#9f224e] font-bold hover:underline active:opacity-70 transition-opacity"
                    >
                        Xóa toàn bộ
                    </button>
                  )}
                </div>
                <div className="flex items-baseline justify-end gap-1 text-[#9f224e]">
                   <span className="text-[26px] md:text-[30px] font-black tabular-nums tracking-tighter leading-none">
                     {grandTotal.toLocaleString('vi-VN', {maximumFractionDigits: 0})}
                   </span>
                   <span className="text-[12px] md:text-[13px] font-bold uppercase">VNĐ</span>
                </div>
                <div className="mt-0.5 text-[9px] md:text-[9px] text-gray-400 text-right italic">
                  *Giá trị được tính theo giá bán ra hiện tại
                </div>
            </div>
            
            {/* Show summary when collapsed on mobile */}
            {isPortfolioCollapsed && assets.length > 0 && (
              <div className="md:hidden p-3 bg-white border-t border-gray-100 flex items-center justify-between animate-in fade-in cursor-pointer" onClick={() => setIsPortfolioCollapsed(false)}>
                 <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Tổng cộng:</span>
                 <div className="flex items-center gap-1.5">
                   <span className="text-[18px] font-black text-[#9f224e] tabular-nums">
                     {grandTotal.toLocaleString('vi-VN', {maximumFractionDigits: 0})} VNĐ
                   </span>
                   <ChevronUp size={14} className="text-gray-400" />
                 </div>
              </div>
            )}
          </div>
       </div>
    </div>
  );
};
