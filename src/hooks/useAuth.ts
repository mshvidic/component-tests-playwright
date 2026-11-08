import { useCallback, useState } from 'react';
import { BookerApi } from '../api/client';
import { Session } from '../api/types';
import { errorMessage } from '../utils/errors';

/** Login state. The session lives in memory only, so a page refresh logs the user out. */
export function useAuth(api: BookerApi) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null);
      try {
        setSession(await api.login(username, password));
      } catch (e) {
        setError(errorMessage(e));
      }
    },
    [api],
  );

  const logout = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return { session, error, login, logout };
}
