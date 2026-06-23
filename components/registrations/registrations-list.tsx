"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteRegistration } from "@/app/(app)/[orgSlug]/activiteiten/actions";
import {
  formatRegistrationCo2Kg,
  formatRegistrationDate,
  formatRegistrationQuantity,
  formatRegistrationSocialScore,
  formatRegistrationUnit,
} from "@/components/dashboard/registration-card";
import { RegistrationListRowCard } from "@/components/registrations/registration-list-row-card";
import { RegistrationsScopeToggle } from "@/components/registrations/registrations-scope-toggle";
import { EmptyState } from "@/components/settings/form-fields";
import {
  cellTextClassName,
  desktopTableScrollClassName,
  mobileDataListClassName,
  sectionDescriptionClassName,
  sectionLabelClassName,
  sectionShellClassName,
  tableHeadActionsClassName,
  tableHeadClassName,
  tableHeadRightClassName,
  tableRowBorderClassName,
} from "@/components/settings/settings-styles";
import { ConfirmArchiveModal, RowIconButton } from "@/components/settings/settings-ui";
import { Button } from "@/components/ui/button";
import type { RegistrationListScope } from "@/lib/registrations/list-filters";
import type { TeamOption } from "@/lib/tenant-dashboard-data";
import type { RegistrationListRow } from "@/lib/tenant-registrations-list-data";
import { cn } from "@/lib/utils";

type DeleteModalState = { type: "closed" } | { type: "delete"; row: RegistrationListRow };

type RegistrationsListProps = {
  isAdmin: boolean;
  orgSlug: string;
  rows: RegistrationListRow[];
  scope: RegistrationListScope;
  selectedTeamId: string | null;
  teams: TeamOption[];
  years: number[];
  year: number;
};

export function RegistrationsList({
  isAdmin,
  orgSlug,
  rows,
  scope,
  selectedTeamId,
  teams,
  years,
  year,
}: RegistrationsListProps) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ type: "closed" });

  function navigateFilters(nextYear: number, nextTeamId: string | null) {
    const params = new URLSearchParams();
    params.set("year", String(nextYear));
    if (nextTeamId) params.set("team", nextTeamId);
    if (scope === "mine") params.set("scope", "mine");
    router.push(`/${orgSlug}/activiteiten?${params.toString()}`);
  }

  const showAuthorColumn = scope === "all";
  const sectionTitle = scope === "all" ? "Alle registraties" : "Mijn registraties";
  const description =
    scope === "all"
      ? isAdmin
        ? `Alle registraties in ${year}. Klik op bewerken om een registratie aan te passen.`
        : `Alle registraties in ${year}. Je kunt alleen je eigen registraties bewerken.`
      : `Jouw registraties in ${year}. Klik op bewerken om een registratie aan te passen.`;

  return (
    <>
      <section className={sectionShellClassName}>
        <header className="space-y-5 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {sectionTitle}
              </h1>
              <p className={sectionDescriptionClassName}>{description}</p>
            </div>
            <RegistrationsScopeToggle
              orgSlug={orgSlug}
              scope={scope}
              selectedTeamId={selectedTeamId}
              year={year}
            />
          </div>
        </header>

        <div className="space-y-5 pb-6">
          <div className="flex flex-wrap gap-4">
            {years.length > 0 ? (
              <div className="space-y-2">
                <p className={sectionLabelClassName}>Jaar</p>
                <div className="inline-flex flex-wrap gap-2">
                  {years.map((optionYear) => (
                    <Button
                      key={optionYear}
                      type="button"
                      variant={optionYear === year ? "brand" : "outline"}
                      className={cn(
                        "min-h-9 rounded-full px-4",
                        optionYear !== year && "border-border/60 bg-card",
                      )}
                      onClick={() => navigateFilters(optionYear, selectedTeamId)}
                    >
                      {optionYear}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {isAdmin && teams.length > 0 ? (
              <div className="w-full space-y-2 sm:w-auto">
                <p className={sectionLabelClassName} id="team-filter-label">
                  Team
                </p>
                <select
                  id="team-filter"
                  aria-labelledby="team-filter-label"
                  className="h-10 w-full min-w-0 rounded-full border border-border/60 bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 sm:min-w-[12rem] sm:w-auto"
                  value={selectedTeamId ?? "all"}
                  onChange={(event) =>
                    navigateFilters(year, event.target.value === "all" ? null : event.target.value)
                  }
                >
                  <option value="all">Alle teams</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon="edit_note" message="Nog geen registraties voor deze selectie." />
        ) : (
          <>
            <div className={mobileDataListClassName}>
              {rows.map((row) => (
                <RegistrationListRowCard
                  key={row.id}
                  onDelete={() => setDeleteModal({ type: "delete", row })}
                  onEdit={() => router.push(`/${orgSlug}/activiteiten/${row.id}/bewerken`)}
                  row={row}
                  showAuthor={showAuthorColumn}
                />
              ))}
            </div>

            <div className={desktopTableScrollClassName}>
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className={tableRowBorderClassName}>
                    <th className={tableHeadClassName}>Datum</th>
                    <th className={tableHeadClassName}>Activiteit</th>
                    <th className={tableHeadClassName}>Team</th>
                    <th className={tableHeadRightClassName}>Eco</th>
                    <th className={tableHeadRightClassName}>Sociaal</th>
                    {showAuthorColumn ? <th className={tableHeadClassName}>Medewerker</th> : null}
                    <th className={tableHeadActionsClassName}>
                      <span className="sr-only">Acties</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className={tableRowBorderClassName}>
                      <td className="px-3 py-3.5 first:pl-6 sm:first:pl-8">
                        <span className={cellTextClassName}>
                          {formatRegistrationDate(row.happenedOn)}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex min-w-[10rem] items-center gap-2">
                          <span
                            aria-hidden
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: row.categoryColor ?? "var(--primary)" }}
                          />
                          <span className={cellTextClassName}>{row.interventionName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={cellTextClassName}>{row.teamName}</span>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <span className={cellTextClassName}>
                          {formatRegistrationQuantity(row.quantity)}{" "}
                          {formatRegistrationUnit(row.ecoUnit)}
                        </span>
                        <p className="text-xs font-semibold text-tertiary">
                          {formatRegistrationCo2Kg(row.co2KgCached)} kg CO₂
                        </p>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <span className={cellTextClassName}>
                          {formatRegistrationQuantity(row.socialQuantity)}{" "}
                          {formatRegistrationUnit(row.socialUnit)}
                        </span>
                        <p className="text-xs font-semibold text-primary">
                          {formatRegistrationSocialScore(row.socialScoreCached)} punten
                        </p>
                      </td>
                      {showAuthorColumn ? (
                        <td className="px-3 py-3.5">
                          <span className={cellTextClassName}>{row.authorEmail ?? "—"}</span>
                        </td>
                      ) : null}
                      <td className="px-6 py-3.5 sm:px-8">
                        {row.canEdit ? (
                          <div className="flex justify-end gap-1">
                            <RowIconButton
                              icon="edit"
                              label="Registratie bewerken"
                              onClick={() =>
                                router.push(`/${orgSlug}/activiteiten/${row.id}/bewerken`)
                              }
                            />
                            <RowIconButton
                              icon="delete"
                              label="Registratie verwijderen"
                              tone="destructive"
                              onClick={() => setDeleteModal({ type: "delete", row })}
                            />
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <ConfirmArchiveModal
        confirmLabel="Verwijderen"
        description={
          deleteModal.type === "delete"
            ? `Weet je zeker dat je de registratie "${deleteModal.row.interventionName}" van ${formatRegistrationDate(deleteModal.row.happenedOn)} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`
            : ""
        }
        onClose={() => setDeleteModal({ type: "closed" })}
        onConfirm={async () => {
          if (deleteModal.type !== "delete") return;
          const result = await deleteRegistration(orgSlug, deleteModal.row.id);
          if (result.status === "error") {
            throw new Error(result.message);
          }
          setDeleteModal({ type: "closed" });
          router.refresh();
        }}
        open={deleteModal.type === "delete"}
        pendingLabel="Verwijderen..."
        title="Registratie verwijderen"
      />
    </>
  );
}
