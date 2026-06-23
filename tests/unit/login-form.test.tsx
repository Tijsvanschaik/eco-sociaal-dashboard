import { LoginForm } from "@/app/(public)/login/login-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMagicLink = vi.fn();
const signInWithPassword = vi.fn();
const verifyLoginOtp = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/(public)/login/actions", () => ({
  sendMagicLink: (...args: unknown[]) => sendMagicLink(...args),
  signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
  verifyLoginOtp: (...args: unknown[]) => verifyLoginOtp(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    sendMagicLink.mockReset();
    signInWithPassword.mockReset();
    verifyLoginOtp.mockReset();
    sendMagicLink.mockResolvedValue({ status: "ok", email: "admin@example.com" });
    signInWithPassword.mockResolvedValue({ status: "ok", redirectTo: "/" });
    verifyLoginOtp.mockResolvedValue({ status: "ok", redirectTo: "/" });
  });

  it("renders the email step by default", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/wachtwoord/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /doorgaan/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /inloggen met 8-cijferige code/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the password form when mode=password", () => {
    render(<LoginForm mode="password" redirectTo="/lev-groep/dashboard" />);

    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wachtwoord/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in met wachtwoord/i })).toBeInTheDocument();
  });

  it("shows the code step after submitting an email", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "admin@example.com" },
    });

    const submit = screen.getByRole("button", { name: /doorgaan/i });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(sendMagicLink).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/check je inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/klik op de link in de mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/8-cijferige code/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^inloggen$/i })).toBeInTheDocument();
    });
  });

  it("submits the OTP step after the email step", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "admin@example.com" },
    });

    const continueButton = screen.getByRole("button", { name: /doorgaan/i });
    await waitFor(() => expect(continueButton).toBeEnabled());
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/8-cijferige code/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/8-cijferige code/i), {
      target: { value: "67109300" },
    });

    const submit = screen.getByRole("button", { name: /^inloggen$/i });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(verifyLoginOtp).toHaveBeenCalledTimes(1);
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
