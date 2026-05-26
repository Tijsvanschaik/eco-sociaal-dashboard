import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RegistrationsFilters } from "@/components/dashboard/registrations-filters";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe("<RegistrationsFilters />", () => {
  it("updates the dashboard URL when a period pill is clicked", () => {
    replaceMock.mockClear();

    render(
      <RegistrationsFilters
        filters={{ period: "all", teamId: null }}
        orgSlug="lev-groep"
        showTeamFilter
        teams={[{ id: "team-1", name: "Team A" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "30 dagen" }));

    expect(replaceMock).toHaveBeenCalledWith("/lev-groep/dashboard?period=30d", { scroll: false });
  });
});
