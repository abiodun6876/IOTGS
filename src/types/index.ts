
export interface BatteryData {
  id: string;
  level: number;
  voltage: number;
  current: number;
  temperature: number;
  timestamps: string;
}


export interface GridData {
  id: string;
  power: number;
  source: string;
  status: string;
  voltage: number;
  current: number;
  frequency: number;
  timestamps: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  uvIndex: number;
  description: string;
  isDay: boolean;
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
  gridPower: number;
  chargingPower: number;
  timestamp: number;
  solarPower: number;
  nepaPower: number;
  batteryLevel: number;
  consumption: number;
}