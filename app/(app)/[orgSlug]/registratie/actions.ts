"use server";

import { calculateCo2 } from "@/lib/impact";
import { getOrgContextBySlug } from "@/lib/organizations";
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

    const { data: intervention } = await supabase
      .from("interventions")
      .select("id, co2_factor_kg")
      .eq("org_id", context.org.id)
      .eq("id", input.interventionId)
      .eq("is_archived", false)
      .maybeSingle();
    if (!intervention) {
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
        return { status: "error", message: "Je mag alleen registreren voor je eigen team." };
      }
    }

    const co2KgCached = calculateCo2(input.quantity, intervention.co2_factor_kg);
    const note = input.note?.trim() ? input.note : null;

    const { error } = await supabase.from("registrations").insert({
      org_id: context.org.id,
      team_id: input.teamId,
      intervention_id: input.interventionId,
      user_id: context.userId,
      quantity: input.quantity,
      happened_on: input.happenedOn,
      note,
      co2_kg_cached: co2KgCached,
    });

    if (error) {
      console.error("createRegistration error:", error.message);
      return { status: "error", message: "Opslaan lukte niet. Probeer het opnieuw." };
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
