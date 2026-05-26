import { getOrgContextBySlug } from "@/lib/organizations";
import { REGISTRATIONS_BUCKET } from "@/lib/registrations/photo-upload";
import type { RegistrationInput } from "@/lib/registrations/schema";
import type { createClient } from "@/lib/supabase/server";
import type { InterventionOption, TeamOption } from "@/lib/tenant-dashboard-data";

const PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type TenantRegistrationEditData = {
  context: NonNullable<Awaited<ReturnType<typeof getOrgContextBySlug>>>;
  initialPhotoUrl: string | null;
  initialValues: RegistrationInput;
  interventions: InterventionOption[];
  registrationId: string;
  teams: TeamOption[];
};

export async function getTenantRegistrationEditData(
  supabase: SupabaseServerClient,
  orgSlug: string,
  registrationId: string,
): Promise<TenantRegistrationEditData | null> {
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) return null;

  const { data: registration } = await supabase
    .from("registrations")
    .select(
      "id, user_id, team_id, intervention_id, quantity, social_quantity, happened_on, note, photo_path",
    )
    .eq("id", registrationId)
    .eq("org_id", context.org.id)
    .maybeSingle();

  if (!registration) return null;

  const [{ data: teams }, { data: categories }, { data: interventions }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name")
      .eq("org_id", context.org.id)
      .eq("is_archived", false)
      .order("name"),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
    supabase
      .from("interventions")
      .select("id, name, eco_unit, social_unit, co2_factor_kg, social_score_factor, category_id")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
  ]);

  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category]));
  const interventionRows: InterventionOption[] = (interventions ?? []).map((intervention) => {
    const category = categoryMap.get(intervention.category_id);
    return {
      id: intervention.id,
      name: intervention.name,
      ecoUnit: intervention.eco_unit,
      socialUnit: intervention.social_unit,
      factorKg: intervention.co2_factor_kg,
      socialScoreFactor: Number(intervention.social_score_factor ?? 0),
      categoryName: category?.name ?? "Onbekende categorie",
      categoryColor: category?.color ?? null,
      categoryId: intervention.category_id,
    };
  });

  let initialPhotoUrl: string | null = null;
  if (registration.photo_path) {
    const { data } = await supabase.storage
      .from(REGISTRATIONS_BUCKET)
      .createSignedUrl(registration.photo_path, PHOTO_SIGNED_URL_TTL_SECONDS);
    initialPhotoUrl = data?.signedUrl ?? null;
  }

  return {
    context,
    registrationId: registration.id,
    teams: teams ?? [],
    interventions: interventionRows,
    initialPhotoUrl,
    initialValues: {
      teamId: registration.team_id,
      interventionId: registration.intervention_id,
      quantity: registration.quantity,
      socialQuantity: Number(registration.social_quantity ?? 0),
      happenedOn: registration.happened_on,
      note: registration.note ?? undefined,
      photoPath: registration.photo_path ?? undefined,
    },
  };
}
