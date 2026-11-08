export interface BookingDates {
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/** A booking together with the id the API assigned to it. */
export interface BookingRecord {
  id: number;
  booking: Booking;
}

export interface BookingFilters {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/** What the app keeps after a successful login. Held in memory only. */
export interface Session {
  username: string;
  token: string;
  /** Authorization header value. Browsers cannot set the Cookie header the API also accepts. */
  authorization: string;
}

export type HealthState = 'checking' | 'up' | 'down';
