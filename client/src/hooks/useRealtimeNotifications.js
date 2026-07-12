import { useEffect } from "react";

export function useRealtimeNotifications(token, onMessage) {
  useEffect(() => {
    if (!token || !onMessage) return;
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const url = `${base}/notifications/stream`;
    const source = new EventSource(url, {
      withCredentials: false
    });

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onMessage(payload);
      } catch {
        // ignore malformed packets
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [token, onMessage]);
}
