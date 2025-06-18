import React from 'react';
import { Cloud, Thermometer, Droplets, Wind, Sun, Moon } from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  data: WeatherData | null;
  loading: boolean;
}

export function WeatherWidget({ data, loading }: WeatherWidgetProps) {
  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-32"></div>
          <div className="h-16 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="text-center text-gray-400">
          <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Weather data unavailable</p>
        </div>
      </div>
    );
  }

  // Remove UV Index related code since it's not in our WeatherData type
  // const getUVIndexColor = (uvIndex: number) => {
  //   if (uvIndex <= 2) return 'text-green-400';
  //   if (uvIndex <= 5) return 'text-yellow-400';
  //   if (uvIndex <= 7) return 'text-orange-400';
  //   return 'text-red-400';
  // };

  const getWeatherIcon = () => {
    if (data.weatherCode === 0) return data.isDay ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-300" />;
    if (data.weatherCode <= 3) return <Cloud className="w-6 h-6 text-gray-400" />;
    if (data.weatherCode <= 48) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (data.weatherCode <= 67) return <Cloud className="w-6 h-6 text-blue-400" />;
    return <Cloud className="w-6 h-6 text-gray-400" />;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          {getWeatherIcon()}
          Lagos Weather
        </h3>
        <span className="text-2xl">{data.icon}</span>
      </div>

      {/* Temperature Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-white mb-2">
          {Math.round(data.temperature)}°C
        </div>
        <p className="text-gray-400 capitalize">{data.description}</p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
          <Droplets className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400 uppercase">Humidity</p>
            <p className="text-white font-semibold">{Math.round(data.humidity)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
          <Wind className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400 uppercase">Wind</p>
            <p className="text-white font-semibold">{data.windSpeed.toFixed(1)} km/h</p>
          </div>
        </div>

        {/* Removed UV Index section since it's not in our data */}

        {/* Day/Night Indicator */}
        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg col-span-2">
          {data.isDay ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-300" />
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase">Daylight</p>
            <p className="text-white font-semibold">
              {data.isDay ? 'Daytime' : 'Nighttime'}
            </p>
          </div>
        </div>
      </div>

      {/* Weather Condition Indicator */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-400">Weather Condition</span>
          <span className="text-sm text-blue-400">
            {data.description}
          </span>
        </div>
      </div>
    </div>
  );
}