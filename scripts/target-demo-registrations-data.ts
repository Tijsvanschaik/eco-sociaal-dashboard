/**
 * Curated demo registrations for LEV Groep — totals ~500 kg CO₂ and ~30 social score.
 * Factors must match supabase/sql/9000_seed.sql (ADR 0007 + 0011 social factors).
 */

import { calculateCo2, calculateSocialScore } from "../lib/impact";

export type TargetDemoRegistrationTemplate = {
  interventionName: string;
  quantity: number;
  socialQuantity: number;
  /** ISO date YYYY-MM-DD */
  happenedOn: string;
  note?: string | null;
};

/** LEV seed intervention factors (name → co2 + social). */
export const LEV_TARGET_INTERVENTION_FACTORS: Record<
  string,
  { co2FactorKg: number; socialScoreFactor: number }
> = {
  "Lezing over energie": { co2FactorKg: 18, socialScoreFactor: 0.93 },
  "Bewustmaking afval tijdens evenement": { co2FactorKg: 10, socialScoreFactor: 1.26 },
  "Hergebruik materialen": { co2FactorKg: 4.8, socialScoreFactor: 1.04 },
  "Repaircafé - hersteld item": { co2FactorKg: 6.5, socialScoreFactor: 1.04 },
  "Kierenjagers (tochtafdichting / handwerk)": { co2FactorKg: 3.55, socialScoreFactor: 1.13 },
  "Energiecoach (contactuur)": { co2FactorKg: 3.05, socialScoreFactor: 1.22 },
  "Teamfietsen (km ipv auto)": { co2FactorKg: 0.17, socialScoreFactor: 0.48 },
  "Taal & Tuin": { co2FactorKg: 0.35, socialScoreFactor: 1.82 },
  "Duurzame buurtactiviteit": { co2FactorKg: 0.75, socialScoreFactor: 1.52 },
  Opruimactie: { co2FactorKg: 1.4, socialScoreFactor: 1.32 },
  "Moestuin / buurttuin (mede-/ondersteuning)": { co2FactorKg: 0.45, socialScoreFactor: 1.52 },
};

export const TARGET_DEMO_REGISTRATION_TEMPLATES: TargetDemoRegistrationTemplate[] = [
  {
    interventionName: "Lezing over energie",
    quantity: 1,
    socialQuantity: 1,
    happenedOn: "2026-04-08",
    note: "Lezing in het buurthuis over energiebesparing; kleine groep maar veel vragen over isolatie.",
  },
  {
    interventionName: "Lezing over energie",
    quantity: 1,
    socialQuantity: 1,
    happenedOn: "2026-03-18",
    note: "Tweede sessie voor bewonersvereniging; focus op verwarmingsgedrag in de winter.",
  },
  {
    interventionName: "Lezing over energie",
    quantity: 1,
    socialQuantity: 1,
    happenedOn: "2026-02-05",
  },
  {
    interventionName: "Bewustmaking afval tijdens evenement",
    quantity: 1,
    socialQuantity: 1,
    happenedOn: "2026-04-22",
    note: "Afvalscheidingsstand op buurtfeest; veel korte gesprekken met voorbijgangers.",
  },
  {
    interventionName: "Bewustmaking afval tijdens evenement",
    quantity: 1,
    socialQuantity: 1,
    happenedOn: "2026-01-15",
  },
  {
    interventionName: "Hergebruik materialen",
    quantity: 28,
    socialQuantity: 1,
    happenedOn: "2026-04-01",
    note: "Hout en isolatiemateriaal hergebruikt bij buurtklus; gewicht geschat met team.",
  },
  {
    interventionName: "Hergebruik materialen",
    quantity: 20,
    socialQuantity: 1,
    happenedOn: "2026-03-11",
  },
  {
    interventionName: "Repaircafé - hersteld item",
    quantity: 10,
    socialQuantity: 1,
    happenedOn: "2026-04-15",
    note: "Drukke repaircafé-middag: kleding, kleine elektronica en fietsen.",
  },
  {
    interventionName: "Repaircafé - hersteld item",
    quantity: 5,
    socialQuantity: 1,
    happenedOn: "2026-02-20",
  },
  {
    interventionName: "Kierenjagers (tochtafdichting / handwerk)",
    quantity: 10,
    socialQuantity: 2,
    happenedOn: "2026-03-25",
    note: "Hands-on tochtafdichting bij twee bewoners; resterende uren voorbereiding en materiaal.",
  },
  {
    interventionName: "Energiecoach (contactuur)",
    quantity: 8,
    socialQuantity: 2,
    happenedOn: "2026-04-10",
    note: "Huisbezoeken en telefonische follow-up voor energiecoach-traject.",
  },
  {
    interventionName: "Teamfietsen (km ipv auto)",
    quantity: 172,
    socialQuantity: 1,
    happenedOn: "2026-04-05",
    note: "Wijkronde en twee bezoeken per fiets i.p.v. auto.",
  },
  {
    interventionName: "Taal & Tuin",
    quantity: 8,
    socialQuantity: 4,
    happenedOn: "2026-03-04",
    note: "Deelnemers oefenden Nederlands tijdens het onderhoud van de buurttuin.",
  },
  {
    interventionName: "Duurzame buurtactiviteit",
    quantity: 4,
    socialQuantity: 3,
    happenedOn: "2026-02-12",
  },
  {
    interventionName: "Opruimactie",
    quantity: 2,
    socialQuantity: 2,
    happenedOn: "2026-01-28",
    note: "Opruimactie langs het park met buurtbewoners.",
  },
  {
    interventionName: "Moestuin / buurttuin (mede-/ondersteuning)",
    quantity: 1,
    socialQuantity: 1,
    happenedOn: "2026-04-18",
  },
];

export function computeTargetDemoTotals(
  templates: TargetDemoRegistrationTemplate[] = TARGET_DEMO_REGISTRATION_TEMPLATES,
): { totalCo2Kg: number; totalSocialScore: number; count: number } {
  let totalCo2Kg = 0;
  let totalSocialScore = 0;

  for (const row of templates) {
    const factors = LEV_TARGET_INTERVENTION_FACTORS[row.interventionName];
    if (!factors) {
      throw new Error(`Onbekende interventie in target-demo data: ${row.interventionName}`);
    }
    totalCo2Kg += calculateCo2(row.quantity, factors.co2FactorKg);
    totalSocialScore += calculateSocialScore(row.socialQuantity, factors.socialScoreFactor);
  }

  return {
    totalCo2Kg: Math.round(totalCo2Kg * 1000) / 1000,
    totalSocialScore: Math.round(totalSocialScore * 1000) / 1000,
    count: templates.length,
  };
}
