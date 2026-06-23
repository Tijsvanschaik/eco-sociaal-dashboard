import {
  TrendAreaChart,
  TrendAreaChartBody,
  hasTrendSocialData,
} from "@/components/charts/trend-area-chart";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ height: 240, width: 320 }}>{children}</div>
    ),
  };
});

vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

describe("TrendAreaChart", () => {
  it("shows an empty state when there is no data", () => {
    render(<TrendAreaChart data={[]} description="Test" title="Trend per week" />);

    expect(screen.getByText(/nog geen trend zichtbaar/i)).toBeInTheDocument();
  });

  it("renders a chart container when data is present", () => {
    render(
      <TrendAreaChart
        data={[
          { weekStart: "2026-04-06", co2SavedKg: 3, socialScoreSaved: 0, registrationCount: 2 },
          { weekStart: "2026-04-13", co2SavedKg: 5, socialScoreSaved: 1, registrationCount: 3 },
        ]}
        description="Test"
        title="Trend per week"
      />,
    );

    expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
  });

  it("toont gestapelde eco- en sociale legende wanneer beide metrics data hebben", () => {
    render(
      <TrendAreaChartBody
        cumulative
        data={[
          { weekStart: "2026-04-06", co2SavedKg: 3, socialScoreSaved: 2, registrationCount: 2 },
          { weekStart: "2026-04-13", co2SavedKg: 5, socialScoreSaved: 4, registrationCount: 3 },
        ]}
      />,
    );

    expect(screen.getByText("Eco")).toBeInTheDocument();
    expect(screen.getByText("Sociaal")).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Eco-sociaal" })).toBeNull();
  });
});

describe("hasTrendSocialData", () => {
  it("returns false when all social values are zero", () => {
    expect(
      hasTrendSocialData([
        { weekStart: "2026-04-06", co2SavedKg: 3, socialScoreSaved: 0, registrationCount: 1 },
      ]),
    ).toBe(false);
  });
});
