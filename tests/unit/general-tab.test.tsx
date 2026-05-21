import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GeneralTab } from "@/components/settings/general-tab";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/(app)/[orgSlug]/beheer/actions", () => ({
  updateOrgProfile: vi.fn(),
  updateOrgSettings: vi.fn(),
}));

const context = {
  description: "Welzijnsorganisatie in Brabant",
  eodBaselineDate: "2024-01-15",
  eodBaselineKg: 12500,
  logoUrl: null,
  name: "LEV Groep",
  publicShareEnabled: true,
  publicShareSlug: "lev-groep",
  slug: "lev-groep",
};

describe("<GeneralTab />", () => {
  it("renders profile and public dashboard sections", () => {
    render(<GeneralTab context={context} />);

    expect(screen.getByRole("heading", { name: /organisatieprofiel/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /publiek dashboard/i })).toBeInTheDocument();
    expect(screen.getByText("LEV Groep")).toBeInTheDocument();
    expect(screen.getByText("Welzijnsorganisatie in Brabant")).toBeInTheDocument();
    expect(screen.getByText("/p/lev-groep")).toBeInTheDocument();
  });

  it("opens inline editing for organisation name", () => {
    render(<GeneralTab context={context} />);

    fireEvent.click(screen.getByRole("button", { name: /organisatienaam bewerken/i }));

    expect(screen.getByDisplayValue("LEV Groep")).toBeInTheDocument();
  });

  it("opens inline editing for description", () => {
    render(<GeneralTab context={context} />);

    fireEvent.click(screen.getByRole("button", { name: /beschrijving bewerken/i }));

    expect(
      screen.getByDisplayValue("Welzijnsorganisatie in Brabant"),
    ).toBeInTheDocument();
  });
});
