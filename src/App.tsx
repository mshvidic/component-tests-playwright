import { useState } from 'react';
import { BookerApi } from './api/client';
import { Booking, BookingFilters as Filters, BookingRecord } from './api/types';
import {
  BookingFilters,
  BookingForm,
  BookingList,
  HealthStatus,
  LoginForm,
  Notice,
  Notification,
} from './components';
import { useAuth } from './hooks/useAuth';
import { useBookings } from './hooks/useBookings';
import { useHealth } from './hooks/useHealth';
import { errorMessage } from './utils/errors';

export function App({ api }: { api: BookerApi }) {
  const health = useHealth(api);
  const auth = useAuth(api);
  const bookings = useBookings(api);

  const [editing, setEditing] = useState<BookingRecord | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0); // bumping it clears the create form

  const fail = (e: unknown) => setNotice({ type: 'error', message: errorMessage(e) });

  const handleSearch = (filters: Filters) => void bookings.reload(filters);

  const handleCreate = async (booking: Booking) => {
    try {
      const created = await api.createBooking(booking);
      setNotice({ type: 'success', message: `Booking #${created.bookingid} created.` });
      setCreateFormKey((key) => key + 1);
      await bookings.reload();
    } catch (e) {
      fail(e);
    }
  };

  const handleUpdate = async (booking: Booking) => {
    if (!editing || !auth.session) return;
    try {
      await api.updateBooking(editing.id, booking, auth.session);
      setNotice({ type: 'success', message: `Booking #${editing.id} updated.` });
      setEditing(null);
      await bookings.reload();
    } catch (e) {
      fail(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!auth.session) return;
    try {
      await api.deleteBooking(id, auth.session);
      setNotice({ type: 'success', message: `Booking #${id} deleted.` });
      if (editing?.id === id) setEditing(null);
      await bookings.reload();
    } catch (e) {
      fail(e);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setEditing(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Restful-Booker</h1>
        <HealthStatus status={health} />
        {auth.session ? (
          <div className="session">
            <span>Signed in as {auth.session.username}</span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <LoginForm onSubmit={auth.login} error={auth.error} />
        )}
      </header>

      <Notification notice={notice} onDismiss={() => setNotice(null)} />

      <main>
        <section className="panel">
          <h2>Bookings</h2>
          <BookingFilters onSearch={handleSearch} />
          <BookingList
            records={bookings.records}
            loading={bookings.loading}
            error={bookings.error}
            canModify={auth.session !== null}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        </section>

        <section className="panel">
          {editing ? (
            <>
              <h2>Edit booking #{editing.id}</h2>
              <BookingForm
                key={editing.id}
                initialBooking={editing.booking}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
                onCancel={() => setEditing(null)}
              />
            </>
          ) : (
            <>
              <h2>New booking</h2>
              <BookingForm key={createFormKey} onSubmit={handleCreate} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
