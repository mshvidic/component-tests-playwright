import { BookingRecord } from '../api/types';
import { BookingCard } from './BookingCard';

interface BookingListProps {
  records: BookingRecord[];
  loading?: boolean;
  error?: string | null;
  canModify: boolean;
  onEdit: (record: BookingRecord) => void;
  onDelete: (id: number) => void;
}

/** The result of GET /booking, with loading, error and empty states. */
export function BookingList({ records, loading = false, error = null, canModify, onEdit, onDelete }: BookingListProps) {
  if (loading) return <p role="status">Loading bookings…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (records.length === 0) return <p role="status">No bookings found.</p>;

  return (
    <section aria-label="Bookings">
      <p className="count">
        {records.length} {records.length === 1 ? 'booking' : 'bookings'}
      </p>
      <ul className="booking-list">
        {records.map((record) => (
          <li key={record.id}>
            <BookingCard record={record} canModify={canModify} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </section>
  );
}
