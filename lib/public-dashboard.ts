import "server-only";

import type { RegistrationCardData } from "@/components/dashboard/registration-card";
import { type DashboardSnapshot, buildDashboardSnapshot } from "@/lib/dashboard";
import { REGISTRATIONS_BUCKET } from "@/lib/registrations/photo-upload";
import { type createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  type DashboardPeriod,
  type WeeklyTimeseriesRow,
  buildWeeklyTimeseries,
  filterRegistrationsByPeriod,
} from "@/lib/timeseries";
import type { Database } from "@/supabase/types/supabase";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PublicDashboardTotalsRow =
  Database["public"]["Views"]["public_dashboard_totals"]["Row"];

/**
 * Hoe lang signed URLs voor publieke foto-previews geldig zijn. 1 uur dekt
 * een TV-/embed-sessie ruim, en valt netjes binnen de page-revalidate van 60s
 * (voor /tv) zodat foto's altijd vers gerenderd worden.
 */
const PUBLIC_PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60;

const DEFAULT_RECENT_LIMIT = 9;

export type PublicDashboardData = {
  totals: PublicDashboardTotalsRow;
  snapshot: DashboardSnapshot;
  timeseries: WeeklyTimeseriesRow[];
  recentRegistrations: RegistrationCardData[];
};

/**
 * Lees alle data die een publieke surface (`/p`, `/tv`, `/embed`) nodig
 * heeft in één call:
 *
 * - `totals`: cijfers uit de `public_dashboard_totals`-view (met
 *   `active_user_count` via SECURITY DEFINER, dus betrouwbaar voor anon).
 * - `snapshot`: identieke shape als het interne dashboard
 *   (`buildDashboardSnapshot`), zodat slide-componenten herbruikbaar zijn.
 *   Wordt server-side opgebouwd uit anon-leesbare aggregaat-kolommen op
 *   `registrations` + categorie-/interventie-/team-rijen.
 * - `timeseries`: weekreeks via `buildWeeklyTimeseries` (CO2 cumulatief in de
 *   chart zelf).
 * - `recentRegistrations`: laatste N registraties met intervention-/team-
 *   labels, notitie en foto-URL. Foto's krijgen een service-role signed URL;
 *   de bucket blijft niet-publiek.
 */
export async function getPublicDashboardBySlug(
  supabase: SupabaseServerClient,
  slug: string,
  options: { period?: DashboardPeriod; recentLimit?: number } = {},
): Promise<PublicDashboardData | null> {
  const period = options.period ?? "all";
  const recentLimit = options.recentLimit ?? DEFAULT_RECENT_LIMIT;

  const { data: totals } = await supabase
    .from("public_dashboard_totals")
    .select("*")
    .eq("share_slug", slug)
    .maybeSingle();

  if (!totals?.org_id) {
    return null;
  }

  const orgId = totals.org_id;

  const [
    { data: teamRows },
    { data: categoryRows },
    { data: interventionRows },
    { data: registrationRows },
    { data: recentRows },
  ] = await Promise.all([
    supabase.from("teams").select("id, name").eq("org_id", orgId).eq("is_archived", false),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("org_id", orgId)
      .eq("is_archived", false),
    supabase
      .from("interventions")
      .select("id, name, category_id")
      .eq("org_id", orgId)
      .eq("is_archived", false),
    // Anon mag alleen aggregate-kolommen op registrations (zie 0001_init.sql).
    // user_id is bewust niet whitelisted; we gebruiken het ID als surrogate
    // voor de snapshot-builder en overschrijven `activeUserCount` met de
    // betrouwbare waarde uit de totals-view.
    supabase
      .from("registrations")
      .select(
        "id, team_id, intervention_id, quantity, social_quantity, happened_on, co2_kg_cached, social_score_cached",
      )
      .eq("org_id", orgId),
    supabase
      .from("public_recent_registrations")
      .select("*")
      .eq("share_slug", slug)
      .order("happened_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(recentLimit),
  ]);

  const teams = (teamRows ?? []).map((team) => ({ id: team.id, name: team.name }));
  const categories = (categoryRows ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
  }));
  const interventions = (interventionRows ?? []).map((intervention) => ({
    id: intervention.id,
    name: intervention.name,
    categoryId: intervention.category_id,
  }));

  const allRegistrations = (registrationRows ?? [])
    .filter((row) => row.team_id && row.intervention_id)
    .map((row) => ({
      teamId: row.team_id,
      interventionId: row.intervention_id,
      // Surrogate user id: anon kan user_id niet lezen, en we hebben hem niet
      // nodig voor snapshot-aggregaten. activeUserCount overschrijven we hieronder
      // met de SECURITY-DEFINER-gestelde waarde uit de totals-view.
      userId: row.id,
      co2KgCached: Number(row.co2_kg_cached ?? 0),
      socialScoreCached: Number(row.social_score_cached ?? 0),
      happenedOn: row.happened_on,
    }));

  const filteredRegistrations = filterRegistrationsByPeriod(allRegistrations, { period });

  const snapshot = buildDashboardSnapshot({
    baselineKg: totals.eod_baseline_kg ?? null,
    categories,
    interventions,
    teams,
    registrations: filteredRegistrations.map((registration) => ({
      teamId: registration.teamId,
      interventionId: registration.interventionId,
      userId: registration.userId,
      co2KgCached: registration.co2KgCached,
      socialScoreCached: registration.socialScoreCached,
    })),
  });
  snapshot.activeUserCount = Number(totals.active_user_count ?? 0);

  const timeseries = buildWeeklyTimeseries(allRegistrations, { period });

  const photoPaths = (recentRows ?? [])
    .map((row) => row.photo_path)
    .filter((path): path is string => Boolean(path));
  const photoUrls = await resolvePublicPhotoUrls(photoPaths);

  const recentRegistrations: RegistrationCardData[] = (recentRows ?? []).map((row) => ({
    id: row.registration_id ?? "",
    interventionLabel: row.intervention_name ?? "Onbekende activiteit",
    quantity: Number(row.quantity ?? 0),
    socialQuantity: Number(row.social_quantity ?? 0),
    ecoUnit: row.intervention_eco_unit ?? null,
    socialUnit: row.intervention_social_unit ?? null,
    note: row.note,
    photoUrl: row.photo_path ? (photoUrls.get(row.photo_path) ?? null) : null,
    teamLabel: row.team_name ?? "Onbekend team",
    categoryName: row.category_name,
    categoryColor: row.category_color,
    co2KgCached: Number(row.co2_kg_cached ?? 0),
    socialScoreCached: Number(row.social_score_cached ?? 0),
    happenedOn: row.happened_on ?? "",
  }));

  return { totals, snapshot, timeseries, recentRegistrations };
}

/**
 * Maakt voor een lijst storage-paden in één batch signed URLs aan via de
 * service-role-client. Bedoeld voor anon-surfaces die geen directe storage-
 * toegang hebben — de bucket zelf blijft niet-publiek.
 */
async function resolvePublicPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return new Map();

  const admin = createServiceRoleClient();
  const { data, error } = await admin.storage
    .from(REGISTRATIONS_BUCKET)
    .createSignedUrls(unique, PUBLIC_PHOTO_SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("[public-dashboard] createSignedUrls failed:", error.message);
    return new Map();
  }

  const byPath = new Map<string, string>();
  for (const entry of data ?? []) {
    if (entry?.path && entry.signedUrl) {
      byPath.set(entry.path, entry.signedUrl);
    }
  }
  return byPath;
}
