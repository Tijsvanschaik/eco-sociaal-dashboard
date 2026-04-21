import { createServiceRoleClient } from "@/lib/supabase/server";

export async function findOrCreateUserId(email: string) {
  const admin = createServiceRoleClient();
  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "Gebruiker kon niet worden aangemaakt.");
  }

  return data.user.id;
}
