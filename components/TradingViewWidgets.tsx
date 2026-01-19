import React, { useEffect, useRef, memo } from 'react';

export const AdvancedRealTimeChart = memo(() => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    container.current.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "480",
      "symbol": "OANDA:XAUUSD",
      "interval": "15",
      "timezone": "Asia/Ho_Chi_Minh",
      "theme": "light",
      "style": "1",
      "locale": "vi_VN",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": true,
      "support_host": "https://www.tradingview.com"
    });
    container.current.appendChild(script);
  }, []);

  return <div className="tradingview-widget-container" ref={container} style={{ height: '480px', width: '100%' }}></div>;
});

export const TechnicalAnalysisWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Standardize structure for consistency
    container.current.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "interval": "15m",
      "width": "100%",
      "isTransparent": false,
      "height": "100%",
      "symbol": "OANDA:XAUUSD",
      "showIntervalTabs": true,
      "displayMode": "single",
      "locale": "vi_VN",
      "colorTheme": "light"
    });
    container.current.appendChild(script);
  }, []);

  return <div className="tradingview-widget-container" ref={container} style={{ height: '350px', width: '100%' }}></div>;
});

export const MiniChartWidget = memo(({ symbol, name }: { symbol: string, name: string }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    container.current.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "width": "100%",
      "height": "100%",
      "locale": "vi_VN",
      "dateRange": "1D",
      "colorTheme": "light",
      "isTransparent": true,
      "autosize": true,
      "largeChartUrl": ""
    });
    container.current.appendChild(script);
  }, [symbol]);

  return <div className="tradingview-widget-container" ref={container} style={{ height: '200px', width: '100%' }}></div>;
});