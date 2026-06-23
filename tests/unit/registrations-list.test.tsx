import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RegistrationsList } from "@/components/registrations/registrations-list";
import { RegistrationsScopeToggle } from "@/components/registrations/registrations-scope-toggle";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

vi.mock("@/app/(app)/[orgSlug]/activiteiten/actions", () => ({
  deleteRegistration: vi.fn(),
}));

const baseRow = {
  authorEmail: null,
  canEdit: true,
  categoryColor: "#3b82f6",
  co2KgCached: 12,
  ecoUnit: "uur",
  happenedOn: "2026-05-20",
  id: "reg-1",
  interventionName: "Fietsen",
  quantity: 2,
  socialQuantity: 1,
  socialScoreCached: 4,
  socialUnit: "uur",
  teamId: "team-1",
  teamName: "LEV Helmond",
  userId: "user-1",
};

describe("<RegistrationsList />", () => {
  it("shows worker copy without medewerker column", () => {
    render(
      <RegistrationsList
        isAdmin={false}
        orgSlug="lev-groep"
        rows={[baseRow]}
        scope="mine"
        selectedTeamId={null}
        teams={[]}
        years={[2026]}
        year={2026}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Mijn registraties" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Medewerker")).not.toBeInTheDocument();
    expect(screen.getAllByText("Fietsen").length).toBeGreaterThan(0);
  });

  it("shows admin medewerker column in all scope", () => {
    render(
      <RegistrationsList
        isAdmin={true}
        orgSlug="lev-groep"
        rows={[{ ...baseRow, authorEmail: "worker@example.com" }]}
        scope="all"
        selectedTeamId={null}
        teams={[{ id: "team-1", name: "LEV Helmond" }]}
        years={[2026, 2025]}
        year={2026}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Alle registraties" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Medewerker")).toBeInTheDocument();
    expect(screen.getAllByText("worker@example.com").length).toBeGreaterThan(0);
  });

  it("hides medewerker column for admin in mine scope", () => {
    render(
      <RegistrationsList
        isAdmin={true}
        orgSlug="lev-groep"
        rows={[baseRow]}
        scope="mine"
        selectedTeamId={null}
        teams={[]}
        years={[2026]}
        year={2026}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Mijn registraties" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Medewerker")).not.toBeInTheDocument();
  });

  it("shows worker scope toggle and hides edit actions for others in all scope", () => {
    render(
      <RegistrationsList
        isAdmin={false}
        orgSlug="lev-groep"
        rows={[
          { ...baseRow, canEdit: true },
          {
            ...baseRow,
            authorEmail: "colleague@example.com",
            canEdit: false,
            id: "reg-2",
            interventionName: "Tuinieren",
            userId: "user-2",
          },
        ]}
        scope="all"
        selectedTeamId={null}
        teams={[]}
        years={[2026]}
        year={2026}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Alle registraties" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mijn registraties" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alle registraties" })).toBeInTheDocument();
    expect(screen.getByText("Medewerker")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /registratie bewerken/i })).toHaveLength(2);
  });

  it("only shows year filter options that have data", () => {
    render(
      <RegistrationsList
        isAdmin={false}
        orgSlug="lev-groep"
        rows={[baseRow]}
        scope="mine"
        selectedTeamId={null}
        teams={[]}
        years={[2025, 2024]}
        year={2025}
      />,
    );

    expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "2026" })).not.toBeInTheDocument();
  });

  it("hides edit actions when the row is not editable", () => {
    render(
      <RegistrationsList
        isAdmin={false}
        orgSlug="lev-groep"
        rows={[{ ...baseRow, canEdit: false }]}
        scope="mine"
        selectedTeamId={null}
        teams={[]}
        years={[2026]}
        year={2026}
      />,
    );

    expect(screen.queryByRole("button", { name: /registratie bewerken/i })).not.toBeInTheDocument();
  });
});

describe("<RegistrationsScopeToggle />", () => {
  it("navigates to mine scope with query param", () => {
    push.mockClear();

    render(
      <RegistrationsScopeToggle
        orgSlug="lev-groep"
        scope="all"
        selectedTeamId={null}
        year={2026}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mijn registraties" }));

    expect(push).toHaveBeenCalledWith("/lev-groep/activiteiten?year=2026&scope=mine");
  });
});
