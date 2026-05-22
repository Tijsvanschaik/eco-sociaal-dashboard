import { sectionDescriptionClassName, sectionLabelClassName } from "@/components/settings/settings-styles";

/** Sub-label binnen een DashboardPanel-sectie (zelfde stijl als instellingen). */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className={sectionLabelClassName}>{children}</p>;
}

export function SectionDescription({ children }: { children: React.ReactNode }) {
  return <p className={sectionDescriptionClassName}>{children}</p>;
}

/** Witte inset-kaart — zelfde hoek/schaduw als impact-overview FactTiles. */
export const registrationInsetPanelClassName =
  "rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)]";
