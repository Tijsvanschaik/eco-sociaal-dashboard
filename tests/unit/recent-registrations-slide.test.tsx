import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { RegistrationCardData } from "@/components/dashboard/registration-card";
import { RecentRegistrationsSlide } from "@/components/public/recent-registrations-slide";

function makeRegistration(overrides: Partial<RegistrationCardData> = {}): RegistrationCardData {
  return {
    categoryColor: "#10b981",
    categoryName: "Voeding",
    co2KgCached: 4,
    socialScoreCached: 0,
    happenedOn: "2026-04-20",
    id: overrides.id ?? "reg-1",
    interventionLabel: "Vegetarische maaltijd",
    note: null,
    photoUrl: null,
    ecoUnit: "maaltijd",
    quantity: 2,
    socialQuantity: 3,
    socialUnit: "personen",
    teamLabel: "LEV Helmond",
    ...overrides,
  };
}

describe("<RecentRegistrationsSlide />", () => {
  it("renders one card per registration with category + team meta", () => {
    render(
      <RecentRegistrationsSlide
        registrations={[
          makeRegistration({ id: "a", interventionLabel: "Vegetarische maaltijd" }),
          makeRegistration({
            id: "b",
            interventionLabel: "Voedselverspilling voorkomen",
            categoryName: "Afval",
            teamLabel: "LEV Asten",
          }),
        ]}
      />,
    );

    expect(screen.getByText(/Recente eco-sociale activiteiten/)).toBeInTheDocument();
    expect(screen.getAllByText(/vegetarische maaltijd/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/voedselverspilling voorkomen/i)).toBeInTheDocument();
    expect(screen.getByText(/LEV Helmond/)).toBeInTheDocument();
    expect(screen.getByText(/LEV Asten/)).toBeInTheDocument();
  });

  it("renders the empty state when no registrations are provided", () => {
    render(<RecentRegistrationsSlide registrations={[]} />);

    expect(screen.getByText(/Recente eco-sociale activiteiten/)).toBeInTheDocument();
    expect(screen.getByText(/nog geen eco-sociale activiteiten binnen deze organisatie/i)).toBeInTheDocument();
  });

  it("respects the limit prop and only shows the first N registrations", () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      makeRegistration({ id: `reg-${i}`, interventionLabel: `Actie ${i + 1}` }),
    );

    render(<RecentRegistrationsSlide limit={3} registrations={many} />);

    expect(screen.getByText("Actie 1")).toBeInTheDocument();
    expect(screen.getByText("Actie 3")).toBeInTheDocument();
    expect(screen.queryByText("Actie 4")).toBeNull();
  });
});
