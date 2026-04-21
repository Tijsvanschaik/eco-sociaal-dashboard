import { getDefaultAuthedPath } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// Code-exchange endpoint for Supabase magic-link flows. Supabase redirects
// the user here after they click the login link in their email.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=code_exchange`);
  }

  // Prefer the explicit `next` hop (where the user was heading before login).
  if (next) {
    const nextUrl = new URL(next, origin);
    if (nextUrl.origin === origin) {
      return NextResponse.redirect(nextUrl);
    }
  }

  const nextPath = await getDefaultAuthedPath(supabase);
  if (nextPath) {
    return NextResponse.redirect(new URL(nextPath, origin));
  }

  return NextResponse.redirect(`${origin}/`);
}
