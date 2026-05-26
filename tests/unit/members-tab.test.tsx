import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MembersTab } from "@/components/settings/members-tab";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/(app)/[orgSlug]/beheer/actions", () => ({
  provisionUser: vi.fn(),
  removeMember: vi.fn(),
  updateMemberTeam: vi.fn(),
  updateMembership: vi.fn(),
}));

const teams = [
  { id: "team-1", name: "LEV Helmond" },
  { id: "team-2", name: "LEV Eindhoven" },
];

const memberships = [
  { user_id: "user-1", role: "admin" },
  { user_id: "user-2", role: "worker" },
];

const teamMemberships = [{ team_id: "team-1", user_id: "user-2" }];

const emailByUserId = {
  "user-1": "admin@lev.nl",
  "user-2": "worker@lev.nl",
};

describe("<MembersTab />", () => {
  it("renders the table and opens the create member modal", () => {
    render(
      <MembersTab
        emailByUserId={emailByUserId}
        memberships={memberships}
        orgSlug="lev-groep"
        teamMemberships={teamMemberships}
        teams={teams}
      />,
    );

    expect(screen.getByRole("heading", { name: /medewerkers/i })).toBeInTheDocument();
    expect(screen.getAllByText("admin@lev.nl").length).toBeGreaterThan(0);
    expect(screen.getAllByText("worker@lev.nl").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /medewerker toevoegen/i }));

    expect(screen.getByRole("dialog", { name: /medewerker toevoegen/i })).toBeInTheDocument();
  });

  it("opens inline editing for role and team cells", () => {
    render(
      <MembersTab
        emailByUserId={emailByUserId}
        memberships={memberships}
        orgSlug="lev-groep"
        teamMemberships={teamMemberships}
        teams={teams}
      />,
    );

    const roleButtons = screen.getAllByRole("button", { name: /rol bewerken: medewerker/i });
    fireEvent.click(roleButtons[0]!);

    expect(screen.getAllByRole("combobox", { name: /rol bewerken/i }).length).toBeGreaterThan(0);

    const teamButtons = screen.getAllByRole("button", { name: /team bewerken: lev helmond/i });
    fireEvent.click(teamButtons[0]!);

    expect(screen.getAllByRole("combobox", { name: /team bewerken/i }).length).toBeGreaterThan(0);
  });
});
