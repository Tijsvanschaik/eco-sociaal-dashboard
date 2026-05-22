import {
  attachStoryImages,
  buildImpactStories,
  kmDrivingAvoidedEquivalent,
} from "@/lib/impact-stories";
import { describe, expect, it } from "vitest";

describe("kmDrivingAvoidedEquivalent", () => {
  it("returns zero for non-positive CO2", () => {
    expect(kmDrivingAvoidedEquivalent(0)).toBe(0);
    expect(kmDrivingAvoidedEquivalent(-10)).toBe(0);
  });

  it("converts kg CO2 to avoided car km using 0.17 kg/km", () => {
    expect(kmDrivingAvoidedEquivalent(170)).toBe(1000);
    expect(kmDrivingAvoidedEquivalent(17)).toBe(100);
  });
});

describe("buildImpactStories", () => {
  it("returns trees, hearts and km stories in fixed order when all values are positive", () => {
    const stories = buildImpactStories({ totalCo2Kg: 1_393, totalSocialScore: 771 });

    expect(stories.map((story) => story.id)).toEqual(["trees", "hearts", "km"]);
    expect(stories[0]?.formattedValue).toBe("63");
    expect(stories[1]?.formattedValue).toBe("771");
    expect(stories[2]?.formattedValue).toBe("8.194");
  });

  it("omits hearts when social score is zero", () => {
    const stories = buildImpactStories({ totalCo2Kg: 220, totalSocialScore: 0 });
    expect(stories.map((story) => story.id)).toEqual(["trees", "km"]);
  });

  it("returns an empty list when both totals are zero", () => {
    expect(buildImpactStories({ totalCo2Kg: 0, totalSocialScore: 0 })).toEqual([]);
  });
});

describe("attachStoryImages", () => {
  it("maps eco stories to high-CO₂ registrations and hearts to high social score", () => {
    const stories = buildImpactStories({ totalCo2Kg: 500, totalSocialScore: 80 });
    const withImages = attachStoryImages(
      stories,
      [
        {
          id: "eco-a",
          photoUrl: "https://example.com/eco-a.jpg",
          co2KgCached: 40,
          socialScoreCached: 5,
        },
        {
          id: "eco-b",
          photoUrl: "https://example.com/eco-b.jpg",
          co2KgCached: 20,
          socialScoreCached: 10,
        },
        {
          id: "social-a",
          photoUrl: "https://example.com/social-a.jpg",
          co2KgCached: 1,
          socialScoreCached: 60,
        },
      ],
      (registration) => registration.photoUrl ?? `placeholder:${registration.id}`,
    );

    expect(withImages.find((story) => story.id === "trees")?.imageUrl).toBe(
      "https://example.com/eco-a.jpg",
    );
    expect(withImages.find((story) => story.id === "km")?.imageUrl).toBe(
      "https://example.com/eco-b.jpg",
    );
    expect(withImages.find((story) => story.id === "hearts")?.imageUrl).toBe(
      "https://example.com/social-a.jpg",
    );
  });

  it("uses the placeholder resolver when photoUrl is null", () => {
    const stories = buildImpactStories({ totalCo2Kg: 100, totalSocialScore: 0 });
    const withImages = attachStoryImages(
      stories,
      [{ id: "reg-1", photoUrl: null, co2KgCached: 100, socialScoreCached: 0 }],
      (registration) => `placeholder:${registration.id}`,
    );

    expect(withImages.every((story) => story.imageUrl === "placeholder:reg-1")).toBe(true);
  });
});
