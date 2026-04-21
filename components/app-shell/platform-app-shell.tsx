import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

import { AppSidebar, type SidebarCta, type SidebarItem } from "./app-sidebar";

type PlatformAppShellProps = {
  userDisplayName: string;
  /** Slug van de eerste org van de user, om een "Terug naar app"-link te tonen. */
  fallbackOrgSlug: string | null;
  children: ReactNode;
};

/**
 * App-shell voor de `/superadmin`-routes. Hergebruikt de generieke AppSidebar
 * met een platform-brandblok en een minimale nav (Organisaties + Nieuwe
 * organisatie). Zodra er een dedicated superadmin-design is kunnen we de items
 * hier uitbreiden zonder iets aan de tenant-shell te veranderen.
 */
export function PlatformAppShell({
  userDisplayName,
  fallbackOrgSlug,
  children,
}: PlatformAppShellProps) {
  const mainItems: SidebarItem[] = [
    {
      kind: "link",
      label: "Organisaties",
      href: "/superadmin",
      icon: "domain",
    },
  ];

  const cta: SidebarCta = {
    label: "Nieuwe organisatie",
    href: "/superadmin/orgs/new",
    icon: "add",
  };

  const footerItems: SidebarItem[] = [];
  if (fallbackOrgSlug) {
    footerItems.push({
      kind: "link",
      label: "Terug naar app",
      href: `/${fallbackOrgSlug}/dashboard`,
      icon: "arrow_back",
    });
  }
  footerItems.push({ kind: "form", label: "Uitloggen", action: "/auth/signout", icon: "logout" });

  return (
    <div className="min-h-dvh bg-background md:pl-72">
      <AppSidebar
        mobileTitle="Superadmin"
        brand={<PlatformBadge userDisplayName={userDisplayName} />}
        mainItems={mainItems}
        cta={cta}
        footerItems={footerItems}
      />
      {children}
    </div>
  );
}

function PlatformBadge({
  userDisplayName,
  className,
}: {
  userDisplayName: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center pt-6 pb-2 text-center", className)}>
      <Logo className="mb-5 h-8 w-auto" />
      <h1 className="text-xl font-extrabold tracking-tight text-primary">Superadmin</h1>
      <span className="mt-1 max-w-[12rem] truncate text-sm text-muted-foreground">
        {userDisplayName}
      </span>
    </div>
  );
}
