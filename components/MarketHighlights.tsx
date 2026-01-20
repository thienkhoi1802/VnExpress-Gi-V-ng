import React, { useState } from 'react';
import { ComputedGoldProduct } from '../types';
import { ArrowUp, ArrowDown, Minus, BarChart2, Globe, ChevronRight, ChevronDown, Check, Activity, TrendingUp, Info, TrendingDown, History } from 'lucide-react';
import { AdvancedRealTimeChart, TechnicalAnalysisWidget } from './TradingViewWidgets';

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

const HISTORY_CHARTS = [
    { title: '30 Ngày', src: 'https://www.kitco.com/chart-images/LFgif/AU0030lnb.gif' },
    { title: '60 Ngày', src: 'https://www.kitco.com/chart-images/LFgif/AU0060lnb.gif' },
    { title: '6 Tháng', src: 'https://www.kitco.com/chart-images/LFgif/AU0182nyb.gif' },
    { title: '1 Năm', src: 'https://www.kitco.com/chart-images/LFgif/AU0365nyb.gif' },
    { title: '5 Năm', src: 'https://www.kitco.com/chart-images/LFgif/AU1825nyb.gif' }, // Corrected 5 year chart code despite prompt typo, assuming 5y is desired
    { title: '10 Năm', src: 'https://www.kitco.com/chart-images/LFgif/AU3650nyb.gif' },
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
          <span className="whitespace-nowrap">{Math.abs(percent).toFixed(1)}% <span className="text-xs font-normal text-gray-600 ml-0.5 font-sans hidden sm:inline">vs hôm qua</span></span>
      ) : (
          <span className="text-xs font-normal text-gray-600 font-sans">Không đổi</span>
      )}
    </div>
  );
};

// Component riêng cho Thanh Vàng Thế Giới (Hàng 2) - Optimized for Legibility and Mobile Wrapping
const WorldStrip = ({ product, setActiveTab }: { product?: ComputedGoldProduct, setActiveTab: (tab: 'vn' | 'world') => void }) => {
    if (!product) return null;
    const isUp = product.percentSell >= 0;

    return (
        <div 
            onClick={() => setActiveTab('world')}
            className="bg-white border border-gray-300 shadow-sm p-3 sm:px-4 sm:py-4 cursor-pointer hover:border-[#9f224e] hover:shadow-md transition-all group rounded-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                
                {/* Content Container */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                    {/* Title */}
                    <div className="flex items-center gap-2">
                         <Globe size={18} className="text-[#9f224e] sm:hidden" />
                         <h3 className="text-base font-bold text-[#9f224e] font-serif shrink-0">
                            Vàng thế giới
                        </h3>
                    </div>
                    
                    <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>

                    {/* Price Data - Flex Wrap allows wrapping on tiny screens */}
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                         <span className="text-2xl sm:text-3xl font-black text-gray-900 tabular-nums font-sans tracking-tight">
                            {product.today.sell.toLocaleString()}
                            <span className="text-sm font-bold text-gray-600 ml-1">USD</span>
                         </span>
                         
                         <span className={`text-sm sm:text-base font-bold ${isUp ? 'text-trend-up' : 'text-trend-down'} tabular-nums flex items-center gap-0.5 font-sans`}>
                            {isUp ? '+' : ''}{product.changeSell} 
                            <span className="text-gray-500 font-medium ml-1">
                                ({Math.abs(product.percentSell).toFixed(2)}%)
                            </span>
                         </span>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between sm:justify-end border-t border-gray-100 sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                    <span className="sm:hidden text-xs text-gray-500 font-medium">Xem biểu đồ & phân tích</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#9f224e] group-hover:underline decoration-[#9f224e]/30 underline-offset-2 font-sans whitespace-nowrap">
                        Chi tiết <ChevronRight size={18} strokeWidth={2.5} />
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
      {/* 1. Header Area */}
      <div className="px-3 sm:px-4 py-3 flex justify-between items-center border-b border-gray-100 bg-gray-50/30">
          <h3 className="font-bold tracking-tight text-gray-900 text-base sm:text-lg leading-tight font-serif truncate mr-2">
              {label}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium hidden xs:inline-block font-sans">
                  (Triệu đ/lượng)
              </span>
              <div className="text-gray-400 group-hover:text-[#9f224e] transition-colors">
                  <BarChart2 size={18} className="sm:w-5 sm:h-5" />
              </div>
          </div>
      </div>

      {/* 2. Prices Area - High Contrast, Large Numbers */}
      <div className="px-3 sm:px-4 py-4 grid grid-cols-2 gap-2 sm:gap-4 flex-grow items-start font-sans">
          
          {/* Left Col: Sell Price */}
          <div className="flex flex-col border-r border-gray-200 pr-2">
              <span className="text-[11px] sm:text-xs text-gray-600 font-bold mb-1">Bán ra</span>
              <span className={`font-black tabular-nums leading-none tracking-tight text-[#bd0000] text-2xl sm:text-4xl break-all sm:break-normal`}>
                  {product.today.sell.toLocaleString('vi-VN')}
              </span>
              <TrendInline value={product.changeSell} percent={product.percentSell} />
          </div>

          {/* Right Col: Buy Price */}
          <div className="flex flex-col pl-2">
              <span className="text-[11px] sm:text-xs text-gray-600 font-bold mb-1">Mua vào</span>
              <span className="font-bold tabular-nums leading-none tracking-tight text-gray-900 text-xl sm:text-3xl break-all sm:break-normal">
                  {product.today.buy.toLocaleString('vi-VN')}
              </span>
              <TrendInline value={product.changeBuy} percent={product.percentBuy} />
          </div>

      </div>

      {/* 3. Footer: Spread - Single Line Layout */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-4 py-2.5 flex items-center justify-between text-[11px] sm:text-xs font-sans">
           {/* Item 1: Domestic Spread */}
           <div className="flex items-center gap-1.5">
               <span className="text-gray-500 font-medium whitespace-nowrap">Chênh lệch:</span>
               <span className="font-bold text-gray-900 tabular-nums">
                  {product.spread.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
               </span>
           </div>

           {/* Vertical Divider */}
           {diffText && <div className="h-3 w-px bg-gray-300 mx-1 shrink-0"></div>}

           {/* Item 2: World Spread */}
           {diffText && (
               <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-medium whitespace-nowrap">Lệch TG:</span>
                    <span className="font-bold text-gray-900 tabular-nums">
                        {diffText} <span className="text-[9px] font-normal text-gray-400">tr</span>
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
                <div className="px-4 sm:px-5 py-4 flex justify-between items-start border-b border-gray-200 bg-gray-50">
                    <div className="pr-2">
                        {/* SYNCHRONIZED TITLE: Match VN Tab Table Titles (gray-900, text-lg sm:text-xl) */}
                        <h2 className="text-gray-900 text-lg sm:text-xl font-bold font-serif flex items-center gap-2">
                            <Globe size={24} className="text-[#9f224e]"/> Vàng thế giới
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-sans">Dữ liệu thời gian thực (XAU/USD)</p>
                    </div>
                    
                    <div className="relative font-sans shrink-0">
                        <button 
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 px-3 py-2 text-sm sm:text-base font-bold text-gray-800 transition-colors shadow-sm rounded"
                        >
                            <span className="text-lg">{selectedCurrency.flag}</span>
                            <span>{selectedCurrency.code}</span>
                            <ChevronDown size={16} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        
                        {isCurrencyOpen && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCurrencyOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-1 w-40 sm:w-48 bg-white border border-gray-300 shadow-xl z-20 py-1 overflow-hidden rounded">
                                {CURRENCIES.map((curr) => (
                                    <button
                                        key={curr.code}
                                        onClick={() => { setSelectedCurrency(curr); setIsCurrencyOpen(false); }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm sm:text-base hover:bg-gray-100 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{curr.flag}</span>
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

                <div className="p-4 sm:p-6 pb-2 font-sans">
                    {/* Price Overview Layout */}
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
                        {/* LEFT: Main Price */}
                        <div>
                             <div className="inline-block bg-[#e0e0e0] text-gray-700 text-[10px] sm:text-xs font-bold px-2 py-1 mb-2 rounded">Giá bán (Ask)</div>
                             <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                 {/* BIG PRICE - Massive size for seniors */}
                                 <span className="text-5xl sm:text-6xl font-black text-[#222] tabular-nums tracking-tighter leading-none">
                                    {selectedCurrency.symbol}{displaySell.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                                 </span>
                                 
                                 {/* Change Indicator next to big price */}
                                 <div className="flex flex-row md:flex-col items-baseline md:items-start gap-2 md:gap-0">
                                     <span className={`flex items-center text-lg font-bold ${trendColor}`}>
                                        {isUp ? <ArrowUp size={20} strokeWidth={3}/> : <ArrowDown size={20} strokeWidth={3}/>}
                                        {Math.abs(displayChange).toFixed(1)} {selectedCurrency.symbol}
                                     </span>
                                     <span className={`text-sm font-semibold ${trendColor}`}>
                                        ({Math.abs(world.percentSell).toFixed(2)}%)
                                     </span>
                                 </div>
                             </div>
                        </div>

                        {/* RIGHT: Secondary Stats Boxes - Larger font */}
                        <div className="flex flex-wrap gap-2 sm:gap-4 ml-0 md:ml-auto w-full md:w-auto">
                            <div className="border border-gray-300 p-3 sm:p-4 flex-1 min-w-[140px] rounded bg-gray-50">
                                <div className="text-[10px] text-gray-500 font-bold mb-1">Giá mua (Bid)</div>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{selectedCurrency.symbol}{displayBuy.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                            </div>
                            <div className="border border-gray-300 p-3 sm:p-4 flex-1 min-w-[140px] rounded bg-gray-50">
                                <div className="text-[10px] text-gray-500 font-bold mb-1">Cao / Thấp</div>
                                <div className="text-lg sm:text-lg font-bold text-gray-900 whitespace-nowrap">
                                    <span className="text-[#0f7d4b]">{Math.round(displayHigh)}</span> <span className="text-gray-400">/</span> <span className="text-[#bd0000]">{Math.round(displayLow)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ANALYSIS BOX */}
                    <div className="bg-[#f0f9ff] border border-blue-100 p-4 sm:p-5 mb-6 relative rounded">
                        <div className="flex items-start gap-3 sm:gap-4">
                             <div className="mt-1">
                                <TrendIcon size={24} className={trendColor} />
                             </div>
                             <div className="flex-1">
                                <p className="text-sm sm:text-base text-gray-900 leading-normal font-medium">
                                    Giá vàng thế giới <span className={trendColor}>{trendText} {Math.abs(world.percentSell).toFixed(2)}%</span> trong 24 giờ qua, 
                                    tương ứng với {trendText} <span className={trendColor}>{Math.abs(displayChange).toFixed(2)} {selectedCurrency.code}/Ounce</span>.
                                </p>
                                <div className="mt-3 pt-3 border-t border-blue-200 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-700">
                                    <Info size={16} className="text-blue-500" />
                                    <span>1 Ounce = <span className="font-bold text-[#222] text-sm sm:text-base">{ounceInVnd.toLocaleString('vi-VN', {maximumFractionDigits: 0})} VNĐ</span></span>
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
                    {/* SYNCHRONIZED TITLE */}
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 font-serif">
                        <Activity size={20} className="text-[#9f224e]"/> Phân tích kỹ thuật (XAU/USD)
                    </h2>
                </div>

                {/* Removed Grid layout, now just the widget in full width container */}
                <div className="p-0 sm:p-0 border-b border-gray-200">
                     <div className="h-[450px] w-full bg-white relative">
                         <TechnicalAnalysisWidget />
                     </div>
                </div>
                
                <div className="p-3 bg-gray-50 text-[11px] text-gray-500 text-center">
                    Dữ liệu được cung cấp bởi TradingView
                </div>
            </div>

            {/* CARD 3: KITCO CHART (Existing) + HISTORICAL CHARTS (Merged) */}
            <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden font-sans">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-[#bd0000] font-serif">
                        Giá vàng Kitco hôm nay
                    </h2>
                </div>
                
                <div className="p-4 sm:p-5">
                    <div className="text-sm text-gray-600 mb-4 font-medium">
                        Cập nhật lúc {world.updatedAt}
                    </div>

                    {/* Chart Images - Full Width */}
                    <div className="flex flex-col gap-4 mb-5">
                        <div className="bg-black border border-gray-400 p-1">
                            <img 
                                id="chart_live_gold"
                                src={`https://www.kitco.com/chart-images/images/live/gold.gif?t=${Date.now()}`}
                                alt="Live 24hrs gold chart"
                                className="w-full h-auto block"
                            />
                        </div>
                        <div className="bg-black border border-gray-400 p-1">
                            <img 
                                id="chart_ny_gold"
                                src={`https://www.kitco.com/chart-images/images/live/nygold.gif?t=${Date.now()}`}
                                alt="Live New York gold Chart"
                                className="w-full h-auto block"
                            />
                        </div>
                    </div>

                    {/* Description Area */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-4 text-[13px] sm:text-sm text-gray-800 space-y-4 leading-relaxed mb-6">
                        
                        {/* 1. Legend Row */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-gray-200 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-[#00ff00] rounded-sm shadow-sm ring-1 ring-black/10"></span>
                                <span className="font-bold">Giá hiện tại</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-[#ff0000] rounded-sm shadow-sm ring-1 ring-black/10"></span>
                                <span className="font-bold">Giá hôm qua</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-[#00ccff] rounded-sm shadow-sm ring-1 ring-black/10"></span>
                                <span className="font-bold">Giá hôm kia</span>
                            </div>
                        </div>

                        {/* 2. Text Content */}
                        <div className="space-y-3 text-gray-700">
                            <p>
                                Giá kết thúc ngày hôm trước là giá khởi đầu ngày hôm sau. 
                                Hai trục thời gian ở dưới cùng, một theo giờ New York, một theo giờ chuẩn GMT.
                            </p>
                            <p>
                                Các thanh (tên sàn giao dịch) trên các trục thời gian này, có độ dài tương ứng với thời gian giao dịch của sàn giao dịch đó. Các sàn chính là New York (USD), London (Bảng Anh) và HongKong.
                            </p>
                        </div>
                    </div>

                    {/* HISTORICAL CHARTS GRID - NEW LAYOUT based on User Request */}
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4 font-serif text-base flex items-center gap-2">
                            <History size={18} className="text-[#9f224e]" />
                            Lịch sử biến động
                        </h3>
                        <div className="flex flex-wrap gap-[15px] justify-between">
                            {HISTORY_CHARTS.map((chart) => (
                                <img 
                                    key={chart.title}
                                    className="w-[calc(50%_-_(15px_/2))] min-w-[305px] border border-gray-300" 
                                    alt={`Live gold chart ${chart.title}`} 
                                    src={`${chart.src}?t=${Date.now()}`}
                                    loading="lazy"
                                />
                            ))}
                        </div>
                        <div className="mt-4 text-[11px] text-gray-500 italic text-center">
                            Nguồn dữ liệu biểu đồ: Kitco.com
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
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-bold transition-all relative outline-none ${
                    activeTab === 'vn' 
                    ? 'text-[#9f224e] bg-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
                <div className={`transition-transform duration-300 ${activeTab === 'vn' ? 'scale-110 sm:scale-125' : 'grayscale opacity-70 scale-100 sm:scale-110'}`}>
                    <VietnamFlag />
                </div>
                <span>Việt Nam</span>
                {activeTab === 'vn' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#9f224e]"></div>}
            </button>

            <button 
                onClick={() => setActiveTab('world')}
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-bold transition-all relative outline-none ${
                    activeTab === 'world' 
                    ? 'text-[#9f224e] bg-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
                <Globe size={18} className={`sm:w-5 sm:h-5 ${activeTab === 'world' ? 'text-[#9f224e]' : 'text-gray-400'}`} />
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
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-6">
                             {/* SJC Box */}
                             <div className="col-span-1 xs:col-span-1 md:col-span-7">
                                 <MainCard 
                                    product={sjc} 
                                    worldProduct={world}
                                    label="Vàng SJC" 
                                    highlight={true} 
                                    onProductClick={onProductClick} 
                                />
                             </div>
                             
                             {/* Jewelry Box */}
                             <div className="col-span-1 xs:col-span-1 md:col-span-5">
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