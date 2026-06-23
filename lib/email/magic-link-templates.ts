import { LOGIN_OTP_LENGTH } from "@/lib/auth/login-otp";
import { EMAIL_BRAND } from "@/lib/email/brand-tokens";
import {
  emailButton,
  emailDivider,
  emailFinePrint,
  emailHeading,
  emailOtpBlock,
  emailParagraph,
  escapeHtml,
  wrapEmailLayout,
} from "@/lib/email/email-layout";

export type MagicLinkEmailKind = "login" | "org_admin_invite" | "member_invite";

export type MagicLinkEmailContent = {
  html: string;
  subject: string;
  text: string;
};

type MagicLinkTemplateInput = {
  actionLink: string;
  emailOtp?: string;
  kind: MagicLinkEmailKind;
  orgName?: string;
};

const FINE_PRINT =
  "Link en code werken eenmalig en verlopen na een uur. Heb je deze mail niet aangevraagd? Negeer hem dan.";

export function buildMagicLinkEmailContent(input: MagicLinkTemplateInput): MagicLinkEmailContent {
  const { actionLink, emailOtp, kind, orgName } = input;

  if (kind === "login") {
    const otpLabel = `${LOGIN_OTP_LENGTH}-cijferige code`;
    const htmlBody = [
      emailHeading("Inloggen", true),
      emailParagraph(
        "Je bent één stap verwijderd van het Eco-sociaal Dashboard. Klik op de knop hieronder, of vul de code in op de loginpagina.",
        true,
      ),
      emailButton(actionLink, "Inloggen"),
      emailOtp ? emailDivider("of gebruik je code") + emailOtpBlock(emailOtp, otpLabel) : "",
      emailFinePrint(FINE_PRINT),
    ].join("");

    return {
      subject: `Inloggen op ${EMAIL_BRAND.productName}`,
      text: buildPlainText({
        actionLink,
        emailOtp,
        intro:
          "Je bent één stap verwijderd van het Eco-sociaal Dashboard. Klik op de link hieronder, of vul de code in op de loginpagina.",
        otpLabel,
        title: "Inloggen",
      }),
      html: wrapEmailLayout({
        title: "Inloggen",
        preheader: "Je loginlink en code voor het Eco-sociaal Dashboard",
        body: htmlBody,
      }),
    };
  }

  const safeOrgName = orgName ?? "je organisatie";

  if (kind === "org_admin_invite") {
    const htmlBody = [
      emailHeading("Admin-uitnodiging"),
      emailParagraph(
        `Je bent uitgenodigd als admin van <strong style="color:${EMAIL_BRAND.foreground};">${escapeHtml(safeOrgName)}</strong>.`,
      ),
      emailButton(actionLink, "Account activeren"),
      emailFinePrint("Deze link werkt eenmalig en verloopt na een uur."),
    ].join("");

    return {
      subject: `Je bent admin van ${safeOrgName}`,
      text: buildPlainText({
        actionLink,
        intro: `Je bent uitgenodigd als admin van ${safeOrgName} in het ${EMAIL_BRAND.productName}.`,
        title: "Admin-uitnodiging",
      }),
      html: wrapEmailLayout({
        title: "Admin-uitnodiging",
        preheader: `Admin-uitnodiging voor ${safeOrgName}`,
        body: htmlBody,
      }),
    };
  }

  const htmlBody = [
    emailHeading("Uitnodiging"),
    emailParagraph(
      `Je bent toegevoegd aan <strong style="color:${EMAIL_BRAND.foreground};">${escapeHtml(safeOrgName)}</strong> in het ${EMAIL_BRAND.productName}.`,
    ),
    emailButton(actionLink, "Inloggen"),
    emailFinePrint("Deze link werkt eenmalig en verloopt na een uur."),
  ].join("");

  return {
    subject: `Uitnodiging voor ${safeOrgName}`,
    text: buildPlainText({
      actionLink,
      intro: `Je bent toegevoegd aan ${safeOrgName}. Klik op de link hieronder om in te loggen.`,
      title: "Uitnodiging",
    }),
    html: wrapEmailLayout({
      title: "Uitnodiging",
      preheader: `Uitnodiging voor ${safeOrgName}`,
      body: htmlBody,
    }),
  };
}

function buildPlainText(input: {
  actionLink: string;
  emailOtp?: string;
  intro: string;
  otpLabel?: string;
  title: string;
}): string {
  return [
    input.title,
    "",
    input.intro,
    "",
    input.actionLink,
    ...(input.emailOtp && input.otpLabel
      ? ["", `${input.otpLabel}: ${input.emailOtp.replace(/\D/g, "")}`]
      : []),
    "",
    FINE_PRINT,
  ].join("\n");
}
