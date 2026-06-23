import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SafeMarkdown } from "@/components/ui/safe-markdown";

describe("SafeMarkdown", () => {
  it("renders basic markdown formatting", () => {
    render(<SafeMarkdown content="**Eco** en _sociaal_" />);

    expect(screen.getByText("Eco").tagName).toBe("STRONG");
    expect(screen.getByText("sociaal").tagName).toBe("EM");
  });

  it("does not render raw HTML tags from user content", () => {
    render(<SafeMarkdown content={'<script>alert("x")</script> Hallo'} />);

    expect(screen.queryByText('alert("x")')).not.toBeInTheDocument();
    expect(screen.getByText(/Hallo/)).toBeInTheDocument();
  });
});
