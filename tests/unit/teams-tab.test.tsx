import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TeamsTab } from "@/components/settings/teams-tab";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/(app)/[orgSlug]/beheer/actions", () => ({
  archiveTeam: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
}));

const teams = [
  { id: "team-1", name: "LEV Helmond" },
  { id: "team-2", name: "LEV Eindhoven" },
];

const teamMemberships = [
  { team_id: "team-1", user_id: "user-1" },
  { team_id: "team-1", user_id: "user-2" },
  { team_id: "team-2", user_id: "user-3" },
];

describe("<TeamsTab />", () => {
  it("renders the table and opens the create team modal", () => {
    render(<TeamsTab orgSlug="lev-groep" teamMemberships={teamMemberships} teams={teams} />);

    expect(screen.getByRole("heading", { name: /teams/i })).toBeInTheDocument();
    expect(screen.getAllByText("LEV Helmond").length).toBeGreaterThan(0);
    expect(screen.getAllByText("LEV Eindhoven").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2 medewerkers").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /nieuw team/i }));

    expect(screen.getByRole("dialog", { name: /nieuw team/i })).toBeInTheDocument();
  });

  it("opens inline editing when clicking a team name", () => {
    render(<TeamsTab orgSlug="lev-groep" teamMemberships={teamMemberships} teams={teams} />);

    const [editButton] = screen.getAllByRole("button", { name: /teamnaam bewerken: lev helmond/i });
    if (!editButton) throw new Error("Expected team edit button");
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue("LEV Helmond")).toBeInTheDocument();
  });
});
