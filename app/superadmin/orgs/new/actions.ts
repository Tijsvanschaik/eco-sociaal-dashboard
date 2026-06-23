"use server";

import { createOrgSchema } from "@/lib/admin-schema";
import { findOrCreateUserId } from "@/lib/admin-users";
import { provisionOrgInvite } from "@/lib/auth/invite-membership";
import { checkInviteRateLimit } from "@/lib/auth/invite-rate-limit";
import { sendMagicLinkEmail } from "@/lib/auth/send-magic-link-email";
import { isCurrentUserSuperadmin } from "@/lib/organizations";
import { revalidateOrgPaths } from "@/lib/revalidate-org-paths";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export type CreateOrganizationAndInviteResult =
  | { message: string; orgId: string; status: "ok" }
  | { message: string; status: "error" };

export async function createOrganizationAndInviteAdmin(
  formData: FormData,
): Promise<CreateOrganizationAndInviteResult> {
  const supabase = await createClient();
  if (!(await isCurrentUserSuperadmin(supabase))) {
    return { status: "error", message: "Alleen superadmins mogen organisaties aanmaken." };
  }

  const input = createOrgSchema.safeParse({
    orgName: formData.get("orgName"),
    orgSlug: formData.get("orgSlug"),
    adminEmail: formData.get("adminEmail"),
  });
  if (!input.success) {
    return {
      status: "error",
      message: input.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const rateLimit = await checkInviteRateLimit(input.data.adminEmail, input.data.orgSlug);
  if (!rateLimit.allowed) {
    return { status: "error", message: rateLimit.message };
  }

  const admin = createServiceRoleClient();
  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: input.data.orgName,
      slug: input.data.orgSlug,
      public_share_enabled: false,
      public_share_slug: null,
    })
    .select("id, slug")
    .single();
  if (orgError || !organization) {
    console.error("createOrganization error:", orgError?.message);
    return {
      status: "error",
      message:
        orgError?.code === "23505"
          ? "Deze slug bestaat al. Kies een andere organisatienaam of slug."
          : "Organisatie aanmaken lukte niet.",
    };
  }

  try {
    const userId = await findOrCreateUserId(input.data.adminEmail);

    await provisionOrgInvite({
      orgId: organization.id,
      orgSlug: organization.slug,
      role: "admin",
      userId,
    });

    const inviteResult = await sendMagicLinkEmail({
      email: input.data.adminEmail,
      kind: "org_admin_invite",
      orgName: input.data.orgName,
      redirectPath: `/${organization.slug}/dashboard`,
    });
    if (!inviteResult.ok) {
      console.error("createOrganization invite error:", inviteResult.reason);
      revalidateOrgPaths(organization.slug, null);
      return {
        status: "ok",
        orgId: organization.id,
        message: "Organisatie is aangemaakt, maar de magic-link kon niet worden verstuurd.",
      };
    }

    revalidateOrgPaths(organization.slug, null);
    return {
      status: "ok",
      orgId: organization.id,
      message: "Organisatie aangemaakt en admin-uitnodiging verstuurd.",
    };
  } catch (error) {
    console.error("createOrganizationAndInviteAdmin unexpected error:", error);
    return {
      status: "error",
      message: "Organisatie is aangemaakt, maar de uitnodiging kon niet volledig worden afgerond.",
    };
  }
}
