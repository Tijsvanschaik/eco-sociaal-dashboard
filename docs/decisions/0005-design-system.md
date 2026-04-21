---
Status: accepted
Datum: 2026-04-21
---

# ADR 0005: Brand-foundation en design-system

## Context

Na fase 4 draaide de app functioneel op een groene default-palette die niet
bij de huisstijl van LEV/CFTF paste. De opdrachtgever levert ontwerpen aan via
Google Stitch: Material 3 tokens, magenta primary, Plus Jakarta Sans en
Material Symbols Outlined. We wilden die visuele identiteit platform-wijd
doortrekken zonder onze shadcn-componenten opnieuw te moeten bouwen.

## Beslissing

- We blijven op de **shadcn-tokenconventie** (`--primary`, `--muted`, `--card`,
  ...). Stitch' Material 3-namen (`on-surface-variant`, `surface-container-high`,
  etc.) mappen we naar onze tokens; we hebben ze niet naast elkaar.
- We breiden de tokenset uit waar Stitch iets toevoegt dat shadcn niet dekt:
  `--primary-dim`, `--primary-container`, `--tertiary`, `--chart-1..5`,
  `--radius-lg`, `--radius-xl`, `--surface-container-low`.
- **Plus Jakarta Sans** laden we via `next/font/google` met weights 400-800 en
  exposen we als `--font-plus-jakarta` → `--font-sans` in Tailwind.
- **Material Symbols Outlined** laden we via een `<link>` in de root layout
  (complexe variable-axes die `next/font` niet schoon dekt), en we wrappen
  gebruik in `<Icon />`.
- **Dark mode** plumbing via `next-themes` staat klaar (class-attribute,
  `defaultTheme: "light"`), maar zonder user-toggle of overgenomen dark
  Stitch-ontwerp. Dark tokens zijn pragmatisch afgeleid.
- We introduceren een **`brand` button-variant** (gradient + pill) voor de
  hoofd-CTA uit Stitch. Bestaande variants (`default`, `outline`, `ghost`,
  enz.) blijven onaangeroerd zodat Slices C-G niet op voorraad breken.
- We veranderen shadcn `Input`, `Card`, `Form`, `Chart` en `Label` niet in
  deze slice. Stitch-specifieke input-styling regelen we per scherm tot we
  duplicatie zien.

## Waarom niet 1-op-1 MD3

- Onze componenten consumeren al `--primary`, `--muted`, `--border` etc. Een
  parallelle MD3-tokenset zou elke component-dubbel moeten stylen.
- MD3-naming (`surface-container-high`, `on-surface-variant`) is expressief,
  maar verspreid over meer tokens dan we nu nodig hebben. We voegen alleen
  dat deel toe dat Stitch ook echt gebruikt.
- Als Stitch in toekomstige slices vlakken uitsplitst die nu nog geen eigen
  token hebben, voegen we gerichte tokens toe zonder de hele MD3-set te
  importeren.

## Waarom `<link>` voor Material Symbols, `next/font` voor Plus Jakarta

- Plus Jakarta Sans is een klassiek text-font; `next/font/google` is hier
  optimaal (preload, self-host, geen FOUT).
- Material Symbols Outlined is een symbol-font met 4 variable axes (opsz,
  wght, FILL, GRAD) en forse payload. `next/font/google` typings dekken deze
  combinatie niet voorspelbaar. `<link>` is voor nu pragmatischer; als het
  een bottleneck wordt, herzien we met subsetting of eigen hosting.

## Gevolgen

+ Platform-wijde magenta-palette zonder componenten aan te passen.
+ Alle bestaande schermen erven automatisch de nieuwe brand; een later slice
  zet ieder scherm layout-wise op maat.
+ Dark mode is klaar om aan te zetten zodra er een ontwerp is.
- Bestaande schermen (dashboard, registratie, superadmin, publiek) zien er
  direct magenta uit terwijl hun compositie nog op "groen-tijdperk" is
  afgestemd. Bewust geaccepteerd tot hun eigen slice (C-G).
- Extra dependency `next-themes`, extra Google-Fonts link-tag. Beide klein.
