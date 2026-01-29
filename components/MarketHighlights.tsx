import React, { useState, useEffect } from 'react';
import { ComputedGoldProduct, HistoryPoint } from '../types';
import { ArrowUp, ArrowDown, Globe, ChevronRight, ChevronDown, Check, X, ZoomIn, Clock, Loader2 } from 'lucide-react';
import { AdvancedRealTimeChart } from './TradingViewWidgets';
import { Sparkline } from './Sparkline';

interface Props {
  data: ComputedGoldProduct[];
  historyData: HistoryPoint[];
  onProductClick: (p: ComputedGoldProduct) => void;
  activeTab: 'vn' | 'world';
  setActiveTab: (tab: 'vn' | 'world') => void;
  sources?: {title: string, uri: string}[];
  isLiveLoading?: boolean;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 0.92, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', rate: 0.79, flag: '🇬🇧' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', rate: 150.5, flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', rate: 1.35, flag: '🇨🇦' },
];

const USD_VND_EXCHANGE_RATE = 25450; 
const TAEL_TO_OZ = 1.20565;

const VietnamFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm ring-1 ring-black/5">
    <rect width="24" height="16" fill="#DA251D"/>
    <path d="M12 2.1L13.9056 6.24166L18.3511 6.56492L14.9458 9.5209L16.0249 13.885L12 11.475L7.9751 13.885L9.05423 9.5209L5.64886 6.56492L10.0944 6.24166L12 2.1Z" fill="#FFEB3B"/>
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

const DomesticItem = ({ 
    product, 
    worldProduct, 
    historyData,
    label, 
    onProductClick,
    className = ""
}: { 
    product?: ComputedGoldProduct,
    worldProduct?: ComputedGoldProduct,
    historyData: HistoryPoint[],
    label: string, 
    onProductClick: (p: ComputedGoldProduct) => void,
    className?: string
}) => {
  if (!product) return null;

  let diffTextValue = null;
  if (worldProduct) {
     const worldVnd = (worldProduct.today.sell * TAEL_TO_OZ * USD_VND_EXCHANGE_RATE) / 1000000;
     const diff = product.today.sell - worldVnd;
     diffTextValue = `${diff > 0 ? '+' : ''}${diff.toLocaleString('vi-VN', {maximumFractionDigits: 2})}`;
  }

  return (
    <div 
      onClick={() => onProductClick(product)}
      className={`bg-white hover:bg-gray-50/80 transition-all cursor-pointer group relative flex flex-col h-full ${className}`}
    >
      <div className="px-3 sm:px-5 pt-4 pb-2 sm:py-2.5 flex justify-between items-center">
          <h3 className="font-bold tracking-tight text-gray-900 text-[18px] sm:text-[20px] leading-tight font-serif truncate">
              {label}
          </h3>
          <span className="text-[11px] text-gray-400 font-medium shrink-0 whitespace-nowrap uppercase">Triệu / lượng</span>
      </div>

      <div className="sm:hidden px-3 pb-2 grid grid-cols-12 gap-1 font-sans items-start">
          <div className="col-span-4 flex flex-col border-r border-gray-100 pr-1">
             <span className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Bán ra</span>
             <span className="font-black text-vne-green text-[30px] leading-none tracking-tighter tabular-nums">
                {product.today.sell.toLocaleString('vi-VN')}
             </span>
             <div className={`flex flex-wrap items-center gap-x-1 text-[13px] font-bold mt-0.5 ${product.changeSell >= 0 ? 'text-vne-green' : 'text-trend-down'}`}>
                <div className="flex items-center gap-0.5">
                   {product.changeSell >= 0 ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
                   <span>{Math.abs(product.changeSell).toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</span>
                </div>
                <span className="text-[12px] opacity-80 font-normal">({product.percentSell >= 0 ? '+' : ''}{product.percentSell.toFixed(2)}%)</span>
             </div>
          </div>
          
          <div className="col-span-4 flex flex-col border-r border-gray-100 px-1">
             <span className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Mua vào</span>
             <span className="font-black text-gray-900 text-[30px] leading-none tracking-tighter tabular-nums">
                {product.today.buy.toLocaleString('vi-VN')}
             </span>
             <div className={`flex flex-wrap items-center gap-x-1 text-[13px] font-bold mt-0.5 ${product.changeBuy >= 0 ? 'text-vne-green' : 'text-trend-down'}`}>
                <div className="flex items-center gap-0.5">
                   {product.changeBuy >= 0 ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
                   <span>{Math.abs(product.changeBuy).toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</span>
                </div>
                <span className="text-[12px] opacity-80 font-normal">({product.percentBuy >= 0 ? '+' : ''}{product.percentBuy.toFixed(2)}%)</span>
             </div>
          </div>
          
          <div className="col-span-4 pl-1 h-[60px] flex items-center justify-center">
            <div className="w-full h-[45px]">
                <Sparkline 
                    data={historyData} 
                    dataKey={product.id} 
                    trend={product.changeSell >= 0 ? 'up' : 'down'}
                />
            </div>
          </div>
      </div>

      <div className="hidden sm:flex items-center px-5 pb-1">
          <div className="flex-grow grid grid-cols-2 gap-4 items-start font-sans">
              <div className="flex flex-col border-r border-gray-100 pr-2 min-w-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Bán ra</span>
                  <span className="font-black tabular-nums leading-none tracking-tighter text-vne-green text-[50px]">
                    {product.today.sell.toLocaleString('vi-VN')}
                  </span>
                  <div className={`flex items-center gap-0.5 text-[13px] font-black mt-1 ${product.changeSell >= 0 ? 'text-vne-green' : 'text-trend-down'} tabular-nums whitespace-nowrap`}>
                      {product.changeSell >= 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                      <span>{Math.abs(product.changeSell).toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</span>
                      <span className="text-[11px] font-bold ml-1 opacity-90">
                          ({product.percentSell >= 0 ? '+' : ''}{product.percentSell.toFixed(2)}%)
                      </span>
                  </div>
              </div>

              <div className="flex flex-col pl-2 min-w-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Mua vào</span>
                  <span className="font-black tabular-nums leading-none tracking-tighter text-gray-900 text-[50px]">
                    {product.today.buy.toLocaleString('vi-VN')}
                  </span>
                  <div className={`flex items-center gap-0.5 text-[13px] font-black mt-1 ${product.changeBuy >= 0 ? 'text-vne-green' : 'text-trend-down'} tabular-nums whitespace-nowrap`}>
                      {product.changeBuy >= 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                      <span>{Math.abs(product.changeBuy).toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</span>
                      <span className="text-[11px] font-bold ml-1 opacity-90">
                          ({product.percentBuy >= 0 ? '+' : ''}{product.percentBuy.toFixed(2)}%)
                      </span>
                  </div>
              </div>
          </div>
      </div>

      {diffTextValue && (
        <div className="px-3 sm:px-5 pb-1.5 sm:pb-3 pt-1 sm:pt-2 mt-auto">
             <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-gray-500 font-sans border-t border-gray-100 pt-1.5 sm:pt-2">
                  <span>Chênh lệch so với thế giới:</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                      {diffTextValue} <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase">Triệu</span>
                  </span>
             </div>
        </div>
      )}
    </div>
  );
};

const WorldGoldInGrid = ({ 
    product, 
    historyData, 
    onProductClick,
    className = ""
}: { 
    product?: ComputedGoldProduct,
    historyData: HistoryPoint[],
    onProductClick: (p: ComputedGoldProduct) => void,
    className?: string
}) => {
  if (!product) return null;

  const worldPricePerTaelUSD = product.today.sell * TAEL_TO_OZ;
  const worldPricePerTaelVND = (worldPricePerTaelUSD * USD_VND_EXCHANGE_RATE) / 1000000;
  const isUp = product.percentSell >= 0;

  return (
    <div 
      onClick={() => onProductClick(product)}
      className={`bg-white hover:bg-gray-50/80 transition-all cursor-pointer group relative flex flex-col h-full ${className}`}
    >
      <div className="px-3 sm:px-5 pt-4 pb-2 sm:py-2.5 flex justify-between items-center">
          <h3 className="font-bold tracking-tight text-[#9f224e] text-[18px] sm:text-[20px] leading-tight font-serif truncate">
              Vàng thế giới
          </h3>
          <span className="text-[11px] text-gray-400 font-medium shrink-0 whitespace-nowrap uppercase">USD / LƯỢNG</span>
      </div>

      {/* Mobile View: Giữ nguyên */}
      <div className="sm:hidden px-3 pb-2 grid grid-cols-12 gap-1 font-sans items-start">
          <div className="col-span-8 flex flex-col border-r border-gray-100 pr-1">
             <span className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Bán ra</span>
             <span className="font-black text-gray-900 text-[30px] leading-none tracking-tighter tabular-nums">
                {worldPricePerTaelUSD.toLocaleString(undefined, { maximumFractionDigits: 1 })}
             </span>
             <div className={`flex flex-wrap items-center gap-x-1 text-[13px] font-bold mt-0.5 ${isUp ? 'text-vne-green' : 'text-trend-down'}`}>
                <div className="flex items-center gap-0.5">
                   {isUp ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
                   <span>{Math.abs(product.changeSell * TAEL_TO_OZ).toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
                </div>
                <span className="text-[12px] opacity-80 font-normal">({isUp ? '+' : ''}{product.percentSell.toFixed(2)}%)</span>
             </div>
          </div>
          
          <div className="col-span-4 pl-1 h-[60px] flex items-center justify-center">
            <div className="w-full h-[45px]">
                <Sparkline 
                    data={historyData} 
                    dataKey={product.id} 
                    trend={isUp ? 'up' : 'down'}
                />
            </div>
          </div>
      </div>

      {/* Desktop View: Bổ sung biểu đồ bên phải */}
      <div className="hidden sm:flex items-center px-5 pb-1 gap-4">
          <div className="flex-grow flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Bán ra</span>
              <span className="font-black tabular-nums leading-none tracking-tighter text-gray-900 text-[50px]">
                {worldPricePerTaelUSD.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              <div className={`flex items-center gap-0.5 text-[13px] font-black mt-1 ${isUp ? 'text-vne-green' : 'text-trend-down'} tabular-nums whitespace-nowrap`}>
                  {isUp ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                  <span>{Math.abs(product.changeSell * TAEL_TO_OZ).toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
                  <span className="text-[11px] font-bold ml-1 opacity-90">
                      ({isUp ? '+' : ''}{product.percentSell.toFixed(2)}%)
                  </span>
              </div>
          </div>
          <div className="w-1/3 h-[70px] flex items-center justify-center border-l border-gray-100 pl-4">
               <Sparkline 
                  data={historyData} 
                  dataKey={product.id} 
                  trend={isUp ? 'up' : 'down'}
               />
          </div>
      </div>

      <div className="px-3 sm:px-5 pb-1.5 sm:pb-3 pt-1 sm:pt-2 mt-auto">
             <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-gray-500 font-sans border-t border-gray-100 pt-1.5 sm:pt-2">
                  <span>Quy đổi giá VNĐ:</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                      {worldPricePerTaelVND.toLocaleString('vi-VN', {maximumFractionDigits: 2})} <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase">Triệu / lượng</span>
                  </span>
             </div>
      </div>
    </div>
  );
};

const WorldDetailTab = ({ 
  world, 
  selectedCurrency, 
  setSelectedCurrency, 
  isCurrencyOpen, 
  setIsCurrencyOpen, 
  isLiveLoading, 
  chartVersion, 
  setZoomedImage, 
  zoomedImage 
}: any) => {
  if (!world) return null;

  const currentRate = selectedCurrency.rate;
  const bid = world.today.buy * currentRate; 
  const ask = world.today.sell * currentRate; 
  const change = world.changeSell * currentRate;
  const percent = world.percentSell;
  const vndPerOunce = world.today.sell * USD_VND_EXCHANGE_RATE;
  const dayLow = bid - (Math.random() * 5 + 10); 
  const dayHigh = ask + (Math.random() * 5 + 5);
  const rangePercent = ((ask - dayLow) / (dayHigh - dayLow)) * 100;

  const ChartImage = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => (
    <div 
      className={`border border-gray-200 p-1 bg-white relative group cursor-zoom-in hover:border-[#9f224e] transition-colors overflow-hidden rounded-sm w-full ${className}`}
      onClick={() => setZoomedImage(src)}
    >
      <img 
        src={`${src}${src.includes('?') ? '&' : '?'}v=${chartVersion}`} 
        alt={alt} 
        className="w-full h-auto block object-cover" 
        loading="lazy" 
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 text-white p-1.5 rounded-sm transition-opacity pointer-events-none">
         <ZoomIn size={18} />
      </div>
    </div>
  );

  return (
      <div className="flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
          {zoomedImage && (
            <div 
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-200"
              onClick={() => setZoomedImage(null)}
            >
              <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[101]" onClick={() => setZoomedImage(null)}>
                <X size={32} />
              </button>
              <img src={`${zoomedImage}${zoomedImage.includes('?') ? '&' : '?'}v=${chartVersion}`} alt="Zoom" className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-200" />
            </div>
          )}

          <div className="bg-white border-x border-b border-gray-200 shadow-sm flex flex-col font-sans rounded-b-sm overflow-hidden p-3 sm:p-5">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                  <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                          <h2 className="text-[16px] sm:text-[18px] font-serif font-bold text-[#111] leading-tight">
                              Giá vàng thế giới
                          </h2>
                          <span className="hidden sm:inline-block text-[11px] sm:text-xs text-gray-500 font-medium pt-0.5 border-l border-gray-300 pl-2">
                              Cập nhật: {world.updatedAt}
                          </span>
                          {isLiveLoading ? (
                              <div className="flex items-center gap-1 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm text-[9px] font-bold">
                              <Loader2 size={10} className="animate-spin" /> Live
                              </div>
                          ) : (
                              <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-vne-red text-white text-[9px] font-bold uppercase rounded-sm animate-pulse">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  Live
                              </div>
                          )}
                      </div>
                      <span className="sm:hidden text-[10px] text-gray-500 font-medium">
                          Cập nhật: {world.updatedAt}
                      </span>
                  </div>
                  
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

              <div className="flex flex-col gap-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4 md:gap-x-8 pb-2">
                      <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-gray-500 text-[11px] sm:text-xs font-bold uppercase tracking-widest">Giá bán (Ask)</span>
                              <div className="px-1.5 py-0.5 bg-red-50 text-red-700 text-[9px] font-bold rounded-sm border border-red-100">BÁN</div>
                          </div>
                          <span className="text-[32px] sm:text-[46px] font-black text-[#111] leading-none tabular-nums tracking-tighter">
                              {ask.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <div className="mt-1">
                              <TrendInline value={change} percent={percent} />
                          </div>
                      </div>

                      <div className="flex flex-col items-end md:items-start md:border-l md:border-gray-100 md:pl-6">
                           <div className="flex items-center gap-1.5 mb-1">
                              <div className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded-sm border border-green-100">MUA</div>
                              <span className="text-gray-500 text-[11px] sm:text-xs font-bold uppercase tracking-widest">Giá mua (Bid)</span>
                          </div>
                          <span className="text-[32px] sm:text-[46px] font-black text-[#111] leading-none tabular-nums tracking-tighter">
                              {bid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                      </div>

                      <div className="col-span-2 md:col-span-1 md:border-l md:border-gray-100 md:pl-6 flex flex-col justify-center pt-2 md:pt-0 border-t border-gray-50 md:border-t-0">
                           <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                               <span>Thấp</span>
                               <span>Biên độ ngày</span>
                               <span>Cao</span>
                           </div>
                           <div className="relative h-2 bg-gray-200 rounded-full w-full mb-1.5">
                               <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-gray-300 via-yellow-400 to-yellow-500 w-full opacity-30"></div>
                               <div className="absolute top-0 h-full bg-yellow-500 rounded-full" style={{ left: '0%', width: '100%' }}></div>
                               <div 
                                  className="absolute top-1/2 w-3.5 h-3.5 bg-white border-[3px] border-[#9f224e] rounded-full shadow-sm transform -translate-y-1/2 -translate-x-1/2 z-10"
                                  style={{ left: `${Math.min(98, Math.max(2, rangePercent))}%` }}
                               ></div>
                           </div>
                           <div className="flex justify-between items-center font-sans">
                               <span className="text-[11px] font-bold text-gray-600 tabular-nums">{dayLow.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                               <span className="text-[11px] font-bold text-gray-600 tabular-nums">{dayHigh.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                           </div>
                      </div>
                  </div>

                  <div className="mt-2 bg-[#f0f9ff] border border-blue-50 p-4 rounded-sm">
                      <p className="text-[18px] text-[#1e293b] leading-snug font-sans text-left">
                          Giá thế giới quy đổi: <span className="font-black text-[#0f172a]">{vndPerOunce.toLocaleString('vi-VN')} VNĐ/Ounce</span>, giá vàng thế giới {percent >= 0 ? 'tăng' : 'giảm'} <span className={`font-black ${percent >= 0 ? 'text-[#0f7d4b]' : 'text-[#bd0000]'}`}>{Math.abs(percent).toFixed(2)}%</span> trong 24 giờ qua.
                      </p>
                  </div>

                  <div className="flex items-center justify-start gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wide opacity-50 mt-3">
                       <Clock size={10} /> {world.updatedAt} • Kitco, TradingView
                  </div>
              </div>
          </div>

          <div className="space-y-4 mt-4">
              <div className="bg-white border border-gray-200 overflow-hidden shadow-sm flex flex-col rounded-sm">
                  <div className="px-3 py-3 border-b border-gray-50 bg-white">
                      <h2 className="text-[16px] sm:text-[18px] font-serif font-bold text-gray-900">Biểu đồ trực tuyến (XAU/USD)</h2>
                  </div>
                  <div className="border-b border-gray-100">
                    <AdvancedRealTimeChart />
                  </div>
              </div>

              <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden font-sans">
                  <div className="px-3 py-3 border-b border-gray-50 bg-white">
                      <h2 className="text-[16px] sm:text-[18px] font-serif font-bold text-gray-900">Lịch sử giá vàng</h2>
                  </div>
                  <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                      <ChartImage src="https://www.kitco.com/chart-images/images/live/gold.gif" alt="Live 24hrs gold chart" />
                      <ChartImage src="https://www.kitco.com/chart-images/images/live/nygold.gif" alt="Live New York gold Chart" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                           <ChartImage alt="30 Days Gold" src="https://www.kitco.com/chart-images/LFgif/AU0030lnb.gif" />
                           <ChartImage alt="60 Days Gold" src="https://www.kitco.com/chart-images/LFgif/AU0060lnb.gif" />
                           <ChartImage alt="6 Months Gold" src="https://www.kitco.com/chart-images/LFgif/AU0182nyb.gif" />
                           <ChartImage alt="1 Year Gold" src="https://www.kitco.com/chart-images/LFgif/AU0365nyb.gif" />
                           <ChartImage alt="5 Years Gold" src="https://www.kitco.com/chart-images/LFgif/AU1825nyb.gif" />
                           <ChartImage alt="10 Years Gold" src="https://www.kitco.com/chart-images/LFgif/AU3650nyb.gif" />
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};

export const MarketHighlights: React.FC<Props> = ({ 
    data, 
    historyData, 
    onProductClick, 
    activeTab, 
    setActiveTab,
    isLiveLoading = false
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const [chartVersion, setChartVersion] = useState(() => {
    const d = new Date();
    return d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + d.getHours().toString().padStart(2, '0');
  });

  useEffect(() => {
    const interval = setInterval(() => {
        const d = new Date();
        const newVersion = d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + d.getHours().toString().padStart(2, '0');
        setChartVersion(newVersion);
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const sjc = data.find(p => p.group === 'sjc');
  const world = data.find(p => p.group === 'world');

  return (
    <div className="flex flex-col">
        <div className="flex border border-gray-200 font-serif bg-white shadow-sm rounded-t-sm z-10 relative">
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

        <div>
            {activeTab === 'vn' ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300 flex flex-col bg-white border border-gray-200 border-t-0 shadow-sm rounded-b-sm pt-4 sm:pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="border-b md:border-b-0 md:border-r border-gray-200">
                             <DomesticItem 
                                product={sjc} 
                                worldProduct={world} 
                                historyData={historyData}
                                label="Vàng miếng SJC" 
                                onProductClick={onProductClick} 
                            />
                        </div>
                        <div className="border-b md:border-b-0 border-gray-200">
                             <WorldGoldInGrid 
                                product={world} 
                                historyData={historyData} 
                                onProductClick={onProductClick} 
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <WorldDetailTab 
                  world={world}
                  selectedCurrency={selectedCurrency}
                  setSelectedCurrency={setSelectedCurrency}
                  isCurrencyOpen={isCurrencyOpen}
                  setIsCurrencyOpen={setIsCurrencyOpen}
                  isLiveLoading={isLiveLoading}
                  chartVersion={chartVersion}
                  setZoomedImage={setZoomedImage}
                  zoomedImage={zoomedImage}
                />
            )}
        </div>
    </div>
  );
};
