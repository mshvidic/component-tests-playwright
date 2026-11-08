import { expect, test } from '@playwright/experimental-ct-react';
import { BookingRecord } from '../../src/api/types';
import { BookingCard } from '../../src/components/BookingCard';

const record: BookingRecord = {
  id: 1,
  booking: {
    firstname: 'Jim',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: '2026-01-01', checkout: '2026-01-05' },
    additionalneeds: 'Breakfast',
  },
};

const noop = () => {};

test.describe('BookingCard', () => {
  test.describe('display', () => {
    test('shows the guest, booking id, dates, price and extras', async ({ mount }) => {
      const component = await mount(
        <BookingCard record={record} canModify={false} onEdit={noop} onDelete={noop} />,
      );

      await expect(component).toHaveAttribute('aria-label', 'Booking 1');
      await expect(component.getByRole('heading', { name: 'Jim Brown', level: 3 })).toBeVisible();
      await expect(component.getByText('#1')).toBeVisible();
      await expect(component.getByText('2026-01-01 → 2026-01-05')).toBeVisible();
      await expect(component.getByText('(4 nights)')).toBeVisible();
      await expect(component.getByText('$111.00')).toBeVisible();
      await expect(component.getByText('Breakfast')).toBeVisible();
    });

    test('shows a paid deposit badge', async ({ mount }) => {
      const component = await mount(
        <BookingCard record={record} canModify={false} onEdit={noop} onDelete={noop} />,
      );

      await expect(component.getByText('Deposit paid')).toBeVisible();
      await expect(component.getByText('No deposit')).toHaveCount(0);
    });

    test('shows a no-deposit badge when the deposit is not paid', async ({ mount }) => {
      const unpaid: BookingRecord = { ...record, booking: { ...record.booking, depositpaid: false } };

      const component = await mount(
        <BookingCard record={unpaid} canModify={false} onEdit={noop} onDelete={noop} />,
      );

      await expect(component.getByText('No deposit')).toBeVisible();
      await expect(component.getByText('Deposit paid')).toHaveCount(0);
    });

    test('uses the singular for a one-night stay', async ({ mount }) => {
      const oneNight: BookingRecord = {
        ...record,
        booking: { ...record.booking, bookingdates: { checkin: '2026-02-10', checkout: '2026-02-11' } },
      };

      const component = await mount(
        <BookingCard record={oneNight} canModify={false} onEdit={noop} onDelete={noop} />,
      );

      await expect(component.getByText('(1 night)')).toBeVisible();
    });

    test('hides additional needs when there are none', async ({ mount }) => {
      const { additionalneeds: _removed, ...withoutNeeds } = record.booking;

      const component = await mount(
        <BookingCard
          record={{ id: 2, booking: withoutNeeds }}
          canModify={false}
          onEdit={noop}
          onDelete={noop}
        />,
      );

      await expect(component.getByText('Needs')).toHaveCount(0);
      await expect(component.getByText('Breakfast')).toHaveCount(0);
    });
  });

  test.describe('permissions', () => {
    test('hides the Edit and Delete buttons for anonymous users', async ({ mount }) => {
      const component = await mount(
        <BookingCard record={record} canModify={false} onEdit={noop} onDelete={noop} />,
      );

      await expect(component.getByRole('button')).toHaveCount(0);
    });

    test('shows the Edit and Delete buttons for logged-in users', async ({ mount }) => {
      const component = await mount(
        <BookingCard record={record} canModify={true} onEdit={noop} onDelete={noop} />,
      );

      await expect(component.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(component.getByRole('button', { name: 'Delete' })).toBeVisible();
    });
  });

  test.describe('actions', () => {
    test('calls onEdit with the booking record', async ({ mount }) => {
      const edited: BookingRecord[] = [];
      const component = await mount(
        <BookingCard
          record={record}
          canModify={true}
          onEdit={(r) => edited.push(r)}
          onDelete={noop}
        />,
      );

      await component.getByRole('button', { name: 'Edit' }).click();

      await expect.poll(() => edited).toEqual([record]);
    });

    test('asks for confirmation before deleting', async ({ mount }) => {
      const deleted: number[] = [];
      const component = await mount(
        <BookingCard
          record={record}
          canModify={true}
          onEdit={noop}
          onDelete={(id) => deleted.push(id)}
        />,
      );

      await component.getByRole('button', { name: 'Delete' }).click();

      await expect(component.getByText('Delete this booking?')).toBeVisible();
      await expect(component.getByRole('button', { name: 'Yes, delete' })).toBeVisible();
      await expect(component.getByRole('button', { name: 'Cancel' })).toBeVisible();
      await expect(component.getByRole('button', { name: 'Edit' })).toHaveCount(0);
      expect(deleted).toEqual([]);
    });

    test('calls onDelete with the booking id once the delete is confirmed', async ({ mount }) => {
      const deleted: number[] = [];
      const component = await mount(
        <BookingCard
          record={record}
          canModify={true}
          onEdit={noop}
          onDelete={(id) => deleted.push(id)}
        />,
      );

      await component.getByRole('button', { name: 'Delete' }).click();
      await component.getByRole('button', { name: 'Yes, delete' }).click();

      await expect.poll(() => deleted).toEqual([1]);
    });

    test('goes back to Edit and Delete when the delete is cancelled', async ({ mount }) => {
      const deleted: number[] = [];
      const component = await mount(
        <BookingCard
          record={record}
          canModify={true}
          onEdit={noop}
          onDelete={(id) => deleted.push(id)}
        />,
      );

      await component.getByRole('button', { name: 'Delete' }).click();
      await component.getByRole('button', { name: 'Cancel' }).click();

      await expect(component.getByText('Delete this booking?')).toHaveCount(0);
      await expect(component.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(component.getByRole('button', { name: 'Delete' })).toBeVisible();
      expect(deleted).toEqual([]);
    });
  });
});
