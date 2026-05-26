import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfoHint } from "@/components/ui/info-hint";
import { getEcoQuantityHelp } from "@/lib/copy/eco-social-metrics-help";

describe("<InfoHint />", () => {
  it("shows help content when the trigger is clicked", () => {
    render(
      <InfoHint
        content={getEcoQuantityHelp("km")}
        label="Uitleg eco-hoeveelheid"
      />,
    );

    expect(screen.queryByText(/kilometers met een duurzaam alternatief/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /uitleg eco-hoeveelheid/i }));

    expect(screen.getByText(/kilometers met een duurzaam alternatief/i)).toBeInTheDocument();
  });
});
