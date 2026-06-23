import { EMAIL_BRAND, getEmailLogoUrl } from "@/lib/email/brand-tokens";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type EmailLayoutInput = {
  body: string;
  preheader?: string;
  title: string;
};

export function wrapEmailLayout(input: EmailLayoutInput): string {
  const logoUrl = escapeHtml(getEmailLogoUrl());
  const preheader = input.preheader
    ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(input.preheader)}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(input.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_BRAND.background};">
  ${preheader}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${EMAIL_BRAND.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:${EMAIL_BRAND.card};border-radius:${EMAIL_BRAND.radiusLg};box-shadow:${EMAIL_BRAND.shadow};overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 0;font-family:${EMAIL_BRAND.fontFamily};">
              <img src="${logoUrl}" alt="${escapeHtml(EMAIL_BRAND.productName)}" width="168" height="36" style="display:block;height:36px;width:auto;max-width:168px;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px;font-family:${EMAIL_BRAND.fontFamily};color:${EMAIL_BRAND.foreground};font-size:16px;line-height:1.6;">
              ${input.body}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-family:${EMAIL_BRAND.fontFamily};">
              <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.mutedForeground};">
                ${EMAIL_BRAND.productName} · Created for the Future
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailHeading(text: string, centered = false): string {
  const align = centered ? "text-align:center;" : "";
  return `<h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_BRAND.foreground};${align}">${escapeHtml(text)}</h1>`;
}

export function emailParagraph(text: string, centered = false): string {
  const align = centered ? "text-align:center;" : "";
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.mutedForeground};${align}">${text}</p>`;
}

export function emailButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 24px;">
    <tr>
      <td align="center" style="border-radius:${EMAIL_BRAND.radiusFull};background-color:${EMAIL_BRAND.primary};">
        <a href="${safeHref}" style="display:block;width:100%;padding:14px 28px;font-family:${EMAIL_BRAND.fontFamily};font-size:16px;font-weight:700;line-height:1;color:${EMAIL_BRAND.primaryForeground};text-decoration:none;border-radius:${EMAIL_BRAND.radiusFull};text-align:center;box-sizing:border-box;">${safeLabel}</a>
      </td>
    </tr>
  </table>`;
}

export function emailDivider(label: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 20px;">
    <tr>
      <td style="border-top:1px solid ${EMAIL_BRAND.border};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <tr>
      <td align="center" style="padding-top:12px;font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedForeground};text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(label)}</td>
    </tr>
  </table>`;
}

export function emailOtpBlock(emailOtp: string, label: string): string {
  const safeOtp = escapeHtml(emailOtp.replace(/\D/g, ""));
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
    <tr>
      <td align="center" style="padding:20px 16px;background-color:${EMAIL_BRAND.primaryContainer};border-radius:${EMAIL_BRAND.radiusMd};">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${EMAIL_BRAND.onPrimaryContainer};">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:32px;line-height:1;font-weight:800;letter-spacing:0.24em;color:${EMAIL_BRAND.onPrimaryContainer};font-family:${EMAIL_BRAND.fontFamily};">${safeOtp}</p>
      </td>
    </tr>
  </table>`;
}

export function emailFinePrint(text: string): string {
  return `<p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.mutedForeground};">${text}</p>`;
}

export { escapeHtml };
