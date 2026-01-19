import React, { useState } from 'react';
import { ComputedGoldProduct } from '../types';
import { ArrowUp, ArrowDown, Minus, BarChart2, Globe, ChevronRight, ChevronDown, Check, Activity, TrendingUp, Info, TrendingDown } from 'lucide-react';
import { AdvancedRealTimeChart, TechnicalAnalysisWidget, MiniChartWidget } from './TradingViewWidgets';

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

// Standardized Vietnam Flag - Centered Star
const VietnamFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm ring-1 ring-black/5">
    <rect width="24" height="16" fill="#DA251D"/>
    <path d="M12 2.1L13.9056 6.24166L18.3511 6.56492L14.9458 9.5209L16.0249 13.885L12 11.475L7.9751 13.885L9.05423 9.5209L5.64886 6.56492L10.0944 6.24166L12 2.1Z" fill="#FFEB3B"/>
  </svg>
);

const TrendInline = ({ value, percent }: { value: number, percent: number }) => {
  const isUp = value > 0;
  const isDown = value < 0;
  // High contrast colors for seniors
  const color = isUp ? 'text-[#007f3f]' : isDown ? 'text-[#d60000]' : 'text-gray-600';
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <div className={`flex items-center gap-1 text-sm font-bold ${color} tabular-nums mt-1`}>
      <Icon size={16} strokeWidth={3} />
      {percent !== 0 ? (
          <span>{Math.abs(percent).toFixed(1)}% <span className="text-xs font-normal text-gray-600 ml-1 font-sans">vs hôm qua</span></span>
      ) : (
          <span className="text-xs font-normal text-gray-600 font-sans">Không đổi</span>
      )}
    </div>
  );
};

// Component riêng cho Thanh Vàng Thế Giới (Hàng 2) - Optimized for Legibility
const WorldStrip = ({ product, setActiveTab }: { product?: ComputedGoldProduct, setActiveTab: (tab: 'vn' | 'world') => void }) => {
    if (!product) return null;
    const isUp = product.percentSell >= 0;

    return (
        <div 
            onClick={() => setActiveTab('world')}
            className="bg-white border border-gray-300 shadow-sm px-4 py-4 cursor-pointer hover:border-[#9f224e] hover:shadow-md transition-all group rounded-sm"
        >
            <div className="flex items-center justify-between gap-2">
                
                {/* Left Group: Title + Data */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 overflow-hidden flex-1">
                    <h3 className="text-base font-bold uppercase text-[#9f224e] whitespace-nowrap shrink-0 font-serif">
                        Vàng Thế Giới
                    </h3>
                    
                    <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>

                    {/* Price & Change combined inline */}
                    <div className="flex items-baseline gap-2 truncate">
                         <span className="text-xl sm:text-2xl font-black text-gray-900 tabular-nums font-sans">
                            {product.today.sell.toLocaleString()}
                            <span className="text-sm font-bold text-gray-600 ml-1">USD</span>
                         </span>
                         
                         <span className={`text-sm font-bold ${isUp ? 'text-trend-up' : 'text-trend-down'} tabular-nums flex items-center gap-0.5 font-sans`}>
                            {isUp ? '+' : ''}{product.changeSell} 
                            <span className="hidden sm:inline">({Math.abs(product.percentSell).toFixed(2)}%)</span>
                         </span>
                    </div>
                </div>

                {/* Right Group: CTA - Larger for easier tapping */}
                <div className="shrink-0 pl-3 border-l border-gray-200 sm:border-none">
                    <span className="flex items-center gap-1 text-sm font-bold text-[#9f224e] hover:text-[#7a1a3b] transition-colors group-hover:underline decoration-[#9f224e]/30 underline-offset-2 font-sans">
                        Xem chi tiết <ChevronRight size={18} strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </div>
    )
}

const MainCard = ({ product, worldProduct, label, highlight = false, onProductClick }: { 
    product?: ComputedGoldProduct,
    worldProduct?: ComputedGoldProduct,
    label: string, 
    highlight?: boolean, 
    onProductClick: (p: ComputedGoldProduct) => void,
}) => {
  if (!product) return null;

  let diffText = null;
  if (worldProduct) {
     const USD_RATE = 25450;
     const TAEL_TO_OZ = 1.20565;
     // World Price in Million VND / Tael
     const worldVnd = (worldProduct.today.sell * TAEL_TO_OZ * USD_RATE) / 1000000;
     const diff = product.today.sell - worldVnd;
     diffText = `${diff > 0 ? '+' : ''}${diff.toLocaleString('vi-VN', {maximumFractionDigits: 2})}`;
  }

  return (
    <div 
      onClick={() => onProductClick(product)}
      className="bg-white border border-gray-300 hover:border-[#9f224e] hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full shadow-sm rounded-sm"
    >
      {/* 1. Header Area - Clear and Big */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-gray-100 bg-gray-50/30">
          <h3 className="font-bold tracking-tight text-gray-900 text-lg uppercase leading-tight font-serif">
              {label}
          </h3>
          <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium hidden xs:inline-block font-sans">
                  (Triệu đồng / lượng)
              </span>
              <div className="text-gray-400 group-hover:text-[#9f224e] transition-colors">
                  <BarChart2 size={20} />
              </div>
          </div>
      </div>

      {/* 2. Prices Area - High Contrast, Large Numbers */}
      <div className="px-4 py-4 grid grid-cols-2 gap-4 flex-grow items-start font-sans">
          
          {/* Left Col: Sell Price */}
          <div className="flex flex-col border-r border-gray-200 pr-2">
              <span className="text-xs text-gray-600 font-bold uppercase mb-1">Bán ra</span>
              <span className={`font-black tabular-nums leading-none tracking-tight text-[#bd0000] text-3xl sm:text-4xl`}>
                  {product.today.sell.toLocaleString('vi-VN')}
              </span>
              <TrendInline value={product.changeSell} percent={product.percentSell} />
          </div>

          {/* Right Col: Buy Price */}
          <div className="flex flex-col pl-2">
              <span className="text-xs text-gray-600 font-bold uppercase mb-1">Mua vào</span>
              <span className="font-bold tabular-nums leading-none tracking-tight text-gray-900 text-2xl sm:text-3xl">
                  {product.today.buy.toLocaleString('vi-VN')}
              </span>
              <TrendInline value={product.changeBuy} percent={product.percentBuy} />
          </div>

      </div>

      {/* 3. Footer: Spread - Readable */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-col gap-2 font-sans">
           {/* Row 1: Domestic Spread */}
           <div className="flex justify-between items-center text-sm">
               <span className="text-gray-600 font-medium">Chênh lệch mua bán:</span>
               <span className="font-bold text-gray-900 tabular-nums">
                  {product.spread.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} <span className="text-xs font-normal text-gray-500">triệu</span>
               </span>
           </div>

           {/* Row 2: World Spread */}
           {diffText && (
               <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                    <span className="text-gray-600 font-medium">Chênh lệch thế giới:</span>
                    <span className="font-bold text-gray-900 tabular-nums whitespace-nowrap">
                        {diffText} <span className="text-xs font-normal text-gray-500">triệu</span>
                    </span>
               </div>
           )}
      </div>
    </div>
  );
};

export const MarketHighlights: React.FC<Props> = ({ data, onProductClick, activeTab, setActiveTab }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const sjc = data.find(p => p.group === 'sjc');
  const jewelry = data.find(p => p.group === 'jewelry'); 
  const world = data.find(p => p.group === 'world');

  const WorldDetailTab = () => {
    if (!world) return null;

    // Convert prices
    const displaySell = world.today.sell * selectedCurrency.rate;
    const displayBuy = world.today.buy * selectedCurrency.rate;
    const displayChange = world.changeSell * selectedCurrency.rate;
    
    // Mock high/low
    const displayHigh = displaySell + (15 * selectedCurrency.rate);
    const displayLow = displaySell - (10 * selectedCurrency.rate);

    // Analysis Logic
    const isUp = world.percentSell >= 0;
    const trendText = isUp ? 'tăng' : 'giảm';
    const TrendIcon = isUp ? TrendingUp : TrendingDown;
    const trendColor = isUp ? 'text-[#0f7d4b]' : 'text-[#bd0000]'; 
    
    // Conversion Logic
    const USD_VND_RATE = 25450;
    const ounceInVnd = world.today.sell * USD_VND_RATE;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-300 pb-4">
            {/* CARD 1: WORLD PRICES - Full Width */}
            <div className="bg-white border border-gray-300 overflow-hidden shadow-sm flex flex-col font-sans rounded-sm">
                {/* Header */}
                <div className="px-5 py-4 flex justify-between items-start border-b border-gray-200 bg-gray-50">
                    <div>
                        <h2 className="text-[#9f224e] text-2xl font-bold font-serif uppercase flex items-center gap-2">
                            <Globe size={24} /> Vàng Thế Giới
                        </h2>
                        <p className="text-sm text-gray-600 mt-1 font-sans">Dữ liệu thời gian thực (XAU/USD)</p>
                    </div>
                    
                    <div className="relative font-sans">
                        <button 
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2 text-base font-bold text-gray-800 transition-colors shadow-sm rounded"
                        >
                            <span className="text-xl">{selectedCurrency.flag}</span>
                            <span>{selectedCurrency.code}</span>
                            <ChevronDown size={16} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        
                        {isCurrencyOpen && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCurrencyOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-300 shadow-xl z-20 py-1 overflow-hidden rounded">
                                {CURRENCIES.map((curr) => (
                                    <button
                                        key={curr.code}
                                        onClick={() => { setSelectedCurrency(curr); setIsCurrencyOpen(false); }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-base hover:bg-gray-100 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{curr.flag}</span>
                                            <span className="font-bold text-gray-800">{curr.code}</span>
                                        </div>
                                        {curr.code === selectedCurrency.code && <Check size={18} className="text-[#9f224e]"/>}
                                    </button>
                                ))}
                            </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 pb-2 font-sans">
                    {/* Price Overview Layout */}
                    <div className="flex flex-col md:flex-row items-end gap-8 mb-6">
                        {/* LEFT: Main Price */}
                        <div>
                             <div className="inline-block bg-[#e0e0e0] text-gray-700 text-xs font-bold uppercase px-2 py-1 mb-2 rounded">Giá Bán (Ask)</div>
                             <div className="flex items-center gap-4">
                                 {/* BIG PRICE - Massive size for seniors */}
                                 <span className="text-6xl font-black text-[#222] tabular-nums tracking-tighter leading-none">
                                    {selectedCurrency.symbol}{displaySell.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                                 </span>
                                 
                                 {/* Change Indicator next to big price */}
                                 <div className="flex flex-col">
                                     <span className={`flex items-center text-lg font-bold ${trendColor}`}>
                                        {isUp ? <ArrowUp size={24} strokeWidth={3}/> : <ArrowDown size={24} strokeWidth={3}/>}
                                        {Math.abs(displayChange).toFixed(1)} {selectedCurrency.symbol}
                                     </span>
                                     <span className={`text-sm font-semibold ${trendColor}`}>
                                        ({Math.abs(world.percentSell).toFixed(2)}%)
                                     </span>
                                 </div>
                             </div>
                        </div>

                        {/* RIGHT: Secondary Stats Boxes - Larger font */}
                        <div className="flex gap-4 ml-auto">
                            <div className="border border-gray-300 p-4 min-w-[160px] rounded bg-gray-50">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Giá Mua (Bid)</div>
                                <div className="text-2xl font-bold text-gray-900">{selectedCurrency.symbol}{displayBuy.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                            </div>
                            <div className="border border-gray-300 p-4 min-w-[160px] rounded bg-gray-50">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Cao / Thấp</div>
                                <div className="text-lg font-bold text-gray-900">
                                    <span className="text-[#0f7d4b]">{Math.round(displayHigh)}</span> <span className="text-gray-400">/</span> <span className="text-[#bd0000]">{Math.round(displayLow)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ANALYSIS BOX */}
                    <div className="bg-[#f0f9ff] border border-blue-100 p-5 mb-6 relative rounded">
                        <div className="flex items-start gap-4">
                             <div className="mt-1">
                                <TrendIcon size={24} className={trendColor} />
                             </div>
                             <div className="flex-1">
                                <p className="text-base text-gray-900 leading-normal font-medium">
                                    Giá vàng thế giới <span className={trendColor}>{trendText} {Math.abs(world.percentSell).toFixed(2)}%</span> trong 24 giờ qua, 
                                    tương ứng với {trendText} <span className={trendColor}>{Math.abs(displayChange).toFixed(2)} {selectedCurrency.code}/Ounce</span>.
                                </p>
                                <div className="mt-3 pt-3 border-t border-blue-200 flex items-center gap-2 text-sm text-gray-700">
                                    <Info size={16} className="text-blue-500" />
                                    <span>1 Ounce = <span className="font-bold text-[#222] text-base">{ounceInVnd.toLocaleString('vi-VN', {maximumFractionDigits: 0})} VNĐ</span></span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                {/* TRADINGVIEW ADVANCED CHART EMBED */}
                <div className="border-t border-gray-200 bg-gray-100">
                    <AdvancedRealTimeChart />
                </div>
            </div>

            {/* CARD 2: KITCO / TECHNICAL DATA - Optimized & Full Width */}
            <div className="bg-white border border-gray-300 overflow-hidden shadow-sm flex flex-col font-sans rounded-sm">
                <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 font-serif">
                        <Activity size={20} className="text-[#9f224e]"/> Phân tích kỹ thuật & Dữ liệu
                    </h2>
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT: Technical Analysis Gauge */}
                        <div className="lg:col-span-5 flex flex-col">
                             <div className="border border-gray-200 overflow-hidden h-[300px] shadow-inner bg-gray-50">
                                 <TechnicalAnalysisWidget />
                             </div>
                        </div>

                        {/* RIGHT: Data Table & Mini Charts */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                             
                             {/* Mini Charts Row */}
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Bạc (Silver)</h4>
                                    <div className="border border-gray-200 h-[120px] overflow-hidden bg-white shadow-sm">
                                        <MiniChartWidget symbol="OANDA:XAGUSD" name="Silver" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Chỉ số USD (DXY)</h4>
                                    <div className="border border-gray-200 h-[120px] overflow-hidden bg-white shadow-sm">
                                        <MiniChartWidget symbol="TVC:DXY" name="DXY" />
                                    </div>
                                </div>
                             </div>

                             {/* Kitco Data Table */}
                             <div>
                                <div className="border border-gray-200 overflow-hidden rounded-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                                            <tr>
                                                <th className="p-3 text-left">Kim loại</th>
                                                <th className="p-3 text-right">Bid</th>
                                                <th className="p-3 text-right">Ask</th>
                                                <th className="p-3 text-right">Thay đổi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 font-medium text-base">
                                            <tr>
                                                <td className="p-3 font-bold text-[#b48e3d]">Gold</td>
                                                <td className="p-3 text-right text-gray-800">2,624.50</td>
                                                <td className="p-3 text-right text-gray-500">2,625.50</td>
                                                <td className="p-3 text-right text-red-600 font-bold">-12.40</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-bold text-gray-600">Silver</td>
                                                <td className="p-3 text-right text-gray-800">30.84</td>
                                                <td className="p-3 text-right text-gray-500">30.94</td>
                                                <td className="p-3 text-right text-green-600 font-bold">+0.15</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-bold text-gray-600">Platinum</td>
                                                <td className="p-3 text-right text-gray-800">950.00</td>
                                                <td className="p-3 text-right text-gray-500">955.00</td>
                                                <td className="p-3 text-right text-red-600 font-bold">-5.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm overflow-hidden flex flex-col rounded-sm">
        {/* Tab Navigation - Large tabs for Seniors */}
        <div className="flex border-b border-gray-200 font-serif">
            <button 
                onClick={() => setActiveTab('vn')}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-3 text-lg font-bold transition-all relative outline-none ${
                    activeTab === 'vn' 
                    ? 'text-[#9f224e] bg-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
                <div className={`transition-transform duration-300 ${activeTab === 'vn' ? 'scale-125' : 'grayscale opacity-70 scale-110'}`}>
                    <VietnamFlag />
                </div>
                <span>Việt Nam</span>
                {activeTab === 'vn' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#9f224e]"></div>}
            </button>

            <button 
                onClick={() => setActiveTab('world')}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-3 text-lg font-bold transition-all relative outline-none ${
                    activeTab === 'world' 
                    ? 'text-[#9f224e] bg-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
                <Globe size={20} className={activeTab === 'world' ? 'text-[#9f224e]' : 'text-gray-400'} />
                <span>Thế giới</span>
                {activeTab === 'world' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#9f224e]"></div>}
            </button>
        </div>

        {/* Tab Content */}
        <div className={`p-3 sm:p-5 bg-white ${activeTab === 'world' ? 'h-auto' : 'h-auto'}`}>
            {activeTab === 'vn' ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex flex-col gap-4">
                        {/* Hàng 1: SJC + Jewelry */}
                        {/* MOBILE: Grid 2 columns (gap-2), DESKTOP: Grid 12 columns */}
                        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-6">
                             {/* SJC Box */}
                             <div className="col-span-1 md:col-span-7">
                                 <MainCard 
                                    product={sjc} 
                                    worldProduct={world}
                                    label="Vàng SJC" 
                                    highlight={true} 
                                    onProductClick={onProductClick} 
                                />
                             </div>
                             
                             {/* Jewelry Box */}
                             <div className="col-span-1 md:col-span-5">
                                 <MainCard 
                                    product={jewelry} 
                                    worldProduct={world}
                                    label="Nữ trang" 
                                    highlight={true} 
                                    onProductClick={onProductClick} 
                                />
                             </div>
                        </div>

                        {/* Hàng 2: Vàng Thế Giới (Full width strip) */}
                        <WorldStrip product={world} setActiveTab={setActiveTab} />
                    </div>
                </div>
            ) : (
                <WorldDetailTab />
            )}
        </div>
    </div>
  );
};