import React, { useState, useEffect } from 'react';
import { getGoldData, getHistoryData } from './services/goldData';
import { GoldTable } from './components/GoldTable';
import { Calculator } from './components/Calculator';
import { ChartModal } from './components/ChartModal';
import { GoldChart } from './components/GoldChart';
import { MarketHighlights } from './components/MarketHighlights';
import { StickyMiniBar } from './components/StickyMiniBar';
import { ComputedGoldProduct, HistoryPoint } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ComputedGoldProduct[]>(getGoldData());
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ComputedGoldProduct | null>(null);
  
  const [activeTab, setActiveTab] = useState<'vn' | 'world'>('vn');

  useEffect(() => {
    setHistoryData(getHistoryData());

    const intervalId = setInterval(() => {
      const freshData = getGoldData();
      setData(freshData);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleProductClick = (product: ComputedGoldProduct) => {
    setSelectedProduct(product);
  };

  const sjc = data.find(p => p.group === 'sjc');
  const world = data.find(p => p.group === 'world');

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#111] overflow-x-hidden">
      <StickyMiniBar sjc={sjc} world={world} updatedAt={data[0]?.updatedAt} />

      <header className="bg-white border-b border-[#e5e5e5] py-3">
        <div className="max-w-[760px] mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
               <button className="text-gray-600 hover:text-vne-red"><Menu size={20} /></button>
               <span className="font-serif text-xl sm:text-2xl font-black text-vne-red tracking-tight">VnExpress</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-1">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-none">
                Giá vàng hôm nay
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] sm:text-xs text-gray-500">
                <span className="text-vne-red font-bold">Cập nhật: {data[0]?.updatedAt}</span>
                <span className="w-0.5 h-3 bg-gray-300"></span>
                <span>Nguồn: SJC, DOJI, Kitco</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-3 sm:px-4 py-4 space-y-6 overflow-hidden">
        <section>
          <MarketHighlights 
            data={data} 
            onProductClick={handleProductClick} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </section>

        {activeTab === 'vn' && (
          <>
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <GoldChart 
                products={data} 
                historyData={historyData} 
              />
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
               <GoldTable 
                  data={data} 
                  historyData={historyData} 
                  onRowClick={handleProductClick} 
               />
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
               <Calculator products={data} />
            </section>
          </>
        )}
      </main>

      <ChartModal 
        product={selectedProduct}
        worldProduct={world}
        historyData={historyData}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default App;