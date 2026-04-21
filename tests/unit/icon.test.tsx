import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "@/components/ui/icon";

describe("<Icon />", () => {
  it("renders a material-symbols span with the given name", () => {
    render(<Icon name="eco" data-testid="eco" />);
    const el = screen.getByTestId("eco");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveTextContent("eco");
    expect(el).toHaveClass("material-symbols-outlined");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the filled variant class when filled", () => {
    render(<Icon name="eco" filled data-testid="eco-filled" />);
    expect(screen.getByTestId("eco-filled")).toHaveClass("is-filled");
  });

  it("exposes an accessible label when aria-label is provided", () => {
    render(<Icon name="eco" aria-label="Eco-icoon" />);
    const el = screen.getByRole("img", { name: /eco-icoon/i });
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveAttribute("aria-hidden");
  });
});
