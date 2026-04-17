import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Auth gate for all /(app)/* routes. Unauthenticated users are redirected to /login.
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="min-h-dvh">{children}</div>;
}
