import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrgContextBySlug } from "@/lib/organizations";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

import {
  createCategory,
  createIntervention,
  createLocation,
  createTeam,
  provisionUser,
  updateOrgSettings,
} from "./actions";

const selectClasses =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30";

type Params = Promise<{ orgSlug: string }>;

export default async function SettingsPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context || context.role !== "admin") notFound();

  const [
    locationsQuery,
    teamsQuery,
    categoriesQuery,
    interventionsQuery,
    membershipsQuery,
    teamMembershipsQuery,
  ] = await Promise.all([
    supabase
      .from("locations")
      .select("id, name, is_internal")
      .eq("org_id", context.org.id)
      .order("name"),
    supabase
      .from("teams")
      .select("id, name, location_id")
      .eq("org_id", context.org.id)
      .order("name"),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("org_id", context.org.id)
      .order("name"),
    supabase
      .from("interventions")
      .select("id, name, category_id, unit, co2_factor_kg")
      .eq("org_id", context.org.id)
      .order("name"),
    supabase.from("memberships").select("user_id, role").eq("org_id", context.org.id),
    supabase.from("team_memberships").select("user_id, team_id").eq("org_id", context.org.id),
  ]);

  const locations = locationsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const interventions = interventionsQuery.data ?? [];
  const memberships = membershipsQuery.data ?? [];
  const teamMemberships = teamMembershipsQuery.data ?? [];
  const locationMap = new Map(locations.map((location) => [location.id, location.name]));
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const userIds = memberships.map((membership) => membership.user_id);
  const emailMap = await getEmailMap(userIds);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{context.org.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Instellingen</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Richt je organisatie in zodat medewerkers kunnen registreren en jullie publieke dashboard
          live kan.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <CrudCard description="Publieke link en EOD-baseline" title="Organisatie-instellingen">
          <form action={updateOrgSettings.bind(null, context.org.slug)} className="space-y-4">
            <LabeledInput
              defaultValue={context.org.publicShareSlug ?? ""}
              label="Publieke slug"
              name="publicShareSlug"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                defaultValue={context.org.eodBaselineKg ?? ""}
                label="EOD-baseline (kg)"
                min="0"
                name="eodBaselineKg"
                step="0.001"
                type="number"
              />
              <LabeledInput
                defaultValue={context.org.eodBaselineDate ?? ""}
                label="Baseline-datum"
                name="eodBaselineDate"
                type="date"
              />
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input
                defaultChecked={context.org.publicShareEnabled}
                name="publicShareEnabled"
                type="checkbox"
              />
              Publieke share-link inschakelen
            </label>
            {context.org.publicShareSlug && (
              <p className="text-xs text-muted-foreground">
                Live URL: /p/{context.org.publicShareSlug}
              </p>
            )}
            <Button type="submit">Instellingen opslaan</Button>
          </form>
        </CrudCard>

        <CrudCard description="Voeg een locatie of team toe" title="Locaties en teams">
          <div className="grid gap-4 md:grid-cols-2">
            <form action={createLocation.bind(null, context.org.slug)} className="space-y-3">
              <LabeledInput
                label="Nieuwe locatie"
                name="name"
                placeholder="Bijv. Wijkcentrum Binnenstad"
                required
              />
              <label className="flex items-center gap-3 text-sm">
                <input name="isInternal" type="checkbox" />
                Alleen intern zichtbaar
              </label>
              <Button type="submit" variant="secondary">
                Locatie toevoegen
              </Button>
            </form>
            <form action={createTeam.bind(null, context.org.slug)} className="space-y-3">
              <LabeledInput
                label="Nieuw team"
                name="name"
                placeholder="Bijv. Team Helmond Centrum"
                required
              />
              <div className="grid gap-2">
                <Label htmlFor="locationId">Locatie</Label>
                <select
                  aria-label="Locatie"
                  className={selectClasses}
                  id="locationId"
                  name="locationId"
                  required
                >
                  <option value="">Kies een locatie</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="secondary">
                Team toevoegen
              </Button>
            </form>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {teams.map((team) => (
              <li key={team.id}>
                {team.name} · {locationMap.get(team.location_id) ?? "Onbekende locatie"}
              </li>
            ))}
          </ul>
        </CrudCard>

        <CrudCard
          description="Bepaal wat geregistreerd kan worden"
          title="Categorieen en interventies"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <form action={createCategory.bind(null, context.org.slug)} className="space-y-3">
              <LabeledInput
                label="Nieuwe categorie"
                name="name"
                placeholder="Bijv. Mobiliteit"
                required
              />
              <LabeledInput
                defaultValue="#6b7280"
                label="Kleur"
                name="color"
                required
                type="color"
              />
              <Button type="submit" variant="secondary">
                Categorie toevoegen
              </Button>
            </form>
            <form action={createIntervention.bind(null, context.org.slug)} className="space-y-3">
              <LabeledInput
                label="Nieuwe interventie"
                name="name"
                placeholder="Bijv. Met de fiets"
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Categorie"
                  name="categoryId"
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                />
                <SelectField
                  label="Eenheid"
                  name="unit"
                  options={["kg", "km", "maaltijd", "kwh", "stuk", "uur", "liter", "dag"].map(
                    (unit) => ({ label: unit, value: unit }),
                  )}
                />
              </div>
              <LabeledInput
                label="CO2-factor per eenheid"
                min="0"
                name="co2FactorKg"
                required
                step="0.001"
                type="number"
              />
              <Button type="submit" variant="secondary">
                Interventie toevoegen
              </Button>
            </form>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {interventions.map((intervention) => (
              <li key={intervention.id}>
                {intervention.name} ·{" "}
                {categoryMap.get(intervention.category_id) ?? "Onbekende categorie"} ·{" "}
                {intervention.co2_factor_kg} kg/{intervention.unit}
              </li>
            ))}
          </ul>
        </CrudCard>

        <CrudCard description="Voeg admins en medewerkers toe" title="Gebruikers">
          <form action={provisionUser.bind(null, context.org.slug)} className="space-y-3">
            <LabeledInput
              label="E-mailadres"
              name="email"
              placeholder="collega@levgroep.nl"
              required
              type="email"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Rol"
                name="role"
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "Medewerker", value: "worker" },
                ]}
              />
              <SelectField
                label="Team (verplicht voor medewerker)"
                name="teamId"
                options={teams.map((team) => ({ label: team.name, value: team.id }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Na toevoegen kan de gebruiker zelf inloggen via de magic-link op /login.
            </p>
            <Button type="submit">Gebruiker toevoegen</Button>
          </form>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {memberships.map((membership) => (
              <li key={membership.user_id}>
                {emailMap.get(membership.user_id) ?? membership.user_id} · {membership.role}
                {teamMemberships
                  .filter((item) => item.user_id === membership.user_id)
                  .map(
                    (item) =>
                      ` · ${teams.find((team) => team.id === item.team_id)?.name ?? "Onbekend team"}`,
                  )
                  .join("")}
              </li>
            ))}
          </ul>
        </CrudCard>
      </div>
    </main>
  );
}

async function getEmailMap(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return new Map<string, string>();

  const admin = createServiceRoleClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const emails = new Map<string, string>();
  for (const user of data.users) {
    if (uniqueIds.includes(user.id) && user.email) emails.set(user.id, user.email);
  }
  return emails;
}

function CrudCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function LabeledInput(props: React.ComponentProps<typeof Input> & { label: string }) {
  const { label, name, ...inputProps } = props;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...inputProps} />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select aria-label={label} className={selectClasses} id={name} name={name}>
        <option value="">Kies...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
