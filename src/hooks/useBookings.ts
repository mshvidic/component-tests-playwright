import { useCallback, useEffect, useRef, useState } from 'react';
import { BookerApi } from '../api/client';
import { BookingFilters, BookingRecord } from '../api/types';
import { errorMessage } from '../utils/errors';

/** The list endpoint only returns ids, so details are fetched for the first few. */
const MAX_BOOKINGS = 20;

interface State {
  records: BookingRecord[];
  loading: boolean;
  error: string | null;
}

/** Loads bookings (ids, then details). `reload(filters)` applies new filters; `reload()` reuses the last ones. */
export function useBookings(api: BookerApi) {
  const [state, setState] = useState<State>({ records: [], loading: true, error: null });
  const filters = useRef<BookingFilters>({});
  const latestRequest = useRef(0);

  const reload = useCallback(
    async (nextFilters?: BookingFilters) => {
      if (nextFilters) filters.current = nextFilters;
      const request = ++latestRequest.current;
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const ids = (await api.listBookingIds(filters.current)).slice(0, MAX_BOOKINGS);
        const results = await Promise.allSettled(
          ids.map(async (id) => ({ id, booking: await api.getBooking(id) })),
        );
        if (request !== latestRequest.current) return; // a newer search replaced this one

        const records = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
        setState({ records, loading: false, error: null });
      } catch (e) {
        if (request !== latestRequest.current) return;
        setState({ records: [], loading: false, error: errorMessage(e) });
      }
    },
    [api],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
