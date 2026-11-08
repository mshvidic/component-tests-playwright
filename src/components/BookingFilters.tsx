import { FormEvent, useState } from 'react';
import { BookingFilters as Filters } from '../api/types';

interface BookingFiltersProps {
  onSearch: (filters: Filters) => void;
}

const EMPTY = { firstname: '', lastname: '', checkin: '', checkout: '' };

/** Filters for GET /booking: by name and by check-in / check-out date. */
export function BookingFilters({ onSearch }: BookingFiltersProps) {
  const [values, setValues] = useState(EMPTY);

  const set = (field: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Only send the filters the user filled in.
    const filters = Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== ''),
    ) as Filters;
    onSearch(filters);
  };

  const handleReset = () => {
    setValues(EMPTY);
    onSearch({});
  };

  return (
    <form className="filters" onSubmit={handleSubmit} aria-label="Search bookings">
      <label>
        First name
        <input value={values.firstname} onChange={set('firstname')} />
      </label>
      <label>
        Last name
        <input value={values.lastname} onChange={set('lastname')} />
      </label>
      <label>
        Check-in from
        <input type="date" value={values.checkin} onChange={set('checkin')} />
      </label>
      <label>
        Check-out until
        <input type="date" value={values.checkout} onChange={set('checkout')} />
      </label>
      <div className="actions">
        <button type="submit">Search</button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
