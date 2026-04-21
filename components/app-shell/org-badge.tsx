import { OrgSwitcher } from "@/components/org-switcher";
import { cn } from "@/lib/utils";

type Org = { id: string; name: string; slug: string };

type OrgBadgeProps = {
  org: Org;
  userDisplayName: string;
  /** Alle organisaties waar de user toegang toe heeft, voor wisselen. */
  switchableOrgs?: Org[];
  className?: string;
};

/**
 * Bovenin de sidebar. Toont een placeholder-logo (initialen op
 * primary-container) + organisatienaam + user-display. Als de user bij
 * meerdere orgs hoort verschijnt daaronder de compacte OrgSwitcher.
 *
 * TODO: vervang het initialen-blok door een echt org-logo zodra we
 * logo-upload naar Supabase Storage ondersteunen.
 */
export function OrgBadge({ org, userDisplayName, switchableOrgs, className }: OrgBadgeProps) {
  const initials = getInitials(org.name);
  const showSwitcher = (switchableOrgs?.length ?? 0) > 1;

  return (
    <div className={cn("flex flex-col items-center pt-6 pb-2 text-center", className)}>
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-lg font-extrabold tracking-tight text-on-primary-container"
        aria-hidden
      >
        {initials}
      </div>
      <h1 className="text-xl font-extrabold tracking-tight text-primary">{org.name}</h1>
      <span className="mt-1 max-w-[12rem] truncate text-sm text-muted-foreground">
        {userDisplayName}
      </span>
      {showSwitcher && (
        <div className="mt-3">
          <OrgSwitcher current={org} orgs={switchableOrgs ?? []} />
        </div>
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
