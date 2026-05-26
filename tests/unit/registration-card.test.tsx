import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegistrationCard } from "@/components/dashboard/registration-card";

const registration = {
  categoryColor: "#10b981",
  categoryName: "Voeding",
  co2KgCached: 4,
  happenedOn: "2026-04-20",
  id: "reg-1",
  interventionLabel: "Vegetarische maaltijd",
  note: null,
  photoUrl: null,
  ecoUnit: "maaltijd",
  quantity: 2,
  socialQuantity: 3,
  socialUnit: "personen",
  socialScoreCached: 6,
  teamLabel: "LEV Helmond",
};

describe("<RegistrationCard />", () => {
  it("shows an edit link when editHref is provided", () => {
    render(
      <RegistrationCard
        editHref="/lev-groep/registraties/reg-1/bewerken"
        registration={registration}
      />,
    );

    expect(screen.getByRole("link", { name: "Registratie bewerken" })).toHaveAttribute(
      "href",
      "/lev-groep/registraties/reg-1/bewerken",
    );
  });

  it("hides the edit link when editHref is omitted", () => {
    render(<RegistrationCard registration={registration} />);

    expect(screen.queryByRole("link", { name: "Registratie bewerken" })).toBeNull();
  });
});
