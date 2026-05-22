"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import { archiveTeam, createTeam, updateTeam } from "@/app/(app)/[orgSlug]/beheer/actions";
import { EditableTextCell } from "@/components/settings/editable-cells";
import { EmptyState, Field, FormError } from "@/components/settings/form-fields";
import {
  cellTextClassName,
  tableHeadActionsClassName,
  tableHeadClassName,
  tableHeadRightClassName,
  tableRowBorderClassName,
} from "@/components/settings/settings-styles";
import {
  ConfirmArchiveModal,
  MemberCountBadge,
  RowIconButton,
  SettingsSection,
  getErrorMessage,
} from "@/components/settings/settings-ui";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal, ModalActions } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export type SettingsTeam = {
  id: string;
  name: string;
};

type ArchiveModalState = { type: "closed" } | { type: "archive-team"; team: SettingsTeam };

type TeamsTabProps = {
  orgSlug: string;
  teamMemberships: Array<{ team_id: string; user_id: string }>;
  teams: SettingsTeam[];
};

export function TeamsTab({ orgSlug, teamMemberships, teams }: TeamsTabProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [archiveModal, setArchiveModal] = useState<ArchiveModalState>({ type: "closed" });

  const memberCountByTeam = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of teamMemberships) {
      counts.set(item.team_id, (counts.get(item.team_id) ?? 0) + 1);
    }
    return counts;
  }, [teamMemberships]);

  const totalMembers = useMemo(
    () => new Set(teamMemberships.map((item) => item.user_id)).size,
    [teamMemberships],
  );

  return (
    <>
      <SettingsSection
        actions={
          <Button
            type="button"
            variant="brand"
            className="min-h-10 rounded-full px-4"
            onClick={() => setCreateOpen(true)}
          >
            <Icon name="add" className="text-base" />
            Nieuw team
          </Button>
        }
        description={`${teams.length} ${teams.length === 1 ? "team" : "teams"} · ${totalMembers} ${totalMembers === 1 ? "medewerker" : "medewerkers"}. Klik op een waarde om te bewerken.`}
        title="Teams"
      >
        {teams.length === 0 ? (
          <EmptyState
            icon="groups"
            message="Nog geen teams. Voeg een team toe zodat medewerkers kunnen registreren."
          />
        ) : (
          <div className="-mx-6 mt-6 overflow-x-auto sm:-mx-8">
            <table className="w-full min-w-[36rem] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[58%]" />
                <col className="w-[28%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className={cn(tableRowBorderClassName, "border-b-2 border-border/80")}>
                  <th className={tableHeadClassName} scope="col">
                    Team
                  </th>
                  <th className={tableHeadRightClassName} scope="col">
                    Leden
                  </th>
                  <th className={tableHeadActionsClassName} scope="col">
                    <span className="sr-only">Acties</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <TeamRow
                    key={team.id}
                    isLast={index === teams.length - 1}
                    memberCount={memberCountByTeam.get(team.id) ?? 0}
                    onArchive={() => setArchiveModal({ type: "archive-team", team })}
                    onSaved={() => router.refresh()}
                    orgSlug={orgSlug}
                    team={team}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsSection>

      <TeamCreateModal onClose={() => setCreateOpen(false)} open={createOpen} orgSlug={orgSlug} />

      <ConfirmArchiveModal
        confirmLabel="Team archiveren"
        description={
          archiveModal.type === "archive-team"
            ? `Weet je zeker dat je "${archiveModal.team.name}" wilt archiveren? Het team verdwijnt uit instellingen, maar bestaande registraties blijven gekoppeld.`
            : ""
        }
        onClose={() => setArchiveModal({ type: "closed" })}
        onConfirm={async () => {
          if (archiveModal.type === "archive-team") {
            await archiveTeam(orgSlug, archiveModal.team.id);
          } else {
            return;
          }
          router.refresh();
          setArchiveModal({ type: "closed" });
        }}
        open={archiveModal.type === "archive-team"}
        pendingLabel="Archiveren..."
        title="Team archiveren"
      />
    </>
  );
}

function TeamRow({
  isLast,
  memberCount,
  onArchive,
  onSaved,
  orgSlug,
  team,
}: {
  isLast: boolean;
  memberCount: number;
  onArchive: () => void;
  onSaved: () => void;
  orgSlug: string;
  team: SettingsTeam;
}) {
  const [editingField, setEditingField] = useState<"name" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveName(rawValue: string) {
    if (isPending) return;

    const trimmed = rawValue.trim();
    if (trimmed === team.name) {
      setEditingField(null);
      return;
    }

    const formData = new FormData();
    formData.set("id", team.id);
    formData.set("name", trimmed);

    startTransition(async () => {
      try {
        await updateTeam(orgSlug, formData);
        setEditingField(null);
        setError(null);
        onSaved();
      } catch (submitError) {
        setError(getErrorMessage(submitError));
      }
    });
  }

  return (
    <>
      <tr
        className={cn(
          "align-middle transition hover:bg-card/40",
          !isLast && tableRowBorderClassName,
        )}
      >
        <td className="px-6 py-3.5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-tertiary-container text-tertiary"
            >
              <Icon name="groups" filled className="text-base" />
            </span>
            <div className="min-w-0 flex-1">
              <EditableTextCell
                editing={editingField === "name"}
                isPending={isPending}
                label="Teamnaam"
                onCancel={() => setEditingField(null)}
                onSave={saveName}
                onStartEdit={() => {
                  if (isPending) return;
                  setError(null);
                  setEditingField("name");
                }}
                value={team.name}
              >
                <span className={cn(cellTextClassName, "truncate")}>{team.name}</span>
              </EditableTextCell>
            </div>
          </div>
        </td>
        <td className="px-3 py-3.5 text-right">
          <MemberCountBadge count={memberCount} />
        </td>
        <td className="px-6 py-3.5 text-right sm:px-8">
          <RowIconButton
            icon="delete"
            label={`${team.name} archiveren`}
            onClick={onArchive}
            tone="destructive"
          />
        </td>
      </tr>
      {error ? (
        <tr>
          <td className="px-6 pb-3 sm:px-8" colSpan={3}>
            <FormError message={error} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function TeamCreateModal({
  onClose,
  open,
  orgSlug,
}: {
  onClose: () => void;
  open: boolean;
  orgSlug: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createTeam(orgSlug, formData);
        router.refresh();
        onClose();
      } catch (submitError) {
        setError(getErrorMessage(submitError));
      }
    });
  }

  return (
    <Modal
      description="Teams groeperen medewerkers voor registratie en rapportage."
      footer={
        <ModalActions>
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            Annuleren
          </Button>
          <Button
            form="create-team-form"
            type="submit"
            variant="brand"
            className="min-h-11 rounded-full px-6"
            disabled={isPending}
          >
            {isPending ? "Opslaan..." : "Team toevoegen"}
          </Button>
        </ModalActions>
      }
      onClose={onClose}
      open={open}
      title="Nieuw team"
    >
      <form className="space-y-5" id="create-team-form" onSubmit={handleSubmit}>
        <Field label="Teamnaam" name="name" placeholder="Bijv. LEV Helmond" required />
        {error ? <FormError message={error} /> : null}
      </form>
    </Modal>
  );
}
