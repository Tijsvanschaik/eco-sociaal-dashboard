import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getPublicDashboardBySlug(supabase: SupabaseServerClient, slug: string) {
  const [{ data: totals }, { data: teams }, { data: categories }] = await Promise.all([
    supabase.from("public_dashboard_totals").select("*").eq("share_slug", slug).maybeSingle(),
    supabase
      .from("public_team_breakdown")
      .select("*")
      .eq("share_slug", slug)
      .order("co2_saved_kg", { ascending: false }),
    supabase
      .from("public_category_breakdown")
      .select("*")
      .eq("share_slug", slug)
      .order("co2_saved_kg", { ascending: false }),
  ]);

  if (!totals) {
    return null;
  }

  return {
    totals,
    teams: teams ?? [],
    categories: categories ?? [],
  };
}
