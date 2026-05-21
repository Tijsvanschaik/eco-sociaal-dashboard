"use client";

import { OrgSwitcher } from "@/components/org-switcher";
import { useSidebar } from "@/components/app-shell/sidebar-context";
import { cn } from "@/lib/utils";

type Org = { id: string; name: string; slug: string; logoUrl?: string | null };

type OrgBadgeProps = {
  org: Org;
  userDisplayName: string;
  /** Alle organisaties waar de user toegang toe heeft, voor wisselen. */
  switchableOrgs?: Org[];
  className?: string;
};

/**
 * Bovenin de sidebar. Toont het org-logo (of initialen als fallback),
 * gebruikersnaam en organisatienaam. Als de user bij meerdere orgs hoort
 * verschijnt daaronder de compacte OrgSwitcher.
 */
export function OrgBadge({ org, userDisplayName, switchableOrgs, className }: OrgBadgeProps) {
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.isCollapsed ?? false;
  const initials = getInitials(org.name);
  const showSwitcher = (switchableOrgs?.length ?? 0) > 1;

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        isCollapsed ? "pt-1 pb-0" : "pt-6 pb-2",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-2xl",
          isCollapsed ? "h-10 w-10" : "mb-4 h-16 w-16",
          org.logoUrl
            ? "bg-card shadow-sm"
            : "bg-primary-container text-lg font-extrabold tracking-tight text-on-primary-container",
        )}
        aria-hidden={!org.logoUrl}
      >
        {org.logoUrl ? (
          <img
            alt={`Logo van ${org.name}`}
            src={org.logoUrl}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          initials
        )}
      </div>
      {!isCollapsed && (
        <>
          <h1 className="max-w-[12rem] truncate text-xl font-extrabold tracking-tight text-primary">
            {userDisplayName}
          </h1>
          <span className="mt-1 max-w-[12rem] truncate text-sm text-muted-foreground">
            {org.name}
          </span>
          {showSwitcher && (
            <div className="mt-3">
              <OrgSwitcher current={org} orgs={switchableOrgs ?? []} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const [first, second] = words;
  if (!first) return "?";
  if (!second) return first.slice(0, 2).toUpperCase();
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
