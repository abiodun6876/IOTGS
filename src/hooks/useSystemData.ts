import { useState, useEffect } from 'react';
import { BatteryData, GridData, PowerHistory } from '../types';
import { useLocalStorageArray } from './useLocalStorage';

export function useSystemData() {
  const [batteryData, setBatteryData] = useState<BatteryData | null>(null);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { items: powerHistory, addItem: addPowerHistory } = useLocalStorageArray<PowerHistory>('powerHistory');

  // Simulate real-time data from ESP32
  const generateMockData = () => {
    const now = Date.now();
    
    // Battery simulation
    const batteryLevel = 20 + Math.sin(now / 60000) * 30 + Math.random() * 10;
    const newBatteryData: BatteryData = {
      id: 'battery_01',
      level: Math.max(0, Math.min(100, batteryLevel)),
      voltage: 12 + Math.random() * 2,
      current: 5 + Math.random() * 10,
      temperature: 25 + Math.random() * 15,
      timestamp: now
    };

    // Grid simulation with intelligent switching
    const sources: Array<'solar' | 'nepa' | 'battery'> = ['solar', 'nepa', 'battery'];
    const currentHour = new Date().getHours();
    let preferredSource: 'solar' | 'nepa' | 'battery';
    
    if (currentHour >= 6 && currentHour <= 18) {
      preferredSource = 'solar'; // Daytime - prefer solar
    } else if (Math.random() > 0.3) {
      preferredSource = 'nepa'; // Night - prefer NEPA if available
    } else {
      preferredSource = 'battery'; // Fallback to battery
    }

    const newGridData: GridData = {
      id: 'grid_01',
      source: preferredSource,
      voltage: 220 + Math.random() * 20 - 10,
      current: 8 + Math.random() * 12,
      power: 0, // Will be calculated
      frequency: 50 + Math.random() * 2 - 1,
      status: Math.random() > 0.05 ? 'online' : 'offline',
      timestamp: now
    };
    
    newGridData.power = newGridData.voltage * newGridData.current;

    setBatteryData(newBatteryData);
    setGridData(newGridData);
    setIsConnected(Math.random() > 0.1); // 90% uptime simulation

    // Add to power history (limit to last 50 entries)
    if (powerHistory.length >= 50) {
      const newHistory = powerHistory.slice(1);
      newHistory.push({
        timestamp: now,
        solarPower: preferredSource === 'solar' ? newGridData.power : 0,
        nepaPower: preferredSource === 'nepa' ? newGridData.power : 0,
        batteryLevel: newBatteryData.level,
        consumption: newGridData.power * 0.8 + Math.random() * 200
      });
    } else {
      addPowerHistory({
        timestamp: now,
        solarPower: preferredSource === 'solar' ? newGridData.power : 0,
        nepaPower: preferredSource === 'nepa' ? newGridData.power : 0,
        batteryLevel: newBatteryData.level,
        consumption: newGridData.power * 0.8 + Math.random() * 200
      });
    }
  };

  useEffect(() => {
    // Initial data generation
    generateMockData();
    
    // Update data every 3 seconds to simulate real-time ESP32 data
    const interval = setInterval(generateMockData, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    batteryData,
    gridData,
    powerHistory: powerHistory.slice(-24), // Last 24 data points for charts
    isConnected
  };
}