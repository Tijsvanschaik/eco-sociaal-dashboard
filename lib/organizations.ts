import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** True when `s` is a canonical UUID string (org id), not a human slug. */
function isUuidSegment(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

const ORG_SELECT =
  "id, name, slug, description, mission_short, impact_disclaimer, logo_url, public_share_enabled, public_share_slug, eod_baseline_kg, eod_baseline_date" as const;

export type OrgContext = {
  isSuperadmin: boolean;
  org: {
    description: string | null;
    eodBaselineDate: string | null;
    eodBaselineKg: number | null;
    id: string;
    impactDisclaimer: string | null;
    logoUrl: string | null;
    missionShort: string | null;
    name: string;
    publicShareEnabled: boolean;
    publicShareSlug: string | null;
    slug: string;
  };
  role: "admin" | "worker";
  userId: string;
};

export async function isCurrentUserSuperadmin(supabase: SupabaseServerClient): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data?.user_id);
}

export async function getDefaultAuthedPath(supabase: SupabaseServerClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (membership) {
    const { data: org } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", membership.org_id)
      .maybeSingle();
    if (org?.slug) {
      return `/${org.slug}/dashboard`;
    }
  }

  if (await isCurrentUserSuperadmin(supabase)) {
    return "/superadmin";
  }

  return null;
}

export async function getOrgContextBySlug(
  supabase: SupabaseServerClient,
  orgSlug: string,
): Promise<OrgContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const isSuperadmin = await isCurrentUserSuperadmin(supabase);

  let { data: org } = await supabase
    .from("organizations")
    .select(ORG_SELECT)
    .eq("slug", orgSlug)
    .maybeSingle();

  // Superadmin UI uses `/superadmin/orgs/{uuid}`; users often paste that id into
  // tenant URLs. Resolve by primary key when the segment is a UUID and slug miss.
  if (!org && isUuidSegment(orgSlug)) {
    const second = await supabase
      .from("organizations")
      .select(ORG_SELECT)
      .eq("id", orgSlug)
      .maybeSingle();
    org = second.data;
  }

  if (!org) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Superadmins mogen elke org bekijken, ook zonder membership. We geven ze
  // in dat geval role='worker' mee: de 0003-RLS staat read-only toe, dus
  // het dashboard werkt, maar write-policies blokkeren nog steeds pogingen
  // tot registraties / beheer-acties in een vreemde org.
  if (!membership && !isSuperadmin) return null;

  return {
    isSuperadmin,
    org: {
      description: org.description,
      eodBaselineDate: org.eod_baseline_date,
      eodBaselineKg: org.eod_baseline_kg,
      id: org.id,
      impactDisclaimer: org.impact_disclaimer ?? null,
      logoUrl: org.logo_url,
      missionShort: org.mission_short ?? null,
      name: org.name,
      publicShareEnabled: org.public_share_enabled,
      publicShareSlug: org.public_share_slug,
      slug: org.slug,
    },
    role: membership?.role ?? "worker",
    userId: user.id,
  };
}
