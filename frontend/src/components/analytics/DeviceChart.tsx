import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon } from '@heroicons/react/24/outline';

interface DeviceChartProps {
  data: Array<{
    device_type: string;
    clicks: number;
  }>;
}

const COLORS = {
  mobile: '#8b5cf6',      // Purple
  desktop: '#06b6d4',     // Cyan
  tablet: '#f59e0b',      // Amber
  unknown: '#94a3b8',     // Gray
};

const DEVICE_ICONS = {
  mobile: DevicePhoneMobileIcon,
  desktop: ComputerDesktopIcon,
  tablet: DeviceTabletIcon,
};

export const DeviceChart: React.FC<DeviceChartProps> = ({ data }) => {
  // Transform data and normalize device names
  const chartData = data.map((item) => ({
    name: item.device_type.charAt(0).toUpperCase() + item.device_type.slice(1).toLowerCase(),
    value: item.clicks,
    color: COLORS[item.device_type.toLowerCase() as keyof typeof COLORS] || COLORS.unknown,
  }));

  const totalClicks = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Hide label if slice is too small

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip with modern design
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass dark:glass-dark border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl p-4 backdrop-blur-xl">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">{data.name}</p>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {data.value.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">clicks</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${((data.value / totalClicks) * 100).toFixed(1)}%`,
                  background: `linear-gradient(to right, ${data.color}, ${data.color}dd)`
                }}
              />
            </div>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {((data.value / totalClicks) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
        No device data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with stats */}
      <div className="space-y-2">
        {chartData.map((item, index) => {
          const deviceType = item.name.toLowerCase();
          const Icon = DEVICE_ICONS[deviceType as keyof typeof DEVICE_ICONS];
          const percentage = ((item.value / totalClicks) * 100).toFixed(1);

          return (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />}
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
