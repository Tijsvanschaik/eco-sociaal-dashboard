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

export function RegistrationCard({
  compact = false,
  registration,
}: {
  compact?: boolean;
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
    <article className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)] transition-transform hover:-translate-y-0.5">
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
        <div className="absolute inset-x-4 top-4 z-10">
          <div className="ml-auto flex max-w-full flex-col items-end gap-1.5 md:ml-0 md:w-full md:flex-row md:items-start md:justify-between md:gap-4">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-primary shadow-sm backdrop-blur-sm">
              <Icon name="eco" filled className="text-base shrink-0" />
              {formatRegistrationCo2Kg(co2KgCached)} kg
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-tertiary shadow-sm backdrop-blur-sm">
              <Icon name="volunteer_activism" filled className="text-base shrink-0" />
              {formatRegistrationSocialScore(socialScoreCached)} score
            </span>
          </div>
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
          <p className="mt-1 space-y-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>
              Eco: {formatRegistrationQuantity(quantity)}
              {ecoUnit ? ` ${ecoUnit}` : ""}
            </span>
            {socialQuantity > 0 ? (
              <span className="block normal-case">
                Sociaal: {formatRegistrationQuantity(socialQuantity)}
                {socialUnit ? ` ${socialUnit}` : ""}
              </span>
            ) : null}
          </p>
        </div>

        {note ? (
          <p
            className={cn(
              "line-clamp-2 rounded-[1rem] bg-surface-container-low px-3 text-muted-foreground",
              compact ? "py-1.5 text-xs" : "py-2 text-sm",
            )}
          >
            <span className="italic">{`"${note}"`}</span>
          </p>
        ) : null}

        <dl
          className={cn(
            "mt-auto grid grid-cols-1 border-t border-border text-sm",
            compact ? "gap-1.5 pt-2" : "gap-2 pt-3",
          )}
        >
          <MetaRow icon="groups" label={teamLabel} />
          <MetaRow icon="event" label={formatRegistrationDate(happenedOn)} />
        </dl>
      </div>
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
