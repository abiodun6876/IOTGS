import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { BatteryData, GridData, PowerHistory } from '../types';

interface AIInsightsProps {
  batteryData: BatteryData | null;
  gridData: GridData | null;
  powerHistory: PowerHistory[];
}

interface Insight {
  id: string;
  type: 'optimization' | 'prediction' | 'alert' | 'tip';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export function AIInsights({ batteryData, gridData, powerHistory }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);

  // Simple ML algorithm for generating insights
  useEffect(() => {
    if (!batteryData || !gridData || powerHistory.length < 5) return;

    const generateInsights = () => {
      const newInsights: Insight[] = [];

      // Battery trend analysis
      const recentBatteryLevels = powerHistory.slice(-10).map(h => h.batteryLevel);
      const batteryTrend = recentBatteryLevels[recentBatteryLevels.length - 1] - recentBatteryLevels[0];

      if (batteryTrend < -20) {
        newInsights.push({
          id: 'battery-drain',
          type: 'alert',
          title: 'High Battery Drain Detected',
          description: `Battery level dropped ${Math.abs(batteryTrend).toFixed(1)}% in recent cycles. Consider reducing load or switching to grid power.`,
          confidence: 85,
          priority: 'high'
        });
      }

      // Solar efficiency analysis
      const solarData = powerHistory.filter(h => h.solarPower > 0);
      if (solarData.length > 0) {
        const avgSolarPower = solarData.reduce((sum, h) => sum + h.solarPower, 0) / solarData.length;
        const currentHour = new Date().getHours();
        
        if (currentHour >= 6 && currentHour <= 18 && avgSolarPower < 1000) {
          newInsights.push({
            id: 'solar-low',
            type: 'optimization',
            title: 'Solar Panel Optimization Needed',
            description: 'Solar panels are underperforming during peak hours. Check for obstructions or cleaning requirements.',
            confidence: 75,
            priority: 'medium'
          });
        }
      }

      // Power consumption prediction
      const avgConsumption = powerHistory.reduce((sum, h) => sum + h.consumption, 0) / powerHistory.length;
      const currentConsumption = powerHistory[powerHistory.length - 1]?.consumption || 0;

      if (currentConsumption > avgConsumption * 1.3) {
        newInsights.push({
          id: 'high-consumption',
          type: 'prediction',
          title: 'Increased Power Demand Detected',
          description: `Current load is ${((currentConsumption / avgConsumption - 1) * 100).toFixed(0)}% above average. System may switch to backup power soon.`,
          confidence: 90,
          priority: 'medium'
        });
      }

      // Grid switching optimization
      if (gridData.source === 'nepa' && batteryData.level > 80) {
        newInsights.push({
          id: 'grid-optimization',
          type: 'tip',
          title: 'Battery Charging Opportunity',
          description: 'NEPA power is stable and battery is well-charged. Consider reducing grid dependency during peak solar hours.',
          confidence: 70,
          priority: 'low'
        });
      }

      // Predictive maintenance
      if (batteryData.temperature > 35) {
        newInsights.push({
          id: 'battery-temp',
          type: 'alert',
          title: 'Battery Temperature Warning',
          description: `Battery temperature is ${batteryData.temperature.toFixed(1)}°C. High temperatures can reduce battery lifespan.`,
          confidence: 95,
          priority: 'high'
        });
      }

      // Energy saving tips
      const currentHour = new Date().getHours();
      const peakHours = currentHour >= 18 && currentHour <= 22;
      if (peakHours && gridData.source === 'nepa') {
        newInsights.push({
          id: 'peak-hours',
          type: 'tip',
          title: 'Peak Hour Energy Management',
          description: 'Consider switching to battery power during peak demand hours to reduce electricity costs.',
          confidence: 80,
          priority: 'low'
        });
      }

      setInsights(newInsights.slice(0, 4)); // Limit to 4 insights
    };

    generateInsights();
    const interval = setInterval(generateInsights, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [batteryData, gridData, powerHistory]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return TrendingUp;
      case 'prediction':
        return Brain;
      case 'alert':
        return AlertTriangle;
      case 'tip':
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      case 'low':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          AI Insights
        </h3>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
          ML Powered
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Analyzing system data...</p>
          <p className="text-sm mt-1">AI insights will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${getInsightColor(insight.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{insight.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-75">
                          {insight.confidence}% confidence
                        </span>
                        <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                      </div>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ML Status Indicator */}
      <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-400">Machine Learning Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}