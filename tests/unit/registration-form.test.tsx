import { RegistrationForm } from "@/components/registration-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
const createRegistration = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

vi.mock("@/app/(app)/[orgSlug]/registratie/actions", () => ({
  createRegistration: (...args: unknown[]) => createRegistration(...args),
}));

const teams = [{ id: "11111111-1111-1111-1111-111111111111", name: "Team Helmond" }];
const interventions = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Fietsen",
    ecoUnit: "km",
    socialUnit: "personen",
    factorKg: 0.15,
    socialScoreFactor: 0.5,
    categoryName: "Mobiliteit",
    categoryColor: "#22aa66",
    categoryId: "33333333-3333-3333-3333-333333333333",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Energiecoach",
    ecoUnit: "uur",
    socialUnit: "personen",
    factorKg: 0.2,
    socialScoreFactor: 1,
    categoryName: "Energie",
    categoryColor: "#ffaa00",
    categoryId: "55555555-5555-5555-5555-555555555555",
  },
];

function getSubmitButton() {
  const submit = screen.getAllByRole("button", { name: /impact opslaan/i })[0];
  if (!submit) throw new Error("Submit button not found");
  return submit;
}

describe("RegistrationForm", () => {
  beforeEach(() => {
    refresh.mockReset();
    createRegistration.mockReset();
    createRegistration.mockResolvedValue({ status: "ok", message: "Registratie opgeslagen." });
  });

  it("keeps submit disabled until the form is valid", async () => {
    render(
      <RegistrationForm
        interventions={interventions}
        orgId="99999999-9999-9999-9999-999999999999"
        orgSlug="lev-groep"
        teams={teams}
        userId="66666666-6666-6666-6666-666666666666"
      />,
    );

    const submit = getSubmitButton();
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/eco-hoeveelheid/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/sociale hoeveelheid/i), { target: { value: "5" } });

    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("shows an error when a negative quantity is entered", async () => {
    render(
      <RegistrationForm
        interventions={interventions}
        orgId="99999999-9999-9999-9999-999999999999"
        orgSlug="lev-groep"
        teams={teams}
        userId="66666666-6666-6666-6666-666666666666"
      />,
    );

    fireEvent.change(screen.getByLabelText(/eco-hoeveelheid/i), { target: { value: "-2" } });
    fireEvent.blur(screen.getByLabelText(/eco-hoeveelheid/i));

    expect(await screen.findByText(/groter zijn dan 0/i)).toBeInTheDocument();
  });

  it("submits and refreshes the page on success", async () => {
    render(
      <RegistrationForm
        interventions={interventions}
        orgId="99999999-9999-9999-9999-999999999999"
        orgSlug="lev-groep"
        teams={teams}
        userId="66666666-6666-6666-6666-666666666666"
      />,
    );

    fireEvent.change(screen.getByLabelText(/eco-hoeveelheid/i), { target: { value: "2.5" } });
    fireEvent.change(screen.getByLabelText(/sociale hoeveelheid/i), { target: { value: "4" } });
    const submit = getSubmitButton();

    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(createRegistration).toHaveBeenCalledTimes(1);
      expect(refresh).toHaveBeenCalledTimes(1);
    });
  });

  it("filters interventions by category tab", () => {
    render(
      <RegistrationForm
        interventions={interventions}
        orgId="99999999-9999-9999-9999-999999999999"
        orgSlug="lev-groep"
        teams={teams}
        userId="66666666-6666-6666-6666-666666666666"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /filter op energie/i }));

    expect(screen.getByRole("button", { name: /energiecoach/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^fietsen$/i })).not.toBeInTheDocument();
  });

  it("filters interventions by search query", () => {
    render(
      <RegistrationForm
        interventions={interventions}
        orgId="99999999-9999-9999-9999-999999999999"
        orgSlug="lev-groep"
        teams={teams}
        userId="66666666-6666-6666-6666-666666666666"
      />,
    );

    fireEvent.change(screen.getByLabelText(/zoek activiteit/i), {
      target: { value: "fiets" },
    });

    expect(screen.getByRole("button", { name: /fietsen/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /energiecoach/i })).not.toBeInTheDocument();
  });

  it("shows impact preview after valid quantities are entered", async () => {
    render(
      <RegistrationForm
        interventions={interventions}
        orgId="99999999-9999-9999-9999-999999999999"
        orgSlug="lev-groep"
        teams={teams}
        userId="66666666-6666-6666-6666-666666666666"
      />,
    );

    fireEvent.change(screen.getByLabelText(/eco-hoeveelheid/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/sociale hoeveelheid/i), { target: { value: "4" } });

    await waitFor(() => {
      expect(screen.getAllByText(/jouw impact/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Sociale score").length).toBeGreaterThan(0);
    expect(screen.getAllByText("punten").length).toBeGreaterThan(0);
  });

  it("shows success actions after submit", async () => {
    render(
      <RegistrationForm
        interventions={interventions}
        orgId="99999999-9999-9999-9999-999999999999"
        orgSlug="lev-groep"
        teams={teams}
        userId="66666666-6666-6666-6666-666666666666"
      />,
    );

    fireEvent.change(screen.getByLabelText(/eco-hoeveelheid/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/sociale hoeveelheid/i), { target: { value: "3" } });
    const submit = getSubmitButton();

    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    expect(await screen.findByRole("link", { name: /bekijk dashboard/i })).toHaveAttribute(
      "href",
      "/lev-groep/dashboard",
    );
    expect(screen.getByRole("button", { name: /nog een registratie/i })).toBeInTheDocument();
  });
});
