"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import {
  provisionUser,
  removeMember,
  updateMemberTeam,
  updateMembership,
} from "@/app/(app)/[orgSlug]/beheer/actions";
import { EditableSelectCell } from "@/components/settings/editable-cells";
import { EmptyState, Field, FormError, SelectField } from "@/components/settings/form-fields";
import {
  MobileRowActionGroup,
  SettingsMobileField,
  SettingsMobileRowCard,
} from "@/components/settings/mobile-row-card";
import {
  cellTextClassName,
  desktopTableWrapClassName,
  mobileDataListClassName,
  tableHeadActionsClassName,
  tableHeadClassName,
  tableRowBorderClassName,
} from "@/components/settings/settings-styles";
import {
  ConfirmArchiveModal,
  RowIconButton,
  SettingsSection,
  getErrorMessage,
} from "@/components/settings/settings-ui";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal, ModalActions } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

import type { SettingsTeam } from "@/components/settings/teams-tab";

export type SettingsMember = {
  role: string;
  user_id: string;
};

type ArchiveModalState =
  | { type: "closed" }
  | { type: "remove-member"; email: string; userId: string };

type MembersTabProps = {
  emailByUserId: Record<string, string>;
  memberships: SettingsMember[];
  orgSlug: string;
  teamMemberships: Array<{ team_id: string; user_id: string }>;
  teams: SettingsTeam[];
};

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Medewerker", value: "worker" },
];

export function MembersTab({
  emailByUserId,
  memberships,
  orgSlug,
  teamMemberships,
  teams,
}: MembersTabProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [archiveModal, setArchiveModal] = useState<ArchiveModalState>({ type: "closed" });

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);

  const teamIdByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of teamMemberships) {
      if (!map.has(item.user_id)) {
        map.set(item.user_id, item.team_id);
      }
    }
    return map;
  }, [teamMemberships]);

  const teamOptions = useMemo(
    () => teams.map((team) => ({ label: team.name, value: team.id })),
    [teams],
  );

  return (
    <>
      <SettingsSection
        actions={
          <Button
            type="button"
            variant="brand"
            className="min-h-10 rounded-full px-4"
            disabled={teams.length === 0}
            onClick={() => setCreateOpen(true)}
          >
            <Icon name="person_add" className="text-base" />
            Medewerker toevoegen
          </Button>
        }
        description={`${memberships.length} ${memberships.length === 1 ? "lid" : "leden"} in deze organisatie. Klik op rol of team om te bewerken.`}
        title="Medewerkers"
      >
        {teams.length === 0 ? (
          <EmptyState
            icon="groups"
            message="Maak eerst een team aan voordat je medewerkers kunt toevoegen."
          />
        ) : memberships.length === 0 ? (
          <EmptyState
            icon="group_off"
            message="Nog geen medewerkers. Voeg de eerste medewerker toe via de knop hierboven."
          />
        ) : (
          <>
            <div className={mobileDataListClassName}>
              {memberships.map((membership) => {
                const email = emailByUserId[membership.user_id] ?? membership.user_id;
                const displayName = email.split("@")[0] ?? email;
                const teamId = teamIdByUserId.get(membership.user_id) ?? "";
                const teamName = teamId ? (teamById.get(teamId) ?? "Onbekend team") : "Geen team";

                return (
                  <MemberRow
                    key={`${membership.user_id}-mobile`}
                    displayName={displayName}
                    email={email}
                    layout="card"
                    membership={membership}
                    onRemove={() =>
                      setArchiveModal({
                        type: "remove-member",
                        email,
                        userId: membership.user_id,
                      })
                    }
                    onSaved={() => router.refresh()}
                    orgSlug={orgSlug}
                    teamId={teamId}
                    teamName={teamName}
                    teamOptions={teamOptions}
                  />
                );
              })}
            </div>

            <div className={desktopTableWrapClassName}>
              <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[18%]" />
                  <col className="w-[26%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead>
                  <tr className={cn(tableRowBorderClassName, "border-b-2 border-border/80")}>
                    <th className={tableHeadClassName} scope="col">
                      Medewerker
                    </th>
                    <th className={tableHeadClassName} scope="col">
                      Rol
                    </th>
                    <th className={tableHeadClassName} scope="col">
                      Team
                    </th>
                    <th className={tableHeadActionsClassName} scope="col">
                      <span className="sr-only">Acties</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((membership, index) => {
                    const email = emailByUserId[membership.user_id] ?? membership.user_id;
                    const displayName = email.split("@")[0] ?? email;
                    const teamId = teamIdByUserId.get(membership.user_id) ?? "";
                    const teamName = teamId
                      ? (teamById.get(teamId) ?? "Onbekend team")
                      : "Geen team";

                    return (
                      <MemberRow
                        key={membership.user_id}
                        displayName={displayName}
                        email={email}
                        isLast={index === memberships.length - 1}
                        layout="table"
                        membership={membership}
                        onRemove={() =>
                          setArchiveModal({
                            type: "remove-member",
                            email,
                            userId: membership.user_id,
                          })
                        }
                        onSaved={() => router.refresh()}
                        orgSlug={orgSlug}
                        teamId={teamId}
                        teamName={teamName}
                        teamOptions={teamOptions}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SettingsSection>

      <MemberCreateModal
        onClose={() => setCreateOpen(false)}
        open={createOpen}
        orgSlug={orgSlug}
        teams={teams}
      />

      <ConfirmArchiveModal
        confirmLabel="Verwijderen"
        description={
          archiveModal.type === "remove-member"
            ? `Weet je zeker dat je ${archiveModal.email} wilt verwijderen uit deze organisatie?`
            : ""
        }
        onClose={() => setArchiveModal({ type: "closed" })}
        onConfirm={async () => {
          if (archiveModal.type === "remove-member") {
            await removeMember(orgSlug, archiveModal.userId);
          } else {
            return;
          }
          router.refresh();
          setArchiveModal({ type: "closed" });
        }}
        open={archiveModal.type === "remove-member"}
        title="Medewerker verwijderen"
      />
    </>
  );
}

function MemberRow({
  displayName,
  email,
  isLast = true,
  layout,
  membership,
  onRemove,
  onSaved,
  orgSlug,
  teamId,
  teamName,
  teamOptions,
}: {
  displayName: string;
  email: string;
  isLast?: boolean;
  layout: "card" | "table";
  membership: SettingsMember;
  onRemove: () => void;
  onSaved: () => void;
  orgSlug: string;
  teamId: string;
  teamName: string;
  teamOptions: Array<{ label: string; value: string }>;
}) {
  const [editingField, setEditingField] = useState<"role" | "team" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isAdmin = membership.role === "admin";
  const initials = getInitials(displayName);

  function saveRole(nextRole: string) {
    if (isPending || nextRole === membership.role) {
      setEditingField(null);
      return;
    }

    const formData = new FormData();
    formData.set("userId", membership.user_id);
    formData.set("role", nextRole);

    startTransition(async () => {
      try {
        await updateMembership(orgSlug, formData);
        setEditingField(null);
        setError(null);
        onSaved();
      } catch (submitError) {
        setError(getErrorMessage(submitError));
      }
    });
  }

  function saveTeam(nextTeamId: string) {
    if (isPending || !nextTeamId || nextTeamId === teamId) {
      setEditingField(null);
      return;
    }

    const formData = new FormData();
    formData.set("userId", membership.user_id);
    formData.set("teamId", nextTeamId);

    startTransition(async () => {
      try {
        await updateMemberTeam(orgSlug, formData);
        setEditingField(null);
        setError(null);
        onSaved();
      } catch (submitError) {
        setError(getErrorMessage(submitError));
      }
    });
  }

  const roleEditor = (
    <EditableSelectCell
      editing={editingField === "role"}
      isPending={isPending}
      label="Rol"
      onCancel={() => setEditingField(null)}
      onSave={saveRole}
      onStartEdit={() => {
        if (isPending) return;
        setError(null);
        setEditingField("role");
      }}
      options={roleOptions}
      value={membership.role}
    >
      <RoleBadge role={membership.role} />
    </EditableSelectCell>
  );

  const teamEditor = isAdmin ? (
    <span className="text-sm text-muted-foreground">N.v.t.</span>
  ) : teamOptions.length === 0 ? (
    <span className="text-sm text-muted-foreground">Geen team</span>
  ) : (
    <EditableSelectCell
      editing={editingField === "team"}
      isPending={isPending}
      label="Team"
      onCancel={() => setEditingField(null)}
      onSave={saveTeam}
      onStartEdit={() => {
        if (isPending) return;
        setError(null);
        setEditingField("team");
      }}
      options={teamOptions}
      value={teamId || teamOptions[0]?.value || ""}
    >
      <span className={cellTextClassName}>{teamName}</span>
    </EditableSelectCell>
  );

  const identityBlock = (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-sm font-bold",
          isAdmin ? "bg-primary-container text-primary" : "bg-secondary-container text-secondary",
        )}
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className={cn(cellTextClassName, "truncate")}>{displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );

  if (layout === "card") {
    return (
      <SettingsMobileRowCard>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">{identityBlock}</div>
          <MobileRowActionGroup>
            <RowIconButton
              icon="delete"
              label={`${email} verwijderen`}
              onClick={onRemove}
              tone="destructive"
            />
          </MobileRowActionGroup>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          <SettingsMobileField label="Rol">{roleEditor}</SettingsMobileField>
          <SettingsMobileField label="Team">{teamEditor}</SettingsMobileField>
        </div>
        {error ? (
          <div className="mt-2">
            <FormError message={error} />
          </div>
        ) : null}
      </SettingsMobileRowCard>
    );
  }

  return (
    <>
      <tr
        className={cn(
          "align-middle transition hover:bg-card/40",
          !isLast && tableRowBorderClassName,
        )}
      >
        <td className="px-6 py-3.5 sm:px-8">{identityBlock}</td>
        <td className="px-3 py-3.5">{roleEditor}</td>
        <td className="px-3 py-3.5">{teamEditor}</td>
        <td className="px-6 py-3.5 text-right sm:px-8">
          <RowIconButton
            icon="delete"
            label={`${email} verwijderen`}
            onClick={onRemove}
            tone="destructive"
          />
        </td>
      </tr>
      {error ? (
        <tr>
          <td className="px-6 pb-3 sm:px-8" colSpan={4}>
            <FormError message={error} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-foreground">
      {isAdmin ? "Admin" : "Medewerker"}
    </span>
  );
}

function MemberCreateModal({
  onClose,
  open,
  orgSlug,
  teams,
}: {
  onClose: () => void;
  open: boolean;
  orgSlug: string;
  teams: SettingsTeam[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<"admin" | "worker">("worker");

  useEffect(() => {
    if (open) {
      setError(null);
      setRole("worker");
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await provisionUser(orgSlug, formData);
        router.refresh();
        onClose();
      } catch (submitError) {
        setError(getErrorMessage(submitError));
      }
    });
  }

  return (
    <Modal
      description="Medewerkers loggen zelf in via /login. Ze ontvangen geen uitnodigingsmail."
      footer={
        <ModalActions>
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            Annuleren
          </Button>
          <Button
            form="create-member-form"
            type="submit"
            variant="brand"
            className="min-h-11 rounded-full px-6"
            disabled={isPending}
          >
            {isPending ? "Opslaan..." : "Medewerker toevoegen"}
          </Button>
        </ModalActions>
      }
      onClose={onClose}
      open={open}
      title="Medewerker toevoegen"
    >
      <form className="space-y-5" id="create-member-form" onSubmit={handleSubmit}>
        <Field
          label="E-mailadres"
          name="email"
          placeholder="collega@organisatie.nl"
          required
          type="email"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            defaultValue="worker"
            label="Rol"
            name="role"
            onChange={(event) => setRole(event.currentTarget.value as "admin" | "worker")}
            options={roleOptions}
          />
          {role === "worker" ? (
            <SelectField
              emptyOption="Kies team..."
              helper="Verplicht voor medewerkers."
              label="Team"
              name="teamId"
              options={teams.map((team) => ({ label: team.name, value: team.id }))}
            />
          ) : (
            <input name="teamId" type="hidden" value="" />
          )}
        </div>
        {error ? <FormError message={error} /> : null}
      </form>
    </Modal>
  );
}

function getInitials(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  if (!cleaned) return "??";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) {
    return (parts[0] ?? "").slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}
