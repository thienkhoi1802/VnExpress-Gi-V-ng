import React, { useState } from 'react';
import { ComputedGoldProduct } from '../types';
import { ArrowUp, ArrowDown, Minus, BarChart2, RefreshCcw, Globe, Image as ImageIcon, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface Props {
  data: ComputedGoldProduct[];
  onProductClick: (p: ComputedGoldProduct) => void;
  activeTab: 'vn' | 'world';
  setActiveTab: (tab: 'vn' | 'world') => void;
}

// Exchange rates mock
const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 0.92, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', rate: 0.79, flag: '🇬🇧' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', rate: 150.5, flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', rate: 1.35, flag: '🇨🇦' },
];

const KITCO_TIME_RANGES = [
  { label: '30 ngày', url: 'https://www.kitco.com/LFgif/au0030lnb.gif' },
  { label: '60 ngày', url: 'https://www.kitco.com/LFgif/au0060lnb.gif' },
  { label: '6 tháng', url: 'https://www.kitco.com/LFgif/au0182nyb.gif' },
  { label: '1 năm', url: 'https://www.kitco.com/LFgif/au0365nyb.gif' },
  { label: '5 năm', url: 'https://www.kitco.com/LFgif/au1825nyb.gif' },
  { label: '10 năm', url: 'https://www.kitco.com/LFgif/au3650nyb.gif' },
];

export const MarketHighlights: React.FC<Props> = ({ data, onProductClick, activeTab, setActiveTab }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [kitcoRangeIndex, setKitcoRangeIndex] = useState(0);

  const sjc = data.find(p => p.group === 'sjc');
  const jewelry = data.find(p => p.group === 'jewelry'); 
  const world = data.find(p => p.group === 'world');

  // Standardized Vietnam Flag
  const VietnamFlag = () => (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-[2px] shadow-sm ring-1 ring-black/5">
      <rect width="24" height="16" fill="#DA251D"/>
      <path d="M12 3.5L13.9056 7.64166L18.3511 7.96492L14.9458 10.9209L16.0249 15.285L12 12.875L7.9751 15.285L9.05423 10.9209L5.64886 7.96492L10.0944 7.64166L12 3.5Z" fill="#FFEB3B"/>
    </svg>
  );

  const TrendInline = ({ value, percent }: { value: number, percent: number }) => {
    const isUp = value > 0;
    const isDown = value < 0;
    const color = isUp ? 'text-trend-up' : isDown ? 'text-trend-down' : 'text-gray-400';
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

    return (
      <span className={`inline-flex items-baseline gap-0.5 text-[11px] sm:text-[12px] font-bold ${color} tabular-nums ml-2`}>
        <span className="self-center"><Icon size={12} strokeWidth={3} /></span>
        <span>{Math.abs(value).toLocaleString()}</span>
        {percent !== 0 && (
            <span className="opacity-90 ml-0.5 font-medium">({Math.abs(percent).toFixed(1)}%)</span>
        )}
      </span>
    );
  };

  const MainCard = ({ product, label, highlight = false }: { product?: ComputedGoldProduct, label: string, highlight?: boolean }) => {
    if (!product) return null;
    
    // Logic for World Box (Small reference in VN Tab)
    if (product.group === 'world') {
        const USD_RATE = 25450;
        const vndValue = product.today.sell * USD_RATE;
        return (
            <div 
                onClick={() => setActiveTab('world')}
                className="bg-blue-50/30 border border-blue-100 border-dashed rounded-xl p-3 h-full flex flex-col justify-between cursor-pointer hover:border-blue-300 transition-all relative overflow-hidden group"
            >
                <div className="flex items-center gap-2 mb-2">
                     <h3 className="text-xs font-bold uppercase text-blue-900 tracking-wider">Giá vàng thế giới</h3>
                </div>

                <div className="flex flex-col gap-0 relative z-10">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-blue-700 tabular-nums">{product.today.sell.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-500">USD</span>
                    </div>
                    {/* Quy đổi */}
                    <div className="flex flex-col mt-2 pt-2 border-t border-blue-100 mb-2">
                        <span className="text-[10px] text-gray-500 font-medium">Quy đổi VNĐ:</span>
                        <span className="text-lg font-bold text-gray-900 tabular-nums">
                            {(vndValue).toLocaleString('vi-VN', {maximumFractionDigits: 0})} 
                            <span className="text-[10px] ml-1 text-gray-500 font-medium">đ/oz</span>
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-2 flex items-center text-blue-600 font-bold text-[11px] group-hover:underline">
                    Xem chi tiết giá vàng thế giới <ChevronRight size={12} className="ml-0.5" />
                </div>
            </div>
        )
    }

    // Logic for Vietnam Products
    return (
      <div 
        onClick={() => onProductClick(product)}
        className="bg-white border border-gray-100 rounded-xl p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full"
      >
        <div className="mb-2 flex justify-between items-center">
          <h3 className="font-bold tracking-tight text-gray-900 text-[13px] sm:text-sm uppercase">{label}</h3>
          <div className="text-gray-300 group-hover:text-blue-500 transition-colors"><BarChart2 size={16} /></div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Bán ra</span>
              <div className="flex items-baseline flex-wrap">
                  <span className={`font-black tabular-nums leading-none tracking-tight ${highlight ? 'text-vne-red text-[26px] sm:text-[30px]' : 'text-gray-900 text-[24px]'}`}>
                    {product.today.sell.toLocaleString('vi-VN')}
                  </span>
                  <TrendInline value={product.changeSell} percent={product.percentSell} />
              </div>
           </div>
           
           <div className="flex flex-col border-t border-dashed border-gray-100 pt-2">
               <span className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Mua vào</span>
               <div className="flex items-baseline flex-wrap">
                   <span className="text-lg font-bold text-gray-800 tabular-nums leading-none">
                      {product.today.buy.toLocaleString('vi-VN')}
                   </span>
                   <TrendInline value={product.changeBuy} percent={product.percentBuy} />
               </div>
           </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 -mx-3 -mb-3 px-3 py-2 rounded-b-xl">
             <span className="text-[11px] text-gray-500 font-medium">Chênh lệch mua/bán:</span>
             <span className="text-xs font-bold text-gray-900 tabular-nums">
                {product.spread.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} <span className="text-[10px] font-normal text-gray-500">tr.đ</span>
             </span>
        </div>
      </div>
    );
  };

  const WorldDetailTab = () => {
    if (!world) return null;

    // Convert prices
    const displaySell = world.today.sell * selectedCurrency.rate;
    const displayBuy = world.today.buy * selectedCurrency.rate;
    const displayChange = world.changeSell * selectedCurrency.rate;
    const displayOpen = (world.today.sell - world.changeSell) * selectedCurrency.rate;
    
    // Mock high/low for visual completeness
    const displayHigh = displaySell + (15 * selectedCurrency.rate);
    const displayLow = displaySell - (10 * selectedCurrency.rate);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-2 duration-300 h-full">
            {/* CỘT 1: THÔNG TIN CHI TIẾT */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-black text-[#003d7e] uppercase tracking-tight flex items-center gap-2">
                            <Globe size={20} /> Vàng Thế Giới
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Dữ liệu thời gian thực (Real-time)</p>
                    </div>
                    
                    {/* Currency Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 transition-colors"
                        >
                            <span className="text-lg">{selectedCurrency.flag}</span>
                            <span>{selectedCurrency.code}</span>
                            <ChevronDown size={14} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        
                        {isCurrencyOpen && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCurrencyOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-20 py-1 overflow-hidden">
                                {CURRENCIES.map((curr) => (
                                    <button
                                        key={curr.code}
                                        onClick={() => { setSelectedCurrency(curr); setIsCurrencyOpen(false); }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{curr.flag}</span>
                                            <span className="font-semibold text-gray-700">{curr.code}</span>
                                        </div>
                                        {curr.code === selectedCurrency.code && <Check size={14} className="text-blue-600"/>}
                                    </button>
                                ))}
                            </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-6">
                    {/* Big Price */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Giá Bán (Ask)</span>
                            <span className={`text-sm font-bold flex items-center gap-1 ${world.percentSell >= 0 ? 'text-trend-up' : 'text-trend-down'}`}>
                                {world.percentSell >= 0 ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                                {Math.abs(displayChange).toFixed(1)} {selectedCurrency.symbol} ({Math.abs(world.percentSell).toFixed(2)}%)
                            </span>
                        </div>
                        <div className="text-[42px] font-black text-gray-900 leading-none tabular-nums tracking-tighter">
                           {selectedCurrency.symbol}{displaySell.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                        </div>
                    </div>

                    {/* Secondary Price */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase">Giá Mua (Bid)</span>
                        <div className="text-2xl font-bold text-gray-700 tabular-nums">
                            {selectedCurrency.symbol}{displayBuy.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                        </div>
                    </div>

                    {/* Detailed Grid */}
                    <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-white p-3">
                             <div className="text-[10px] text-gray-400 font-bold uppercase">Mở cửa</div>
                             <div className="font-bold text-gray-800">{selectedCurrency.symbol}{displayOpen.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                        </div>
                        <div className="bg-white p-3">
                             <div className="text-[10px] text-gray-400 font-bold uppercase">Đóng cửa trước</div>
                             <div className="font-bold text-gray-800">{selectedCurrency.symbol}{displayOpen.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                        </div>
                        <div className="bg-white p-3">
                             <div className="text-[10px] text-gray-400 font-bold uppercase">Thấp nhất</div>
                             <div className="font-bold text-red-700">{selectedCurrency.symbol}{displayLow.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                        </div>
                        <div className="bg-white p-3">
                             <div className="text-[10px] text-gray-400 font-bold uppercase">Cao nhất</div>
                             <div className="font-bold text-green-700">{selectedCurrency.symbol}{displayHigh.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                        </div>
                    </div>

                    {/* VND Conversion Info */}
                    <div className="mt-auto text-[11px] text-gray-500 italic bg-blue-50/50 p-2 rounded text-center">
                        *1 Ounce ≈ 0.83 Lượng. Tỷ giá quy đổi ước tính chưa bao gồm thuế phí nhập khẩu.
                    </div>
                </div>
            </div>

            {/* CỘT 2: KITCO GOLD PRICE */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-800">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={16} className="text-yellow-400"/> Giá vàng Kitco hôm nay
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Row 1: 24 Hour Spot Gold */}
                    <div className="border-b border-gray-100">
                        <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase">
                            Biểu đồ 24H (Spot Gold)
                        </div>
                        <div className="p-2 flex justify-center">
                             <img src="https://www.kitco.com/images/live/gold.gif" className="max-w-full h-auto object-contain rounded" alt="24h Spot Gold" />
                        </div>
                    </div>

                    {/* Row 2: New York Spot Gold Table (Mock) */}
                    <div className="border-b border-gray-100">
                         <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase">
                            New York Spot Gold (Bid)
                        </div>
                        <div className="p-3">
                            <table className="w-full text-xs text-right">
                                <thead>
                                    <tr className="text-gray-400 border-b border-gray-100">
                                        <th className="pb-1 text-left">Kim loại</th>
                                        <th className="pb-1">Bid</th>
                                        <th className="pb-1">Ask</th>
                                        <th className="pb-1">Change</th>
                                    </tr>
                                </thead>
                                <tbody className="font-medium text-gray-700">
                                    <tr className="border-b border-gray-50">
                                        <td className="py-2 text-left font-bold text-yellow-600">Gold</td>
                                        <td className="py-2">2,624.50</td>
                                        <td className="py-2">2,625.50</td>
                                        <td className="py-2 text-red-600">-12.40</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-left font-bold text-gray-500">Silver</td>
                                        <td className="py-2">30.84</td>
                                        <td className="py-2">30.94</td>
                                        <td className="py-2 text-green-600">+0.15</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Row 3: Historical Charts */}
                    <div className="flex flex-col h-full">
                         <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase flex justify-between items-center">
                            <span>Biểu đồ lịch sử</span>
                        </div>
                        
                        {/* Tab Selector for History */}
                        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
                            {KITCO_TIME_RANGES.map((range, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setKitcoRangeIndex(idx)}
                                    className={`px-3 py-2 text-[10px] font-bold whitespace-nowrap transition-colors border-b-2 ${
                                        kitcoRangeIndex === idx 
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-2 flex justify-center bg-white min-h-[200px]">
                            <img 
                                src={KITCO_TIME_RANGES[kitcoRangeIndex].url} 
                                alt={`Kitco Chart ${KITCO_TIME_RANGES[kitcoRangeIndex].label}`}
                                className="max-w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('vn')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold transition-all relative outline-none ${
                    activeTab === 'vn' 
                    ? 'text-[#003d7e] bg-white' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
            >
                <div className={`transition-transform duration-300 ${activeTab === 'vn' ? 'scale-110' : 'grayscale opacity-70'}`}>
                    <VietnamFlag />
                </div>
                <span>Việt Nam</span>
                {activeTab === 'vn' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#003d7e]"></div>}
            </button>

            <button 
                onClick={() => setActiveTab('world')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold transition-all relative outline-none ${
                    activeTab === 'world' 
                    ? 'text-blue-600 bg-white' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
            >
                <Globe size={16} className={activeTab === 'world' ? 'text-blue-600' : 'text-gray-400'} />
                <span>Thế giới</span>
                {activeTab === 'world' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600"></div>}
            </button>
        </div>

        {/* Tab Content */}
        {/* CHANGED: Removed fixed min-h-[400px], apply min-h only for World tab to support scrolling */}
        <div className={`p-4 bg-white ${activeTab === 'world' ? 'h-[600px]' : 'h-auto'}`}>
            {activeTab === 'vn' ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Box 1: SJC */}
                        <div className="md:col-span-1 h-full">
                            <MainCard product={sjc} label="Vàng miếng SJC" highlight={true} />
                        </div>
                        
                        {/* Box 2: Jewelry */}
                        <div className="md:col-span-1 h-full">
                            <MainCard product={jewelry} label="Nữ trang 99,99%" />
                        </div>

                        {/* Box 3: World (Small Reference) */}
                        <div className="md:col-span-1 h-full">
                            <MainCard product={world} label="Giá vàng thế giới" />
                        </div>
                    </div>
                </div>
            ) : (
                <WorldDetailTab />
            )}
        </div>
    </div>
  );
};