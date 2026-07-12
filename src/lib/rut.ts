// Chilean RUT: módulo-11 validation and UI formatting.
// Storage convention: normalized "12345678-9" (no dots, uppercase K).

/** Strip dots/hyphens/spaces and uppercase the check digit. */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

/** Compute the módulo-11 check digit for a numeric body. Returns '0'-'9' or 'K'. */
export function computeCheckDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

/** Validate a RUT via módulo-11. Accepts formatted or bare input. */
export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  const checkDigit = clean.slice(-1);
  return computeCheckDigit(body) === checkDigit;
}

/** Normalize to storage form "12345678-9". Throws on invalid input. */
export function normalizeRut(rut: string): string {
  const clean = cleanRut(rut);
  if (!isValidRut(clean)) {
    throw new Error(`RUT inválido: ${rut}`);
  }
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

/** Format a RUT for display with dots, e.g. "12.345.678-9". */
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return rut;
  const body = clean.slice(0, -1);
  const checkDigit = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${checkDigit}`;
}
