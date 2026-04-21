import { RegistrationPlaceholder } from "@/components/dashboard/registration-placeholder";
import { Icon } from "@/components/ui/icon";

export type RegistrationCardData = {
  categoryColor: string | null;
  categoryName: string | null;
  co2KgCached: number;
  happenedOn: string;
  id: string;
  interventionLabel: string;
  note: string | null;
  photoUrl?: string | null;
  quantity: number;
  teamLabel: string;
  unit: string | null;
};

function formatKg(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value);
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

export function RegistrationCard({ registration }: { registration: RegistrationCardData }) {
  const {
    categoryColor,
    categoryName,
    co2KgCached,
    happenedOn,
    id,
    interventionLabel,
    note,
    photoUrl,
    quantity,
    teamLabel,
    unit,
  } = registration;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)] transition-transform hover:-translate-y-0.5">
      <div className="relative aspect-[5/3] w-full overflow-hidden">
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
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-sm"
            style={{
              // subtiele tint naar de categoriekleur
              boxShadow: categoryColor ? `0 0 0 1px ${categoryColor}33` : undefined,
            }}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: categoryColor ?? "var(--primary)" }}
            />
            {categoryName}
          </span>
        ) : null}
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-primary shadow-sm backdrop-blur-sm">
          <Icon name="eco" filled className="text-base" />
          {formatKg(co2KgCached)} kg
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="line-clamp-2 text-lg font-extrabold tracking-tight text-foreground">
            {interventionLabel}
          </h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {formatQuantity(quantity)}
            {unit ? ` ${unit}` : ""}
          </p>
        </div>

        {note ? (
          <p className="line-clamp-2 rounded-[1rem] bg-surface-container-low px-3 py-2 text-sm text-muted-foreground">
            <span className="italic">"{note}"</span>
          </p>
        ) : null}

        <dl className="mt-auto grid grid-cols-1 gap-2 border-t border-border pt-3 text-sm">
          <MetaRow icon="groups" label={teamLabel} />
          <MetaRow icon="event" label={formatDate(happenedOn)} />
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
