import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrgWelcomePanel } from "@/components/org-welcome-panel";
import {
  DASHBOARD_IMPACT_DISCLAIMER_FALLBACK,
  DASHBOARD_MISSION_FALLBACK,
} from "@/lib/copy/dashboard-welcome";

describe("OrgWelcomePanel", () => {
  it("renders org name in the welcome title", () => {
    render(<OrgWelcomePanel orgName="LEV Groep" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Welkom op het LEV Groep impact dashboard/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows extended mission and disclaimer when provided", () => {
    render(
      <OrgWelcomePanel
        description="LEV Groep werkt sinds 2020 aan duurzaamheid."
        impactDisclaimer="Onze cijfers zijn **indicatief**."
        orgName="LEV Groep"
      />,
    );

    expect(screen.getByText(/werkt sinds 2020 aan duurzaamheid/)).toBeInTheDocument();
    expect(screen.getByText("indicatief")).toBeInTheDocument();
    expect(screen.queryByText(DASHBOARD_MISSION_FALLBACK)).not.toBeInTheDocument();
  });

  it("prefers extended mission over mission short", () => {
    render(
      <OrgWelcomePanel
        description="Uitgebreide missie."
        missionShort="Korte pitch."
        orgName="LEV Groep"
      />,
    );

    expect(screen.getByText("Uitgebreide missie.")).toBeInTheDocument();
    expect(screen.queryByText("Korte pitch.")).not.toBeInTheDocument();
  });

  it("falls back to placeholder copy when org fields are empty", () => {
    render(
      <OrgWelcomePanel description="" impactDisclaimer="" missionShort="" orgName="Demo Org" />,
    );

    expect(screen.getByText(DASHBOARD_MISSION_FALLBACK)).toBeInTheDocument();
    expect(screen.getByText(DASHBOARD_IMPACT_DISCLAIMER_FALLBACK)).toBeInTheDocument();
  });

  it("labels the methodology disclaimer section", () => {
    render(<OrgWelcomePanel orgName="LEV Groep" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Over de impactcijfers" }),
    ).toBeInTheDocument();
  });

  it("uses a two-column grid only from 2xl", () => {
    render(<OrgWelcomePanel orgName="LEV Groep" />);

    const grid = screen.getByTestId("org-welcome-panel").firstElementChild;
    expect(grid?.className).toContain("2xl:grid-cols-2");
  });
});
