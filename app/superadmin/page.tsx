import Link from "next/link";

import { SuperadminMetricGrid } from "@/components/superadmin/superadmin-metric-grid";
import { SuperadminOrgListPanel } from "@/components/superadmin/superadmin-org-list-panel";
import {
  SuperadminPageHeader,
  SuperadminPageMain,
} from "@/components/superadmin/superadmin-page-layout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/server";

function formatNumber(value: number) {
  return new Intl.NumberFormat("nl-NL").format(value);
}

export default async function SuperadminPage() {
  const supabase = await createClient();
  const [{ data: organizations }, { data: memberships }, { data: registrations }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("id, name, slug, public_share_enabled, public_share_slug, eod_baseline_kg")
        .order("name"),
      supabase.from("memberships").select("org_id"),
      supabase.from("registrations").select("org_id"),
    ]);

  const memberCounts = new Map<string, number>();
  for (const membership of memberships ?? []) {
    memberCounts.set(membership.org_id, (memberCounts.get(membership.org_id) ?? 0) + 1);
  }

  const registrationCounts = new Map<string, number>();
  for (const registration of registrations ?? []) {
    registrationCounts.set(
      registration.org_id,
      (registrationCounts.get(registration.org_id) ?? 0) + 1,
    );
  }

  const orgRows = (organizations ?? []).map((org) => ({
    eodBaselineKg: org.eod_baseline_kg,
    id: org.id,
    memberCount: memberCounts.get(org.id) ?? 0,
    name: org.name,
    publicShareEnabled: org.public_share_enabled,
    publicShareSlug: org.public_share_slug,
    registrationCount: registrationCounts.get(org.id) ?? 0,
    slug: org.slug,
  }));

  return (
    <SuperadminPageMain>
      <SuperadminPageHeader
        actions={
          <Button asChild className="min-h-11 rounded-full" variant="brand">
            <Link href="/superadmin/orgs/new">
              <Icon name="add" />
              Nieuwe organisatie
            </Link>
          </Button>
        }
        description="Bekijk alle tenants, controleer de basisconfiguratie en voeg nieuwe organisaties toe."
        eyebrow="Platformbeheer"
        title="Organisaties"
      />

      <SuperadminMetricGrid
        metrics={[
          {
            description: "Actieve tenants op het platform.",
            icon: "domain",
            label: "Organisaties",
            tone: "primary",
            value: formatNumber(orgRows.length),
          },
          {
            description: "Totaal aantal gekoppelde gebruikers over alle tenants.",
            icon: "group",
            label: "Gebruikerskoppelingen",
            tone: "neutral",
            value: formatNumber((memberships ?? []).length),
          },
          {
            description: "Alle registraties.",
            icon: "edit_note",
            label: "Registraties",
            tone: "tertiary",
            value: formatNumber((registrations ?? []).length),
          },
        ]}
      />

      <SuperadminOrgListPanel organizations={orgRows} />
    </SuperadminPageMain>
  );
}
