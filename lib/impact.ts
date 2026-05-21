const DECIMAL_PRECISION = 1_000;
const DAYS_IN_YEAR = 365;
// Gemiddelde CO2-opname van een volwassen boom in Nederland: ~22 kg/jaar
// (bronnen: Wageningen UR, Milieu Centraal, Trees for All). Bewust iets aan
// de conservatieve kant om niet te overdrijven in publieke communicatie.
const KG_CO2_PER_TREE_PER_YEAR = 22;

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

/**
 * Sociale score op registratie-niveau: sociale hoeveelheid × factor per
 * sociale eenheid (ingesteld op de interventie). Zelfde afronding als CO₂.
 */
export function calculateSocialScore(quantity: number, factorPerUnit: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(factorPerUnit)) {
    throw new Error("Quantity and factor must be finite numbers.");
  }
  if (quantity < 0 || factorPerUnit < 0) {
    throw new Error("Quantity and factor cannot be negative.");
  }

  return roundToThousandths(quantity * factorPerUnit);
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

/**
 * Zet bespaarde CO2 (kg) om in het aantal equivalente bomen dat deze CO2 in
 * een jaar zou absorberen. Bedoeld als publieksvriendelijke "fun fact" naast
 * de harde CO2-getallen, niet als strikt wetenschappelijke maat.
 */
export function treesEquivalent(savedKg: number): number {
  if (!Number.isFinite(savedKg)) {
    throw new Error("Saved value must be a finite number.");
  }
  if (savedKg <= 0) return 0;
  return Math.round(savedKg / KG_CO2_PER_TREE_PER_YEAR);
}
