import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TenantAppShell } from "@/components/app-shell/tenant-app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/lev-groep/dashboard",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const org = { id: "org-1", name: "LEV Groep", slug: "lev-groep" };

describe("<TenantAppShell />", () => {
  it("renders dashboard + registraties for worker role without instellingen", () => {
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
    expect(screen.getAllByRole("link", { name: /^registraties$/i }).length).toBeGreaterThan(0);
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

  it("adds public surface links for admin when share is enabled", () => {
    render(
      <TenantAppShell
        org={{
          ...org,
          publicShareEnabled: true,
          publicShareSlug: "lev-groep",
        }}
        memberRole="admin"
        isSuperadmin={false}
        userDisplayName="admin@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    const publicLink = screen.getAllByRole("link", { name: /openbare link/i })[0];
    const tvLink = screen.getAllByRole("link", { name: /tv-scherm/i })[0];
    const embedLink = screen.getAllByRole("link", { name: /embed-link/i })[0];

    expect(publicLink).toHaveAttribute("href", "/p/lev-groep");
    expect(publicLink).toHaveAttribute("target", "_blank");
    expect(tvLink).toHaveAttribute("href", "/tv/lev-groep");
    expect(embedLink).toHaveAttribute("href", "/embed/lev-groep");
  });

  it("hides public surface links for workers and when share is disabled", () => {
    render(
      <TenantAppShell
        org={{ ...org, publicShareEnabled: true, publicShareSlug: "lev-groep" }}
        memberRole="worker"
        isSuperadmin={false}
        userDisplayName="medewerker@example.com"
        switchableOrgs={[org]}
      >
        <p>content</p>
      </TenantAppShell>,
    );

    expect(screen.queryAllByRole("link", { name: /openbare link/i })).toHaveLength(0);
    expect(screen.queryAllByRole("link", { name: /tv-scherm/i })).toHaveLength(0);
    expect(screen.queryAllByRole("link", { name: /embed-link/i })).toHaveLength(0);
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

  it("renders the CTA pointing at the new activity page", () => {
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

    const ctaLinks = screen.getAllByRole("link", { name: /activiteit registreren/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0]).toHaveAttribute("href", "/lev-groep/activiteit/nieuw");
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
