import { LoginForm } from "@/app/(public)/login/login-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMagicLink = vi.fn();
const signInWithPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/(public)/login/actions", () => ({
  sendMagicLink: (...args: unknown[]) => sendMagicLink(...args),
  signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    sendMagicLink.mockReset();
    signInWithPassword.mockReset();
    sendMagicLink.mockResolvedValue({ status: "ok", email: "admin@example.com" });
    signInWithPassword.mockResolvedValue({ status: "ok", redirectTo: "/" });
  });

  it("shows temporary password fields when switching mode", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /tijdelijk wachtwoord/i }));

    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wachtwoord/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in met wachtwoord/i })).toBeInTheDocument();
  });

  it("allows typing in the temporary password mode", async () => {
    render(<LoginForm redirectTo="/lev-groep/dashboard" />);

    fireEvent.click(screen.getByRole("button", { name: /tijdelijk wachtwoord/i }));

    const emailInput = await screen.findByLabelText(/e-mailadres/i);
    const passwordInput = await screen.findByLabelText(/wachtwoord/i);

    fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Welkom123!" } });

    expect(emailInput).toHaveValue("admin@example.com");
    expect(passwordInput).toHaveValue("Welkom123!");
    expect(
      screen.getByText(/tijdelijke fallback voor admins en testgebruikers/i),
    ).toBeInTheDocument();
  });

  it("keeps the magic-link flow available", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "admin@example.com" },
    });

    const submit = screen.getByRole("button", { name: /stuur login-link/i });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(sendMagicLink).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/check je inbox/i)).toBeInTheDocument();
    });
  });
});
