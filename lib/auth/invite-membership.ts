import "server-only";

import type { User } from "@supabase/supabase-js";

import {
  type OrgInviteIntent,
  PENDING_ORG_ROLE,
  PENDING_ORG_SLUG,
  PENDING_TEAM_ID,
  parsePendingInviteIntent,
} from "@/lib/auth/invite-membership-intent";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type { OrgInviteIntent } from "@/lib/auth/invite-membership-intent";
export { parsePendingInviteIntent } from "@/lib/auth/invite-membership-intent";

type SupabaseAdmin = ReturnType<typeof createServiceRoleClient>;

/** Stamps invite intent on the auth user so first login can repair partial provisioning. */
export async function stampPendingInviteMetadata(intent: OrgInviteIntent): Promise<void> {
  const admin = createServiceRoleClient();
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(intent.userId);
  if (userError) {
    throw new Error(userError.message);
  }

  const existingMeta = userData.user?.user_metadata ?? {};
  const { error } = await admin.auth.admin.updateUserById(intent.userId, {
    user_metadata: {
      ...existingMeta,
      [PENDING_ORG_SLUG]: intent.orgSlug,
      [PENDING_ORG_ROLE]: intent.role,
      [PENDING_TEAM_ID]: intent.teamId ?? null,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
}

/** Upserts org + team membership for an invited user (service role, idempotent). */
export async function upsertOrgMembership(intent: OrgInviteIntent): Promise<void> {
  const admin = createServiceRoleClient();

  const { error: membershipError } = await admin.from("memberships").upsert(
    {
      org_id: intent.orgId,
      user_id: intent.userId,
      role: intent.role,
    },
    { onConflict: "org_id,user_id" },
  );
  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (intent.role === "worker" && intent.teamId) {
    await ensureTeamMembership(admin, intent.orgId, intent.userId, intent.teamId);
  }
}

/** Provision invite: stamp metadata first, then persist membership rows. */
export async function provisionOrgInvite(intent: OrgInviteIntent): Promise<void> {
  await stampPendingInviteMetadata(intent);
  await upsertOrgMembership(intent);
}

/**
 * On first login after an invite, ensure membership rows exist even when
 * provisioning partially failed before the mail was sent.
 */
export async function syncInviteMembershipFromAuthUser(
  user: Pick<User, "id" | "user_metadata">,
): Promise<void> {
  const intent = await resolvePendingInviteIntent(user);
  if (!intent) return;

  try {
    await upsertOrgMembership(intent);
    await clearPendingInviteMetadata(user.id, user.user_metadata ?? {});
  } catch (error) {
    console.error("syncInviteMembershipFromAuthUser error:", error);
  }
}

export async function resolvePendingInviteIntent(
  user: Pick<User, "id" | "user_metadata">,
): Promise<OrgInviteIntent | null> {
  const parsed = parsePendingInviteIntent(user);
  if (!parsed) return null;

  const admin = createServiceRoleClient();
  const { data: org, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", parsed.orgSlug)
    .maybeSingle();
  if (error || !org) return null;

  return { ...parsed, orgId: org.id };
}

async function ensureTeamMembership(
  admin: SupabaseAdmin,
  orgId: string,
  userId: string,
  teamId: string,
): Promise<void> {
  const { data: existing, error: lookupError } = await admin
    .from("team_memberships")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .maybeSingle();
  if (lookupError) {
    throw new Error(lookupError.message);
  }
  if (existing) return;

  const { error: insertError } = await admin.from("team_memberships").insert({
    org_id: orgId,
    user_id: userId,
    team_id: teamId,
  });
  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function clearPendingInviteMetadata(
  userId: string,
  existingMeta: Record<string, unknown>,
): Promise<void> {
  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existingMeta,
      [PENDING_ORG_SLUG]: null,
      [PENDING_ORG_ROLE]: null,
      [PENDING_TEAM_ID]: null,
    },
  });
  if (error) {
    console.error("clearPendingInviteMetadata error:", error.message);
  }
}
