import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BrowserChartProps {
  data: Array<{
    browser: string;
    clicks: number;
  }>;
}

export const BrowserChart: React.FC<BrowserChartProps> = ({ data }) => {
  // Transform data and sort by clicks (descending)
  const chartData = data
    .map((item) => ({
      browser: item.browser,
      clicks: item.clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10); // Show top 10 browsers

  // Custom tooltip with modern design
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass dark:glass-dark border border-orange-200 dark:border-orange-500/30 rounded-xl shadow-2xl p-4 backdrop-blur-xl">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            {payload[0].payload.browser}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold bg-gradient-to-br from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
              {payload[0].value.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">clicks</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom bar label
  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === 0) return null;

    return (
      <text
        x={x + width + 5}
        y={y + 12}
        fill="#6b7280"
        fontSize={12}
        textAnchor="start"
      >
        {value.toLocaleString()}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
        No browser data available
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 60, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            type="category"
            dataKey="browser"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} />
          <Bar
            dataKey="clicks"
            fill="url(#barGradient)"
            radius={[0, 8, 8, 0]}
            label={renderCustomLabel}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
