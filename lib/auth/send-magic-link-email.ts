import "server-only";

import { buildAuthCallbackUrl, buildMagicLinkConfirmUrl } from "@/lib/app-url";
import {
  type MagicLinkEmailKind,
  buildMagicLinkEmailContent,
} from "@/lib/email/magic-link-templates";
import { getServerEnv } from "@/lib/env";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export type SendMagicLinkEmailInput = {
  email: string;
  kind: MagicLinkEmailKind;
  orgName?: string;
  redirectPath?: string;
};

export type SendMagicLinkEmailResult =
  | { ok: true }
  | { ok: false; reason: "user_not_found" | "link_generation_failed" | "email_delivery_failed" };

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const { RESEND_API_KEY } = getServerEnv();
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Generates a Supabase magic link and delivers it via Resend. */
export async function sendMagicLinkEmail(
  input: SendMagicLinkEmailInput,
): Promise<SendMagicLinkEmailResult> {
  const email = normalizeEmail(input.email);
  const redirectTo = buildAuthCallbackUrl(input.redirectPath);
  const admin = createServiceRoleClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("user not found") || message.includes("not found")) {
      return { ok: false, reason: "user_not_found" };
    }
    console.error("sendMagicLinkEmail generateLink error:", error.message);
    return { ok: false, reason: "link_generation_failed" };
  }

  const actionLink = data.properties?.hashed_token
    ? buildMagicLinkConfirmUrl(data.properties.hashed_token, input.redirectPath)
    : data.properties?.action_link;
  if (!actionLink) {
    console.error("sendMagicLinkEmail: missing hashed_token in generateLink response");
    return { ok: false, reason: "link_generation_failed" };
  }

  const content = buildMagicLinkEmailContent({
    actionLink,
    emailOtp: input.kind === "login" ? data.properties?.email_otp : undefined,
    kind: input.kind,
    orgName: input.orgName,
  });

  const { RESEND_FROM, RESEND_REPLY_TO } = getServerEnv();
  const { error: sendError } = await getResendClient().emails.send({
    from: RESEND_FROM,
    to: email,
    replyTo: RESEND_REPLY_TO,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });

  if (sendError) {
    console.error("sendMagicLinkEmail resend error:", sendError.message);
    return { ok: false, reason: "email_delivery_failed" };
  }

  return { ok: true };
}
