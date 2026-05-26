import { createServiceRoleClient } from "@/lib/supabase/server";

/** Resolve auth user e-mails for a set of user IDs (admin/server only). */
export async function getEmailMap(userIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return new Map();

  const admin = createServiceRoleClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const emails = new Map<string, string>();
  for (const user of data.users) {
    if (uniqueIds.includes(user.id) && user.email) {
      emails.set(user.id, user.email);
    }
  }
  return emails;
}
