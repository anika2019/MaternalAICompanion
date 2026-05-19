/**
 * Normalizes phone numbers to standard format: '91' followed by the 10-digit number.
 * E.g., '+91 98765 43210' -> '919876543210'
 * E.g., '9876543210' -> '919876543210'
 * E.g., '919876543210' -> '919876543210'
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
}
