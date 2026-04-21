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

const teams = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Team Helmond", locationName: "Binnenstad" },
];
const interventions = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Fietsen",
    unit: "km",
    factorKg: 0.15,
    categoryName: "Mobiliteit",
  },
];

describe("RegistrationForm", () => {
  beforeEach(() => {
    refresh.mockReset();
    createRegistration.mockReset();
    createRegistration.mockResolvedValue({ status: "ok", message: "Registratie opgeslagen." });
  });

  it("keeps submit disabled until the form is valid", async () => {
    render(<RegistrationForm interventions={interventions} orgSlug="lev-groep" teams={teams} />);

    const submit = screen.getByRole("button", { name: /registratie opslaan/i });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/hoeveelheid/i), { target: { value: "3" } });

    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("shows an error when a negative quantity is entered", async () => {
    render(<RegistrationForm interventions={interventions} orgSlug="lev-groep" teams={teams} />);

    fireEvent.change(screen.getByLabelText(/hoeveelheid/i), { target: { value: "-2" } });
    fireEvent.blur(screen.getByLabelText(/hoeveelheid/i));

    expect(await screen.findByText(/groter zijn dan 0/i)).toBeInTheDocument();
  });

  it("submits and refreshes the page on success", async () => {
    render(<RegistrationForm interventions={interventions} orgSlug="lev-groep" teams={teams} />);

    fireEvent.change(screen.getByLabelText(/hoeveelheid/i), { target: { value: "2.5" } });
    const submit = screen.getByRole("button", { name: /registratie opslaan/i });

    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(createRegistration).toHaveBeenCalledTimes(1);
      expect(refresh).toHaveBeenCalledTimes(1);
    });
  });
});
