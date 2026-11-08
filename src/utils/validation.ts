import { Booking } from '../api/types';

/** Form state: everything is a string while the user is typing. */
export interface BookingFormValues {
  firstname: string;
  lastname: string;
  totalprice: string;
  depositpaid: boolean;
  checkin: string;
  checkout: string;
  additionalneeds: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

export const emptyBookingValues: BookingFormValues = {
  firstname: '',
  lastname: '',
  totalprice: '',
  depositpaid: false,
  checkin: '',
  checkout: '',
  additionalneeds: '',
};

export function valuesFromBooking(booking: Booking): BookingFormValues {
  return {
    firstname: booking.firstname,
    lastname: booking.lastname,
    totalprice: String(booking.totalprice),
    depositpaid: booking.depositpaid,
    checkin: booking.bookingdates.checkin,
    checkout: booking.bookingdates.checkout,
    additionalneeds: booking.additionalneeds ?? '',
  };
}

export function validateBooking(values: BookingFormValues): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (!values.firstname.trim()) errors.firstname = 'First name is required';
  if (!values.lastname.trim()) errors.lastname = 'Last name is required';

  if (values.totalprice.trim() === '') {
    errors.totalprice = 'Total price is required';
  } else if (Number.isNaN(Number(values.totalprice)) || Number(values.totalprice) < 0) {
    errors.totalprice = 'Total price must be a positive number';
  }

  if (!values.checkin) errors.checkin = 'Check-in date is required';
  if (!values.checkout) errors.checkout = 'Check-out date is required';
  if (values.checkin && values.checkout && values.checkout < values.checkin) {
    errors.checkout = 'Check-out must be on or after check-in';
  }

  return errors;
}

export function bookingFromValues(values: BookingFormValues): Booking {
  const additionalneeds = values.additionalneeds.trim();
  return {
    firstname: values.firstname.trim(),
    lastname: values.lastname.trim(),
    totalprice: Number(values.totalprice),
    depositpaid: values.depositpaid,
    bookingdates: { checkin: values.checkin, checkout: values.checkout },
    ...(additionalneeds ? { additionalneeds } : {}),
  };
}
