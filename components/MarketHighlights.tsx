import React, { useState } from 'react';
import { ComputedGoldProduct } from '../types';
import { ArrowUp, ArrowDown, Minus, BarChart2, Globe, Image as ImageIcon, ChevronRight, ChevronDown, Check, Activity, Gauge, TrendingUp, Info, TrendingDown } from 'lucide-react';
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

export const MarketHighlights: React.FC<Props> = ({ data, onProductClick, activeTab, setActiveTab }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

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
      <span className={`inline-flex items-baseline gap-0.5 text-[10px] sm:text-[12px] font-bold ${color} tabular-nums ml-1 sm:ml-2`}>
        <span className="self-center"><Icon size={10} strokeWidth={3} className="sm:w-3 sm:h-3" /></span>
        <span className="hidden sm:inline">{Math.abs(value).toLocaleString()}</span>
        {percent !== 0 && (
            <span className="opacity-90 ml-0.5 font-medium">{Math.abs(percent).toFixed(1)}%</span>
        )}
      </span>
    );
  };

  const MainCard = ({ product, label, highlight = false }: { product?: ComputedGoldProduct, label: string, highlight?: boolean }) => {
    if (!product) return null;
    
    // Logic for World Box (Compact View in VN Tab)
    if (product.group === 'world') {
        const USD_RATE = 25450;
        const vndValue = product.today.sell * USD_RATE;
        
        return (
            <div 
                onClick={() => setActiveTab('world')}
                className="bg-white border border-gray-200 border-dashed rounded-lg sm:rounded-xl p-2 sm:p-3 h-full cursor-pointer hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden group"
            >
                {/* Mobile Compact Layout for World */}
                <div className="flex sm:flex-col justify-between items-center sm:items-start h-full gap-2 sm:gap-0">
                    
                    {/* Left: Title & Converted Price */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-0.5 sm:mb-2">
                             <Globe size={14} className="text-blue-600 sm:hidden" />
                             <h3 className="text-[11px] sm:text-xs font-bold uppercase text-blue-700 sm:text-gray-500 tracking-wider whitespace-nowrap">Thế giới</h3>
                        </div>
                         {/* Desktop Price (Hidden on Mobile here, shown below) */}
                        <div className="hidden sm:flex flex-col gap-0 relative z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900 tabular-nums">{product.today.sell.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-gray-500">USD</span>
                            </div>
                        </div>

                        {/* Converted Price */}
                        <div className="flex flex-col sm:mt-2 sm:pt-2 sm:border-t sm:border-gray-100 sm:mb-2">
                            <span className="hidden sm:inline text-[10px] text-gray-500 font-medium">Quy đổi VNĐ:</span>
                            <span className="text-[11px] sm:text-lg font-bold text-gray-500 sm:text-gray-900 tabular-nums">
                                <span className="sm:hidden text-[10px] font-normal mr-1">Quy đổi:</span>
                                {(vndValue).toLocaleString('vi-VN', {maximumFractionDigits: 0})} 
                                <span className="text-[9px] sm:text-[10px] ml-0.5 sm:ml-1 text-gray-500 font-medium">đ</span>
                            </span>
                        </div>
                    </div>

                    {/* Right: Price & Action */}
                    <div className="flex flex-col items-end sm:items-start sm:w-full sm:mt-auto">
                        {/* Mobile Price Display */}
                        <div className="sm:hidden flex flex-col items-end">
                             <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-gray-900 tabular-nums leading-none">{product.today.sell.toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-gray-500">$</span>
                            </div>
                             <div className={`text-[10px] font-bold mt-0.5 ${product.percentSell >= 0 ? 'text-trend-up' : 'text-trend-down'}`}>
                                {product.percentSell >= 0 ? '+' : ''}{product.percentSell.toFixed(2)}%
                             </div>
                        </div>

                        <div className="hidden sm:flex pt-2 w-full items-center text-blue-600 font-bold text-[11px] group-hover:underline">
                            Chi tiết <ChevronRight size={12} className="ml-0.5" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Logic for Vietnam Products
    return (
      <div 
        onClick={() => onProductClick(product)}
        className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full justify-between"
      >
        <div className="mb-1 sm:mb-2 flex justify-between items-start">
          <h3 className="font-bold tracking-tight text-gray-900 text-[11px] sm:text-sm uppercase leading-tight sm:leading-normal max-w-[80%]">{label}</h3>
          <div className="text-gray-300 group-hover:text-blue-500 transition-colors hidden sm:block"><BarChart2 size={16} /></div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
           {/* Sell Price */}
           <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase mb-0 sm:mb-0.5">Bán ra</span>
              <div className="flex items-baseline flex-wrap">
                  <span className={`font-black tabular-nums leading-none tracking-tight ${highlight ? 'text-vne-red text-[20px] sm:text-[30px]' : 'text-gray-900 text-[18px] sm:text-[24px]'}`}>
                    {product.today.sell.toLocaleString('vi-VN')}
                  </span>
                  <TrendInline value={product.changeSell} percent={product.percentSell} />
              </div>
           </div>
           
           {/* Buy Price */}
           <div className="flex flex-col border-t border-dashed border-gray-100 pt-1.5 sm:pt-2">
               <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase mb-0 sm:mb-0.5">Mua vào</span>
               <div className="flex items-baseline flex-wrap">
                   <span className="text-[14px] sm:text-lg font-bold text-gray-800 tabular-nums leading-none">
                      {product.today.buy.toLocaleString('vi-VN')}
                   </span>
                   <TrendInline value={product.changeBuy} percent={product.percentBuy} />
               </div>
           </div>
        </div>

        {/* Spread footer */}
        <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 -mx-2.5 sm:-mx-3 -mb-2.5 sm:-mb-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-b-lg sm:rounded-b-xl">
             <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium">Chênh lệch:</span>
             <span className="text-[10px] sm:text-xs font-bold text-gray-900 tabular-nums">
                {product.spread.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} 
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
    
    // Mock high/low
    const displayHigh = displaySell + (15 * selectedCurrency.rate);
    const displayLow = displaySell - (10 * selectedCurrency.rate);

    // Analysis Logic
    const isUp = world.percentSell >= 0;
    const trendText = isUp ? 'tăng' : 'giảm';
    const TrendIcon = isUp ? TrendingUp : TrendingDown;
    const trendColor = isUp ? 'text-[#0f7d4b]' : 'text-[#bd0000]'; // VnExpress style Green/Red
    
    // Conversion Logic
    const USD_VND_RATE = 25450;
    const ounceInVnd = world.today.sell * USD_VND_RATE;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-300 pb-4">
            {/* CARD 1: WORLD PRICES - Full Width */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm flex flex-col font-sans">
                {/* Header */}
                <div className="px-5 py-4 flex justify-between items-start border-b border-[#f0f0f0]">
                    <div>
                        <h2 className="text-[#003d7e] text-lg font-bold uppercase flex items-center gap-2">
                            <Globe size={18} /> Vàng Thế Giới
                        </h2>
                        <p className="text-[13px] text-gray-500 mt-1">Dữ liệu thời gian thực (XAU/USD)</p>
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors"
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

                <div className="p-5 pb-0">
                    {/* Price Overview Layout */}
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-5">
                        {/* LEFT: Main Price */}
                        <div>
                             <div className="inline-block bg-[#f0f0f0] text-[#757575] text-[10px] font-bold uppercase px-2 py-0.5 rounded mb-2">Giá Bán (Ask)</div>
                             <div className="flex items-center gap-3">
                                 {/* BIG PRICE - Styled like Screenshot */}
                                 <span className="text-6xl font-black text-[#222] tabular-nums tracking-tighter leading-none">
                                    {selectedCurrency.symbol}{displaySell.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                                 </span>
                                 
                                 {/* Change Indicator next to big price */}
                                 <div className="flex flex-col">
                                     <span className={`flex items-center text-sm font-bold ${trendColor}`}>
                                        {isUp ? <ArrowUp size={18} strokeWidth={3}/> : <ArrowDown size={18} strokeWidth={3}/>}
                                        {Math.abs(displayChange).toFixed(1)} {selectedCurrency.symbol}
                                     </span>
                                     <span className={`text-xs font-semibold ${trendColor}`}>
                                        ({Math.abs(world.percentSell).toFixed(2)}%)
                                     </span>
                                 </div>
                             </div>
                        </div>

                        {/* RIGHT: Secondary Stats Boxes */}
                        <div className="flex gap-4 ml-auto">
                            <div className="border border-[#e5e5e5] rounded p-3 min-w-[140px]">
                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Giá Mua (Bid)</div>
                                <div className="text-xl font-bold text-gray-800">{selectedCurrency.symbol}{displayBuy.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                            </div>
                            <div className="border border-[#e5e5e5] rounded p-3 min-w-[140px]">
                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Cao / Thấp</div>
                                <div className="text-base font-bold text-gray-800">
                                    <span className="text-[#0f7d4b]">{Math.round(displayHigh)}</span> <span className="text-gray-300">/</span> <span className="text-[#bd0000]">{Math.round(displayLow)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ANALYSIS BOX (Requirement) */}
                    <div className="bg-[#f7f7f7] rounded border border-[#e5e5e5] p-4 mb-6 relative">
                        <div className="flex items-start gap-3">
                             <div className="mt-1">
                                <TrendIcon size={20} className={trendColor} />
                             </div>
                             <div className="flex-1">
                                <p className="text-[14px] text-[#222] leading-snug font-medium">
                                    Giá vàng thế giới <span className={trendColor}>{trendText} {Math.abs(world.percentSell).toFixed(2)}%</span> trong 24 giờ qua, 
                                    tương ứng với {trendText} <span className={trendColor}>{Math.abs(displayChange).toFixed(2)} {selectedCurrency.code}/Ounce</span>.
                                </p>
                                <div className="mt-2 pt-2 border-t border-[#e0e0e0] flex items-center gap-2 text-[13px] text-gray-600">
                                    <Info size={14} className="text-gray-400" />
                                    <span>1 Ounce = <span className="font-bold text-[#222]">{ounceInVnd.toLocaleString('vi-VN', {maximumFractionDigits: 0})} VNĐ</span></span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                {/* TRADINGVIEW ADVANCED CHART EMBED */}
                <div className="border-t border-[#e5e5e5] bg-gray-50">
                    <AdvancedRealTimeChart />
                </div>
            </div>

            {/* CARD 2: KITCO / TECHNICAL DATA - Full Width */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="bg-[#1a1a1a] px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} className="text-yellow-400"/> Phân tích kỹ thuật & Dữ liệu
                    </h2>
                </div>

                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT: Technical Analysis Gauge */}
                        <div className="lg:col-span-5 flex flex-col">
                             <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Gauge size={14} /> Chỉ số sức mạnh (XAU/USD)
                             </h3>
                             <div className="border border-gray-100 rounded-lg overflow-hidden h-[350px]">
                                 <TechnicalAnalysisWidget />
                             </div>
                        </div>

                        {/* RIGHT: Data Table & Mini Charts */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                             
                             {/* Mini Charts Row */}
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Bạc (Silver)</h4>
                                    <div className="border border-gray-100 rounded h-[120px] overflow-hidden">
                                        <MiniChartWidget symbol="OANDA:XAGUSD" name="Silver" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Chỉ số USD (DXY)</h4>
                                    <div className="border border-gray-100 rounded h-[120px] overflow-hidden">
                                        <MiniChartWidget symbol="TVC:DXY" name="DXY" />
                                    </div>
                                </div>
                             </div>

                             {/* Kitco Data Table */}
                             <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <ImageIcon size={14} /> Bảng giá Spot (Nguồn: Kitco)
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr>
                                                <th className="p-3 text-left">Kim loại</th>
                                                <th className="p-3 text-right">Bid</th>
                                                <th className="p-3 text-right">Ask</th>
                                                <th className="p-3 text-right">Thay đổi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 font-medium">
                                            <tr>
                                                <td className="p-3 font-bold text-yellow-700">Gold</td>
                                                <td className="p-3 text-right">2,624.50</td>
                                                <td className="p-3 text-right text-gray-500">2,625.50</td>
                                                <td className="p-3 text-right text-red-600 font-bold">-12.40</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-bold text-gray-500">Silver</td>
                                                <td className="p-3 text-right">30.84</td>
                                                <td className="p-3 text-right text-gray-500">30.94</td>
                                                <td className="p-3 text-right text-green-600 font-bold">+0.15</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-bold text-blue-700">Platinum</td>
                                                <td className="p-3 text-right">950.00</td>
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
        <div className={`p-2 sm:p-4 bg-white ${activeTab === 'world' ? 'h-auto' : 'h-auto'}`}>
            {activeTab === 'vn' ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                        {/* Box 1: SJC */}
                        <div className="col-span-1 h-full">
                            <MainCard product={sjc} label="Vàng SJC" highlight={true} />
                        </div>
                        
                        {/* Box 2: Jewelry */}
                        <div className="col-span-1 h-full">
                            <MainCard product={jewelry} label="Nữ trang 9999" highlight={true} />
                        </div>

                        {/* Box 3: World (Condensed on Mobile) */}
                        <div className="col-span-2 md:col-span-1 h-full">
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