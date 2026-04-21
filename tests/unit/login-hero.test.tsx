import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginHero } from "@/components/brand/login-hero";

describe("<LoginHero />", () => {
  it("renders the brand heading and the filled eco icon", () => {
    render(<LoginHero />);

    expect(screen.getByRole("heading", { name: /eco-sociaal\s*dashboard/i })).toBeInTheDocument();

    const icon = screen.getByText("eco");
    expect(icon).toHaveClass("material-symbols-outlined");
    expect(icon).toHaveClass("is-filled");
  });
});
