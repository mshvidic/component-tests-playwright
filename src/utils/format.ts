const priceFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(amount: number): string {
  return priceFormat.format(amount);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole nights between two YYYY-MM-DD dates, or null if either date is invalid or out of order. */
export function nightsBetween(checkin: string, checkout: string): number | null {
  const start = Date.parse(`${checkin}T00:00:00Z`);
  const end = Date.parse(`${checkout}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return Math.round((end - start) / MS_PER_DAY);
}

export function formatNights(nights: number | null): string {
  if (nights === null) return '';
  return nights === 1 ? '1 night' : `${nights} nights`;
}
