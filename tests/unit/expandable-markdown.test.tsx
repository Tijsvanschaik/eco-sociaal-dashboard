import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ExpandableMarkdown } from "@/components/dashboard/expandable-markdown";

function mockOverflow(isOverflowing: boolean) {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(isOverflowing ? 120 : 60);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(60);
}

describe("ExpandableMarkdown", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders markdown content", () => {
    render(<ExpandableMarkdown content="**Eco** en sociaal" />);

    expect(screen.getByText("Eco").tagName).toBe("STRONG");
  });

  it("shows expand control when content overflows the clamp", () => {
    mockOverflow(true);

    render(
      <ExpandableMarkdown content="Regel één.\n\nRegel twee.\n\nRegel drie.\n\nRegel vier." />,
    );

    expect(screen.getByText("Lees meer")).toHaveAttribute("aria-expanded", "false");
  });

  it("hides expand control when content fits within the clamp", () => {
    mockOverflow(false);

    render(<ExpandableMarkdown content="Korte missie." />);

    expect(screen.queryByText("Lees meer")).not.toBeInTheDocument();
  });

  it("toggles expanded state", () => {
    mockOverflow(true);

    render(<ExpandableMarkdown content={"Eén.\n\nTwee.\n\nDrie.\n\nVier."} />);

    fireEvent.click(screen.getByText("Lees meer"));

    expect(screen.getByText("Toon minder")).toHaveAttribute("aria-expanded", "true");
  });
});
