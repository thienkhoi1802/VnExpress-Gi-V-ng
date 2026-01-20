import React, { useState, useMemo } from 'react';
import { ComputedGoldProduct } from '../types';
import { ArrowUp, ArrowDown, Minus, Globe, ChevronRight, ChevronDown, Check, TrendingUp, Info, TrendingDown, X, ZoomIn } from 'lucide-react';
import { AdvancedRealTimeChart, TechnicalAnalysisWidget } from './TradingViewWidgets';

interface Props {
  data: ComputedGoldProduct[];
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
    <path d="M12 2.1L13.9056 6.24166L18.3511 6.56492L14.9458 9.5209L16.0249 13.885L12 11.475L7.9751 13.885L9.05423 9.5209L5.64886 6.56492L10.0944 6.24166L12 2.1Z" fill="#FFEB3B"/>
  </svg>
);

const TrendInline = ({ value }: { value: number }) => {
  const isUp = value > 0;
  const isDown = value < 0;
  const color = isUp ? 'text-trend-up' : isDown ? 'text-trend-down' : 'text-gray-500';
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <div className={`flex items-center gap-0.5 text-[12px] sm:text-[16px] font-black ${color} tabular-nums whitespace-nowrap`}>
      <Icon size={12} className="sm:w-[14px]" strokeWidth={4} />
      <span>{value !== 0 ? Math.abs(value).toLocaleString('vi-VN', { minimumFractionDigits: 1 }) : '0'}</span>
    </div>
  );
};

const WorldStrip = ({ product, setActiveTab }: { product?: ComputedGoldProduct, setActiveTab: (tab: 'vn' | 'world') => void }) => {
    if (!product) return null;
    const isUp = product.percentSell >= 0;

    return (
        <div 
            onClick={() => setActiveTab('world')}
            className="bg-white border border-gray-300 shadow-sm p-3 sm:px-4 sm:py-4 cursor-pointer hover:border-[#9f224e] hover:shadow-md transition-all group rounded-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1">
                    <div className="flex items-center gap-2">
                         <h3 className="text-base font-bold text-[#9f224e] font-serif shrink-0">
                            Vàng thế giới
                        </h3>
                    </div>
                    <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
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
                <div className="flex items-center justify-between sm:justify-end border-t border-gray-100 sm:border-t-0 pt-2 sm:pt-0 mt-1">
                    <span className="sm:hidden text-xs text-gray-500 font-medium font-sans lowercase">xem biểu đồ & phân tích</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#9f224e] group-hover:underline decoration-[#9f224e]/30 underline-offset-2 font-sans whitespace-nowrap">
                        Chi tiết <ChevronRight size={18} strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </div>
    )
}

const MainCard = ({ product, worldProduct, label, onProductClick }: { 
    product?: ComputedGoldProduct,
    worldProduct?: ComputedGoldProduct,
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

  return (
    <div 
      onClick={() => onProductClick(product)}
      className="bg-white border border-gray-300 hover:border-[#9f224e] hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full shadow-sm rounded-sm overflow-hidden"
    >
      <div className="px-3 sm:px-4 py-2 flex justify-between items-center border-b border-gray-200 bg-gray-50/50">
          <h3 className="font-bold tracking-tight text-gray-900 text-[15px] sm:text-lg leading-tight font-serif truncate">
              {label}
          </h3>
          <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium shrink-0 whitespace-nowrap">Triệu/lượng</span>
      </div>

      <div className="px-2 sm:px-4 py-4 sm:py-8 grid grid-cols-2 gap-1 sm:gap-4 flex-grow items-start font-sans">
          <div className="flex flex-col border-r border-gray-100 pr-1 sm:pr-2 min-w-0">
              <span className="text-[11px] sm:text-[13px] text-gray-400 font-bold uppercase tracking-wider mb-1 sm:mb-2">Bán ra</span>
              <div className="flex items-end flex-wrap sm:flex-nowrap">
                  <span className="font-black tabular-nums leading-none tracking-tighter text-vne-green text-[28px] sm:text-[44px] shrink-0">
                    {product.today.sell.toLocaleString('vi-VN')}
                  </span>
                  <div className="flex flex-col ml-1 sm:ml-2 pb-0.5 sm:pb-1.5 shrink-0">
                      <TrendInline value={product.changeSell} />
                  </div>
              </div>
          </div>

          <div className="flex flex-col pl-1 sm:pl-2 min-w-0">
              <span className="text-[11px] sm:text-[13px] text-gray-400 font-bold uppercase tracking-wider mb-1 sm:mb-2">Mua vào</span>
              <div className="flex items-end flex-wrap sm:flex-nowrap">
                  <span className="font-black tabular-nums leading-none tracking-tighter text-gray-900 text-[28px] sm:text-[44px] shrink-0">
                    {product.today.buy.toLocaleString('vi-VN')}
                  </span>
                  <div className="flex flex-col ml-1 sm:ml-2 pb-0.5 sm:pb-1.5 shrink-0">
                      <TrendInline value={product.changeBuy} />
                  </div>
              </div>
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

export const MarketHighlights: React.FC<Props> = ({ data, onProductClick, activeTab, setActiveTab }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const hourlyVersion = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 13).replace(/[-T]/g, '');
  }, []);

  const sjc = data.find(p => p.group === 'sjc');
  const jewelry = data.find(p => p.group === 'jewelry'); 
  const world = data.find(p => p.group === 'world');

  const WorldDetailTab = () => {
    if (!world) return null;

    const displaySell = world.today.sell * selectedCurrency.rate;
    const isUp = world.percentSell >= 0;
    const trendText = isUp ? 'tăng' : 'giảm';
    const trendColor = isUp ? 'text-[#0f7d4b]' : 'text-[#bd0000]'; 
    
    const USD_VND_RATE = 25450;
    const ounceInVnd = world.today.sell * USD_VND_RATE;

    const ChartImage = ({ src, alt }: { src: string, alt: string }) => (
      <div 
        className="border border-gray-200 p-1 bg-white relative group cursor-zoom-in hover:border-[#9f224e] transition-colors"
        onClick={() => setZoomedImage(src)}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto block" 
          loading="lazy" 
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 text-white p-1 rounded-sm transition-opacity">
           <ZoomIn size={16} />
        </div>
      </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-300 pb-4">
            {/* Image Zoom Lightbox Overlay */}
            {zoomedImage && (
              <div 
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-200"
                onClick={() => setZoomedImage(null)}
              >
                <button 
                  className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[101]"
                  onClick={() => setZoomedImage(null)}
                >
                  <X size={32} />
                </button>
                <img 
                  src={zoomedImage} 
                  alt="Zoomed Chart" 
                  className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-200"
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-sans">
                  Click bất kỳ đâu để đóng
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-300 overflow-hidden shadow-sm flex flex-col font-sans rounded-sm">
                <div className="px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-start border-b border-gray-100 bg-white">
                    <div className="flex items-baseline gap-2 overflow-hidden pr-2">
                        <h2 className="text-lg font-serif font-bold text-gray-900 shrink-0">
                            Giá vàng thế giới
                        </h2>
                        <span className="text-[11px] sm:text-xs text-gray-500 font-medium border-l border-gray-300 pl-2 font-sans truncate">Dữ liệu XAU/USD</span>
                    </div>
                    
                    <div className="relative font-sans shrink-0">
                        <button 
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1.5 text-[13px] sm:text-sm font-bold text-gray-800 transition-colors shadow-sm rounded-sm"
                        >
                            <span className="text-base sm:text-lg">{selectedCurrency.flag}</span>
                            <span>{selectedCurrency.code}</span>
                            <ChevronDown size={14} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        
                        {isCurrencyOpen && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCurrencyOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-1 w-36 sm:w-48 bg-white border border-gray-300 shadow-xl z-20 py-1 overflow-hidden rounded-sm">
                                {CURRENCIES.map((curr) => (
                                    <button
                                        key={curr.code}
                                        onClick={() => { setSelectedCurrency(curr); setIsCurrencyOpen(false); }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm sm:text-base hover:bg-gray-100 text-left font-sans"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{curr.flag}</span>
                                            <span className="font-bold text-gray-800">{curr.code}</span>
                                        </div>
                                        {curr.code === selectedCurrency.code && <Check size={16} className="text-[#9f224e]"/>}
                                    </button>
                                ))}
                            </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 sm:p-6 pb-2 font-sans">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-5 sm:gap-6 mb-6">
                        <div>
                             <div className="inline-block bg-[#f3f4f6] text-gray-600 text-[11px] sm:text-xs font-bold px-2 py-0.5 mb-2 rounded uppercase font-sans border border-gray-200">Giá bán (Ask)</div>
                             <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                 <span className="text-[34px] sm:text-[42px] font-black text-[#222] tabular-nums tracking-tighter leading-none font-sans">
                                    <span className="text-[20px] sm:text-[28px] mr-1 opacity-60 font-bold">{selectedCurrency.symbol}</span>
                                    {displaySell.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                                 </span>
                                 <div className="flex flex-row md:flex-col items-baseline md:items-start gap-1 md:gap-0">
                                     <span className={`flex items-center text-base sm:text-lg font-bold ${trendColor} font-sans`}>
                                        {isUp ? <ArrowUp size={16} strokeWidth={3}/> : <ArrowDown size={16} strokeWidth={3}/>}
                                        {Math.abs(world.changeSell).toFixed(1)}
                                     </span>
                                     <span className={`text-[11px] sm:text-sm font-semibold ${trendColor} font-sans`}>
                                        ({Math.abs(world.percentSell).toFixed(2)}%)
                                     </span>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-[#f0f9ff] border border-blue-100 p-3.5 sm:p-5 mb-6 relative rounded">
                        <div className="flex items-start gap-3 sm:gap-4">
                             <div className="flex-1">
                                <p className="text-[13px] sm:text-base text-gray-800 leading-normal font-medium font-sans">
                                    Giá vàng thế giới <span className={trendColor}>{trendText} {Math.abs(world.percentSell).toFixed(2)}%</span> trong 24 giờ qua.
                                </p>
                                <div className="mt-2.5 pt-2.5 border-t border-blue-100 flex flex-wrap items-center gap-2 text-[12px] sm:text-sm text-gray-600 font-sans">
                                    <Info size={14} className="text-blue-500" />
                                    <span>Quy đổi: <span className="font-bold text-gray-900">{ounceInVnd.toLocaleString('vi-VN', {maximumFractionDigits: 0})} VNĐ/Ounce</span></span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-200 bg-gray-100">
                    <AdvancedRealTimeChart />
                </div>
            </div>

            <div className="bg-white border border-gray-300 overflow-hidden shadow-sm flex flex-col font-sans rounded-sm">
                <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-serif font-bold text-gray-900">
                        Phân tích kỹ thuật (XAU/USD)
                    </h2>
                </div>
                <div className="p-0 sm:p-0 border-b border-gray-200">
                     <div className="h-[450px] w-full bg-white relative">
                         <TechnicalAnalysisWidget />
                     </div>
                </div>
            </div>

            <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden font-sans">
                <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-serif font-bold text-gray-900">
                        Lịch sử biến động
                    </h2>
                </div>
                
                <div className="p-4 sm:p-5 font-sans">
                    <div className="flex flex-col gap-6">
                        <ChartImage 
                          src={`https://www.kitco.com/chart-images/images/live/gold.gif?v=${hourlyVersion}`} 
                          alt="Live 24hrs gold chart" 
                        />
                        <ChartImage 
                          src={`https://www.kitco.com/chart-images/images/live/nygold.gif?v=${hourlyVersion}`} 
                          alt="Live New York gold Chart" 
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                             <ChartImage alt="30 Ngày" src={`https://www.kitco.com/chart-images/LFgif/AU0030lnb.gif?v=${hourlyVersion}`} />
                             <ChartImage alt="60 Ngày" src={`https://www.kitco.com/chart-images/LFgif/AU0060lnb.gif?v=${hourlyVersion}`} />
                             <ChartImage alt="6 Tháng" src={`https://www.kitco.com/chart-images/LFgif/AU0182nyb.gif?v=${hourlyVersion}`} />
                             <ChartImage alt="1 Năm" src={`https://www.kitco.com/chart-images/LFgif/AU0365nyb.gif?v=${hourlyVersion}`} />
                             <ChartImage alt="5 Năm" src={`https://www.kitco.com/chart-images/LFgif/AU1825nyb.gif?v=${hourlyVersion}`} />
                             <ChartImage alt="10 Năm" src={`https://www.kitco.com/chart-images/LFgif/AU3650nyb.gif?v=${hourlyVersion}`} />
                        </div>
                    </div>
                    <div className="mt-6 text-[11px] text-gray-500 text-center font-sans font-bold uppercase tracking-wide">
                        Nguồn dữ liệu biểu đồ: Kitco.com (Cập nhật 1 tiếng/lần)
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
                <Globe size={22} className={`${activeTab === 'world' ? 'text-[#9f224e]' : 'text-gray-400'}`} />
                <span>Thế giới</span>
                {activeTab === 'world' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#9f224e]"></div>}
            </button>
        </div>

        <div className="p-2 sm:p-5 bg-white">
            {activeTab === 'vn' ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                             <div className="col-span-1">
                                 <MainCard 
                                    product={sjc} 
                                    worldProduct={world}
                                    label="Vàng miếng SJC" 
                                    onProductClick={onProductClick} 
                                />
                             </div>
                             <div className="col-span-1">
                                 <MainCard 
                                    product={jewelry} 
                                    worldProduct={world}
                                    label="Vàng nhẫn" 
                                    onProductClick={onProductClick} 
                                />
                             </div>
                        </div>
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