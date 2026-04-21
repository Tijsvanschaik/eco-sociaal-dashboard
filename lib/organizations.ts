import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type OrgContext = {
  org: {
    eodBaselineDate: string | null;
    eodBaselineKg: number | null;
    id: string;
    name: string;
    publicShareEnabled: boolean;
    publicShareSlug: string | null;
    slug: string;
  };
  role: "admin" | "worker";
  userId: string;
};

export async function getOrgContextBySlug(
  supabase: SupabaseServerClient,
  orgSlug: string,
): Promise<OrgContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, public_share_enabled, public_share_slug, eod_baseline_kg, eod_baseline_date",
    )
    .eq("slug", orgSlug)
    .maybeSingle();
  if (!org) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return null;

  return {
    org: {
      eodBaselineDate: org.eod_baseline_date,
      eodBaselineKg: org.eod_baseline_kg,
      id: org.id,
      name: org.name,
      publicShareEnabled: org.public_share_enabled,
      publicShareSlug: org.public_share_slug,
      slug: org.slug,
    },
    role: membership.role,
    userId: user.id,
  };
}
