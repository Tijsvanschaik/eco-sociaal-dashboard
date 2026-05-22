import { ImpactPreview } from "@/components/registration/impact-preview";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const intervention = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Fietsen",
  ecoUnit: "km",
  socialUnit: "personen",
  factorKg: 0.15,
  socialScoreFactor: 0.5,
  categoryName: "Mobiliteit",
  categoryColor: "#22aa66",
  categoryId: "33333333-3333-3333-3333-333333333333",
};

describe("ImpactPreview", () => {
  it("shows placeholder copy when quantities are missing", () => {
    render(
      <ImpactPreview intervention={intervention} quantity={0} socialQuantity={0} variant="inline" />,
    );

    expect(screen.getByText(/zodra je een activiteit kiest/i)).toBeInTheDocument();
  });

  it("shows estimated impact for numeric string quantities from inputs", () => {
    render(
      <ImpactPreview
        intervention={intervention}
        quantity={"10" as unknown as number}
        socialQuantity={"4" as unknown as number}
        variant="inline"
      />,
    );

    expect(screen.getAllByText(/jouw impact/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Sociale score")).toBeInTheDocument();
    expect(screen.getByText("punten")).toBeInTheDocument();
  });
});
