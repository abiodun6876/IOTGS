import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PowerHistory } from '../types';

interface PowerChartProps {
  data: PowerHistory[];
}

export function PowerChart({ data }: PowerChartProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const chartData = data.map(item => ({
    time: formatTime(item.timestamp),
    solar: (item.solarPower / 1000).toFixed(2),
    nepa: (item.nepaPower / 1000).toFixed(2),
    battery: item.batteryLevel,
    consumption: (item.consumption / 1000).toFixed(2)
  }));

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        📊 Power Analytics
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="solar" 
              stroke="#FCD34D" 
              strokeWidth={2}
              name="Solar (kW)"
              dot={{ fill: '#FCD34D', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="nepa" 
              stroke="#60A5FA" 
              strokeWidth={2}
              name="NEPA (kW)" 
              dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="consumption" 
              stroke="#F87171" 
              strokeWidth={2}
              name="Load (kW)"
              dot={{ fill: '#F87171', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="battery" 
              stroke="#A78BFA" 
              strokeWidth={2}
              name="Battery (%)"
              dot={{ fill: '#A78BFA', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Power Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">Solar Peak</p>
          <p className="text-lg font-bold text-yellow-400">
            {Math.max(...data.map(d => d.solarPower / 1000)).toFixed(1)}kW
          </p>
        </div>
        <div className="text-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">NEPA Peak</p>
          <p className="text-lg font-bold text-blue-400">
            {Math.max(...data.map(d => d.nepaPower / 1000)).toFixed(1)}kW
          </p>
        </div>
        <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Max Load</p>
          <p className="text-lg font-bold text-red-400">
            {Math.max(...data.map(d => d.consumption / 1000)).toFixed(1)}kW
          </p>
        </div>
        <div className="text-center p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-purple-400 uppercase tracking-wide mb-1">Efficiency</p>
          <p className="text-lg font-bold text-purple-400">
            {(
              (data.reduce((acc, d) => acc + d.solarPower, 0) /
                (data.reduce((acc, d) => acc + d.consumption, 0) || 1)) *
              100
            ).toFixed(0) || 85}%
          </p>
        </div>
      </div>
    </div>
  );
}