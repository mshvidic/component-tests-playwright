import { useState } from 'react';
import { BookingRecord } from '../api/types';
import { formatNights, formatPrice, nightsBetween } from '../utils/format';

interface BookingCardProps {
  record: BookingRecord;
  /** Edit and delete need a logged-in user. */
  canModify: boolean;
  onEdit: (record: BookingRecord) => void;
  onDelete: (id: number) => void;
}

/** One booking, with edit and (confirmed) delete actions for logged-in users. */
export function BookingCard({ record, canModify, onEdit, onDelete }: BookingCardProps) {
  const { id, booking } = record;
  const [confirming, setConfirming] = useState(false);
  const fullName = `${booking.firstname} ${booking.lastname}`;
  const nights = formatNights(nightsBetween(booking.bookingdates.checkin, booking.bookingdates.checkout));

  return (
    <article className="booking-card" aria-label={`Booking ${id}`}>
      <header>
        <h3>{fullName}</h3>
        <span className="booking-id">#{id}</span>
      </header>

      <dl>
        <dt>Dates</dt>
        <dd>
          {booking.bookingdates.checkin} → {booking.bookingdates.checkout}
          {nights && <span className="nights"> ({nights})</span>}
        </dd>
        <dt>Total</dt>
        <dd>{formatPrice(booking.totalprice)}</dd>
        <dt>Deposit</dt>
        <dd>
          <span className={booking.depositpaid ? 'badge badge-paid' : 'badge badge-unpaid'}>
            {booking.depositpaid ? 'Deposit paid' : 'No deposit'}
          </span>
        </dd>
        {booking.additionalneeds && (
          <>
            <dt>Needs</dt>
            <dd>{booking.additionalneeds}</dd>
          </>
        )}
      </dl>

      {canModify &&
        (confirming ? (
          <div className="actions" role="group" aria-label="Confirm delete">
            <span>Delete this booking?</span>
            <button type="button" className="danger" onClick={() => onDelete(id)}>
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="actions">
            <button type="button" onClick={() => onEdit(record)}>
              Edit
            </button>
            <button type="button" className="danger" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </div>
        ))}
    </article>
  );
}
