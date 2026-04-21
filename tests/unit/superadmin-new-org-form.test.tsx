import { SuperadminOrgForm } from "@/components/superadmin-org-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const createOrganizationAndInviteAdmin = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/app/superadmin/orgs/new/actions", () => ({
  createOrganizationAndInviteAdmin: (...args: unknown[]) =>
    createOrganizationAndInviteAdmin(...args),
}));

describe("SuperadminOrgForm", () => {
  it("shows a validation error for an invalid slug", async () => {
    render(<SuperadminOrgForm />);

    fireEvent.change(screen.getByLabelText(/organisatienaam/i), {
      target: { value: "Welzijn Eindhoven" },
    });
    fireEvent.change(screen.getByLabelText(/^slug$/i), {
      target: { value: "Welzijn Eindhoven" },
    });
    fireEvent.blur(screen.getByLabelText(/^slug$/i));

    await waitFor(() => {
      expect(
        screen.getByText(/gebruik alleen kleine letters, cijfers en koppeltekens/i),
      ).toBeInTheDocument();
    });
    expect(createOrganizationAndInviteAdmin).not.toHaveBeenCalled();
  });
});
