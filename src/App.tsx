import React from 'react';
import {
  Settings, Activity, Zap, Sun, Battery, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { StatusCard } from './components/StatusCard';
import { BatteryIndicator } from './components/BatteryIndicator';
import { GridStatus } from './components/GridStatus';
import { WeatherWidget } from './components/WeatherWidget';
import { PowerChart } from './components/PowerChart';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { AIInsights } from './components/AIInsights';
import { QRScanner } from './components/QRScanner';

import { useWeatherData } from './hooks/useWeatherData';
import { useThingSpeakData } from './hooks/useThingSpeakData';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const { data: tsData, loading: tsLoading } = useThingSpeakData();
  const { weatherData, loading: weatherLoading } = useWeatherData();
  const [deviceIP] = useLocalStorage('deviceIP', '192.168.1.100');
  const [scannedIP, setScannedIP] = useLocalStorage<string | null>('scanned_ip', null);

  

  // Extract ThingSpeak values
  const solarPower = parseFloat(tsData?.field1 || '0');       // W
  const gridPower = parseFloat(tsData?.field2 || '0');        // W
  const loadPower = parseFloat(tsData?.field3 || '0');        // W
  const batteryLevel = parseFloat(tsData?.field4 || '0');     // %
  const batteryVoltage = parseFloat(tsData?.field5 || '0');   // V
  const batteryCurrent = parseFloat(tsData?.field6 || '0');   // A
  const temperature = parseFloat(tsData?.field7 || '0');      // °C

  const isConnected = !!tsData;

  const getEfficiency = () => {
    return loadPower > 0 ? (solarPower / loadPower) * 100 : 0;
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
                <span className="text-xs">{new Date().toLocaleTimeString()}</span>
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
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Solar Power"
            value={solarPower}
            unit="W"
            icon={Sun}
            status={solarPower > 0 ? 'good' : 'neutral'}
            trend="up"
          />
          <StatusCard
            title="Battery Level"
            value={batteryLevel}
            unit="%"
            icon={Battery}
            status={
              batteryLevel > 70 ? 'good' :
              batteryLevel > 30 ? 'warning' : 'error'
            }
            trend={batteryLevel > 50 ? 'up' : batteryLevel < 30 ? 'down' : 'stable'}
          />
          <StatusCard
            title="Load Power"
            value={loadPower / 1000}
            unit="kW"
            icon={Zap}
            status={loadPower > 0 ? 'good' : 'neutral'}
            trend="stable"
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
           <BatteryIndicator data={{
  id: 'battery-01',
  level: batteryLevel,
  voltage: batteryVoltage,
  current: batteryCurrent,
  temperature: temperature, // or a placeholder if needed
  timestamps: new Date().toISOString()
}} />

            <WeatherWidget data={weatherData} loading={weatherLoading} />
          </div>

          {/* Center Column */}
          <div className="space-y-8">
            <GridStatus data={{
  id: 'grid-01',
  power: gridPower,
  source: 'solar',
  status: 'online',
  voltage: 220,           // Use realistic or placeholder value
  current: 5.0,           // Or estimate from load
  frequency: 50.0,        // Typical Nigerian grid frequency
  timestamps: new Date().toISOString()
}} />

            <QRCodeGenerator />
            <input
              type="text"
              value={scannedIP || ''}
              onChange={(e) => setScannedIP(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Scanned IP will appear here"
            />
            <QRScanner onResult={setScannedIP} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
          <AIInsights
  batteryData={{
    id: 'battery-01',
    level: batteryLevel,
    voltage: batteryVoltage,
    current: batteryCurrent,
    temperature: temperature,
    timestamps: new Date().toISOString()
  }}
  gridData={{
    id: 'grid-01',
    power: gridPower,
    source: 'solar',
    status: 'online',
    voltage: 220,
    current: 5.0,
    frequency: 50.0,
    timestamps: new Date().toISOString()
  }}
  powerHistory={[]} // You can populate this with ThingSpeak historical data later
/>

          </div>
        </div>

        {/* Power Chart Placeholder */}
        <div className="mb-8">
          <PowerChart data={[]} />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm py-6 border-t border-gray-700/50">
          <p>IoT Solar Grid Management System • Built with React & ESP32</p>
          <p className="mt-1">Real-time monitoring • AI-powered insights • ThingSpeak data feed</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
