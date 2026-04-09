"use client"

import { useState, useEffect } from 'react';

export interface SystemData {
  cpuTemp: number;
  cpuUsage: string[];
  memoryUsage: {
    total: number;
    used: number;
    free: number;
  };
  storage: {
    total: string;
    used: string;
    available: string;
    usagePercent: string;
    mountPoint: string;
  };
  uptime: string;
  loadAverage: {
    oneMin: number;
    fiveMin: number;
    fifteenMin: number;
  };
  cpuCount: number;
  platform: string;
  arch: string;
  hostname: string;
  release: string;
}

interface UseSystemDataReturn {
  data: SystemData | null;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useSystemData(interval: number = 5000): UseSystemDataReturn {
  const [data, setData] = useState<SystemData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      
      try {
        console.log('Attempting to connect to EventSource...');
        eventSource = new EventSource(`/api/ws?interval=${interval}`);
        
        eventSource.onopen = () => {
          if (!isMounted) return;
          console.log('EventSource connection opened');
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            console.log('EventSource message received:', event.data);
            const message = JSON.parse(event.data);
            
            if (message.type === 'system-update') {
              setData(message.data);
              setLastUpdate(new Date());
              setError(null);
            } else if (message.type === 'error') {
              setError(message.message);
            }
          } catch (parseError) {
            console.error('Error parsing EventSource message:', parseError);
            setError('Failed to parse system data');
          }
        };

        eventSource.onerror = (error) => {
          if (!isMounted) return;
          console.error('EventSource error:', error);
          console.log('EventSource readyState:', eventSource?.readyState);
          setIsConnected(false);
          setError('Connection lost. Attempting to reconnect...');
          
          // Close current connection
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            if (isMounted) {
              console.log('Attempting to reconnect...');
              connect();
            }
          }, 3000);
        };
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to create EventSource connection:', err);
        setError('Failed to connect to system data stream');
        setIsConnected(false);
      }
    };

    // Initial connection
    connect();

    // Cleanup function
    return () => {
      isMounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [interval]);

  return { data, isConnected, error, lastUpdate };
}
