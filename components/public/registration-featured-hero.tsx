import {
  type RegistrationCardData,
  formatRegistrationCo2Kg,
  formatRegistrationDate,
  formatRegistrationQuantity,
  formatRegistrationSocialScore,
  formatRegistrationUnit,
} from "@/components/dashboard/registration-card";
import { RegistrationPlaceholder } from "@/components/dashboard/registration-placeholder";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function MetaRow({
  icon,
  label,
  className,
  iconClassName,
}: {
  icon: string;
  label: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
      <Icon name={icon} className={cn("text-base text-primary", iconClassName)} filled />
      <span className="truncate font-medium text-foreground">{label}</span>
    </div>
  );
}

export type RegistrationFeaturedHeroProps = {
  registration: RegistrationCardData;
  /**
   * Kiosk / TV / embed-rotate: titel + icoon linksboven op de foto, zelfde
   * typografie als `<DashboardPanel>` (zoals “Impact per categorie”).
   */
  recentMeta?: { index: number; total: number };
};

/**
 * Groot kiosk-formaat: linkerfoto (±50%), rechts inhoud gegroepeerd en
 * verticaal gecentreerd. Met `recentMeta` een paneelachtige header op de foto.
 */
export function RegistrationFeaturedHero({
  registration,
  recentMeta,
}: RegistrationFeaturedHeroProps) {
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

  const kiosk = Boolean(recentMeta);

  return (
    <article
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden bg-card lg:flex-row",
        kiosk
          ? "h-full min-h-0 flex-1 rounded-xl shadow-sm lg:min-h-0 lg:rounded-2xl xl:rounded-[2rem] xl:shadow-md"
          : "min-h-[220px] rounded-[2rem] shadow-[0_20px_40px_rgba(54,50,45,0.04)]",
      )}
      data-testid="registration-featured-hero"
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden lg:h-full lg:min-h-0 lg:w-1/2",
          kiosk ? "min-h-[min(42vh,22rem)] sm:min-h-[38vh] lg:min-h-0" : "min-h-[220px] lg:min-h-0",
        )}
      >
        {photoUrl ? (
          <img
            alt={interventionLabel}
            src={photoUrl}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-container-low">
            <RegistrationPlaceholder color={categoryColor} id={id} />
          </div>
        )}

        {kiosk && recentMeta ? (
          <div className="pointer-events-none absolute left-0 top-0 z-10 max-w-[min(94%,30rem)] p-3 sm:max-w-[min(92%,32rem)] sm:p-4 lg:p-5 xl:p-6">
            <div className="rounded-[2rem] bg-surface-container-low/95 px-4 py-3 shadow-[0_20px_40px_rgba(54,50,45,0.12)] ring-1 ring-black/[0.06] backdrop-blur-sm sm:px-5 sm:py-3.5 xl:px-6 xl:py-4">
              <header className="flex items-start gap-3 xl:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-container text-primary shadow-sm xl:h-12 xl:w-12 xl:rounded-[1.1rem]">
                  <Icon name="history" filled className="text-[22px] xl:text-[26px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground xl:text-2xl">
                    Recente registraties
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground xl:text-sm">
                    {recentMeta.total > 1
                      ? `${recentMeta.index + 1} van ${recentMeta.total}`
                      : "Laatste actie van de organisatie"}
                  </p>
                </div>
              </header>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          kiosk
            ? "justify-center gap-3 p-5 sm:p-7 lg:gap-4 lg:p-[clamp(1.75rem,3.2vw,4.5rem)] xl:gap-5 xl:p-[clamp(2rem,3.8vw,5.5rem)] 2xl:gap-6"
            : "justify-start gap-4 p-6 sm:p-8 lg:gap-5 lg:p-10",
        )}
      >
        <div>
          <h4
            className={cn(
              "font-extrabold tracking-tight text-foreground",
              kiosk
                ? "text-2xl leading-[1.15] sm:text-3xl lg:text-[clamp(1.75rem,2.4vw+0.65rem,3.4rem)] xl:leading-[1.12]"
                : "text-xl sm:text-2xl lg:text-3xl",
            )}
          >
            {interventionLabel}
          </h4>
          <p
            className={cn(
              "mt-2 text-sm font-medium text-muted-foreground lg:text-base xl:text-lg",
              kiosk && "lg:text-base xl:text-lg",
            )}
          >
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

        <div className={cn("flex flex-wrap items-center gap-2", kiosk && "lg:gap-2.5 xl:gap-3")}>
          <span
            className={cn(
              "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full bg-tertiary-container font-extrabold text-tertiary shadow-sm",
              kiosk
                ? "px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base xl:px-5 xl:text-[1.05rem]"
                : "px-3 py-1.5 text-sm",
            )}
          >
            <Icon
              name="eco"
              filled
              className={cn("shrink-0", kiosk ? "text-base lg:text-lg" : "text-base")}
            />
            {formatRegistrationCo2Kg(co2KgCached)} kg
          </span>
          <span
            className={cn(
              "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full bg-primary-container font-extrabold text-primary shadow-sm",
              kiosk
                ? "px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base xl:px-5 xl:text-[1.05rem]"
                : "px-3 py-1.5 text-sm",
            )}
          >
            <Icon
              name="favorite"
              filled
              className={cn("shrink-0", kiosk ? "text-base lg:text-lg" : "text-base")}
            />
            {formatRegistrationSocialScore(socialScoreCached)} punten
          </span>
        </div>

        {categoryName ? (
          <span
            className={cn(
              "inline-flex max-w-full items-center gap-2 self-start rounded-full bg-surface-container-high font-bold uppercase tracking-wider text-foreground shadow-sm",
              kiosk
                ? "px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm xl:text-[0.95rem]"
                : "px-3 py-1.5 text-xs",
            )}
            style={{
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

        {note ? (
          <p
            className={cn(
              "rounded-[1rem] bg-surface-container-low leading-relaxed text-foreground",
              kiosk
                ? "px-4 py-3 text-base lg:px-5 lg:py-4 lg:text-lg xl:text-xl xl:leading-relaxed"
                : "px-4 py-3 text-base lg:text-lg",
            )}
          >
            {note}
          </p>
        ) : null}

        <div
          className={cn(
            "space-y-2 border-t border-border",
            kiosk ? "pt-3 lg:space-y-2.5 lg:pt-4 xl:pt-5" : "mt-auto pt-4",
          )}
        >
          <MetaRow
            icon="groups"
            label={teamLabel}
            className={cn(kiosk && "gap-2.5 text-base lg:gap-3 xl:text-lg")}
            iconClassName={cn(kiosk && "lg:text-lg xl:text-xl")}
          />
          <MetaRow
            icon="event"
            label={formatRegistrationDate(happenedOn)}
            className={cn(kiosk && "gap-2.5 text-base lg:gap-3 xl:text-lg")}
            iconClassName={cn(kiosk && "lg:text-lg xl:text-xl")}
          />
        </div>
      </div>
    </article>
  );
}
