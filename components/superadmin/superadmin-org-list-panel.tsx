import Link from "next/link";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type OrganizationRow = {
  eodBaselineKg: number | null;
  id: string;
  memberCount: number;
  name: string;
  publicShareEnabled: boolean;
  publicShareSlug: string | null;
  registrationCount: number;
  slug: string;
};

export function SuperadminOrgListPanel({ organizations }: { organizations: OrganizationRow[] }) {
  return (
    <DashboardPanel
      description="Read-only overzicht over alle tenants op het platform."
      icon="domain"
      iconTone="neutral"
      title="Tenant-overzicht"
    >
      {organizations.length === 0 ? (
        <p className="rounded-[1.5rem] bg-card p-6 text-sm text-muted-foreground shadow-[0_20px_40px_rgba(54,50,45,0.04)]">
          Er zijn nog geen organisaties aangemaakt.
        </p>
      ) : (
        <ul className="space-y-3">
          {organizations.map((org) => (
            <li
              key={org.id}
              className="rounded-[1.5rem] border border-border/60 bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-extrabold tracking-tight text-foreground">
                      {org.name}
                    </p>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      /{org.slug}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {org.memberCount} leden · {org.registrationCount} registraties · publieke link{" "}
                    <span className="font-semibold text-foreground">
                      {org.publicShareEnabled && org.publicShareSlug ? "aan" : "uit"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    EOD-baseline:{" "}
                    <span className="font-semibold text-foreground">
                      {org.eodBaselineKg ? `${org.eodBaselineKg} kg` : "placeholder"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary" className="rounded-full">
                    <Link href={`/${org.slug}/dashboard`}>
                      <Icon name="dashboard" className="text-base" />
                      Dashboard
                    </Link>
                  </Button>
                  {org.publicShareEnabled && org.publicShareSlug ? (
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link href={`/p/${org.publicShareSlug}`}>
                        <Icon name="share" className="text-base" />
                        Publieke link
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild size="sm" variant="brand" className="rounded-full">
                    <Link href={`/superadmin/orgs/${org.id}`}>
                      <Icon name="visibility" className="text-base" />
                      Details
                    </Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
