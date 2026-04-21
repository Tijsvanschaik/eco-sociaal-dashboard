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

  it("renders the magic-link form by default", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/wachtwoord/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /magic link versturen/i })).toBeInTheDocument();
  });

  it("renders the password form when mode=password", () => {
    render(<LoginForm mode="password" redirectTo="/lev-groep/dashboard" />);

    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wachtwoord/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in met wachtwoord/i })).toBeInTheDocument();
  });

  it("submits the magic-link flow and shows the sent state", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "admin@example.com" },
    });

    const submit = screen.getByRole("button", { name: /magic link versturen/i });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(sendMagicLink).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/check je inbox/i)).toBeInTheDocument();
    });
  });

  it("submits the password flow with the provided credentials", async () => {
    render(<LoginForm mode="password" />);

    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/wachtwoord/i), {
      target: { value: "Welkom123!" },
    });

    const submit = screen.getByRole("button", { name: /log in met wachtwoord/i });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledTimes(1);
    });
  });
});
