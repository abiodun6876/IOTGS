import {
  Settings, Activity, Zap, Sun, Battery, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { StatusCard } from './components/StatusCard';
import { BatteryIndicator } from './components/BatteryIndicator';

import { WeatherWidget } from './components/WeatherWidget';
import { PowerChart } from './components/PowerChart';

import { AIInsights } from './components/AIInsights';

import { useWeatherData } from './hooks/useWeatherData';
import { useThingSpeakData } from './hooks/useThingSpeakData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PowerHistory } from './types';


function App() {
  const [deviceIP] = useLocalStorage('deviceIP', '192.168.1.199');
  const { data: tsData, loading: tsLoading } = useThingSpeakData(deviceIP);
  const { weatherData, loading: weatherLoading } = useWeatherData();

  // Extract raw measurements from ThingSpeak with proper field mapping
  const solarVoltage = parseFloat(tsData?.field1 || '0');    // Solar Voltage (V)
  const gridVoltage = parseFloat(tsData?.field2 || '0');     // Grid Voltage (V)
  const batteryVoltage = parseFloat(tsData?.field3 || '0');  // Battery Voltage (V)
  const solarCurrent = parseFloat(tsData?.field4 || '0');    // Solar Current (A)
  const gridCurrent = parseFloat(tsData?.field5 || '0');     // Grid Current (A)
  const batteryCurrent = parseFloat(tsData?.field6 || '0');  // Battery Current (A)
  const batteryTemp = parseFloat(tsData?.field7 || '25');    // Battery Temperature (°C)
  const powerMode = parseInt(tsData?.field8 || '1');         // Power Mode (1=Solar, 0=Grid)

 

  // Determine system state
  const isSolarActive = powerMode === 1;
  const isGridActive = powerMode === 0;
  const powerSource = isSolarActive ? 'solar' : 'grid';
  const isConnected = !tsLoading && !!tsData;
  const isBatteryCharging = batteryCurrent < 0; // Negative current = charging





// Replace the power calculations with:
const solarPower = solarVoltage * 1.13;       // Solar Power (W) using fixed 1.13A
const gridPower = gridVoltage * 60;          // Grid Power (W) using fixed 60A
const batteryPower = batteryVoltage * 7.6;   // Battery Power (W) using fixed 7.6A

// The rest of the calculations can remain the same
const loadPower = isSolarActive ? 
  solarPower + (isBatteryCharging ? 0 : Math.abs(batteryPower)) : 
  gridPower + (isBatteryCharging ? 0 : Math.abs(batteryPower));


  // Calculate battery level (simplified estimation for 12V battery)
  const maxBatteryVoltage = 14.4; // For 12V lead-acid battery
  const minBatteryVoltage = 10.8;
  const batteryLevel = Math.min(100, Math.max(0, 
    ((batteryVoltage - minBatteryVoltage) / (maxBatteryVoltage - minBatteryVoltage)) * 100
  ));

  // Define power output for status card
  const powerOutputW = powerSource === 'solar' ? solarPower : gridPower;

  // System health check
  const systemHealthy = batteryVoltage > minBatteryVoltage && batteryTemp < 50;

  // Calculate efficiency (solar power utilization)
  const efficiency = loadPower > 0 ? 
    Math.min(100, (solarPower / (loadPower + (isBatteryCharging ? Math.abs(batteryPower) : 0))) * 100) : 0;

  const getGridStatus = () => {
    return {
      id: 'grid-01',
      power: isGridActive ? gridPower : solarPower,
      source: powerSource,
      status: isConnected ? (systemHealthy ? 'online' : 'critical') : 'offline',
      voltage: isGridActive ? gridVoltage : solarVoltage,
      current: isGridActive ? gridCurrent : solarCurrent,
      frequency: 50.0, // Standard frequency
      timestamps: new Date(tsData?.created_at || Date.now()).toISOString()
    };
  };

  const getBatteryData = () => {
    return {
      id: 'battery-01',
      level: batteryLevel,
      voltage: batteryVoltage,
      current: batteryCurrent,
      temperature: batteryTemp,
      timestamps: new Date(tsData?.created_at || Date.now()).toISOString(),
      state: isBatteryCharging ? 'charging' : 'discharging'
    };
  };

  const getPowerHistory = (): PowerHistory[] => {
    if (!tsData) return [];
    return [{
      timestamp: new Date(tsData.created_at).getTime(),
      solarPower: isSolarActive ? solarPower : 0,
      gridPower: isGridActive ? gridPower : 0,
      nepaPower: isGridActive ? gridPower : 0, // Alias for backward compatibility
      batteryLevel: batteryLevel,
      consumption: loadPower,
      chargingPower: isBatteryCharging ? Math.abs(batteryPower) : 0
    }];
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
                <p className="text-xs text-gray-400">
                  {tsData ? `Last update: ${new Date(tsData.created_at).toLocaleTimeString()}` : 'Loading data...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  systemHealthy ? (
                    <Wifi className="w-5 h-5 text-green-400" />
                  ) : (
                    <Wifi className="w-5 h-5 text-yellow-400" />
                  )
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  !isConnected ? 'text-red-400' :
                  systemHealthy ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {!isConnected ? 'Offline' : systemHealthy ? 'Connected' : 'Critical'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <RefreshCw className={`w-4 h-4 ${tsLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs">{new Date().toLocaleTimeString()}</span>
              </div>

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
            title={powerSource === 'solar' ? "Solar Power" : "Grid Power"}
            value={powerOutputW.toFixed(1)}
            unit="W"
            icon={powerSource === 'solar' ? Sun : Zap}
            status={powerOutputW > 0 ? 'good' : 'neutral'}
            trend={powerOutputW > 100 ? 'up' : 'stable'}
          />
          <StatusCard
            title="Battery Level"
            value={batteryLevel.toFixed(1)}
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
            value={(loadPower / 1000).toFixed(2)}
            unit="kW"
            icon={Zap}
            status={loadPower > 0 ? 'good' : 'neutral'}
            trend="stable"
          />
          <StatusCard
            title="Efficiency"
            value={efficiency.toFixed(1)}
            unit="%"
            icon={Activity}
            status={efficiency > 70 ? 'good' : efficiency > 40 ? 'warning' : 'neutral'}
            trend={efficiency > 60 ? 'up' : 'stable'}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            <BatteryIndicator data={getBatteryData()} />
            <WeatherWidget data={weatherData} loading={weatherLoading} />
          </div>

          <AIInsights
            batteryData={getBatteryData()}
            gridData={getGridStatus()}
            powerHistory={getPowerHistory()} weatherData={null}          />

          <PowerChart data={getPowerHistory()} />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm py-6 border-t border-gray-700/50">
          <p>IoT Solar Grid Management System • Built with React & ESP32</p>
          <p className="mt-1">Device IP: {deviceIP} • ThingSpeak Channel: 2991136</p>
        </footer>
      </main>
    </div>
  );
}

export default App;