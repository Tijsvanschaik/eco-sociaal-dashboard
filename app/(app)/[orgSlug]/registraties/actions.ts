"use server";

import { calculateCo2, calculateSocialScore } from "@/lib/impact";
import { getOrgContextBySlug } from "@/lib/organizations";
import { cleanupStoragePhoto } from "@/lib/registrations/photo-upload";
import { registrationUpdateFromFormData } from "@/lib/registrations/schema";
import { revalidateOrgPaths } from "@/lib/revalidate-org-paths";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const paramsSchema = z.object({
  orgSlug: z.string().min(1),
  registrationId: z.string().uuid(),
});

export type MutationResult =
  | { message: string; status: "error" }
  | { message: string; status: "ok" };

export async function updateRegistration(
  orgSlugInput: string,
  registrationIdInput: string,
  formData: FormData,
): Promise<MutationResult> {
  try {
    const { orgSlug, registrationId } = paramsSchema.parse({
      orgSlug: orgSlugInput,
      registrationId: registrationIdInput,
    });
    const input = registrationUpdateFromFormData(formData);
    if (input.registrationId !== registrationId) {
      return { status: "error", message: "Registratie-id komt niet overeen." };
    }

    const supabase = await createClient();
    const context = await getOrgContextBySlug(supabase, orgSlug);
    if (!context) {
      return { status: "error", message: "Je sessie is verlopen. Log opnieuw in." };
    }

    if (input.photoPath && !input.photoPath.startsWith(`${context.org.id}/`)) {
      return { status: "error", message: "Foto hoort niet bij deze organisatie." };
    }

    const { data: existing } = await supabase
      .from("registrations")
      .select("id, photo_path")
      .eq("id", registrationId)
      .eq("org_id", context.org.id)
      .maybeSingle();
    if (!existing) {
      await cleanupStoragePhoto(supabase, input.photoPath);
      return { status: "error", message: "Registratie niet gevonden." };
    }

    const { data: intervention } = await supabase
      .from("interventions")
      .select("id, co2_factor_kg, social_score_factor")
      .eq("org_id", context.org.id)
      .eq("id", input.interventionId)
      .eq("is_archived", false)
      .maybeSingle();
    if (!intervention) {
      await cleanupStoragePhoto(supabase, input.photoPath);
      return { status: "error", message: "Deze activiteit is niet meer beschikbaar." };
    }

    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("org_id", context.org.id)
      .eq("id", input.teamId)
      .eq("is_archived", false)
      .maybeSingle();
    if (!team) {
      await cleanupStoragePhoto(supabase, input.photoPath);
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
        await cleanupStoragePhoto(supabase, input.photoPath);
        return { status: "error", message: "Je mag alleen registreren voor je eigen team." };
      }
    }

    const co2KgCached = calculateCo2(input.quantity, intervention.co2_factor_kg);
    const socialScoreCached = calculateSocialScore(
      input.socialQuantity,
      intervention.social_score_factor,
    );
    const note = input.note?.trim() ? input.note : null;
    const newPhotoPath = input.photoPath ?? null;

    const { data: updated, error } = await supabase
      .from("registrations")
      .update({
        team_id: input.teamId,
        intervention_id: input.interventionId,
        quantity: input.quantity,
        social_quantity: input.socialQuantity,
        happened_on: input.happenedOn,
        note,
        photo_path: newPhotoPath,
        co2_kg_cached: co2KgCached,
        social_score_cached: socialScoreCached,
      })
      .eq("id", registrationId)
      .eq("org_id", context.org.id)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      await cleanupStoragePhoto(supabase, input.photoPath);
      return {
        status: "error",
        message: error
          ? `Opslaan geweigerd door database: ${error.message}`
          : "Je mag deze registratie niet bewerken.",
      };
    }

    const previousPhotoPath = existing.photo_path;
    if (previousPhotoPath && previousPhotoPath !== newPhotoPath) {
      await cleanupStoragePhoto(supabase, previousPhotoPath);
    }

    revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
    return { status: "ok", message: "Registratie bijgewerkt." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        message: error.issues[0]?.message ?? "Ongeldige invoer.",
      };
    }
    console.error("updateRegistration unexpected error:", error);
    return { status: "error", message: "Er ging iets mis. Probeer het opnieuw." };
  }
}

export async function deleteRegistration(
  orgSlugInput: string,
  registrationIdInput: string,
): Promise<MutationResult> {
  try {
    const { orgSlug, registrationId } = paramsSchema.parse({
      orgSlug: orgSlugInput,
      registrationId: registrationIdInput,
    });

    const supabase = await createClient();
    const context = await getOrgContextBySlug(supabase, orgSlug);
    if (!context) {
      return { status: "error", message: "Je sessie is verlopen. Log opnieuw in." };
    }

    const { data: existing } = await supabase
      .from("registrations")
      .select("id, photo_path")
      .eq("id", registrationId)
      .eq("org_id", context.org.id)
      .maybeSingle();
    if (!existing) {
      return { status: "error", message: "Registratie niet gevonden." };
    }

    const { data: deleted, error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", registrationId)
      .eq("org_id", context.org.id)
      .select("id")
      .maybeSingle();

    if (error || !deleted) {
      return {
        status: "error",
        message: error
          ? `Verwijderen geweigerd door database: ${error.message}`
          : "Je mag deze registratie niet verwijderen.",
      };
    }

    await cleanupStoragePhoto(supabase, existing.photo_path);
    revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
    return { status: "ok", message: "Registratie verwijderd." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        message: error.issues[0]?.message ?? "Ongeldige invoer.",
      };
    }
    console.error("deleteRegistration unexpected error:", error);
    return { status: "error", message: "Er ging iets mis. Probeer het opnieuw." };
  }
}
