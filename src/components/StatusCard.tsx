
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: typeof LucideIcon;
  status?: 'good' | 'warning' | 'error' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
}

export function StatusCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status = 'neutral',
  trend,
  onClick 
}: StatusCardProps) {
  const statusColors = {
    good: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    neutral: 'border-blue-500/30 bg-blue-500/5'
  };

  const iconColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    neutral: 'text-blue-400'
  };

  const trendIndicators = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };

  return (
    <div 
      className={`
        relative p-6 rounded-xl border backdrop-blur-sm transition-all duration-300
        ${statusColors[status]}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
        group
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${iconColors[status]} group-hover:scale-110 transition-transform`} />
        {trend && (
          <span className="text-2xl opacity-60">
            {trendIndicators[trend]}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </p>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-white">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          {unit && (
            <span className="text-lg text-gray-400 font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Subtle animated background effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}