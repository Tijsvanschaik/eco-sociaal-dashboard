import { notFound } from "next/navigation";

import { ImpactVisualPlayground } from "@/components/impact-metaphors/landscape/landscape-playground";
import { isImpactSandboxEnabled } from "@/lib/dev/impact-sandbox-enabled";

export const metadata = {
  title: "Impact-visualisatie sandbox",
  robots: { index: false, follow: false },
};

export default function ImpactLandscapeSandboxPage() {
  if (!isImpactSandboxEnabled()) {
    notFound();
  }

  return (
    <main className="h-dvh overflow-hidden bg-background">
      <ImpactVisualPlayground />
    </main>
  );
}
