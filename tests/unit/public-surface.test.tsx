import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PublicSurface } from "@/components/public/public-surface";
import type { PublicDashboardData } from "@/lib/public-dashboard";

function createPublicDashboardData(
  overrides: Partial<PublicDashboardData> = {},
): PublicDashboardData {
  return {
    totals: {
      active_user_count: 0,
      co2_saved_kg: 0,
      eod_baseline_date: null,
      eod_baseline_kg: null,
      eod_days_gained: null,
      org_id: "org-1",
      org_name: "LEV Groep",
      registration_count: 0,
      share_slug: "lev-groep",
      social_score_total: 0,
    },
    snapshot: {
      activeUserCount: 0,
      categoryBreakdown: [],
      eodDays: 0,
      registrationCount: 0,
      teamBreakdown: [],
      totalCo2Kg: 0,
      totalSocialScore: 0,
    },
    timeseries: [],
    recentRegistrations: [],
    orgWelcome: {
      description: "Publieke missie.",
      impactDisclaimer: "Publieke disclaimer.",
      missionShort: null,
      orgName: "LEV Groep",
    },
    ...overrides,
  };
}

describe("PublicSurface", () => {
  it("renders OrgWelcomePanel on the public share surface", () => {
    render(<PublicSurface data={createPublicDashboardData()} mode="share" />);

    expect(screen.getByTestId("org-welcome-panel")).toBeInTheDocument();
    expect(screen.getByText("Publieke missie.")).toBeInTheDocument();
    expect(screen.getByText("Publieke disclaimer.")).toBeInTheDocument();
  });

  it("renders OrgWelcomePanel on embed stack mode", () => {
    render(<PublicSurface data={createPublicDashboardData()} mode="embed-stack" />);

    expect(screen.getByTestId("org-welcome-panel")).toBeInTheDocument();
  });

  it("hides OrgWelcomePanel on TV and embed rotate kiosk modes", () => {
    const data = createPublicDashboardData();

    render(<PublicSurface data={data} mode="tv" />);
    expect(screen.queryByTestId("org-welcome-panel")).not.toBeInTheDocument();

    render(<PublicSurface data={data} mode="embed-rotate" />);
    expect(screen.queryAllByTestId("org-welcome-panel")).toHaveLength(0);
  });
});
