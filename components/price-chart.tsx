import React, { useEffect, useRef } from 'react';

interface WidgetConfig {
autoSize: boolean;

  chainId: string;
  defaultInterval: string;
  timeZone: string;
  theme: string;
  locale: string;
  pairAddress: string;
  hideLeftToolbar: boolean;
  hideTopToolbar: boolean;
  hideBottomToolbar: boolean;
}

declare global {
  interface Window {
    createMyWidget: (containerId: string, config: WidgetConfig) => void;
  }
}

const PRICE_CHART_ID = 'price-chart-widget-container';

export const PriceChart = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadWidget = () => {
      const checkWidgetFunction = () => {
        if (typeof window.createMyWidget === 'function') {
          window.createMyWidget(PRICE_CHART_ID, {
            autoSize: true,
            chainId: '0x1',
            pairAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
            defaultInterval: '1D',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/UTC',
            theme: 'moralis',
            locale: 'en',
            hideLeftToolbar: false,
            hideTopToolbar: false,
            hideBottomToolbar: false
          });
        } else {
          console.error('createMyWidget function is not defined.');
        }
      };

      if (typeof window.createMyWidget === 'function') {
        checkWidgetFunction();
      } else {
        setTimeout(checkWidgetFunction, 1000); // Retry after 1 second
      }
    };

    if (!document.getElementById('moralis-chart-widget')) {
      const script = document.createElement('script');
      script.id = 'moralis-chart-widget';
      script.src = 'https://moralis.com/static/embed/chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = loadWidget;
      script.onerror = () => {
        console.error('Failed to load the chart widget script.');
      };
      document.body.appendChild(script);
    } else {
      loadWidget();
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "565px" }}>
      <div
        id={PRICE_CHART_ID}
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};