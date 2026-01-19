import React, { useState, useEffect, useMemo } from 'react';
import { getGoldData, getHistoryData } from './services/goldData';
import { GoldTable } from './components/GoldTable';
import { GoldCard } from './components/GoldCard';
import { Calculator } from './components/Calculator';
import { ChartModal } from './components/ChartModal';
import { GoldChart } from './components/GoldChart'; // Imported GoldChart
import { MarketHighlights } from './components/MarketHighlights';
import { ComputedGoldProduct, HistoryPoint } from './types';
import { Menu, Search, User, TrendingUp, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [data] = useState(getGoldData());
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ComputedGoldProduct | null>(null);

  useEffect(() => {
    // Simulate loading historical data
    const history = getHistoryData();
    setHistoryData(history);
  }, []);

  const worldGoldData = useMemo(() => data.filter(p => p.group === 'world'), [data]);
  const domesticData = useMemo(() => data.filter(p => p.group !== 'world'), [data]);

  const handleProductClick = (product: ComputedGoldProduct) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans text-[#333]">
      {/* Sticky Header - VnExpress Style */}
      <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-[760px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-vne-red transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex items-baseline gap-1 select-none cursor-pointer">
              <span className="font-serif text-2xl font-black text-vne-red tracking-tight">VnExpress</span>
              <span className="text-sm text-gray-400 hidden sm:inline-block">/ Số liệu</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5 text-gray-500">
             <button className="hover:text-vne-red transition-colors"><Search size={20} /></button>
             <button className="hover:text-vne-red transition-colors"><User size={20} /></button>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Paper Layout max-w-760px */}
      <main className="max-w-[760px] mx-auto bg-white min-h-[calc(100vh-56px)] shadow-sm border-x border-[#e5e5e5]">
        
        {/* Top Info Bar */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-xs font-medium text-vne-red uppercase tracking-wider">
            <span className="w-2 h-2 bg-vne-red rounded-full animate-pulse"></span>
            Live Trading
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={14} />
            <span>Cập nhật: {data[0]?.updatedAt}</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-8">
          
          {/* Header Section */}
          <div className="text-center pb-2">
             <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
               Thị trường Vàng
             </h1>
             <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-[90%] mx-auto">
               Cập nhật trực tuyến giá vàng SJC, vàng nhẫn và tỷ giá thế giới. Công cụ theo dõi và phân tích dành cho nhà đầu tư chuyên nghiệp.
             </p>
          </div>

          {/* Highlights Component */}
          <section className="animate-in slide-in-from-bottom-2 duration-500">
            <MarketHighlights data={data} />
          </section>

          {/* MAIN CHART SECTION - MOVED HERE */}
          <section className="animate-in slide-in-from-bottom-3 duration-500 delay-100">
             <GoldChart 
                products={data} 
                historyData={historyData} 
                title="Diễn biến giá (Live)"
             />
          </section>

          <hr className="border-gray-100" />

          {/* SECTION 1: WORLD GOLD */}
          <section>
            <div className="flex items-center justify-between mb-4">
               <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                 <span className="w-1 h-5 bg-vne-red"></span>
                 Thế giới
               </h2>
               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">USD/ounce</span>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="hidden sm:block">
                <GoldTable 
                  data={worldGoldData} 
                  historyData={historyData}
                  onRowClick={handleProductClick}
                />
              </div>
              <div className="sm:hidden">
                {worldGoldData.map(product => (
                  <GoldCard 
                    key={product.id} 
                    product={product} 
                    historyData={historyData} 
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 2: DOMESTIC GOLD */}
          <section>
            <div className="flex items-center justify-between mb-4 mt-8">
               <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                 <span className="w-1 h-5 bg-vne-red"></span>
                 Trong nước
               </h2>
               <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-1 rounded">VND/lượng</span>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="hidden sm:block">
                <GoldTable 
                  data={domesticData} 
                  historyData={historyData}
                  onRowClick={handleProductClick}
                />
              </div>
              <div className="sm:hidden divide-y divide-gray-100">
                {domesticData.map(product => (
                  <GoldCard 
                    key={product.id} 
                    product={product} 
                    historyData={historyData}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: CALCULATOR (Bottom) */}
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-inner">
             <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-vne-red" />
                <h2 className="font-serif text-lg font-bold text-gray-900">Công cụ tính giá</h2>
             </div>
             <Calculator products={data} />
          </section>

          {/* News Footer */}
          <footer className="pt-6 border-t border-gray-200">
             <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 tracking-wider">Tin liên quan</h4>
             <div className="grid gap-4">
                {[
                  {
                    title: "Ngân hàng Nhà nước tiếp tục đấu thầu vàng miếng SJC",
                    time: "30 phút trước",
                    img: "https://images.unsplash.com/photo-1610375461490-6d615d521e2a?auto=format&fit=crop&q=80&w=100&h=100"
                  },
                  {
                    title: "Dự báo giá vàng tuần tới: Chuyên gia thận trọng",
                    time: "2 giờ trước",
                    img: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&q=80&w=100&h=100"
                  }
                ].map((news, idx) => (
                  <div key={idx} className="group flex gap-4 cursor-pointer">
                    <div className="w-24 h-16 shrink-0 overflow-hidden rounded bg-gray-200">
                      <img src={news.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-vne-red transition-colors leading-snug mb-1">
                        {news.title}
                      </h3>
                      <span className="text-xs text-gray-500">{news.time}</span>
                    </div>
                  </div>
                ))}
             </div>
          </footer>

        </div>

        {/* Mobile Detail Modal */}
        <ChartModal 
          product={selectedProduct}
          historyData={historyData}
          onClose={() => setSelectedProduct(null)}
        />

      </main>
    </div>
  );
};

export default App;