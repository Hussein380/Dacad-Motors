/**
 * Format price in Kenyan Shillings
 */
export function formatPrice(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

/**
 * Format price with per-day suffix
 */
export function formatPricePerDay(amount: number): string {
  return `${formatPrice(amount)}/day`;
}
