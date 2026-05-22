import {
  deriveCategoriesFromInterventions,
  filterInterventions,
} from "@/lib/registration/intervention-filters";
import { describe, expect, it } from "vitest";

const interventions = [
  {
    id: "a",
    name: "Fietsen",
    categoryId: "cat-mob",
    categoryName: "Mobiliteit",
    categoryColor: "#22aa66",
  },
  {
    id: "b",
    name: "Energiecoach",
    categoryId: "cat-energie",
    categoryName: "Energie",
    categoryColor: "#ffaa00",
  },
  {
    id: "c",
    name: "Workshop duurzaamheid",
    categoryId: "cat-energie",
    categoryName: "Energie",
    categoryColor: "#ffaa00",
  },
];

describe("filterInterventions", () => {
  it("returns all interventions when no filters are set", () => {
    expect(filterInterventions(interventions)).toHaveLength(3);
  });

  it("filters by category id", () => {
    const result = filterInterventions(interventions, { categoryId: "cat-energie" });
    expect(result.map((item) => item.id)).toEqual(["b", "c"]);
  });

  it("filters by case-insensitive search on name and category", () => {
    expect(
      filterInterventions(interventions, { searchQuery: "fiets" }).map((item) => item.id),
    ).toEqual(["a"]);

    expect(
      filterInterventions(interventions, { searchQuery: "ENERGIE" }).map((item) => item.id),
    ).toEqual(["b", "c"]);
  });

  it("combines category and search filters", () => {
    const result = filterInterventions(interventions, {
      categoryId: "cat-energie",
      searchQuery: "workshop",
    });
    expect(result.map((item) => item.id)).toEqual(["c"]);
  });

  it("always includes the selected intervention even when filtered out", () => {
    const result = filterInterventions(interventions, {
      categoryId: "cat-energie",
      alwaysIncludeId: "a",
    });
    expect(result.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("returns empty list when nothing matches", () => {
    expect(filterInterventions(interventions, { searchQuery: "onbekend" })).toEqual([]);
  });
});

describe("deriveCategoriesFromInterventions", () => {
  it("returns unique sorted categories", () => {
    expect(deriveCategoriesFromInterventions(interventions)).toEqual([
      { id: "cat-energie", name: "Energie", color: "#ffaa00" },
      { id: "cat-mob", name: "Mobiliteit", color: "#22aa66" },
    ]);
  });
});
