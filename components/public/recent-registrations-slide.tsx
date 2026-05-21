import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  RegistrationCard,
  type RegistrationCardData,
} from "@/components/dashboard/registration-card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type RecentRegistrationsSlideProps = {
  compactCards?: boolean;
  /**
   * Hoeveel kaarten maximaal tonen. Stack/share = beperkt tot N; default = alle
   * geladen recente registraties uit `getPublicDashboardBySlug`.
   */
  limit?: number;
  registrations: RegistrationCardData[];
  /**
   * Grid-classnames. Default = mobile-first responsive grid passend voor
   * stack-modus.
   */
  gridClassName?: string;
};

const DEFAULT_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3";

/**
 * Slide 3: Recente registraties. Identieke kaarten als op het interne
 * dashboard zodat foto, categoriekleur en CO₂- + sociale score-badges consistent zijn.
 *
 * Foto's worden via service-role signed URLs aangeleverd door de loader; valt
 * de URL weg, dan toont `<RegistrationCard>` de gekleurde
 * `<RegistrationPlaceholder>` zoals overal elders.
 *
 * TV en `/embed?mode=rotate` gebruiken geen geneste carousel: `PublicSurface`
 * splitst logische slide `3` daar in aparte kiosk-slides (max. 3 registraties).
 */
export function RecentRegistrationsSlide({
  compactCards = false,
  limit,
  registrations,
  gridClassName,
}: RecentRegistrationsSlideProps) {
  const visible = typeof limit === "number" ? registrations.slice(0, limit) : registrations;

  return (
    <DashboardPanel
      className={compactCards ? "w-full" : "h-full min-h-0"}
      contentClassName={compactCards ? undefined : "flex min-h-0 flex-1 flex-col"}
      description="De laatste acties van de hele organisatie — elke kaart telt direct mee in het overzicht bovenaan."
      icon="history"
      iconTone="primary"
      title="Recente registraties"
    >
      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-[1.5rem] bg-surface-container-low p-6 text-sm text-muted-foreground">
          <Icon name="inbox" className="text-2xl text-primary" filled />
          <p>
            Nog geen registraties binnen deze organisatie. Voeg via de registratie-pagina de eerste
            actie toe.
          </p>
        </div>
      ) : (
        <ul className={cn(DEFAULT_GRID, gridClassName)}>
          {visible.map((registration) => (
            <li key={registration.id} className="h-full">
              <RegistrationCard compact={compactCards} registration={registration} />
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
