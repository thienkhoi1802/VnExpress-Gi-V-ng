
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
  // SEO Requirement: Hiển thị xu hướng trong 7 ngày (1 tuần) gần nhất
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(-7);
  }, [data]);

  // Điều chỉnh sang màu xám nhẹ nhàng và độ mảnh 1.2 theo yêu cầu UI mới
  const strokeColor = '#cbd5e1'; 

  return (
    <div className="h-full w-full" style={{ minWidth: '40px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide={true} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={1.2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
