import { Booking, BookingFilters, Session } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Everything the UI needs from Restful-Booker. Components and hooks depend on this, not on fetch. */
export interface BookerApi {
  /** GET /ping */
  ping(): Promise<boolean>;
  /** POST /auth */
  login(username: string, password: string): Promise<Session>;
  /** GET /booking */
  listBookingIds(filters?: BookingFilters): Promise<number[]>;
  /** GET /booking/:id */
  getBooking(id: number): Promise<Booking>;
  /** POST /booking */
  createBooking(booking: Booking): Promise<{ bookingid: number; booking: Booking }>;
  /** PUT /booking/:id */
  updateBooking(id: number, booking: Booking, session: Session): Promise<Booking>;
  /** DELETE /booking/:id */
  deleteBooking(id: number, session: Session): Promise<void>;
}

function describe(status: number): string {
  switch (status) {
    case 403:
      return 'Not authorised. Please log in again.';
    case 404:
      return 'Booking not found.';
    case 405:
      return 'That action is not allowed.';
    default:
      return `Request failed (HTTP ${status}).`;
  }
}

function cleanBooking(booking: Booking): Booking {
  const { additionalneeds, ...rest } = booking;
  return additionalneeds ? { ...rest, additionalneeds } : rest;
}

export function createApiClient(baseUrl: string, fetchImpl: typeof fetch = (...args) => fetch(...args)): BookerApi {
  async function request(
    path: string,
    init: { method?: string; body?: unknown; session?: Session } = {},
  ): Promise<unknown> {
    const hasBody = init.body !== undefined;
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(init.session ? { Authorization: init.session.authorization } : {}),
      },
      body: hasBody ? JSON.stringify(init.body) : undefined,
    });

    if (!response.ok) throw new ApiError(describe(response.status), response.status);

    // Some endpoints (/ping, DELETE) answer with the plain text "Created".
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return {
    async ping() {
      try {
        await request('/ping');
        return true;
      } catch {
        return false;
      }
    },

    async login(username, password) {
      const body = (await request('/auth', { method: 'POST', body: { username, password } })) as {
        token?: string;
        reason?: string;
      };
      // Restful-Booker answers 200 with a "reason" when the credentials are wrong.
      if (!body.token) throw new ApiError(body.reason ?? 'Login failed.', 401);
      return { username, token: body.token, authorization: `Basic ${btoa(`${username}:${password}`)}` };
    },

    async listBookingIds(filters = {}) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) params.set(key, value);
      }
      const query = params.toString();
      const body = (await request(`/booking${query ? `?${query}` : ''}`)) as Array<{ bookingid: number }>;
      return body.map((entry) => entry.bookingid);
    },

    async getBooking(id) {
      return (await request(`/booking/${id}`)) as Booking;
    },

    async createBooking(booking) {
      return (await request('/booking', { method: 'POST', body: cleanBooking(booking) })) as {
        bookingid: number;
        booking: Booking;
      };
    },

    async updateBooking(id, booking, session) {
      return (await request(`/booking/${id}`, {
        method: 'PUT',
        body: cleanBooking(booking),
        session,
      })) as Booking;
    },

    async deleteBooking(id, session) {
      await request(`/booking/${id}`, { method: 'DELETE', session });
    },
  };
}
