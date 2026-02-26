import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ClicksChartProps {
  data: Array<{
    date: string;
    clicks: number;
  }>;
}

export const ClicksChart: React.FC<ClicksChartProps> = ({ data }) => {
  // Transform data to format Recharts expects
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    clicks: item.clicks,
  }));

  // Custom tooltip component with modern design
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass dark:glass-dark border border-primary-200 dark:border-primary-500/30 rounded-xl shadow-2xl p-4 backdrop-blur-xl">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            {payload[0].payload.date}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold bg-gradient-to-br from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
              {payload[0].value}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">clicks</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
        No data available for this time period
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="url(#colorGradient)"
            strokeWidth={3}
            fill="url(#colorClicks)"
            dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
