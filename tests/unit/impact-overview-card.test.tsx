import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImpactOverviewCard } from "@/components/dashboard/impact-overview-card";
import type { TeamBreakdownRow } from "@/lib/dashboard";

function makeTeam(
  id: string,
  name: string,
  co2SavedKg: number,
  segments: Array<{ color: string; interventionId: string; kg: number }> = [],
  eodDays = 0,
): TeamBreakdownRow {
  return {
    id,
    name,
    co2SavedKg,
    eodDays,
    registrationCount: segments.length,
    segments: segments.map((segment) => ({
      id: `${id}:${segment.interventionId}`,
      interventionId: segment.interventionId,
      interventionName: `Interventie ${segment.interventionId}`,
      categoryId: `cat-${segment.interventionId}`,
      categoryName: `Categorie ${segment.interventionId}`,
      categoryColor: segment.color,
      co2SavedKg: segment.kg,
      registrationCount: 1,
    })),
  };
}

describe("<ImpactOverviewCard />", () => {
  it("toont hero-datapunten en bars per team met categoriekleuren", () => {
    render(
      <ImpactOverviewCard
        eodDays={5}
        registrationCount={42}
        totalCo2Kg={4_200}
        periodLabel="laatste 90 dagen"
        teamBreakdown={[
          makeTeam(
            "team-a",
            "LEV Helmond",
            3_000,
            [
              { color: "#3b82f6", interventionId: "bike", kg: 2_000 },
              { color: "#10b981", interventionId: "veggie", kg: 1_000 },
            ],
            12,
          ),
          makeTeam(
            "team-b",
            "LEV Asten",
            1_200,
            [{ color: "#3b82f6", interventionId: "bike", kg: 1_200 }],
            5,
          ),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /5\s*dagen gewonnen/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/4,2 ton/)).toBeInTheDocument();
    expect(screen.getByText("LEV Helmond")).toBeInTheDocument();
    expect(screen.getByText("LEV Asten")).toBeInTheDocument();
    expect(screen.getByText(/12\s*dagen/)).toBeInTheDocument();
    expect(screen.getByText(/5\s*dagen/)).toBeInTheDocument();

    const progressbars = screen.getAllByRole("progressbar");
    const helmondBar = progressbars[0];
    if (!helmondBar) throw new Error("progressbar missing");
    expect(helmondBar.getAttribute("aria-valuenow")).toBe("71");

    const bikeSegment = screen.getAllByTitle(/bike.*—/i)[0];
    if (!bikeSegment) throw new Error("segment missing");
    expect(bikeSegment.getAttribute("style")).toContain("rgb(59, 130, 246)");
  });

  it("toont 'Toon alle'-knop pas bij meer dan 5 teams", () => {
    const many = Array.from({ length: 7 }, (_, i) =>
      makeTeam(`team-${i}`, `Team ${i + 1}`, 100 - i),
    );

    render(
      <ImpactOverviewCard
        eodDays={3}
        registrationCount={10}
        totalCo2Kg={500}
        periodLabel="alle data"
        teamBreakdown={many}
      />,
    );

    expect(screen.getByText("Team 1")).toBeInTheDocument();
    expect(screen.getByText("Team 5")).toBeInTheDocument();
    expect(screen.queryByText("Team 6")).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: /toon alle 7 teams/i });
    fireEvent.click(toggle);
    expect(screen.getByText("Team 6")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toon top 5/i })).toBeInTheDocument();
  });

  it("toont een lege-staat wanneer er geen teamdata is", () => {
    render(
      <ImpactOverviewCard
        eodDays={0}
        registrationCount={0}
        totalCo2Kg={0}
        periodLabel="alle data"
        teamBreakdown={[]}
      />,
    );

    expect(screen.getByText(/nog geen registraties gekoppeld aan een team/i)).toBeInTheDocument();
    expect(screen.getByText(/zodra de eerste acties binnenrollen/i)).toBeInTheDocument();
  });
});
