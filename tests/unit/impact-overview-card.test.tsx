import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImpactOverviewCard } from "@/components/dashboard/impact-overview-card";
import type { TeamBreakdownRow } from "@/lib/dashboard";

function makeTeam(
  id: string,
  name: string,
  co2SavedKg: number,
  segments: Array<{ color: string; interventionId: string; kg: number; socialKg?: number }> = [],
  eodDays = 0,
): TeamBreakdownRow {
  const socialScoreTotal = segments.reduce((sum, s) => sum + (s.socialKg ?? 0), 0);
  return {
    id,
    name,
    co2SavedKg,
    socialScoreTotal,
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
      socialScoreTotal: segment.socialKg ?? 0,
      registrationCount: 1,
    })),
  };
}

describe("<ImpactOverviewCard />", () => {
  it("toont hero-datapunten en eco/sociale teambalken", () => {
    render(
      <ImpactOverviewCard
        eodDays={5}
        registrationCount={42}
        totalCo2Kg={4_200}
        totalSocialScore={120}
        periodLabel="2026"
        teamBreakdown={[
          makeTeam(
            "team-a",
            "LEV Helmond",
            3_000,
            [
              { color: "#3b82f6", interventionId: "bike", kg: 2_000, socialKg: 40 },
              { color: "#10b981", interventionId: "veggie", kg: 1_000 },
            ],
            12,
          ),
          makeTeam(
            "team-b",
            "LEV Asten",
            1_200,
            [{ color: "#3b82f6", interventionId: "bike", kg: 1_200, socialKg: 80 }],
            5,
          ),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /191\s*bomen geplant/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Eco score")).toBeInTheDocument();
    expect(screen.getByText("Sociale score")).toBeInTheDocument();
    expect(screen.getByText(/Dit is de som van de CO2 impact/i)).toBeInTheDocument();
    expect(screen.getByText(/Dit is de som van alle sociale impact/i)).toBeInTheDocument();
    expect(screen.getByText("4.200")).toBeInTheDocument();
    expect(screen.getByText("LEV Helmond")).toBeInTheDocument();
    expect(screen.getByText("LEV Asten")).toBeInTheDocument();
    expect(screen.getByTitle("3.000 kg CO₂")).toBeInTheDocument();
    expect(screen.getByTitle("40 punten")).toBeInTheDocument();
    expect(screen.getByText(/Eco · kg CO/i)).toBeInTheDocument();
    expect(screen.getByText("Sociaal · punten")).toBeInTheDocument();
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
        totalSocialScore={0}
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
        totalSocialScore={0}
        periodLabel="alle data"
        teamBreakdown={[]}
      />,
    );

    expect(screen.getByText(/nog geen registraties gekoppeld aan een team/i)).toBeInTheDocument();
    expect(screen.getByText(/zodra de eerste acties binnenrollen/i)).toBeInTheDocument();
  });
});
