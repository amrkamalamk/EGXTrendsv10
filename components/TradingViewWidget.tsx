import React, { useEffect, useRef, useState } from 'react';
import { TimeFrame } from '../types';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol: string;
  timeFrame: TimeFrame;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, timeFrame }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const widgetId = `tv_widget_${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Use IntersectionObserver to Lazy Load widgets.
  // Loading 30 WebGL charts at once will crash the browser.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && window.TradingView && containerRef.current) {
      // Efficient cleanup: Explicitly remove children to prevent memory leaks from old iframes
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      const container = document.createElement("div");
      container.id = widgetId;
      container.style.width = "100%";
      container.style.height = "100%";
      containerRef.current.appendChild(container);

      // Ensure the symbol is correctly formatted for TradingView
      const cleanSymbol = symbol.trim();
      const tvSymbol = cleanSymbol.includes(':') 
        ? cleanSymbol 
        : `EGX:${cleanSymbol}`;

      // Initialize the widget
      new window.TradingView.widget({
        "autosize": true,
        "symbol": tvSymbol,
        "interval": timeFrame,
        "timezone": "Africa/Cairo",
        "theme": "dark",
        "style": "1", // 1 = Candles
        "locale": "en",
        "toolbar_bg": "#1e293b",
        "enable_publishing": false,
        "hide_top_toolbar": true,
        "hide_side_toolbar": true,
        "allow_symbol_change": false,
        "save_image": false,
        "container_id": widgetId,
        "studies": [
          "Volume@tv-basicstudies",
          "MACD@tv-basicstudies",
          "VWAP@tv-basicstudies",
          "RSI@tv-basicstudies"
        ],
        "disabled_features": [
           "header_symbol_search",
           "header_compare",
           "header_screenshot",
           "header_saveload", 
           "timeframes_toolbar",
           "create_volume_indicator_by_default"
        ],
        "enabled_features": [
          "hide_left_toolbar_by_default", 
          "use_localstorage_for_settings"
        ]
      });
    }
  }, [isVisible, symbol, timeFrame, widgetId]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-slate-900 flex items-center justify-center relative"
    >
      {!isVisible && (
        <div className="text-xs text-slate-500 flex flex-col items-center animate-pulse">
            <span className="block w-2 h-2 bg-slate-700 rounded-full mb-2"></span>
            Waiting for view...
        </div>
      )}
    </div>
  );
};

export default TradingViewWidget;