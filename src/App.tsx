import React from 'react';
import { 
  Settings, 
  Activity, 
  Zap, 
  Sun, 
  Battery, 
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { StatusCard } from './components/StatusCard';
import { BatteryIndicator } from './components/BatteryIndicator';
import { GridStatus } from './components/GridStatus';
import { WeatherWidget } from './components/WeatherWidget';
import { PowerChart } from './components/PowerChart';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { AIInsights } from './components/AIInsights';
import { useSystemData } from './hooks/useSystemData';
import { useWeatherData } from './hooks/useWeatherData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { QRScanner } from './components/QRScanner';

function App() {
  const { batteryData, gridData, powerHistory, isConnected } = useSystemData();
  const { weatherData, loading: weatherLoading } = useWeatherData();
  const [deviceIP] = useLocalStorage('deviceIP', '192.168.1.100');
  const [scannedIP, setScannedIP] = React.useState<string | null>(null);



  const getCurrentPower = () => {
    if (!gridData) return 0;
    return gridData.power / 1000; // Convert to kW
  };

  const getEfficiency = () => {
    if (powerHistory.length === 0) return 0;
    const solarTotal = powerHistory.reduce((sum, h) => sum + h.solarPower, 0);
    const consumptionTotal = powerHistory.reduce((sum, h) => sum + h.consumption, 0);
    return consumptionTotal > 0 ? (solarTotal / consumptionTotal) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">IoT Solar Grid</h1>
                <p className="text-xs text-gray-400">Smart Power Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
              
              {/* Last Update */}
              <div className="flex items-center gap-2 text-gray-400">
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              {/* Settings Button */}
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Battery Level"
            value={batteryData?.level || 0}
            unit="%"
            icon={Battery}
            status={
              !batteryData ? 'neutral' :
              batteryData.level > 70 ? 'good' :
              batteryData.level > 30 ? 'warning' : 'error'
            }
            trend={batteryData && batteryData.level > 50 ? 'up' : batteryData && batteryData.level < 30 ? 'down' : 'stable'}
          />
          
          <StatusCard
            title="Current Power"
            value={getCurrentPower()}
            unit="kW"
            icon={Zap}
            status={getCurrentPower() > 0 ? 'good' : 'neutral'}
            trend="stable"
          />
          
          <StatusCard
            title="Active Source"
            value={gridData?.source.toUpperCase() || 'N/A'}
            icon={gridData?.source === 'solar' ? Sun : gridData?.source === 'nepa' ? Zap : Battery}
            status={gridData?.status === 'online' ? 'good' : gridData?.status === 'switching' ? 'warning' : 'error'}
          />
          
          <StatusCard
            title="Efficiency"
            value={getEfficiency()}
            unit="%"
            icon={Activity}
            status={getEfficiency() > 70 ? 'good' : getEfficiency() > 40 ? 'warning' : 'neutral'}
            trend={getEfficiency() > 60 ? 'up' : 'stable'}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            {batteryData && <BatteryIndicator data={batteryData} />}
            <WeatherWidget data={weatherData} loading={weatherLoading} />
          </div>

          {/* Center Column */}
          <div className="space-y-8">
            {gridData && <GridStatus data={gridData} />}
             
      <QRCodeGenerator />


      {/* Don't do this anymore if QRScanner has no props */}
<QRScanner />

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <AIInsights 
              batteryData={batteryData}
              gridData={gridData}
              powerHistory={powerHistory}
            />
          </div>
        </div>

        {/* Power Chart - Full Width */}
        <div className="mb-8">
          <PowerChart data={powerHistory} />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm py-6 border-t border-gray-700/50">
          <p>IoT Solar Grid Management System • Built with React & ESP32</p>
          <p className="mt-1">Real-time monitoring • AI-powered insights • Local data storage</p>
        </footer>
      </main>
    </div>
  );
}

export default App;