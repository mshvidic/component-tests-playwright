import { FormEvent, useState } from 'react';
import { Booking } from '../api/types';
import {
  BookingFormErrors,
  BookingFormValues,
  bookingFromValues,
  emptyBookingValues,
  validateBooking,
  valuesFromBooking,
} from '../utils/validation';

interface BookingFormProps {
  /** Pre-fills the form for editing. Change the component's `key` to load a different booking. */
  initialBooking?: Booking;
  submitLabel?: string;
  onSubmit: (booking: Booking) => Promise<void> | void;
  onCancel?: () => void;
}

/** Create / edit form for POST /booking and PUT /booking/:id. */
export function BookingForm({ initialBooking, submitLabel = 'Create booking', onSubmit, onCancel }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>(
    initialBooking ? valuesFromBooking(initialBooking) : emptyBookingValues,
  );
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof BookingFormValues>(field: K, value: BookingFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateBooking(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(bookingFromValues(values));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: keyof BookingFormValues) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const error = (name: keyof BookingFormValues) =>
    errors[name] ? (
      <span id={`${name}-error`} className="field-error" role="alert">
        {errors[name]}
      </span>
    ) : null;

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate aria-label="Booking form">
      <label>
        First name
        <input value={values.firstname} onChange={(e) => update('firstname', e.target.value)} {...field('firstname')} />
        {error('firstname')}
      </label>
      <label>
        Last name
        <input value={values.lastname} onChange={(e) => update('lastname', e.target.value)} {...field('lastname')} />
        {error('lastname')}
      </label>
      <label>
        Total price
        <input
          type="number"
          min="0"
          step="any"
          value={values.totalprice}
          onChange={(e) => update('totalprice', e.target.value)}
          {...field('totalprice')}
        />
        {error('totalprice')}
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={values.depositpaid}
          onChange={(e) => update('depositpaid', e.target.checked)}
        />
        Deposit paid
      </label>
      <label>
        Check-in
        <input type="date" value={values.checkin} onChange={(e) => update('checkin', e.target.value)} {...field('checkin')} />
        {error('checkin')}
      </label>
      <label>
        Check-out
        <input
          type="date"
          value={values.checkout}
          onChange={(e) => update('checkout', e.target.value)}
          {...field('checkout')}
        />
        {error('checkout')}
      </label>
      <label>
        Additional needs
        <input value={values.additionalneeds} onChange={(e) => update('additionalneeds', e.target.value)} />
      </label>

      <div className="actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
