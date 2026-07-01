/** Placeholder missie when the org has not set `description` or `mission_short` yet. */
export const DASHBOARD_MISSION_FALLBACK =
  "Medewerkers registreren dagelijkse eco-sociale activiteiten. Dit dashboard maakt die inspanningen zichtbaar — voor het team, de organisatie en de samenleving. Zo zien we welke concrete stappen teams zetten in eco- en sociale thema's.";

/** Placeholder methodology disclaimer when `impact_disclaimer` is empty. */
export const DASHBOARD_IMPACT_DISCLAIMER_FALLBACK =
  "De eco- en sociale score op dit dashboard zijn indicatieve inschattingen, bedoeld om bewustwording en betrokkenheid te stimuleren. Ze zijn geen wetenschappelijk gevalideerde meting, maar geven een praktisch beeld van de impact van onze activiteiten.";

/** Prefers extended mission (`description`), then short pitch (`mission_short`). */
export function resolveDashboardMission(
  description: string | null | undefined,
  missionShort: string | null | undefined,
): string {
  const extended = description?.trim();
  if (extended) return extended;

  const short = missionShort?.trim();
  if (short) return short;

  return DASHBOARD_MISSION_FALLBACK;
}

export function resolveDashboardImpactDisclaimer(
  impactDisclaimer: string | null | undefined,
): string {
  const trimmed = impactDisclaimer?.trim();
  return trimmed ? trimmed : DASHBOARD_IMPACT_DISCLAIMER_FALLBACK;
}
