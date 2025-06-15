export interface BatteryData {
  id: string;
  level: number;
  voltage: number;
  current: number;
  temperature: number;
  timestamp: number;
}

export interface GridData {
  id: string;
  source: 'solar' | 'nepa' | 'battery';
  voltage: number;
  current: number;
  power: number;
  frequency: number;
  status: 'online' | 'offline' | 'switching';
  timestamp: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  description: string;
  icon: string;
  timestamp: number;
}

export interface SystemConfig {
  id: string;
  deviceName: string;
  ipAddress: string;
  autoSwitch: boolean;
  batteryLowThreshold: number;
  solarPriorityEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PowerHistory {
  timestamp: number;
  solarPower: number;
  nepaPower: number;
  batteryLevel: number;
  consumption: number;
}