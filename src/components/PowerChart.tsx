import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PowerHistory } from '../types';

interface PowerChartProps {
  data: PowerHistory[];
}

export function PowerChart({ data }: PowerChartProps) {
  // Local storage keys for chart preferences
  const CHART_PREFS_KEY = 'powerChartPreferences';
  
  // Initialize state with defaults or saved preferences
  const [chartPrefs, setChartPrefs] = useState(() => {
    const saved = localStorage.getItem(CHART_PREFS_KEY);
    return saved ? JSON.parse(saved) : {
      showSolar: true,
      showGrid: true,
      showBattery: true,
      showLoad: true,
      showCharging: true,
      chartTheme: 'dark'
    };
  });

  // Save preferences to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(CHART_PREFS_KEY, JSON.stringify(chartPrefs));
  }, [chartPrefs]);

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
    grid: (item.gridPower / 1000).toFixed(2),
    battery: item.batteryLevel,
    consumption: (item.consumption / 1000).toFixed(2),
    charging: (item.chargingPower / 1000).toFixed(2)
  }));

  // Calculate summary statistics
  const maxSolar = Math.max(...data.map(d => d.solarPower / 1000));
  const maxGrid = Math.max(...data.map(d => d.gridPower / 1000));
  const maxLoad = Math.max(...data.map(d => d.consumption / 1000));
  const totalSolar = data.reduce((acc, d) => acc + d.solarPower, 0);
  const totalConsumption = data.reduce((acc, d) => acc + d.consumption, 0);
  const efficiency = totalConsumption > 0 ? 
    (totalSolar / totalConsumption) * 100 : 0;

  // Toggle visibility of chart lines
  const toggleLineVisibility = (line: string) => {
    setChartPrefs((prev: any) => ({
      ...prev,
      [`show${line.charAt(0).toUpperCase() + line.slice(1)}`]: !prev[`show${line.charAt(0).toUpperCase() + line.slice(1)}`]
    }));
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border ${
      chartPrefs.chartTheme === 'dark' ? 'border-gray-700/50' : 'border-gray-300/50'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          📊 Power Analytics
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => toggleLineVisibility('solar')}
            className={`px-3 py-1 rounded-lg text-xs ${
              chartPrefs.showSolar ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Solar
          </button>
          <button 
            onClick={() => toggleLineVisibility('grid')}
            className={`px-3 py-1 rounded-lg text-xs ${
              chartPrefs.showGrid ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Grid
          </button>
          <button 
            onClick={() => toggleLineVisibility('battery')}
            className={`px-3 py-1 rounded-lg text-xs ${
              chartPrefs.showBattery ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Battery
          </button>
          <button 
            onClick={() => toggleLineVisibility('load')}
            className={`px-3 py-1 rounded-lg text-xs ${
              chartPrefs.showLoad ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Load
          </button>
          <button 
            onClick={() => toggleLineVisibility('charging')}
            className={`px-3 py-1 rounded-lg text-xs ${
              chartPrefs.showCharging ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Charging
          </button>
        </div>
      </div>

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
            <YAxis 
              yAxisId="left"
              stroke="#9CA3AF" 
              fontSize={12}
              label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#A78BFA"
              fontSize={12}
              domain={[0, 100]}
              label={{ value: 'Battery (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            {chartPrefs.showSolar && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="solar" 
                stroke="#FCD34D" 
                strokeWidth={2}
                name="Solar (kW)"
                dot={{ fill: '#FCD34D', strokeWidth: 2, r: 4 }}
              />
            )}
            {chartPrefs.showGrid && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="grid" 
                stroke="#60A5FA" 
                strokeWidth={2}
                name="Grid (kW)" 
                dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
              />
            )}
            {chartPrefs.showLoad && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="consumption" 
                stroke="#F87171" 
                strokeWidth={2}
                name="Load (kW)"
                dot={{ fill: '#F87171', strokeWidth: 2, r: 4 }}
              />
            )}
            {chartPrefs.showBattery && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="battery" 
                stroke="#A78BFA" 
                strokeWidth={2}
                name="Battery (%)"
                dot={{ fill: '#A78BFA', strokeWidth: 2, r: 4 }}
              />
            )}
            {chartPrefs.showCharging && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="charging" 
                stroke="#34D399" 
                strokeWidth={2}
                name="Charging (kW)"
                dot={{ fill: '#34D399', strokeWidth: 2, r: 4 }}
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Power Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">Solar Peak</p>
          <p className="text-lg font-bold text-yellow-400">
            {maxSolar.toFixed(1)}kW
          </p>
        </div>
        <div className="text-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">Grid Peak</p>
          <p className="text-lg font-bold text-blue-400">
            {maxGrid.toFixed(1)}kW
          </p>
        </div>
        <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Max Load</p>
          <p className="text-lg font-bold text-red-400">
            {maxLoad.toFixed(1)}kW
          </p>
        </div>
        <div className="text-center p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-purple-400 uppercase tracking-wide mb-1">Efficiency</p>
          <p className="text-lg font-bold text-purple-400">
            {efficiency.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}