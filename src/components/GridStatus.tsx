import React from 'react';
import { Sun, Zap, Battery, Power, AlertCircle } from 'lucide-react';
import { GridData } from '../types';

interface GridStatusProps {
  data: GridData;
}

export function GridStatus({ data }: GridStatusProps) {
  const { source, voltage, current, power, frequency, status } = data;

  const getSourceConfig = () => {
    switch (source) {
      case 'solar':
        return {
          icon: Sun,
          name: 'Solar Power',
          color: 'yellow',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400'
        };
      case 'nepa':
        return {
          icon: Zap,
          name: 'NEPA Grid',
          color: 'blue',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400'
        };
      case 'battery':
        return {
          icon: Battery,
          name: 'Battery Power',
          color: 'purple',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          textColor: 'text-purple-400'
        };
    }
  };

  const sourceConfig = getSourceConfig();
  const Icon = sourceConfig.icon;

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'switching':
        return 'text-yellow-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Power className="w-6 h-6 text-green-400" />
          Grid Status
        </h3>
      </div>

      {/* Current Source Display */}
      <div className={`p-4 rounded-lg border ${sourceConfig.borderColor} ${sourceConfig.bgColor} mb-6`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 ${sourceConfig.textColor}`} />
            <div>
              <h4 className={`font-semibold ${sourceConfig.textColor}`}>
                {sourceConfig.name}
              </h4>
              <p className="text-sm text-gray-400">Active Source</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              status === 'online' ? 'bg-green-400 animate-pulse' :
              status === 'switching' ? 'bg-yellow-400 animate-pulse' :
              'bg-red-400'
            }`} />
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Power Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Voltage</p>
          <p className="text-lg font-bold text-white">{voltage.toFixed(1)}V</p>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current</p>
          <p className="text-lg font-bold text-white">{current.toFixed(1)}A</p>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Power</p>
          <p className="text-lg font-bold text-white">{(power/1000).toFixed(2)}kW</p>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Frequency</p>
          <p className="text-lg font-bold text-white">{frequency.toFixed(1)}Hz</p>
        </div>
      </div>

      {/* Auto Switch Indicator */}
      <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Auto Switch</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Enabled</span>
          </div>
        </div>
      </div>

      {/* Switching Logic Display */}
      {status === 'switching' && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">Switching power source...</span>
          </div>
        </div>
      )}
    </div>
  );
}