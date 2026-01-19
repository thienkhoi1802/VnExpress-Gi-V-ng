import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Trend } from '../types';

interface TrendIndicatorProps {
  trend: Trend;
  value: number;
  showValue?: boolean;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, value, showValue = true }) => {
  const formatVal = (v: number) => Math.abs(v).toFixed(2);

  if (trend === Trend.UP) {
    return (
      <div className="flex items-center text-trend-up text-xs font-semibold tabular-nums">
        <ArrowUp className="w-3 h-3 mr-1" />
        {showValue && <span>+{formatVal(value)}</span>}
      </div>
    );
  }

  if (trend === Trend.DOWN) {
    return (
      <div className="flex items-center text-trend-down text-xs font-semibold tabular-nums">
        <ArrowDown className="w-3 h-3 mr-1" />
        {showValue && <span>-{formatVal(value)}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center text-trend-flat text-xs tabular-nums opacity-60">
      <Minus className="w-3 h-3 mr-1" />
      {showValue && <span>0.00</span>}
    </div>
  );
};