import { z } from "zod";

/**
 * Slide-IDs die `/tv` en `/embed` ondersteunen. Volgorde = vertoonvolgorde.
 *
 * - `1` = Totale impact + Top teams
 * - `2` = Voortgang + Impact per categorie
 * - `3` = Recente registraties
 */
export const ALL_PUBLIC_SLIDES = ["1", "2", "3"] as const;
export type PublicSlideId = (typeof ALL_PUBLIC_SLIDES)[number];

const slideIdSchema = z.enum(ALL_PUBLIC_SLIDES);

const screensSchema = z
  .string()
  .transform((value) => value.split(","))
  .pipe(z.array(slideIdSchema).min(1).max(ALL_PUBLIC_SLIDES.length));

const MIN_INTERVAL_SECONDS = 3;
const MAX_INTERVAL_SECONDS = 60;
const DEFAULT_INTERVAL_SECONDS = 8;

/**
 * Querystring-contract voor `/embed/[slug]`. Wordt server-side gevalideerd in
 * de page; tikfouten of onbekende waarden vallen netjes terug op defaults.
 *
 * - `mode`: `stack` (default, scrollbaar in iframes) of `rotate` (slideshow).
 * - `screens`: comma-separated slide-IDs (default = alle drie).
 * - `interval`: secondes tussen slides (3-60, default 8). Alleen relevant in
 *   `mode=rotate`.
 */
export const embedQuerySchema = z.object({
  mode: z.enum(["stack", "rotate"]).default("stack"),
  screens: screensSchema.optional(),
  interval: z.coerce
    .number()
    .int()
    .min(MIN_INTERVAL_SECONDS)
    .max(MAX_INTERVAL_SECONDS)
    .default(DEFAULT_INTERVAL_SECONDS),
});

export type EmbedQuery = z.infer<typeof embedQuerySchema>;

/**
 * Veilige parser: nooit gooien op user input. Onbekende of ongeldige waarden
 * → defaults. Verwacht het rauwe `searchParams`-object van een Next.js
 * server component (zonder string-coercion).
 */
export function parseEmbedQuery(input: unknown): {
  mode: EmbedQuery["mode"];
  screens: PublicSlideId[];
  intervalMs: number;
} {
  const parsed = embedQuerySchema.safeParse(input);
  const { mode, screens, interval } = parsed.success
    ? parsed.data
    : { mode: "stack" as const, screens: undefined, interval: DEFAULT_INTERVAL_SECONDS };

  return {
    mode,
    screens: screens ?? [...ALL_PUBLIC_SLIDES],
    intervalMs: interval * 1000,
  };
}
