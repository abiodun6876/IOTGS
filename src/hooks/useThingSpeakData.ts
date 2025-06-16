// src/hooks/useThingSpeakData.ts
import { useEffect, useState } from 'react';
const API_URL = 'https://api.thingspeak.com/channels/2991136/feeds.json?api_key=3XPVMS09C02M866S&results=1';


export function useThingSpeakData(deviceIP: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        setData(json.feeds[0]); // latest data point
      } catch (err) {
        console.error('Error fetching ThingSpeak data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
}
