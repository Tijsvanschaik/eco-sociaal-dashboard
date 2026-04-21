const DECIMAL_PRECISION = 1_000;
const DAYS_IN_YEAR = 365;

export function roundToThousandths(value: number): number {
  return Math.round(value * DECIMAL_PRECISION) / DECIMAL_PRECISION;
}

export function calculateCo2(quantity: number, factor: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(factor)) {
    throw new Error("Quantity and factor must be finite numbers.");
  }
  if (quantity < 0 || factor < 0) {
    throw new Error("Quantity and factor cannot be negative.");
  }

  return roundToThousandths(quantity * factor);
}

export function eodDaysGained(savedKg: number, baselineKg: number): number {
  if (!Number.isFinite(savedKg) || !Number.isFinite(baselineKg)) {
    throw new Error("Saved and baseline values must be finite numbers.");
  }
  if (savedKg <= 0 || baselineKg <= 0) {
    return 0;
  }

  return Math.min(Math.round((savedKg / baselineKg) * DAYS_IN_YEAR), DAYS_IN_YEAR);
}
