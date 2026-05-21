import type { RegistrationCardData } from "@/components/dashboard/registration-card";
import { RegistrationFeaturedHero } from "@/components/public/registration-featured-hero";

/** Één kiosk-slide: hero vult de slide; geen apart DashboardPanel (header zit op de foto). */
export function RecentRegistrationFeaturedPanel({
  index,
  registration,
  totalRecent,
}: {
  index: number;
  registration: RegistrationCardData;
  totalRecent: number;
}) {
  return (
    <RegistrationFeaturedHero recentMeta={{ index, total: totalRecent }} registration={registration} />
  );
}
