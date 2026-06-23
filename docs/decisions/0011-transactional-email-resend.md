---
Status: accepted
Datum: 2026-06-23
---

# ADR 0011: Transactionele e-mail via Resend

## Context

Magic links en uitnodigingen liepen via Supabase Auth OTP + ingebouwde SMTP (~2
mails/uur). Daardoor was een wachtwoord-fallback nodig op `/login`. Voor
productie op `www.eco-sociaal.nl` is betrouwbare mail vereist.

## Beslissing

- **Resend** als mailprovider (`eco-sociaal.nl`, verified DKIM/SPF).
- Magic links worden gegenereerd via Supabase **`admin.generateLink`**
  (service role) en verstuurd met de **Resend API** + NL-templates.
- Callback-URL's gebruiken **`NEXT_PUBLIC_APP_URL`** (canoniek:
  `https://www.eco-sociaal.nl`), niet request headers.
- Drie flows: login, superadmin org-admin invite, org-admin member invite.
- Login: rate limit (IP + e-mail) + anti-enumeration (altijd `ok` naar client).
- Login fallback: 6-cijferige OTP uit `generateLink.email_otp` in mail + invoer op `/login`.
- Admin flows: tonen fout als mail niet verstuurd kon worden.

## Gevolgen

+ Geen Supabase SMTP-limiet meer; branded NL-mails.
+ Eén gedeelde helper (`lib/auth/send-magic-link-email.ts`).
- Extra env vars: `RESEND_API_KEY`, `RESEND_FROM` (+ optioneel `RESEND_REPLY_TO`).
- Rate limit is in-process (Vercel serverless); later Upstash/KV indien nodig.

## Configuratie

| Omgeving | `NEXT_PUBLIC_APP_URL` |
| --- | --- |
| Lokaal | `http://localhost:3000` |
| Productie | `https://www.eco-sociaal.nl` |

Supabase Site URL + redirect URLs moeten overeenkomen met bovenstaande callback.
