import { createServiceRoleClient } from "@/lib/supabase/server";

export async function findOrCreateUserId(email: string) {
  const admin = createServiceRoleClient();
  const normalizedEmail = email.trim().toLowerCase();

  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(error.message);
    }

    const existing = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (existing) return existing.id;

    if (data.users.length < 200) break;
    page += 1;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "Gebruiker kon niet worden aangemaakt.");
  }

  return data.user.id;
}
