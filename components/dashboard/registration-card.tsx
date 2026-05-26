import Link from "next/link";

import { RegistrationPlaceholder } from "@/components/dashboard/registration-placeholder";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type RegistrationCardData = {
  categoryColor: string | null;
  categoryName: string | null;
  co2KgCached: number;
  happenedOn: string;
  id: string;
  interventionLabel: string;
  note: string | null;
  photoUrl?: string | null;
  ecoUnit: string | null;
  quantity: number;
  socialQuantity: number;
  socialScoreCached: number;
  socialUnit: string | null;
  teamLabel: string;
};

export function formatRegistrationCo2Kg(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function formatRegistrationSocialScore(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function formatRegistrationQuantity(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value);
}

export function formatRegistrationDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

export function formatRegistrationUnit(unit: string | null): string {
  if (!unit) return "";
  return unit.toLowerCase();
}

export function RegistrationCard({
  compact = false,
  editHref = null,
  registration,
}: {
  compact?: boolean;
  editHref?: string | null;
  registration: RegistrationCardData;
}) {
  const {
    categoryColor,
    categoryName,
    co2KgCached,
    happenedOn,
    id,
    interventionLabel,
    note,
    photoUrl,
    ecoUnit,
    quantity,
    socialQuantity,
    socialScoreCached,
    socialUnit,
    teamLabel,
  } = registration;

  return (
    <article className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)] transition-transform hover:-translate-y-0.5">
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden",
          compact ? "aspect-[3/1]" : "aspect-[5/3]",
        )}
      >
        {photoUrl ? (
          <img
            alt={interventionLabel}
            src={photoUrl}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <RegistrationPlaceholder color={categoryColor} id={id} />
        )}
        {categoryName ? (
          <span
            className="absolute left-4 top-4 z-10 md:bottom-4 md:top-auto inline-flex max-w-[calc(100%-2rem)] items-center gap-1.5 truncate rounded-full bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-sm"
            style={{
              // subtiele tint naar de categoriekleur
              boxShadow: categoryColor ? `0 0 0 1px ${categoryColor}33` : undefined,
            }}
          >
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColor ?? "var(--primary)" }}
            />
            <span className="truncate">{categoryName}</span>
          </span>
        ) : null}
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-start justify-between gap-2 sm:inset-x-4 sm:bottom-4 md:inset-x-4 md:bottom-auto md:top-4">
          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-xs font-extrabold text-tertiary shadow-sm backdrop-blur-sm sm:px-3 sm:text-sm">
            <Icon name="eco" filled className="shrink-0 text-sm sm:text-base" />
            {formatRegistrationCo2Kg(co2KgCached)} kg
          </span>
          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-xs font-extrabold text-primary shadow-sm backdrop-blur-sm sm:px-3 sm:text-sm">
            <Icon name="favorite" filled className="shrink-0 text-sm sm:text-base" />
            {formatRegistrationSocialScore(socialScoreCached)} punten
          </span>
        </div>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col", compact ? "gap-2 p-4" : "gap-3 p-5")}>
        <div>
          <h3
            className={cn(
              "line-clamp-2 font-extrabold tracking-tight text-foreground",
              compact ? "text-base" : "text-lg",
            )}
          >
            {interventionLabel}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-semibold text-tertiary">Eco</span>
            {" · "}
            {formatRegistrationQuantity(quantity)}
            {ecoUnit ? ` ${formatRegistrationUnit(ecoUnit)}` : ""}
            {socialQuantity > 0 ? (
              <>
                {" · "}
                <span className="font-semibold text-primary">Sociaal</span>
                {" · "}
                {formatRegistrationQuantity(socialQuantity)}
                {socialUnit ? ` ${formatRegistrationUnit(socialUnit)}` : ""}
              </>
            ) : null}
          </p>
        </div>

        {note ? (
          <p
            className={cn(
              "rounded-[1rem] bg-surface-container-low px-3 text-foreground leading-relaxed",
              compact ? "py-2.5 text-xs" : "py-3.5 text-sm",
            )}
          >
            {note}
          </p>
        ) : null}

        <dl
          className={cn(
            "mt-auto grid grid-cols-1 border-t border-border text-sm",
            compact ? "gap-1.5 pt-2" : "gap-2 pt-3",
            editHref && (compact ? "pr-10" : "pr-11"),
          )}
        >
          <MetaRow icon="groups" label={teamLabel} />
          <MetaRow icon="event" label={formatRegistrationDate(happenedOn)} />
        </dl>
      </div>

      {editHref ? (
        <Link
          aria-label="Registratie bewerken"
          className={cn(
            "absolute z-10 inline-flex items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-[0_8px_20px_rgba(54,50,45,0.12)] backdrop-blur-sm transition hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            compact ? "bottom-3 right-3 h-8 w-8" : "bottom-4 right-4 h-9 w-9",
          )}
          href={editHref}
        >
          <Icon name="edit" className={compact ? "text-base" : "text-lg"} />
        </Link>
      ) : null}
    </article>
  );
}

function MetaRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon name={icon} className="text-base text-primary" filled />
      <span className="truncate font-medium text-foreground">{label}</span>
    </div>
  );
}
