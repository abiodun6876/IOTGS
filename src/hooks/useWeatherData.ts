import { useState, useEffect } from 'react';
import { WeatherData } from '../types';

export function useWeatherData() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock weather data for Lagos, Nigeria
  const generateMockWeatherData = (): WeatherData => {
    const conditions = [
      { description: 'Sunny', icon: '☀️', temp: 32 },
      { description: 'Partly Cloudy', icon: '⛅', temp: 29 },
      { description: 'Cloudy', icon: '☁️', temp: 27 },
      { description: 'Light Rain', icon: '🌦️', temp: 25 },
    ];
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      temperature: randomCondition.temp + Math.random() * 4 - 2,
      humidity: 65 + Math.random() * 20,
      windSpeed: 5 + Math.random() * 10,
      uvIndex: Math.floor(Math.random() * 11),
      description: randomCondition.description,
      icon: randomCondition.icon,
      timestamp: Date.now()
    };
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In production, replace this with actual weather API call
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      const mockData = generateMockWeatherData();
      setWeatherData(mockData);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Update weather data every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { weatherData, loading, error, refetch: fetchWeatherData };
}