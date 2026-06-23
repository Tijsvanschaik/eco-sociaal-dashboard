import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GeneralTab } from "@/components/settings/general-tab";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/(app)/[orgSlug]/beheer/actions", () => ({
  removeOrgLogo: vi.fn(),
  updateOrgProfile: vi.fn(),
  updateOrgSettings: vi.fn(),
  uploadOrgLogo: vi.fn(),
}));

const context = {
  description: "Welzijnsorganisatie in Brabant",
  eodBaselineDate: "2024-01-15",
  eodBaselineKg: 12500,
  impactDisclaimer: null,
  logoUrl: null,
  missionShort: null,
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

  it("opens inline editing for mission short with character counter", () => {
    render(
      <GeneralTab
        context={{
          ...context,
          missionShort: "Welzijnsorganisatie die eco-sociale impact zichtbaar maakt.",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /missie kort bewerken/i }));

    expect(screen.getByRole("textbox", { name: /missie kort bewerken/i })).toBeInTheDocument();
    expect(screen.getByText(/tekens over/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Opslaan$/i })).toBeInTheDocument();
  });

  it("shows logo upload controls in the profile preview", () => {
    render(<GeneralTab context={context} />);

    expect(screen.getByRole("button", { name: /logo uploaden/i })).toBeInTheDocument();
  });
});
