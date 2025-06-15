import React from 'react';
import { Battery, BatteryLow, AlertTriangle } from 'lucide-react';
import { BatteryData } from '../types';

interface BatteryIndicatorProps {
  data: BatteryData;
}

export function BatteryIndicator({ data }: BatteryIndicatorProps) {
  const { level, voltage, current, temperature } = data;
  
  const getBatteryStatus = () => {
    if (level > 70) return { status: 'good', color: 'green' };
    if (level > 30) return { status: 'warning', color: 'yellow' };
    return { status: 'critical', color: 'red' };
  };

  const { status, color } = getBatteryStatus();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          {status === 'critical' ? (
            <BatteryLow className="w-6 h-6 text-red-400" />
          ) : (
            <Battery className="w-6 h-6 text-green-400" />
          )}
          Battery Status
        </h3>
        {status === 'critical' && (
          <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
        )}
      </div>

      {/* Battery Visual Indicator */}
      <div className="mb-6">
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-lg h-8 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-lg bg-gradient-to-r ${
                color === 'green' ? 'from-green-500 to-green-400' :
                color === 'yellow' ? 'from-yellow-500 to-yellow-400' :
                'from-red-500 to-red-400'
              }`}
              style={{ width: `${level}%` }}
            >
              <div className="w-full h-full bg-white/20 animate-pulse rounded-lg" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {level.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Battery Details Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Voltage</p>
          <p className="text-lg font-bold text-white">{voltage.toFixed(1)}V</p>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current</p>
          <p className="text-lg font-bold text-white">{current.toFixed(1)}A</p>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Temp</p>
          <p className="text-lg font-bold text-white">{temperature.toFixed(1)}°C</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`mt-4 p-3 rounded-lg border ${
        color === 'green' ? 'border-green-500/30 bg-green-500/10' :
        color === 'yellow' ? 'border-yellow-500/30 bg-yellow-500/10' :
        'border-red-500/30 bg-red-500/10'
      }`}>
        <p className={`text-sm font-medium ${
          color === 'green' ? 'text-green-400' :
          color === 'yellow' ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {status === 'good' ? '✅ Battery Healthy' :
           status === 'warning' ? '⚠️ Battery Low' :
           '🚨 Critical Battery Level'}
        </p>
      </div>
    </div>
  );
}