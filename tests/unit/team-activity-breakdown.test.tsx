import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamActivityBreakdown } from "@/components/team/team-activity-breakdown";
import type { TeamBreakdownSegment } from "@/lib/dashboard";

function makeSegment(
  id: string,
  name: string,
  co2SavedKg: number,
  socialScoreTotal: number,
): TeamBreakdownSegment {
  return {
    id,
    interventionId: id,
    interventionName: name,
    categoryId: `cat-${id}`,
    categoryName: "Mobiliteit",
    categoryColor: "#3b82f6",
    co2SavedKg,
    socialScoreTotal,
    registrationCount: 1,
  };
}

describe("<TeamActivityBreakdown />", () => {
  it("sorteert interventies op eco-impact en toont eenheden", () => {
    render(
      <TeamActivityBreakdown
        periodLabel="2026"
        segments={[
          makeSegment("a", "Fietsen", 50, 10),
          makeSegment("b", "Vegetarisch eten", 120, 0),
        ]}
      />,
    );

    expect(screen.getByText("Fietsen")).toBeInTheDocument();
    expect(screen.getByText("Vegetarisch eten")).toBeInTheDocument();
    expect(screen.getByText("120 kg CO₂")).toBeInTheDocument();
    expect(screen.getByText("50 kg CO₂")).toBeInTheDocument();
  });

  it("wisselt naar sociale tab en toont punten", () => {
    render(
      <TeamActivityBreakdown
        periodLabel="2026"
        segments={[makeSegment("a", "Fietsen", 50, 10), makeSegment("b", "Workshop", 0, 80)]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sociaal" }));
    expect(screen.getByText("80 punten")).toBeInTheDocument();
    expect(screen.getByText("10 punten")).toBeInTheDocument();
  });

  it("toont empty state zonder segments", () => {
    render(<TeamActivityBreakdown periodLabel="2026" segments={[]} />);

    expect(
      screen.getByText(/nog geen activiteiten geregistreerd voor dit team/i),
    ).toBeInTheDocument();
  });
});
