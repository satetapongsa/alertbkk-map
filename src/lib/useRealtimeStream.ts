'use client';

import { useEffect, useState } from 'react';

export interface StreamEvent {
  event: string;
  data?: unknown;
  timestamp: string;
}

export function useRealtimeStream(onEvent?: (event: StreamEvent) => void) {
  const [connected, setConnected] = useState<boolean>(false);
  const [lastPing, setLastPing] = useState<string>('');

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          setLastPing(parsed.timestamp || new Date().toISOString());
          if (onEvent) {
            onEvent(parsed);
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
      };
    } catch {
      setConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [onEvent]);

  return { connected, lastPing };
}
