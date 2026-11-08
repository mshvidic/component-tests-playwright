import { useEffect, useState } from 'react';
import { BookerApi } from '../api/client';
import { HealthState } from '../api/types';

export function useHealth(api: BookerApi): HealthState {
  const [status, setStatus] = useState<HealthState>('checking');

  useEffect(() => {
    let cancelled = false;
    api
      .ping()
      .then((ok) => !cancelled && setStatus(ok ? 'up' : 'down'))
      .catch(() => !cancelled && setStatus('down'));
    return () => {
      cancelled = true;
    };
  }, [api]);

  return status;
}
