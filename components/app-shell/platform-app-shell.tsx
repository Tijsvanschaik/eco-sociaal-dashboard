"use client";

import type { ReactNode } from "react";

import { useSidebar } from "@/components/app-shell/sidebar-context";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

import { AppSidebarLayout, type SidebarCta, type SidebarItem } from "./app-sidebar";

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
    <AppSidebarLayout
      mobileTitle="Superadmin"
      brand={<PlatformBadge userDisplayName={userDisplayName} />}
      mainItems={mainItems}
      cta={cta}
      footerItems={footerItems}
    >
      {children}
    </AppSidebarLayout>
  );
}

function PlatformBadge({
  userDisplayName,
  className,
}: {
  userDisplayName: string;
  className?: string;
}) {
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.isCollapsed ?? false;

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center pt-6 pb-2",
        isCollapsed && "md:pt-1 md:pb-0",
        className,
      )}
    >
      <Logo
        className={cn(
          "mb-5 h-8 w-auto",
          isCollapsed && "md:mb-0 md:h-6 md:w-auto",
        )}
      />
      <div className={cn(isCollapsed && "md:hidden")}>
        <h1 className="text-xl font-extrabold tracking-tight text-primary">Superadmin</h1>
        <span className="mt-1 max-w-[12rem] truncate text-sm text-muted-foreground">
          {userDisplayName}
        </span>
      </div>
    </div>
  );
}
