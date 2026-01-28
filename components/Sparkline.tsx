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
  // SEO Requirement: Hiển thị xu hướng trong 30 ngày (1 tháng) gần nhất
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(-30);
  }, [data]);

  const strokeColor = trend === 'up' ? '#0f7d4b' : trend === 'down' ? '#bd0000' : '#757575';

  return (
    <div className="h-full w-full" style={{ minWidth: '40px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide={true} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false} // Tắt animation để tránh cảm giác dữ liệu đang "chạy" khi F5
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};