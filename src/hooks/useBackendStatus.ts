import { useEffect, useState } from 'react';

import { API_BASE_URL, BackendStatus } from '../config';

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>(API_BASE_URL ? 'starting' : 'not-configured');

  useEffect(() => {
    if (!API_BASE_URL) {
      setStatus('not-configured');
      return;
    }

    let cancelled = false;
    const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

    const wakeBackend = async () => {
      setStatus('starting');
      for (let attempt = 0; attempt < 5 && !cancelled; attempt += 1) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 12_000);
        try {
          const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal, cache: 'no-store' });
          if (response.ok) {
            if (!cancelled) setStatus('online');
            return;
          }
        } catch (error) {
          console.info(`Backend wake attempt ${attempt + 1} is still pending.`, error);
        } finally {
          window.clearTimeout(timeout);
        }
        if (attempt < 4) await wait(8_000);
      }
      if (!cancelled) setStatus('offline');
    };

    wakeBackend();
    return () => { cancelled = true; };
  }, []);

  return status;
}
