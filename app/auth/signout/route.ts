import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Sign out the current user and bounce to /login.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
