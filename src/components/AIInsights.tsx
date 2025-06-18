import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, AlertTriangle, X } from 'lucide-react';
import { BatteryData, GridData, PowerHistory, WeatherData } from '../types';

interface AIInsightsProps {
  batteryData: BatteryData | null;
  gridData: GridData | null;
  powerHistory: PowerHistory[];
  weatherData: WeatherData | null;
}

interface Insight {
  id: string;
  type: 'optimization' | 'prediction' | 'alert' | 'tip' | 'weather';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  dismissed?: boolean;
  weatherIcon?: string;
}

export function AIInsights({ batteryData, gridData, powerHistory, weatherData }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('aiInsightsPreferences');
    return saved ? JSON.parse(saved) : {
      dismissedInsights: [] as string[],
      priorityFilter: ['high', 'medium', 'low'],
      typesFilter: ['optimization', 'prediction', 'alert', 'tip', 'weather']
    };
  });

  // Save preferences to local storage
  useEffect(() => {
    localStorage.setItem('aiInsightsPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Generate insights with ML algorithm
  useEffect(() => {
    if (!batteryData || !gridData || !weatherData || powerHistory.length < 5) return;

    const generateInsights = () => {
      const newInsights: Insight[] = [];
      const now = new Date();

      // 1. Battery Health Insights
      if (batteryData) {
        // Battery drain rate
        const recentBatteryLevels = powerHistory.slice(-10).map(h => h.batteryLevel);
        if (recentBatteryLevels.length > 1) {
          const batteryTrend = recentBatteryLevels[recentBatteryLevels.length - 1] - recentBatteryLevels[0];
          if (batteryTrend < -20) {
            newInsights.push({
              id: `battery-drain-${now.getTime()}`,
              type: 'alert',
              title: 'High Battery Drain Detected',
              description: `Battery level dropped ${Math.abs(batteryTrend).toFixed(1)}% recently. Consider reducing load.`,
              confidence: 85,
              priority: 'high'
            });
          }
        }

        // Battery temperature
        if (batteryData.temperature > 35) {
          newInsights.push({
            id: `battery-temp-${now.getTime()}`,
            type: 'alert',
            title: 'Battery Temperature Warning',
            description: `Battery temperature is ${batteryData.temperature.toFixed(1)}°C. High temps reduce lifespan.`,
            confidence: 95,
            priority: 'high'
          });
        }
      }

      // 2. Solar Performance Insights
      const solarData = powerHistory.filter(h => h.solarPower > 0);
      if (solarData.length > 0) {
        const avgSolarPower = solarData.reduce((sum, h) => sum + h.solarPower, 0) / solarData.length;
        const currentHour = now.getHours();
        
        if (currentHour >= 6 && currentHour <= 18 && avgSolarPower < 1000) {
          newInsights.push({
            id: `solar-low-${now.getTime()}`,
            type: 'optimization',
            title: 'Solar Panel Optimization',
            description: 'Solar output is lower than expected during peak hours. Check for obstructions.',
            confidence: 75,
            priority: 'medium'
          });
        }
      }

      // 3. Load Analysis
      const avgConsumption = powerHistory.reduce((sum, h) => sum + h.consumption, 0) / powerHistory.length;
      const currentConsumption = powerHistory[powerHistory.length - 1]?.consumption || 0;

      if (currentConsumption > avgConsumption * 1.3) {
        newInsights.push({
          id: `high-consumption-${now.getTime()}`,
          type: 'prediction',
          title: 'Increased Power Demand',
          description: `Current load is ${((currentConsumption / avgConsumption - 1) * 100).toFixed(0)}% above average.`,
          confidence: 90,
          priority: 'medium'
        });
      }

      // 4. Energy Management Tips
      const currentHour = now.getHours();
      const peakHours = currentHour >= 18 && currentHour <= 22;
      
      if (peakHours && gridData.source === 'grid') {
        newInsights.push({
          id: `peak-hours-${now.getTime()}`,
          type: 'tip',
          title: 'Peak Hour Energy Savings',
          description: 'Consider using battery power during peak hours to reduce costs.',
          confidence: 80,
          priority: 'low'
        });
      }

      // 5. Weather-based Insights
      if (weatherData) {
        // Cloudy weather reducing solar output
        if ([2, 3, 45].includes(weatherData.weatherCode)) {
          newInsights.push({
            id: `weather-cloudy-${now.getTime()}`,
            type: 'weather',
            title: 'Reduced Solar Output Expected',
            description: `Current ${weatherData.description.toLowerCase()} will reduce solar panel efficiency by ~30-60%.`,
            confidence: 85,
            priority: 'medium',
            weatherIcon: weatherData.icon
          });
        }

        // Rain suggesting panel cleaning
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherData.weatherCode)) {
          newInsights.push({
            id: `panel-cleaning-${now.getTime()}`,
            type: 'tip',
            title: 'Post-Rain Panel Maintenance',
            description: 'After the rain passes, consider cleaning your solar panels to remove any residue for optimal performance.',
            confidence: 75,
            priority: 'low',
            weatherIcon: weatherData.icon
          });
        }

        // Extreme temperature warnings
        if (weatherData.temperature > 35) {
          newInsights.push({
            id: `high-temp-${now.getTime()}`,
            type: 'alert',
            title: 'High Temperature Alert',
            description: `Temperatures reaching ${weatherData.temperature}°C may reduce battery efficiency and increase cooling needs.`,
            confidence: 90,
            priority: 'high',
            weatherIcon: weatherData.icon
          });
        } else if (weatherData.temperature < 5) {
          newInsights.push({
            id: `low-temp-${now.getTime()}`,
            type: 'alert',
            title: 'Low Temperature Alert',
            description: `Cold temperatures (${weatherData.temperature}°C) may reduce battery capacity temporarily.`,
            confidence: 80,
            priority: 'medium',
            weatherIcon: weatherData.icon
          });
        }

        // Thunderstorm warning
        if ([95, 96, 99].includes(weatherData.weatherCode)) {
          newInsights.push({
            id: `storm-warning-${now.getTime()}`,
            type: 'alert',
            title: 'Storm Warning',
            description: 'Thunderstorm detected. Consider securing outdoor equipment and prepare for potential power fluctuations.',
            confidence: 95,
            priority: 'high',
            weatherIcon: weatherData.icon
          });
        }

        // Weather-based consumption predictions
        const tempTrend = powerHistory.slice(-6).map(h => h.consumption);
        if (tempTrend.length > 1) {
          const consumptionTrend = tempTrend[tempTrend.length - 1] - tempTrend[0];
          
          // Hot weather increasing AC usage
          if (weatherData.temperature > 30 && consumptionTrend > 0) {
            newInsights.push({
              id: `ac-usage-${now.getTime()}`,
              type: 'prediction',
              title: 'Cooling Demand Rising',
              description: `Hot weather (${weatherData.temperature}°C) is increasing AC usage. Consider battery conservation.`,
              confidence: 80,
              priority: 'medium',
              weatherIcon: weatherData.icon
            });
          }
          
          // Cold weather increasing heating usage
          if (weatherData.temperature < 10 && consumptionTrend > 0) {
            newInsights.push({
              id: `heating-usage-${now.getTime()}`,
              type: 'prediction',
              title: 'Heating Demand Rising',
              description: `Cold weather (${weatherData.temperature}°C) is increasing heating usage. Battery drain may accelerate.`,
              confidence: 80,
              priority: 'medium',
              weatherIcon: weatherData.icon
            });
          }
        }
      }

      // Filter out dismissed insights and apply user preferences
      const filteredInsights = newInsights
        .filter(insight => !userPreferences.dismissedInsights.includes(insight.id))
        .filter(insight => userPreferences.priorityFilter.includes(insight.priority))
        .filter(insight => userPreferences.typesFilter.includes(insight.type))
        .slice(0, 4); // Limit to 4 insights

      setInsights(filteredInsights);
    };

    generateInsights();
    const interval = setInterval(generateInsights, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [batteryData, gridData, powerHistory, userPreferences, weatherData]);

  const dismissInsight = (id: string) => {
    setUserPreferences((prev: { dismissedInsights: any; }) => ({
      ...prev,
      dismissedInsights: [...prev.dismissedInsights, id]
    }));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp;
      case 'prediction': return Brain;
      case 'alert': return AlertTriangle;
      case 'tip': return Lightbulb;
      case 'weather': return Lightbulb;
      default: return Brain;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20';
      case 'low': return 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          AI Insights
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {insights.length} Active
          </span>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No new insights to show</p>
          <p className="text-sm mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${getInsightColor(insight.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-start gap-2">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getPriorityTextColor(insight.priority)}`} />
                    {insight.weatherIcon && (
                      <span className="text-lg -ml-1 mr-1">{insight.weatherIcon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{insight.title}</h4>
                      <button 
                        onClick={() => dismissInsight(insight.id)}
                        className="text-gray-400 hover:text-white p-1 -mr-2"
                        aria-label="Dismiss insight"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityTextColor(insight.priority)} bg-black/20`}>
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          Confidence: {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ML Status and Controls */}
      <div className="mt-6 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-300">AI Analysis Active</span>
          </div>
          <span className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
}