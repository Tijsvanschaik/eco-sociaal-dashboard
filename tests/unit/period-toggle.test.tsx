import { PeriodToggle } from "@/components/period-toggle";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/lev-groep/dashboard",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("period=90d"),
}));

describe("PeriodToggle", () => {
  it("writes the selected period to the URL", () => {
    render(<PeriodToggle current="90d" />);

    fireEvent.click(screen.getByRole("button", { name: /30 dagen/i }));

    expect(replace).toHaveBeenCalledWith("/lev-groep/dashboard?period=30d", { scroll: false });
  });
});
