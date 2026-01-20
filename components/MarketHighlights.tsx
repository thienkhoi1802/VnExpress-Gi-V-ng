import React, { useState, useMemo } from 'react';
import { ComputedGoldProduct, HistoryPoint } from '../types';
import { ArrowUp, ArrowDown, Minus, Globe, ChevronRight, ChevronDown, Check, X, ZoomIn, Clock } from 'lucide-react';
import { AdvancedRealTimeChart, TechnicalAnalysisWidget } from './TradingViewWidgets';
import { Sparkline } from './Sparkline';

interface Props {
  data: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  onProductClick: (p: ComputedGoldProduct) => void;
  activeTab: 'vn' | 'world';
  setActiveTab: (tab: 'vn' | 'world') => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 0.92, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', rate: 0.79, flag: '🇬🇧' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', rate: 150.5, flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', rate: 1.35, flag: '🇨🇦' },
];

const VietnamFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm ring-1 ring-black/5">
    <rect width="24" height="16" fill="#DA251D"/>
    <path d="M12 2.1L13.9056 6.24166L18.3511 6.56492L14.9458 9.5209L16.0249 13.885L12 11.475L7.9751 13.885L12 11.475L7.9751 13.885L9.05423 9.5209L5.64886 6.56492L10.0944 6.24166L12 2.1Z" fill="#FFEB3B"/>
  </svg>
);

const TrendInline = ({ value, percent }: { value: number, percent?: number }) => {
  const isUp = value > 0;
  const isDown = value < 0;
  const color = isUp ? 'text-[#0f7d4b]' : isDown ? 'text-[#bd0000]' : 'text-gray-500';

  return (
    <div className={`flex items-center gap-1 text-[13px] sm:text-[15px] font-bold ${color} tabular-nums whitespace-nowrap`}>
      <span>{isUp ? '+' : ''}{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      {percent !== undefined && (
        <span>({isUp ? '+' : ''}{percent.toFixed(2)}%)</span>
      )}
    </div>
  );
};

const WorldStrip = ({ 
  product, 
  historyData, 
  setActiveTab 
}: { 
  product?: ComputedGoldProduct, 
  historyData: HistoryPoint[],
  setActiveTab: (tab: 'vn' | 'world') => void 
}) => {
    if (!product) return null;
    const isUp = product.percentSell >= 0;

    return (
        <div 
            onClick={() => setActiveTab('world')}
            className="bg-white border border-gray-300 shadow-sm p-3 sm:px-4 sm:py-4 cursor-pointer hover:border-[#9f224e] hover:shadow-md transition-all group rounded-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-row items-center justify-between sm:justify-start gap-1 sm:gap-4 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                             <h3 className="text-base font-bold text-[#9f224e] font-serif shrink-0">
                                Vàng thế giới
                            </h3>
                        </div>
                        <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
                        <div className="flex flex-wrap items-baseline gap-x-2 sm:gap-x-3">
                            <span className="text-xl sm:text-2xl font-black text-gray-900 tabular-nums font-sans tracking-tight">
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

                    <div className="w-[70px] h-[32px] sm:hidden shrink-0 pl-3 flex items-center justify-center border-l border-gray-100 ml-2">
                        <Sparkline 
                            data={historyData} 
                            dataKey={product.id} 
                            trend={isUp ? 'up' : 'down'} 
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end border-t border-gray-100 sm:border-t-0 pt-2 sm:pt-0 mt-1">
                    <span className="sm:hidden text-xs text-gray-500 font-medium font-sans lowercase">xem biểu đồ &amp; phân tích</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#9f224e] group-hover:underline decoration-[#9f224e]/30 underline-offset-2 font-sans whitespace-nowrap">
                        Chi tiết <ChevronRight size={18} strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </div>
    )
}

const MainCard = ({ 
    product, 
    worldProduct, 
    historyData,
    label, 
    onProductClick 
}: { 
    product?: ComputedGoldProduct,
    worldProduct?: ComputedGoldProduct,
    historyData: HistoryPoint[],
    label: string, 
    onProductClick: (p: ComputedGoldProduct) => void,
}) => {
  if (!product) return null;

  let diffTextValue = null;
  if (worldProduct) {
     const USD_RATE = 25450;
     const TAEL_TO_OZ = 1.20565;
     const worldVnd = (worldProduct.today.sell * TAEL_TO_OZ * USD_RATE) / 1000000;
     const diff = product.today.sell - worldVnd;
     diffTextValue = `${diff > 0 ? '+' : ''}${diff.toLocaleString('vi-VN', {maximumFractionDigits: 2})}`;
  }

  const labelStyle = "text-gray-500 text-[13px] sm:text-[15px] font-normal tracking-tight";
  const valueStyle = "font-bold text-gray-900 tabular-nums text-[14px] sm:text-[18px]";
  const unitStyle = "text-[11px] font-bold text-gray-500 ml-1";

  const isUp = product.percentSell >= 0;

  return (
    <div 
      onClick={() => onProductClick(product)}
      className="bg-white border border-gray-300 hover:border-[#9f224e] hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full shadow-sm rounded-sm overflow-hidden"
    >
      <div className="px-3 sm:px-4 py-2.5 flex justify-between items-center border-b border-gray-200 bg-gray-50/50">
          <h3 className="font-bold tracking-tight text-gray-900 text-[20px] sm:text-[22px] leading-tight font-serif truncate">
              {label}
          </h3>
          <span className="text-[11px] sm:text-[12px] text-gray-400 font-medium shrink-0 whitespace-nowrap">Triệu/lượng</span>
      </div>

      <div className="flex items-center">
          <div className="flex-grow px-2 sm:px-4 py-4 sm:py-6 grid grid-cols-2 gap-1 sm:gap-4 items-start font-sans">
              <div className="flex flex-col border-r border-gray-100 pr-1 sm:pr-2 min-w-0">
                  <span className="text-[11px] sm:text-[13px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bán ra</span>
                  <div className="flex flex-col items-start">
                      <span className="font-black tabular-nums leading-none tracking-tighter text-vne-green text-[28px] sm:text-[44px]">
                        {product.today.sell.toLocaleString('vi-VN')}
                      </span>
                      <div className={`flex items-center gap-0.5 text-[14px] sm:text-[16px] font-black mt-1.5 ${product.changeSell >= 0 ? 'text-vne-green' : 'text-trend-down'} tabular-nums whitespace-nowrap`}>
                          {product.changeSell >= 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                          <span>{Math.abs(product.changeSell).toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</span>
                          <span className="text-[11px] sm:text-[13px] font-bold ml-1 opacity-90">
                              ({product.percentSell >= 0 ? '+' : ''}{product.percentSell.toFixed(2)}%)
                          </span>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col pl-1 sm:pl-2 min-w-0">
                  <span className="text-[11px] sm:text-[13px] text-gray-400 font-bold uppercase tracking-wider mb-1">Mua vào</span>
                  <div className="flex flex-col items-start">
                      <span className="font-black tabular-nums leading-none tracking-tighter text-gray-900 text-[28px] sm:text-[44px]">
                        {product.today.buy.toLocaleString('vi-VN')}
                      </span>
                      <div className={`flex items-center gap-0.5 text-[14px] sm:text-[16px] font-black mt-1.5 ${product.changeBuy >= 0 ? 'text-vne-green' : 'text-trend-down'} tabular-nums whitespace-nowrap`}>
                          {product.changeBuy >= 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                          <span>{Math.abs(product.changeBuy).toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</span>
                          <span className="text-[11px] sm:text-[13px] font-bold ml-1 opacity-90">
                              ({product.percentBuy >= 0 ? '+' : ''}{product.percentBuy.toFixed(2)}%)
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="w-[70px] h-[50px] sm:hidden shrink-0 pr-3 flex items-center justify-center border-l border-gray-100 ml-1">
              <Sparkline 
                data={historyData} 
                dataKey={product.id} 
                trend={isUp ? 'up' : 'down'} 
              />
          </div>
      </div>

      {diffTextValue && (
        <div className="bg-white border-t border-gray-100 px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-1.5 font-sans">
             <div className="flex items-center justify-between">
                  <span className={labelStyle}>Chênh lệch so với thế giới:</span>
                  <span className={valueStyle}>
                      {diffTextValue} <span className={unitStyle}>Triệu</span>
                  </span>
             </div>
        </div>
      )}
    </div>
  );
};

export const MarketHighlights: React.FC<Props> = ({ 
    data, 
    historyData,
    onProductClick, 
    activeTab, 
    setActiveTab 
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const hourlyVersion = useMemo(() => {
    const d = new Date();
    return d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + d.getHours().toString().padStart(2, '0');
  }, []);

  const sjc = data.find(p => p.group === 'sjc');
  const jewelry = data.find(p => p.group === 'jewelry'); 
  const world = data.find(p => p.group === 'world');

  const WorldDetailTab = () => {
    if (!world) return null;

    const currentRate = selectedCurrency.rate;
    const bid = world.today.buy * currentRate; 
    const ask = world.today.sell * currentRate; 
    const change = world.changeSell * currentRate;
    const percent = world.percentSell;

    const high = (world.today.sell * 1.012) * currentRate;
    const low = (world.today.buy * 0.992) * currentRate;

    const conversions = [
      { unit: 'Ounce', val: bid, change: change },
      { unit: 'Gram', val: bid / 31.1035, change: change / 31.1035 },
      { unit: 'Kilo', val: (bid / 31.1035) * 1000, change: (change / 31.1035) * 1000 },
      { unit: 'Pennyweight', val: bid / 20, change: change / 20 },
      { unit: 'Tola', val: bid / 2.666, change: change / 2.666 },
      { unit: 'Tael', val: bid * 1.2152, change: change * 1.2152 },
    ];

    const ChartImage = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => (
      <div 
        className={`border border-gray-200 p-1 bg-white relative group cursor-zoom-in hover:border-[#9f224e] transition-colors overflow-hidden rounded-sm ${className}`}
        onClick={() => setZoomedImage(src)}
      >
        <img 
          src={`${src}${src.includes('?') ? '&' : '?'}v=${hourlyVersion}`} 
          alt={alt} 
          className="w-full h-auto block object-cover" 
          loading="lazy" 
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 text-white p-1.5 rounded-sm transition-opacity">
           <ZoomIn size={18} />
        </div>
      </div>
    );

    return (
        <div className="flex flex-col gap-3 sm:gap-4 animate-in fade-in slide-in-from-right-2 duration-300 pb-4">
            {zoomedImage && (
              <div 
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-200"
                onClick={() => setZoomedImage(null)}
              >
                <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[101]" onClick={() => setZoomedImage(null)}>
                  <X size={32} />
                </button>
                <img src={`${zoomedImage}${zoomedImage.includes('?') ? '&' : '?'}v=${hourlyVersion}`} alt="Zoom" className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-200" />
              </div>
            )}

            <div className="bg-white border border-gray-200 shadow-sm flex flex-col font-sans rounded-none overflow-hidden p-3 sm:p-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <h2 className="text-[15px] sm:text-lg font-serif font-bold text-[#111] leading-tight">
                        Giá vàng thế giới
                    </h2>
                    <div className="relative">
                        <button 
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 px-2 py-1 text-xs font-bold text-gray-800 transition-colors rounded-sm shadow-sm"
                        >
                            <span className="text-sm">{selectedCurrency.flag}</span>
                            <span>{selectedCurrency.code}</span>
                            <ChevronDown size={12} />
                        </button>
                        {isCurrencyOpen && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 shadow-xl z-20 py-1 rounded-sm">
                            {CURRENCIES.map(curr => (
                              <button key={curr.code} onClick={() => {setSelectedCurrency(curr); setIsCurrencyOpen(false)}} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 text-left">
                                <span>{curr.flag}</span>
                                <span>{curr.code}</span>
                                {curr.code === selectedCurrency.code && <Check size={12} className="ml-auto text-vne-red"/>}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-5">
                    <div className="space-y-3 sm:space-y-4">
                         <div className="flex items-baseline justify-between gap-4">
                            <span className="text-gray-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest shrink-0">Giá bán</span>
                            <div className="flex flex-col items-end">
                                <span className="text-[30px] sm:text-[42px] font-black text-[#111] leading-none tabular-nums tracking-tighter">
                                    {bid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <div className="mt-1.5">
                                    <TrendInline value={change} percent={percent} />
                                </div>
                            </div>
                         </div>

                         <div className="flex items-center justify-between py-2 border-t border-gray-50">
                             <span className="text-gray-400 text-[10px] sm:text-[10px] font-bold uppercase tracking-wide opacity-80">Giá mua</span>
                             <span className="text-xl sm:text-2xl font-semibold text-gray-400 tabular-nums">
                                {ask.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                             </span>
                         </div>
                    </div>

                    <div className="flex flex-col border-t border-gray-50 pt-2">
                        {conversions.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1.5 text-[12px] sm:text-[14px] border-b border-gray-50/50 last:border-0">
                                <span className="font-bold text-gray-700">{item.unit}</span>
                                <div className="flex items-center gap-3 sm:gap-8">
                                    <span className="font-medium text-gray-600 tabular-nums">
                                        {item.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className={`font-bold tabular-nums min-w-[60px] text-right ${item.change >= 0 ? 'text-[#0f7d4b]' : 'text-[#bd0000]'}`}>
                                        {item.change >= 0 ? '+' : ''}{item.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 space-y-1.5">
                         <div className="flex justify-between text-[11px] sm:text-[13px] font-bold text-gray-500 tabular-nums">
                            <span>{low.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            <span>{high.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                         </div>
                         <div className="relative h-1 w-full bg-gray-100 rounded-full">
                             <div 
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#111] border-2 border-white rounded-full shadow-sm"
                                style={{ left: `${((bid - low) / (high - low)) * 100}%` }}
                             ></div>
                         </div>
                         <div className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                             Day&apos;s Range
                         </div>
                    </div>

                    <div className="mt-1 bg-[#f0f9ff] border border-blue-50 p-4 rounded-sm">
                        <p className="text-[18px] text-[#1e293b] leading-snug font-sans text-left">
                            Giá thế giới quy đổi: <span className="font-black text-[#0f172a]">117.795.325 VNĐ/Ounce</span>, giá vàng thế giới {percent >= 0 ? 'tăng' : 'giảm'} <span className={`font-black ${percent >= 0 ? 'text-[#0f7d4b]' : 'text-[#bd0000]'}`}>{Math.abs(percent).toFixed(2)}%</span> trong 24 giờ qua.
                        </p>
                    </div>

                    <div className="flex items-center justify-start gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wide opacity-50">
                         <Clock size={10} /> {world.updatedAt} • Kitco, TradingView
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white border border-gray-200 overflow-hidden shadow-sm flex flex-col rounded-sm">
                    <div className="px-3 py-2 border-b border-gray-50 bg-white">
                        <h2 className="text-sm font-serif font-bold text-gray-900">Biểu đồ trực tuyến (XAU/USD)</h2>
                    </div>
                    <div className="border-b border-gray-100"><AdvancedRealTimeChart /></div>
                </div>

                <div className="bg-white border border-gray-200 overflow-hidden shadow-sm flex flex-col rounded-sm">
                    <div className="px-3 py-2 border-b border-gray-50 bg-white">
                        <h2 className="text-sm font-serif font-bold text-gray-900">Phân tích kỹ thuật</h2>
                    </div>
                    <div className="h-[380px] sm:h-[420px]"><TechnicalAnalysisWidget /></div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden font-sans">
                    <div className="px-3 py-2 border-b border-gray-50 bg-white">
                        <h2 className="text-sm font-serif font-bold text-gray-900">Lịch sử giá vàng</h2>
                        <div className="text-[11px] sm:text-xs text-gray-400 font-medium mt-0.5">
                            Cập nhật: {world.updatedAt}
                        </div>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <ChartImage src="https://www.kitco.com/chart-images/images/live/gold.gif" alt="Live 24hrs" />
                        <ChartImage src="https://www.kitco.com/chart-images/images/live/nygold.gif" alt="Live New York" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                             <ChartImage alt="30 Ngày" src="https://www.kitco.com/chart-images/LFgif/AU0030lnb.gif" />
                             <ChartImage alt="60 Ngày" src="https://www.kitco.com/chart-images/LFgif/AU0060lnb.gif" />
                             <ChartImage alt="6 Tháng" src="https://www.kitco.com/chart-images/LFgif/AU0182nyb.gif" />
                             <ChartImage alt="1 Năm" src="https://www.kitco.com/chart-images/LFgif/AU0365nyb.gif" />
                             <ChartImage alt="5 Năm" src="https://www.kitco.com/chart-images/LFgif/AU1825nyb.gif" />
                             <ChartImage alt="10 Năm" src="https://www.kitco.com/chart-images/LFgif/AU3650nyb.gif" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm overflow-hidden flex flex-col rounded-sm">
        <div className="flex border-b border-gray-200 font-serif">
            <button 
                onClick={() => setActiveTab('vn')}
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-bold transition-all relative outline-none ${activeTab === 'vn' ? 'text-[#9f224e] bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
                <div className={`transition-transform duration-300 ${activeTab === 'vn' ? 'scale-110 sm:scale-125' : 'grayscale opacity-70'}`}><VietnamFlag /></div>
                <span>Việt Nam</span>
                {activeTab === 'vn' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#9f224e]"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('world')}
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-bold transition-all relative outline-none ${activeTab === 'world' ? 'text-[#9f224e] bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
                <Globe size={22} className={`${activeTab === 'world' ? 'text-[#9f224e]' : 'text-gray-400'}`} />
                <span>Thế giới</span>
                {activeTab === 'world' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#9f224e]"></div>}
            </button>
        </div>

        <div className="p-2 sm:p-5 bg-white">
            {activeTab === 'vn' ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MainCard 
                            product={sjc} 
                            worldProduct={world} 
                            historyData={historyData}
                            label="Vàng miếng SJC" 
                            onProductClick={onProductClick} 
                        />
                        <MainCard 
                            product={jewelry} 
                            worldProduct={world} 
                            historyData={historyData}
                            label="Vàng nhẫn" 
                            onProductClick={onProductClick} 
                        />
                    </div>
                    <WorldStrip 
                        product={world} 
                        historyData={historyData}
                        setActiveTab={setActiveTab} 
                    />
                </div>
            ) : (
                <WorldDetailTab />
            )}
        </div>
    </div>
  );
};