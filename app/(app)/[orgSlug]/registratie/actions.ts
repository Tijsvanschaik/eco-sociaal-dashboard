"use server";

import { calculateCo2, calculateSocialScore } from "@/lib/impact";
import { getOrgContextBySlug } from "@/lib/organizations";
import { REGISTRATIONS_BUCKET } from "@/lib/registrations/photo-upload";
import { registrationInputFromFormData } from "@/lib/registrations/schema";
import { revalidateOrgPaths } from "@/lib/revalidate-org-paths";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const paramsSchema = z.object({
  orgSlug: z.string().min(1),
});

export type CreateRegistrationResult =
  | { message: string; status: "error" }
  | { message: string; status: "ok" };

export async function createRegistration(
  orgSlugInput: string,
  formData: FormData,
): Promise<CreateRegistrationResult> {
  try {
    const { orgSlug } = paramsSchema.parse({ orgSlug: orgSlugInput });
    const input = registrationInputFromFormData(formData);
    const supabase = await createClient();
    const context = await getOrgContextBySlug(supabase, orgSlug);

    if (!context) {
      return { status: "error", message: "Je sessie is verlopen. Log opnieuw in." };
    }

    // De foto moet onder het org-pad staan (past bij RLS-policy
    // `registrations_storage_insert_member`). Als iemand rommelt met de
    // formData, hier afvangen.
    if (input.photoPath && !input.photoPath.startsWith(`${context.org.id}/`)) {
      return { status: "error", message: "Foto hoort niet bij deze organisatie." };
    }

    const { data: intervention } = await supabase
      .from("interventions")
      .select("id, co2_factor_kg, social_score_factor")
      .eq("org_id", context.org.id)
      .eq("id", input.interventionId)
      .eq("is_archived", false)
      .maybeSingle();
    if (!intervention) {
      await cleanupOrphanPhoto(supabase, input.photoPath);
      return { status: "error", message: "Deze interventie is niet meer beschikbaar." };
    }

    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("org_id", context.org.id)
      .eq("id", input.teamId)
      .eq("is_archived", false)
      .maybeSingle();
    if (!team) {
      await cleanupOrphanPhoto(supabase, input.photoPath);
      return { status: "error", message: "Dit team is niet meer beschikbaar." };
    }

    if (context.role !== "admin") {
      const { data: teamMembership } = await supabase
        .from("team_memberships")
        .select("id")
        .eq("org_id", context.org.id)
        .eq("team_id", input.teamId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (!teamMembership) {
        await cleanupOrphanPhoto(supabase, input.photoPath);
        return { status: "error", message: "Je mag alleen registreren voor je eigen team." };
      }
    }

    const co2KgCached = calculateCo2(input.quantity, intervention.co2_factor_kg);
    const socialScoreCached = calculateSocialScore(
      input.socialQuantity,
      intervention.social_score_factor,
    );
    const note = input.note?.trim() ? input.note : null;

    const { error } = await supabase.from("registrations").insert({
      org_id: context.org.id,
      team_id: input.teamId,
      intervention_id: input.interventionId,
      user_id: context.userId,
      quantity: input.quantity,
      social_quantity: input.socialQuantity,
      happened_on: input.happenedOn,
      note,
      photo_path: input.photoPath ?? null,
      co2_kg_cached: co2KgCached,
      social_score_cached: socialScoreCached,
    });

    if (error) {
      // Log concrete auth-context om RLS-falen te kunnen debuggen. We zien dan
      // of membership/role/team_membership matcht met wat de RLS-policy eist.
      const [{ data: membership }, { data: teamMembership }] = await Promise.all([
        supabase
          .from("memberships")
          .select("role")
          .eq("org_id", context.org.id)
          .eq("user_id", context.userId)
          .maybeSingle(),
        supabase
          .from("team_memberships")
          .select("id")
          .eq("org_id", context.org.id)
          .eq("team_id", input.teamId)
          .eq("user_id", context.userId)
          .maybeSingle(),
      ]);
      console.error("createRegistration error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        context: {
          orgId: context.org.id,
          userId: context.userId,
          teamId: input.teamId,
          contextRole: context.role,
          membershipRole: membership?.role ?? null,
          hasTeamMembership: Boolean(teamMembership),
          isSuperadmin: context.isSuperadmin,
        },
      });
      await cleanupOrphanPhoto(supabase, input.photoPath);
      return {
        status: "error",
        message: `Opslaan geweigerd door database: ${error.message}`,
      };
    }

    revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
    return { status: "ok", message: "Registratie opgeslagen." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        message: error.issues[0]?.message ?? "Ongeldige invoer.",
      };
    }

    console.error("createRegistration unexpected error:", error);
    return { status: "error", message: "Er ging iets mis. Probeer het opnieuw." };
  }
}

/**
 * Best-effort: verwijder een geüploade foto die bij een mislukte registratie
 * hoort, zodat we geen weesbestanden in Storage achterlaten. Fouten hier
 * worden alleen gelogd — de gebruiker krijgt al een nette foutmelding.
 */
async function cleanupOrphanPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | undefined,
) {
  if (!path) return;
  const { error } = await supabase.storage.from(REGISTRATIONS_BUCKET).remove([path]);
  if (error) {
    console.error("createRegistration orphan cleanup failed:", error.message);
  }
}
