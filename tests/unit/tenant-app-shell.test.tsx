import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TenantAppShell } from "@/components/app-shell/tenant-app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/lev-groep/dashboard",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const org = { id: "org-1", name: "LEV Groep", slug: "lev-groep" };

describe("<TenantAppShell />", () => {
  it("renders dashboard + registratie for worker role without instellingen", () => {
    render(
      <TenantAppShell
        org={org}
        memberRole="worker"
        isSuperadmin={false}
        userDisplayName="medewerker@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    expect(screen.getAllByRole("link", { name: /^dashboard$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^registratie$/i }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("link", { name: /instellingen/i })).toHaveLength(0);
    expect(screen.queryAllByRole("link", { name: /superadmin/i })).toHaveLength(0);
  });

  it("adds instellingen for admin role", () => {
    render(
      <TenantAppShell
        org={org}
        memberRole="admin"
        isSuperadmin={false}
        userDisplayName="admin@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    expect(screen.getAllByRole("link", { name: /instellingen/i }).length).toBeGreaterThan(0);
  });

  it("adds instellingen for superadmin without org admin role", () => {
    render(
      <TenantAppShell
        org={org}
        memberRole="worker"
        isSuperadmin={true}
        userDisplayName="superadmin@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    expect(screen.getAllByRole("link", { name: /instellingen/i }).length).toBeGreaterThan(0);
  });

  it("adds superadmin footer link when user is superadmin", () => {
    render(
      <TenantAppShell
        org={org}
        memberRole="admin"
        isSuperadmin={true}
        userDisplayName="admin@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    expect(screen.getAllByRole("link", { name: /superadmin/i }).length).toBeGreaterThan(0);
  });

  it("renders the CTA pointing at the registratie page", () => {
    render(
      <TenantAppShell
        org={org}
        memberRole="worker"
        isSuperadmin={false}
        userDisplayName="medewerker@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    const ctaLinks = screen.getAllByRole("link", { name: /nieuwe registratie/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0]).toHaveAttribute("href", "/lev-groep/registratie");
  });

  it("displays org initials when no logo is configured", () => {
    render(
      <TenantAppShell
        org={org}
        memberRole="worker"
        isSuperadmin={false}
        userDisplayName="medewerker@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    expect(screen.getAllByText("LG").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("heading", { name: /medewerker@example.com/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/LEV Groep/i).length).toBeGreaterThan(0);
  });

  it("displays the org logo when logoUrl is set", () => {
    render(
      <TenantAppShell
        org={{ ...org, logoUrl: "https://example.com/logo.png" }}
        memberRole="worker"
        isSuperadmin={false}
        userDisplayName="medewerker@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    const logos = screen.getAllByRole("img", { name: /logo van lev groep/i });
    expect(logos.length).toBeGreaterThan(0);
    expect(logos[0]).toHaveAttribute("src", "https://example.com/logo.png");
    expect(screen.queryAllByText("LG")).toHaveLength(0);
  });
});
