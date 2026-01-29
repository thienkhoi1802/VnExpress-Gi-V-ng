import React, { useState, useEffect, useRef } from 'react';
import { getGoldData, getHistoryData, fetchWorldGoldPrice, getHourlyData } from './services/goldData';
import { GoldTable } from './components/GoldTable';
import { Calculator } from './components/Calculator';
import { ChartModal } from './components/ChartModal';
import { GoldChart } from './components/GoldChart';
import { MarketHighlights } from './components/MarketHighlights';
import { StickyMiniBar } from './components/StickyMiniBar';
import { GoldNews } from './components/GoldNews';
import { AlertsModal } from './components/AlertsModal';
import { ComputedGoldProduct, HistoryPoint, PriceAlert } from './types';
import { Menu, X, BellRing, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ComputedGoldProduct[]>(getGoldData());
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [hourlyData, setHourlyData] = useState<HistoryPoint[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ComputedGoldProduct | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'vn' | 'world'>('vn');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('vne_gold_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastAlert, setToastAlert] = useState<PriceAlert | null>(null);

  useEffect(() => {
    localStorage.setItem('vne_gold_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    setHistoryData(getHistoryData());
    setHourlyData(getHourlyData());

    const initFetch = async () => {
        setIsLiveLoading(true);
        const freshData = await fetchWorldGoldPrice();
        setData(freshData);
        setIsLiveLoading(false);
    };
    initFetch();

    const liveInterval = setInterval(async () => {
        setIsLiveLoading(true);
        const freshData = await fetchWorldGoldPrice();
        setData(freshData);
        setHourlyData(getHourlyData());
        setIsLiveLoading(false);
    }, 60000);

    return () => clearInterval(liveInterval);
  }, []);

  // Monitor Alerts
  useEffect(() => {
    const checkAlerts = () => {
      alerts.forEach(alert => {
        if (!alert.isActive) return;
        
        const product = data.find(p => p.id === alert.productId);
        if (!product) return;

        const currentPrice = alert.priceType === 'sell' ? product.today.sell : product.today.buy;
        let triggered = false;

        if (alert.type === 'above' && currentPrice >= alert.targetPrice) triggered = true;
        if (alert.type === 'below' && currentPrice <= alert.targetPrice) triggered = true;

        if (triggered) {
          triggerNotification(alert, currentPrice);
          // Mark as inactive to prevent spamming
          setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a));
        }
      });
    };

    checkAlerts();
  }, [data, alerts]);

  const triggerNotification = (alert: PriceAlert, actualPrice: number) => {
    const title = `VnExpress | Cảnh báo giá vàng`;
    const message = `${alert.productName} đã chạm mức ${actualPrice.toLocaleString()} (${alert.type === 'above' ? 'tăng' : 'giảm'} so với ngưỡng ${alert.targetPrice.toLocaleString()})`;

    // Browser Notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.ico' });
    }

    // In-App Toast
    setToastAlert(alert);
    setTimeout(() => setToastAlert(null), 10000); // Hide after 10s
  };

  const addAlert = (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => {
    const alert: PriceAlert = {
      ...newAlert,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isActive: true
    };
    setAlerts(prev => [alert, ...prev]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleProductClick = (product: ComputedGoldProduct) => {
    setSelectedProduct(product);
  };

  const sjc = data.find(p => p.group === 'sjc');
  const world = data.find(p => p.group === 'world');

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#111] overflow-x-hidden">
      <StickyMiniBar sjc={sjc} world={world} updatedAt={data[0]?.updatedAt} />

      {/* Triggered Alert Toast */}
      {toastAlert && (
        <div className="fixed bottom-4 left-4 right-4 z-[80] sm:left-auto sm:right-4 sm:w-80 bg-vne-red text-white p-4 shadow-2xl animate-in slide-in-from-right-4 duration-500">
           <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <BellRing size={20} className="animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Cảnh báo giá chạm ngưỡng!</p>
                <p className="text-xs opacity-90 mt-0.5">
                  {toastAlert.productName} đã đạt mục tiêu {toastAlert.targetPrice.toLocaleString()} của bạn.
                </p>
              </div>
              <button onClick={() => setToastAlert(null)} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
           </div>
        </div>
      )}

      <header className="bg-white border-b border-[#e5e5e5] py-3">
        <div className="max-w-[760px] mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
               <button className="text-gray-600 hover:text-vne-red"><Menu size={20} /></button>
               <span className="font-serif text-xl sm:text-2xl font-black text-vne-red tracking-tight">VnExpress</span>
            </div>

            <button 
              onClick={() => setIsAlertModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 hover:text-vne-red transition-all rounded-sm shadow-sm group"
            >
               <Bell size={16} className={alerts.some(a => a.isActive) ? "text-vne-red animate-pulse" : "group-hover:text-vne-red"} />
               <span className="text-[11px] font-bold uppercase hidden sm:inline">Thông báo giá</span>
            </button>
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
            historyData={historyData}
            onProductClick={handleProductClick} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLiveLoading={isLiveLoading}
          />
        </section>

        {activeTab === 'vn' && (
          <>
            <section className="md:hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
               <GoldNews />
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <GoldChart 
                products={data} 
                historyData={historyData} 
                hourlyData={hourlyData}
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
        hourlyData={hourlyData}
        alerts={alerts}
        onAddAlert={addAlert}
        onRemoveAlert={removeAlert}
        onClose={() => setSelectedProduct(null)}
      />

      <AlertsModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        products={data}
        alerts={alerts}
        onAddAlert={addAlert}
        onRemoveAlert={removeAlert}
      />
    </div>
  );
};

export default App;