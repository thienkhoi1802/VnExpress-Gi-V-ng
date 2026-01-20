import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { HistoryPoint } from '../types';

interface SparklineProps {
  data: HistoryPoint[];
  dataKey: string;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
}

export const Sparkline: React.FC<SparklineProps> = ({ data, dataKey, trend = 'flat' }) => {
  // Get last 7 days for the sparkline
  const chartData = useMemo(() => {
    return data.slice(-7);
  }, [data]);

  const strokeColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#9ca3af';

  return (
    <div className="h-full w-full" style={{ minWidth: '40px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide={true} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};