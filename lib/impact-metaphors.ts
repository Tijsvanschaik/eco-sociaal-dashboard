import { treesEquivalent } from "@/lib/impact";

/** Indicatief: kg CO₂ per glas schoon water (publieksvertaling, geen wetenschap). */
export const KG_CO2_PER_GLASS = 0.5;

/** Indicatief: kg CO₂ per maaltijd (catalogus). */
export const KG_CO2_PER_MEAL = 2;

/** Indicatief: kg CO₂ per zonnepaneel-equivalent (catalogus). */
export const KG_PER_SOLAR_PANEL = 50;

export type MetaphorId = "trees" | "people" | "water" | "meals" | "solar" | "park";

export type MetaphorTone = "eco" | "social";

export type MetaphorUnit = {
  description: string;
  formattedValue: string;
  /** Icons rendered in the scatter scene (may be less than numericValue when scaled). */
  iconCount: number;
  id: MetaphorId;
  numericValue: number;
  title: string;
  tone: MetaphorTone;
  /** How many units each visible icon represents (1 = one icon per unit). */
  unitsPerIcon: number;
};

export const METAPHOR_MAX_VISIBLE: Record<MetaphorId, number> = {
  trees: 36,
  people: 32,
  water: 28,
  meals: 28,
  solar: 24,
  park: 1,
};

/** Default carousel order for LEV Groep. */
export const LEV_DEFAULT_METAPHOR_IDS: MetaphorId[] = ["trees", "people"];

const integerFormatter = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

export type MetaphorIconVisual = {
  iconCount: number;
  unitsPerIcon: number;
};

/**
 * Maps the headline number to a renderable icon count.
 * ≤ max visible: one icon per unit. Above max: each icon represents multiple units
 * so iconCount × unitsPerIcon ≈ numericValue.
 */
export function resolveMetaphorIconVisual(
  id: MetaphorId,
  numericValue: number,
): MetaphorIconVisual {
  if (numericValue <= 0) {
    return { iconCount: 0, unitsPerIcon: 1 };
  }

  const maxVisible = METAPHOR_MAX_VISIBLE[id];
  if (numericValue <= maxVisible) {
    return { iconCount: numericValue, unitsPerIcon: 1 };
  }

  const unitsPerIcon = Math.ceil(numericValue / maxVisible);
  const iconCount = Math.ceil(numericValue / unitsPerIcon);
  return { iconCount, unitsPerIcon };
}

export function visibleMetaphorCount(id: MetaphorId, numericValue: number): number {
  return resolveMetaphorIconVisual(id, numericValue).iconCount;
}

export function glassesOfWaterEquivalent(co2Kg: number): number {
  if (!Number.isFinite(co2Kg) || co2Kg <= 0) return 0;
  return Math.round(co2Kg / KG_CO2_PER_GLASS);
}

export function mealsEquivalent(co2Kg: number): number {
  if (!Number.isFinite(co2Kg) || co2Kg <= 0) return 0;
  return Math.round(co2Kg / KG_CO2_PER_MEAL);
}

export function solarPanelsEquivalent(co2Kg: number): number {
  if (!Number.isFinite(co2Kg) || co2Kg <= 0) return 0;
  return Math.round(co2Kg / KG_PER_SOLAR_PANEL);
}

function withIconVisual(
  id: MetaphorId,
  unit: Omit<MetaphorUnit, "iconCount" | "unitsPerIcon">,
): MetaphorUnit {
  const visual = resolveMetaphorIconVisual(id, unit.numericValue);
  return { ...unit, iconCount: visual.iconCount, unitsPerIcon: visual.unitsPerIcon };
}

/**
 * Builds carousel units for impact hero visuals.
 * Only units with numericValue > 0 are included.
 */
export function buildMetaphorUnits({
  enabledIds = LEV_DEFAULT_METAPHOR_IDS,
  totalCo2Kg,
  totalSocialScore,
}: {
  enabledIds?: MetaphorId[];
  totalCo2Kg: number;
  totalSocialScore: number;
}): MetaphorUnit[] {
  const units: MetaphorUnit[] = [];

  for (const id of enabledIds) {
    if (id === "trees") {
      const numericValue = treesEquivalent(totalCo2Kg);
      if (numericValue > 0) {
        units.push(
          withIconVisual("trees", {
            id,
            tone: "eco",
            numericValue,
            formattedValue: integerFormatter.format(numericValue),
            title: "bomen geplant",
            description: "Zoveel bomen nemen ongeveer dezelfde hoeveelheid CO₂ op in één jaar.",
          }),
        );
      }
      continue;
    }

    if (id === "people") {
      const numericValue = Math.round(totalSocialScore);
      if (numericValue > 0) {
        units.push(
          withIconVisual("people", {
            id,
            tone: "social",
            numericValue,
            formattedValue: integerFormatter.format(numericValue),
            title: "harten bereikt",
            description:
              "Zoveel keer maakte jullie inzet verschil voor inwoners, buren of vrijwilligers.",
          }),
        );
      }
      continue;
    }

    if (id === "water") {
      const numericValue = glassesOfWaterEquivalent(totalCo2Kg);
      if (numericValue > 0) {
        units.push(
          withIconVisual("water", {
            id,
            tone: "eco",
            numericValue,
            formattedValue: integerFormatter.format(numericValue),
            title: "glazen schoon water",
            description:
              "Indicatieve vertaling van jullie CO₂-besparing — bedoeld als sprekend beeld, geen wetenschappelijke meting.",
          }),
        );
      }
      continue;
    }

    if (id === "meals") {
      const numericValue = mealsEquivalent(totalCo2Kg);
      if (numericValue > 0) {
        units.push(
          withIconVisual("meals", {
            id,
            tone: "eco",
            numericValue,
            formattedValue: integerFormatter.format(numericValue),
            title: "maaltijden gedeeld",
            description: "Indicatieve vertaling van jullie eco-impact in maaltijden.",
          }),
        );
      }
      continue;
    }

    if (id === "solar") {
      const numericValue = solarPanelsEquivalent(totalCo2Kg);
      if (numericValue > 0) {
        units.push(
          withIconVisual("solar", {
            id,
            tone: "eco",
            numericValue,
            formattedValue: integerFormatter.format(numericValue),
            title: "zonnepanelen geplaatst",
            description: "Indicatieve vertaling van jullie CO₂-besparing.",
          }),
        );
      }
    }
  }

  return units;
}
