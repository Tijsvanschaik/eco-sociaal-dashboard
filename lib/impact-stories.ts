import { treesEquivalent } from "@/lib/impact";

/** Zelfde orde als mobiliteits-CO₂-factoren in ADR 0007 (kg/km autokilometer vermeden). */
export const KG_CO2_PER_AVOIDED_CAR_KM = 0.17;

export type ImpactStoryId = "trees" | "hearts" | "km";

export type ImpactStory = {
  description: string;
  formattedValue: string;
  icon: string;
  iconTone: "primary" | "tertiary";
  id: ImpactStoryId;
  imageUrl?: string;
  numericValue: number;
  title: string;
};

export type ImpactStoryPhotoSource = {
  co2KgCached: number;
  id: string;
  photoUrl: string | null;
  socialScoreCached: number;
};

const integerFormatter = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

export function kmDrivingAvoidedEquivalent(co2Kg: number): number {
  if (!Number.isFinite(co2Kg) || co2Kg <= 0) return 0;
  return Math.round(co2Kg / KG_CO2_PER_AVOIDED_CAR_KM);
}

/**
 * Bouwt de rotatie-verhalen voor de impact-hero (links boven).
 * Alleen verhalen met waarde > 0 worden opgenomen.
 */
export function buildImpactStories({
  totalCo2Kg,
  totalSocialScore,
}: {
  totalCo2Kg: number;
  totalSocialScore: number;
}): ImpactStory[] {
  const stories: ImpactStory[] = [];

  const trees = treesEquivalent(totalCo2Kg);
  if (trees > 0) {
    stories.push({
      id: "trees",
      icon: "forest",
      iconTone: "tertiary",
      numericValue: trees,
      formattedValue: integerFormatter.format(trees),
      title: "bomen geplant",
      description:
        "Zoveel bomen nemen ongeveer dezelfde hoeveelheid CO₂ op in één jaar.",
    });
  }

  const hearts = Math.round(totalSocialScore);
  if (hearts > 0) {
    stories.push({
      id: "hearts",
      icon: "favorite",
      iconTone: "primary",
      numericValue: hearts,
      formattedValue: integerFormatter.format(hearts),
      title: "mensen bereikt",
      description:
        "Zoveel keer maakte jullie inzet verschil voor inwoners, buren of vrijwilligers.",
    });
  }

  const km = kmDrivingAvoidedEquivalent(totalCo2Kg);
  if (km > 0) {
    stories.push({
      id: "km",
      icon: "directions_car",
      iconTone: "tertiary",
      numericValue: km,
      formattedValue: integerFormatter.format(km),
      title: "km autorijden vermeden",
      description:
        "Deze CO₂-besparing staat gelijk aan zoveel autokilometers minder rijden.",
    });
  }

  return stories;
}

/**
 * Picks a registration photo per story slide: eco stories use high-CO₂
 * registrations, the social story uses high social score. Falls back to the
 * caller's placeholder resolver when `photoUrl` is null.
 */
export function attachStoryImages(
  stories: ImpactStory[],
  registrations: ImpactStoryPhotoSource[],
  resolvePhotoUrl: (registration: ImpactStoryPhotoSource) => string,
): ImpactStory[] {
  if (stories.length === 0 || registrations.length === 0) return stories;

  const byCo2 = [...registrations].sort((a, b) => b.co2KgCached - a.co2KgCached);
  const bySocial = [...registrations].sort((a, b) => b.socialScoreCached - a.socialScoreCached);

  const topEco = byCo2[0];
  const secondEco = byCo2.find((registration) => registration.id !== topEco?.id) ?? topEco;
  const topSocial = bySocial[0];

  return stories.map((story) => {
    let source: ImpactStoryPhotoSource | undefined;
    if (story.id === "hearts") source = topSocial;
    else if (story.id === "trees") source = topEco;
    else if (story.id === "km") source = secondEco;

    if (!source) return story;
    return { ...story, imageUrl: resolvePhotoUrl(source) };
  });
}
