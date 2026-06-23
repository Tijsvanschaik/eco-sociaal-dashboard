import { notFound } from "next/navigation";

import { ImpactVisualPlayground } from "@/components/impact-metaphors/landscape/landscape-playground";

export const metadata = {
  title: "Impact-visualisatie sandbox",
  robots: { index: false, follow: false },
};

export default function ImpactLandscapeSandboxPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="h-dvh overflow-hidden bg-background">
      <ImpactVisualPlayground />
    </main>
  );
}
