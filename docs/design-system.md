# Design system

Brand en UI-fundament voor het Eco-sociaal Dashboard. Afgeleid van het Stitch-ontwerp
voor LEV/CFTF maar gemapt op de shadcn/Tailwind-tokenconventie die we in de
componenten al gebruiken.

## Uitgangspunten

- **Een token-set**. Geen Material 3-naming parallel aan shadcn-naming; we
  gebruiken shadcn (`--primary`, `--muted`, ...) en voegen alleen toe wat
  echt ontbrak (bv. `--primary-dim`, `--tertiary`, `--chart-*`).
- **CSS-tokens in `app/globals.css`**. Aliasen in `@theme inline` zodat
  Tailwind utilities als `bg-primary-dim` of `text-tertiary` werken.
- **Dark mode via `.dark`-class**. Geplumd via `next-themes`; standaard `light`
  want er is nog geen dark Stitch-ontwerp.
- **Plus Jakarta Sans** voor alle tekst, via `next/font/google` (variable
  `--font-plus-jakarta`).
- **Material Symbols Outlined** voor iconen, via `<link>` in de root layout.
  Wrap in `<Icon name="..." />` (zie `components/ui/icon.tsx`).

## Token-map

| Token (shadcn)          | Waarde (light) | Stitch MD3-equivalent       | Gebruik                                    |
| ----------------------- | -------------- | --------------------------- | ------------------------------------------ |
| `--background`          | `#fff8f3`      | `surface`                   | Body achtergrond, kiosk/tv                 |
| `--foreground`          | `#36322d`      | `on-surface`                | Basisteksten                               |
| `--card`                | `#ffffff`      | `surface-container-lowest`  | Card/paneel-oppervlakken                   |
| `--primary`             | `#af1e7b`      | `primary`                   | CTA, focus-ring, brand-koppen              |
| `--primary-dim`         | `#9f096e`      | `primary-dim`               | Gradient-einde op brand-buttons en hero    |
| `--primary-container`   | `#ffa6d2`      | `primary-container`         | Lichte brand-vlakken (badges, highlights)  |
| `--on-primary-container`| `#780052`      | `on-primary-container`      | Tekst op `--primary-container`             |
| `--secondary`           | `#efe7e0`      | `surface-container-high`    | Pill-buttons (Contact opnemen), zachte bg  |
| `--tertiary`            | `#3d6b00`      | `tertiary`                  | Eco-positieve accents, chart-2             |
| `--tertiary-container`  | `#befa7f`      | `tertiary-container`        | Chips/badges met positief signaal          |
| `--muted`               | `#f4ece6`      | `surface-container`         | Subtiele backgrounds, disabled-states      |
| `--muted-foreground`    | `#645e58`      | `on-surface-variant`        | Secundaire tekst, hints                    |
| `--accent`              | `#ffdcc6`      | `secondary-container`       | Hover/focus op secondary surfaces          |
| `--destructive`         | `#ac3149`      | `error`                     | Error-states, destructive acties           |
| `--border` / `--input`  | `#eae1d9` / `#efe7e0` | `surface-container-highest` / `surface-container-high` | Randen, subtiele input-backgrounds |
| `--ring`                | `#af1e7b`      | `primary`                   | Focus-ring                                 |
| `--chart-1..5`          | -              | -                           | Recharts-kleurvolgorde                     |

### Radii

| Token         | Waarde   | Gebruik                      |
| ------------- | -------- | ---------------------------- |
| `--radius-sm` | 0.75rem  | Inputs, badges               |
| `--radius`    | 1rem     | Default: cards, buttons      |
| `--radius-lg` | 2rem     | Grote paneel-oppervlakken    |
| `--radius-xl` | 3rem     | Hero/illustratie-wrappers    |
| `full`        | 9999px   | Pill-buttons                 |

## Componenten

- `components/ui/button.tsx` - shadcn-button met extra `brand` variant
  (gradient primary → primary-dim, pill-vorm). Gebruik `variant="brand"` voor
  de hoofd-CTA.
- `components/ui/icon.tsx` - `<Icon name="eco" filled />`. Material Symbols
  Outlined wrapper.
- `components/theme-provider.tsx` - `next-themes` wrapper, gebruikt in
  `app/layout.tsx`. De user-facing theme-toggle zelf komt in de app-shell
  (Fase 5, Slice C).

## Dark mode

`.dark` tokens zijn een pragmatische inversie tot er een dark Stitch-ontwerp is.
Niet-functioneel in de UI: er staat nog geen toggle. Zodra er een dark-mock
komt herzien we deze waarden.

## Hoe nieuwe Stitch-schermen te vertalen

1. Screenshot of HTML-snippet in `docs/design/<slice>.png` droppen.
2. Stitch-kleuren via bovenstaande tabel mappen op onze tokens.
3. Arbitrary Tailwind waarden (`rounded-[2rem]`, `shadow-[...]`) alleen voor
   one-off accenten; als ze in meerdere slices terugkomen, extraheren naar
   een utility-token.
4. Iconen: Material Symbols met `<Icon name="arrow_forward" />`. Lucide mag
   blijven in bestaande schermen; nieuwe schermen gebruiken Material Symbols
   voor consistentie met Stitch.
