import { syncInviteMembershipFromAuthUser } from "@/lib/auth/invite-membership";
import { getDefaultAuthedPath } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function isEmailOtpType(value: string): value is EmailOtpType {
  return OTP_TYPES.has(value as EmailOtpType);
}

async function redirectAfterAuth(
  requestOrigin: string,
  next: string | null,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<NextResponse> {
  if (next) {
    const nextUrl = new URL(next, requestOrigin);
    if (nextUrl.origin === requestOrigin) {
      return NextResponse.redirect(nextUrl);
    }
  }

  const nextPath = await getDefaultAuthedPath(supabase);
  if (nextPath) {
    return NextResponse.redirect(new URL(nextPath, requestOrigin));
  }

  return NextResponse.redirect(`${requestOrigin}/`);
}

async function syncSessionInviteMembership(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await syncInviteMembershipFromAuthUser(user);
  }
}

// Handles magic-link confirmation for both PKCE (`code`) and admin.generateLink
// (`token_hash`) flows.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const next = searchParams.get("next");

  const supabase = await createClient();

  if (tokenHash && otpType && isEmailOtpType(otpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) {
      console.error("verifyOtp error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=code_exchange`);
    }
    await syncSessionInviteMembership(supabase);
    return redirectAfterAuth(origin, next, supabase);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=code_exchange`);
    }
    await syncSessionInviteMembership(supabase);
    return redirectAfterAuth(origin, next, supabase);
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
