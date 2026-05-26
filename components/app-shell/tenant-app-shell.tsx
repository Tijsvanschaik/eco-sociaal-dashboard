import type { ReactNode } from "react";

import { AppSidebarLayout, type SidebarCta, type SidebarItem } from "./app-sidebar";
import { OrgBadge } from "./org-badge";

type Org = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  publicShareEnabled?: boolean;
  publicShareSlug?: string | null;
};

function buildPublicSurfaceFooterItems(shareSlug: string): SidebarItem[] {
  return [
    {
      kind: "link",
      label: "Openbare link",
      href: `/p/${shareSlug}`,
      icon: "public",
      external: true,
      neverActive: true,
    },
    {
      kind: "link",
      label: "TV-scherm",
      href: `/tv/${shareSlug}`,
      icon: "tv",
      external: true,
      neverActive: true,
    },
    {
      kind: "link",
      label: "Embed-link",
      href: `/embed/${shareSlug}`,
      icon: "code",
      external: true,
      neverActive: true,
    },
  ];
}

type TenantAppShellProps = {
  org: Org;
  memberRole: "admin" | "worker";
  isSuperadmin: boolean;
  userDisplayName: string;
  switchableOrgs: Org[];
  children: ReactNode;
};

/**
 * App-shell voor alle tenant-routes (dashboard, registratie, instellingen).
 * Rendert de gedeelde sidebar met rol-gebaseerde nav-items en wraps de
 * pagina-content met de juiste desktop-offset.
 */
export function TenantAppShell({
  org,
  memberRole,
  isSuperadmin,
  userDisplayName,
  switchableOrgs,
  children,
}: TenantAppShellProps) {
  const mainItems: SidebarItem[] = [
    { kind: "link", label: "Dashboard", href: `/${org.slug}/dashboard`, icon: "dashboard" },
    {
      kind: "link",
      label: "Registraties",
      href: `/${org.slug}/registraties`,
      icon: "edit_note",
    },
  ];
  // Admins van de org én superadmins mogen bij instellingen. Voor superadmins
  // zonder org-membership zorgt de server-action-laag voor schrijfrechten via
  // de service-role client (RLS laat alleen org-admins schrijven).
  if (memberRole === "admin" || isSuperadmin) {
    mainItems.push({
      kind: "link",
      label: "Instellingen",
      href: `/${org.slug}/instellingen`,
      icon: "settings",
    });
  }

  const cta: SidebarCta = {
    label: "Nieuwe Registratie",
    href: `/${org.slug}/registratie`,
    icon: "add",
  };

  const footerItems: SidebarItem[] = [
    // TODO: koppel aan echte helpdesk-route zodra die bestaat.
    {
      kind: "link",
      label: "Hulp",
      href: `/${org.slug}/dashboard`,
      icon: "support",
      neverActive: true,
    },
  ];

  const canManageOrg = memberRole === "admin" || isSuperadmin;
  const shareSlug =
    org.publicShareEnabled && org.publicShareSlug?.trim() ? org.publicShareSlug.trim() : null;
  if (canManageOrg && shareSlug) {
    footerItems.push(...buildPublicSurfaceFooterItems(shareSlug));
  }

  if (isSuperadmin) {
    footerItems.push({
      kind: "link",
      label: "Superadmin",
      href: "/superadmin",
      icon: "admin_panel_settings",
    });
  }
  footerItems.push({ kind: "form", label: "Uitloggen", action: "/auth/signout", icon: "logout" });

  return (
    <AppSidebarLayout
      mobileTitle={org.name}
      brand={
        <OrgBadge org={org} userDisplayName={userDisplayName} switchableOrgs={switchableOrgs} />
      }
      mainItems={mainItems}
      cta={cta}
      footerItems={footerItems}
    >
      {children}
    </AppSidebarLayout>
  );
}
