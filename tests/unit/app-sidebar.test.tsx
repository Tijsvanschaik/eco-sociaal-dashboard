import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppSidebar, AppSidebarLayout, type SidebarItem } from "@/components/app-shell/app-sidebar";

let currentPathname = "/lev-groep/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

const brand = <div data-testid="brand">LEV</div>;

const mainItems: SidebarItem[] = [
  { kind: "link", label: "Dashboard", href: "/lev-groep/dashboard", icon: "dashboard" },
  { kind: "link", label: "Registratie", href: "/lev-groep/registratie", icon: "edit_note" },
  { kind: "link", label: "Instellingen", href: "/lev-groep/instellingen", icon: "settings" },
];

const footerItems: SidebarItem[] = [
  { kind: "link", label: "Superadmin", href: "/superadmin", icon: "admin_panel_settings" },
  { kind: "form", label: "Uitloggen", action: "/auth/signout", icon: "logout" },
];

describe("<AppSidebar />", () => {
  beforeEach(() => {
    currentPathname = "/lev-groep/dashboard";
  });

  it("marks the link matching the current pathname as active", () => {
    render(
      <AppSidebar
        brand={brand}
        mainItems={mainItems}
        footerItems={footerItems}
        cta={{ label: "Nieuwe Registratie", href: "/lev-groep/registratie", icon: "add" }}
      />,
    );

    const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
    for (const link of dashboardLinks) {
      expect(link).toHaveAttribute("aria-current", "page");
    }

    const registratieLinks = screen.getAllByRole("link", { name: /^registratie$/i });
    for (const link of registratieLinks) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("treats a pathname inside a section as active", () => {
    currentPathname = "/lev-groep/instellingen/team";
    render(<AppSidebar brand={brand} mainItems={mainItems} footerItems={footerItems} />);

    const instellingenLinks = screen.getAllByRole("link", { name: /instellingen/i });
    for (const link of instellingenLinks) {
      expect(link).toHaveAttribute("aria-current", "page");
    }
  });

  it("does not mark footer links with neverActive as current", () => {
    const withHelpFooter: SidebarItem[] = [
      {
        kind: "link",
        label: "Hulp",
        href: "/lev-groep/dashboard",
        icon: "support",
        neverActive: true,
      },
      ...footerItems,
    ];
    render(
      <AppSidebar
        brand={brand}
        mainItems={mainItems}
        footerItems={withHelpFooter}
        cta={{ label: "Nieuwe Registratie", href: "/lev-groep/registratie", icon: "add" }}
      />,
    );

    const helpLinks = screen.getAllByRole("link", { name: /^hulp$/i });
    for (const link of helpLinks) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("renders form items as POST forms with a submit button", () => {
    render(<AppSidebar brand={brand} mainItems={mainItems} footerItems={footerItems} />);

    const buttons = screen.getAllByRole("button", { name: /uitloggen/i });
    expect(buttons.length).toBeGreaterThan(0);
    const form = buttons[0]?.closest("form");
    expect(form).not.toBeNull();
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/auth/signout");
  });

  it("opens and closes the mobile drawer via the hamburger button", () => {
    render(<AppSidebar brand={brand} mainItems={mainItems} footerItems={footerItems} />);

    const openButton = screen.getByRole("button", { name: /menu openen/i });
    fireEvent.click(openButton);

    const closeButtons = screen.getAllByRole("button", { name: /menu sluiten/i });
    expect(closeButtons.length).toBeGreaterThan(0);

    const firstCloseButton = closeButtons[0];
    if (!firstCloseButton) throw new Error("Expected at least one close button");
    fireEvent.click(firstCloseButton);

    expect(screen.queryAllByRole("button", { name: /menu sluiten/i })).toHaveLength(0);
  });

  it("collapses the desktop sidebar and keeps the CTA accessible", () => {
    render(
      <AppSidebarLayout
        brand={brand}
        mainItems={mainItems}
        footerItems={footerItems}
        cta={{ label: "Nieuwe Registratie", href: "/lev-groep/registratie", icon: "add" }}
      >
        <p>content</p>
      </AppSidebarLayout>,
    );

    const collapseButton = screen.getByRole("button", { name: /sidebar inklappen/i });
    fireEvent.click(collapseButton);

    expect(screen.getByRole("navigation", { name: /hoofdnavigatie/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: /sidebar uitklappen/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /nieuwe registratie/i }).length).toBeGreaterThan(0);
  });
});
