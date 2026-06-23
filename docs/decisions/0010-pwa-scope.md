---
Status: accepted
Datum: 2026-06-23
---

# ADR 0010: PWA-scope (manifest + service worker)

## Context

Medewerkers registreren eco-sociale activiteiten vooral op de telefoon. Een
installeerbare webapp (Add to Home Screen) maakt terugkerend gebruik sneller en
app-achtiger, zonder een native app te onderhouden.

In ADR 0002 is PWA bewust uit Fase 0 gehouden. Stream 7 van Fase 6 bracht PWA
terug op de backlog.

## Beslissing

### Scope v1

- **Installeerbaar** via Web App Manifest (`app/manifest.ts`) en PNG-icons
  (192 / 512 / maskable) gegenereerd uit `public/icons/icon.svg`.
- **Service worker** via `@serwist/next` + `serwist`, alleen in production
  builds (`disable` in development).
- **Caching**: Serwist `defaultCache` voor statische Next.js-assets en
  navigatie; **network-first** voor dynamische data (Supabase blijft
  online-first).
- **Offline fallback**: `/~offline` voor document-navigatie zonder netwerk.
  Geen offline registratie of sync in v1.
- **Doelgroep-routes**: tenant-app `(app)/[orgSlug]/*` + `/login`. Kiosk
  (`/tv`, `/embed`) en publieke share (`/p`) blijven gewone webpagina's; geen
  install-hint daar.
- **Install-hint**: zachte banner in `TenantAppShell` na ≥2 mobiele bezoeken,
  dismissible via `localStorage`. Android: `beforeinstallprompt`; iOS: instructie
  Deel → Zet op beginscherm.
- **Update-UX**: toast “Nieuwe versie beschikbaar” wanneer een wachtende SW
  klaarstaat; gebruiker kiest zelf om te verversen (`skipWaiting: false`).

### Buiten scope v1

- Offline activiteit-registratie + background sync
- Push-notificaties
- Org-specifieke manifest (naam/icon per tenant)
- PWA voor TV/embed/share surfaces

### Technische keuzes

| Onderdeel | Keuze |
| --- | --- |
| Integratie | `@serwist/next` (Workbox-successor, Next 15-compatibel) |
| Manifest | `app/manifest.ts` (Next Metadata Route API) |
| SW-bron | `app/sw.ts` → build output `public/sw.js` (gitignored) |
| Registratie | `SerwistProvider` in root layout |
| Middleware | `sw.js` / `swe-worker-*.js` uitgesloten van auth middleware |

## Gevolgen

+ Medewerkers kunnen de app op het startscherm zetten; herhaalde registratie
  voelt sneller door asset-caching.
+ Geen extra native codebase of app-store distributie.
+ Security-model ongewijzigd: auth + RLS blijven server-side; SW cached geen
  persoonsgegevens bewust.
- Service worker vereist HTTPS (Vercel production); lokaal alleen via
  `npm run build && npm run start`.
- Icon-generatie vereist `npm run pwa:icons` (sharp) na wijziging van
  `public/icons/icon.svg`; PNG's worden wel gecommit.

## Later (v2)

- Offline draft-registraties (IndexedDB) + sync bij reconnect
- Org-specifieke `short_name` / theme uit org-profiel
- Lighthouse CI gate op “installable”
