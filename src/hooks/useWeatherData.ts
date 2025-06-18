import { useState, useEffect } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import { WeatherData } from '../types';

export function useWeatherData() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lagos coordinates (6.5244° N, 3.3792° E)
      const params = {
        "latitude": 6.5244,
        "longitude": 3.3792,
        "current": ["temperature_2m", "relative_humidity_2m", "weather_code", "wind_speed_10m", "is_day"],
        "timezone": "auto"
      };
      
      const url = "https://api.open-meteo.com/v1/forecast";
      const responses = await fetchWeatherApi(url, params);
      const response = responses[0];

      // Process the weather data
      const current = response.current()!;
      
      const weatherData: WeatherData = {
        temperature: current.variables(0)!.value(),
        humidity: current.variables(1)!.value(),
        weatherCode: current.variables(2)!.value(),
        windSpeed: current.variables(3)!.value(),
        isDay: current.variables(4)!.value() === 1,
        description: getWeatherDescription(current.variables(2)!.value()),
        icon: getWeatherIcon(current.variables(2)!.value(), current.variables(4)!.value() === 1),
        timestamp: Date.now(),
        uvIndex: 0
      };

      setWeatherData(weatherData);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get weather description from code
  const getWeatherDescription = (code: number): string => {
    const descriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown weather';
  };

  // Helper function to get weather icon from code
  const getWeatherIcon = (code: number, isDay: boolean): string => {
    const icons: Record<number, string> = {
      0: isDay ? '☀️' : '🌙',
      1: isDay ? '🌤️' : '🌙☁️',
      2: '⛅',
      3: '☁️',
      45: '🌫️',
      51: '🌦️',
      53: '🌧️',
      55: '🌧️',
      61: '🌧️',
      63: '🌧️',
      65: '🌧️',
      71: '❄️',
      73: '❄️',
      75: '❄️',
      80: '🌦️',
      81: '🌧️',
      82: '🌧️',
      85: '❄️',
      86: '❄️',
      95: '⛈️',
      96: '⛈️',
      99: '⛈️'
    };
    return icons[code] || '❓';
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Update weather data every hour (3600000 ms)
    const interval = setInterval(fetchWeatherData, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  return { weatherData, loading, error, refetch: fetchWeatherData };
}