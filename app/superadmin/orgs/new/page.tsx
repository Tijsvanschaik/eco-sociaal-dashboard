import Link from "next/link";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { SuperadminOrgForm } from "@/components/superadmin-org-form";
import {
  SuperadminPageHeader,
  SuperadminPageMain,
} from "@/components/superadmin/superadmin-page-layout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function NewSuperadminOrgPage() {
  return (
    <SuperadminPageMain className="max-w-3xl">
      <SuperadminPageHeader
        actions={
          <Button asChild className="rounded-full" variant="outline">
            <Link href="/superadmin">
              <Icon name="arrow_back" className="text-base" />
              Terug
            </Link>
          </Button>
        }
        description="Maak een nieuwe tenant aan en verstuur meteen een magic-link naar de eerste admin."
        eyebrow="Platformbeheer"
        title="Nieuwe organisatie"
      />

      <DashboardPanel
        description="De eerste admin krijgt na opslaan direct een login-link per e-mail."
        icon="add_business"
        iconTone="primary"
        title="Tenant aanmaken"
      >
        <SuperadminOrgForm />
      </DashboardPanel>
    </SuperadminPageMain>
  );
}
