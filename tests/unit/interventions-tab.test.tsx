import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InterventionsTab } from "@/components/settings/interventions-tab";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/(app)/[orgSlug]/beheer/actions", () => ({
  archiveCategory: vi.fn(),
  archiveIntervention: vi.fn(),
  createCategory: vi.fn(),
  createIntervention: vi.fn(),
  updateCategory: vi.fn(),
  updateIntervention: vi.fn(),
}));

const categories = [
  { id: "cat-1", name: "Mobiliteit", color: "#3b82f6" },
  { id: "cat-2", name: "Energie", color: "#10b981" },
];

const interventions = [
  {
    id: "int-1",
    name: "Fietsen",
    category_id: "cat-1",
    eco_unit: "km",
    social_unit: "personen",
    co2_factor_kg: 0.17,
    social_score_factor: 0.5,
  },
  {
    id: "int-2",
    name: "Energiecoach",
    category_id: "cat-2",
    eco_unit: "uur",
    social_unit: "personen",
    co2_factor_kg: 3.05,
    social_score_factor: 1.22,
  },
];

describe("<InterventionsTab />", () => {
  it("renders the table and opens the create intervention modal", () => {
    render(
      <InterventionsTab categories={categories} interventions={interventions} orgSlug="lev-groep" />,
    );

    expect(screen.getByRole("heading", { name: /interventies/i })).toBeInTheDocument();
    expect(screen.getByText("Fietsen")).toBeInTheDocument();
    expect(screen.getByText("Energiecoach")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /nieuwe interventie/i }));

    expect(screen.getByRole("dialog", { name: /nieuwe interventie/i })).toBeInTheDocument();
  });

  it("filters interventions by category chip", () => {
    render(
      <InterventionsTab categories={categories} interventions={interventions} orgSlug="lev-groep" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /filter op mobiliteit/i }));

    expect(screen.getByText("Fietsen")).toBeInTheDocument();
    expect(screen.queryByText("Energiecoach")).not.toBeInTheDocument();
  });

  it("opens inline editing when clicking a cell value", () => {
    render(
      <InterventionsTab categories={categories} interventions={interventions} orgSlug="lev-groep" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /eco-eenheid bewerken: km/i }));

    expect(screen.getByDisplayValue("km")).toBeInTheDocument();
  });

  it("opens category dropdown when clicking the category cell", () => {
    render(
      <InterventionsTab categories={categories} interventions={interventions} orgSlug="lev-groep" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /categorie bewerken: mobiliteit/i }));

    expect(screen.getByRole("combobox", { name: /categorie bewerken/i })).toBeInTheDocument();
  });
});
