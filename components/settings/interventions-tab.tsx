"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  archiveIntervention,
  createCategory,
  createIntervention,
  updateIntervention,
} from "@/app/(app)/[orgSlug]/beheer/actions";
import {
  EditableNumberCell,
  EditableSelectCell,
  EditableTextCell,
} from "@/components/settings/editable-cells";
import {
  EmptyState,
  Field,
  FormError,
  FormSection,
  SelectField,
} from "@/components/settings/form-fields";
import {
  cellTextClassName,
  modalFieldHelperClassName,
  sectionDescriptionClassName,
  sectionLabelClassName,
  sectionShellClassName,
  sectionTitleClassName,
  tableHeadActionsClassName,
  tableHeadClassName,
  tableHeadRightClassName,
  tableRowBorderClassName,
  tableSectionBorderClassName,
} from "@/components/settings/settings-styles";
import {
  ConfirmArchiveModal,
  getErrorMessage,
  RowIconButton,
} from "@/components/settings/settings-ui";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal, ModalActions } from "@/components/ui/modal";
import { iconForCategory } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

export type SettingsCategory = {
  color: string;
  id: string;
  name: string;
};

export type SettingsIntervention = {
  category_id: string;
  co2_factor_kg: number;
  eco_unit: string;
  id: string;
  name: string;
  social_score_factor: number;
  social_unit: string;
};

type CreateModalState =
  | { type: "closed" }
  | { type: "create-category" }
  | { type: "create-intervention" };

type ArchiveModalState =
  | { type: "closed" }
  | { type: "archive-intervention"; intervention: SettingsIntervention };

type InterventionsTabProps = {
  categories: SettingsCategory[];
  interventions: SettingsIntervention[];
  orgSlug: string;
};

const categoryIconClassName =
  "inline-flex shrink-0 items-center justify-center rounded-sm text-white shadow-sm";

function categoryIconSizeClassName(size: "sm" | "md" = "md") {
  return size === "sm" ? "h-8 w-8" : "h-9 w-9";
}

type EditableField =
  | "name"
  | "categoryId"
  | "ecoUnit"
  | "co2FactorKg"
  | "socialUnit"
  | "socialScoreFactor";

export function InterventionsTab({ categories, interventions, orgSlug }: InterventionsTabProps) {
  const router = useRouter();
  const [createModal, setCreateModal] = useState<CreateModalState>({ type: "closed" });
  const [archiveModal, setArchiveModal] = useState<ArchiveModalState>({ type: "closed" });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const filteredInterventions = useMemo(() => {
    if (!categoryFilter) return interventions;
    return interventions.filter((intervention) => intervention.category_id === categoryFilter);
  }, [categoryFilter, interventions]);

  return (
    <>
      <section className={sectionShellClassName}>
        <header className="space-y-5 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className={sectionTitleClassName}>Interventies</h3>
              <p className={sectionDescriptionClassName}>
                Stel activiteiten in die medewerkers kunnen kiezen bij registratie. Klik op een
                waarde om te bewerken.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-10 rounded-full border-border/60 bg-card px-4"
                onClick={() => setCreateModal({ type: "create-category" })}
              >
                <Icon name="palette" className="text-base" />
                Nieuwe categorie
              </Button>
              <Button
                type="button"
                variant="brand"
                className="min-h-10 rounded-full px-4"
                onClick={() => setCreateModal({ type: "create-intervention" })}
              >
                <Icon name="add" className="text-base" />
                Nieuwe interventie
              </Button>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className={sectionLabelClassName}>Filter op categorie</p>
            {categories.length === 0 ? (
              <p className={sectionDescriptionClassName}>
                Nog geen categorieën. Voeg er eerst een toe via &quot;Nieuwe categorie&quot;.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <CategoryFilterButton
                  active={categoryFilter === null}
                  ariaLabel="Alle categorieën"
                  icon="apps"
                  onClick={() => setCategoryFilter(null)}
                  title={`Alle (${interventions.length})`}
                />
                {categories.map((category) => {
                  const count = interventions.filter(
                    (intervention) => intervention.category_id === category.id,
                  ).length;

                  return (
                    <CategoryFilterButton
                      key={category.id}
                      active={categoryFilter === category.id}
                      ariaLabel={`Filter op ${category.name}`}
                      color={category.color}
                      icon={iconForCategory(category.name)}
                      onClick={() =>
                        setCategoryFilter((current) =>
                          current === category.id ? null : category.id,
                        )
                      }
                      title={`${category.name} (${count})`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {interventions.length === 0 ? (
          <EmptyState
            icon="eco"
            message="Nog geen interventies. Voeg een categorie en interventie toe om te starten."
          />
        ) : filteredInterventions.length === 0 ? (
          <EmptyState
            icon="filter_alt"
            message="Geen interventies in deze categorie. Kies een andere filter."
          />
        ) : (
          <div className="-mx-6 mt-6 overflow-x-auto sm:-mx-8">
            <table className="w-full min-w-[52rem] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[26%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead>
                <tr className={cn(tableRowBorderClassName, "border-b-2 border-border/80")}>
                  <th className={tableHeadClassName} scope="col">
                    Interventie
                  </th>
                  <th className={tableHeadClassName} scope="col">
                    Categorie
                  </th>
                  <th className={tableHeadClassName} scope="col">
                    Eco-eenheid
                  </th>
                  <th className={tableHeadRightClassName} scope="col">
                    CO₂-factor
                  </th>
                  <th
                    className={cn(tableHeadClassName, tableSectionBorderClassName)}
                    scope="col"
                  >
                    Sociale eenheid
                  </th>
                  <th className={tableHeadRightClassName} scope="col">
                    Score
                  </th>
                  <th className={tableHeadActionsClassName} scope="col">
                    <span className="sr-only">Acties</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInterventions.map((intervention, index) => (
                  <InterventionRow
                    key={intervention.id}
                    categories={categories}
                    category={categoryMap.get(intervention.category_id)}
                    intervention={intervention}
                    isLast={index === filteredInterventions.length - 1}
                    onDelete={() =>
                      setArchiveModal({ type: "archive-intervention", intervention })
                    }
                    onSaved={() => router.refresh()}
                    orgSlug={orgSlug}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CategoryCreateModal
        onClose={() => setCreateModal({ type: "closed" })}
        open={createModal.type === "create-category"}
        orgSlug={orgSlug}
      />

      <InterventionCreateModal
        categories={categories}
        onClose={() => setCreateModal({ type: "closed" })}
        open={createModal.type === "create-intervention"}
        orgSlug={orgSlug}
      />

      <ConfirmArchiveModal
        description={
          archiveModal.type === "archive-intervention"
            ? `Weet je zeker dat je "${archiveModal.intervention.name}" wilt verwijderen? Bestaande registraties blijven bewaard, maar medewerkers kunnen deze activiteit niet meer kiezen.`
            : ""
        }
        onClose={() => setArchiveModal({ type: "closed" })}
        onConfirm={async () => {
          if (archiveModal.type === "archive-intervention") {
            await archiveIntervention(orgSlug, archiveModal.intervention.id);
          } else {
            return;
          }
          router.refresh();
          setArchiveModal({ type: "closed" });
        }}
        open={archiveModal.type === "archive-intervention"}
        title="Interventie verwijderen"
      />
    </>
  );
}

function InterventionRow({
  categories,
  category,
  intervention,
  isLast,
  onDelete,
  onSaved,
  orgSlug,
}: {
  categories: SettingsCategory[];
  category?: SettingsCategory;
  intervention: SettingsIntervention;
  isLast: boolean;
  onDelete: () => void;
  onSaved: () => void;
  orgSlug: string;
}) {
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const icon = iconForCategory(category?.name ?? "");

  function startEditing(field: EditableField) {
    if (isPending) return;
    setError(null);
    setEditingField(field);
  }

  function cancelEditing() {
    if (isPending) return;
    setEditingField(null);
    setError(null);
  }

  function saveField(field: EditableField, rawValue: string) {
    if (isPending) return;

    const trimmed = rawValue.trim();
    if (!hasFieldChanged(field, trimmed, intervention)) {
      setEditingField(null);
      return;
    }

    const formData = buildInterventionFormData(intervention, field, trimmed);

    startTransition(async () => {
      try {
        await updateIntervention(orgSlug, formData);
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
            <CategoryIconSquare color={category?.color ?? "#6b7280"} icon={icon} />
            <div className="min-w-0 flex-1">
              <EditableTextCell
                align="left"
                editing={editingField === "name"}
                isPending={isPending}
                label="Naam"
                onCancel={cancelEditing}
                onSave={(value) => saveField("name", value)}
                onStartEdit={() => startEditing("name")}
                value={intervention.name}
              >
                <span className={cn(cellTextClassName, "truncate")}>{intervention.name}</span>
              </EditableTextCell>
            </div>
          </div>
        </td>
        <td className="px-3 py-3.5">
          <EditableCategoryCell
            categories={categories}
            category={category}
            editing={editingField === "categoryId"}
            isPending={isPending}
            onCancel={cancelEditing}
            onSave={(value) => saveField("categoryId", value)}
            onStartEdit={() => startEditing("categoryId")}
            value={intervention.category_id}
          />
        </td>
        <td className="px-3 py-3.5">
          <EditableTextCell
            editing={editingField === "ecoUnit"}
            isPending={isPending}
            label="Eco-eenheid"
            onCancel={cancelEditing}
            onSave={(value) => saveField("ecoUnit", value)}
            onStartEdit={() => startEditing("ecoUnit")}
            value={intervention.eco_unit}
          >
            <UnitBadge label={intervention.eco_unit} />
          </EditableTextCell>
        </td>
        <td className="px-3 py-3.5 text-right tabular-nums">
          <EditableNumberCell
            align="right"
            editing={editingField === "co2FactorKg"}
            isPending={isPending}
            label="CO₂-factor"
            onCancel={cancelEditing}
            onSave={(value) => saveField("co2FactorKg", value)}
            onStartEdit={() => startEditing("co2FactorKg")}
            suffix={`kg/${intervention.eco_unit}`}
            value={intervention.co2_factor_kg}
          />
        </td>
        <td className={cn("px-3 py-3.5", tableSectionBorderClassName)}>
          <EditableTextCell
            editing={editingField === "socialUnit"}
            isPending={isPending}
            label="Sociale eenheid"
            onCancel={cancelEditing}
            onSave={(value) => saveField("socialUnit", value)}
            onStartEdit={() => startEditing("socialUnit")}
            value={intervention.social_unit}
          >
            <UnitBadge label={intervention.social_unit} />
          </EditableTextCell>
        </td>
        <td className="px-3 py-3.5 text-right tabular-nums">
          <EditableNumberCell
            align="right"
            editing={editingField === "socialScoreFactor"}
            isPending={isPending}
            label="Sociale score"
            onCancel={cancelEditing}
            onSave={(value) => saveField("socialScoreFactor", value)}
            onStartEdit={() => startEditing("socialScoreFactor")}
            suffix={`score/${intervention.social_unit}`}
            value={intervention.social_score_factor}
          />
        </td>
        <td className="px-6 py-3.5 text-right sm:px-8">
          <RowIconButton
            icon="delete"
            label={`${intervention.name} verwijderen`}
            onClick={onDelete}
            tone="destructive"
          />
        </td>
      </tr>
      {error ? (
        <tr>
          <td className="px-6 pb-3 sm:px-8" colSpan={7}>
            <FormError message={error} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function buildInterventionFormData(
  intervention: SettingsIntervention,
  field: EditableField,
  rawValue: string,
): FormData {
  const formData = new FormData();
  formData.set("id", intervention.id);
  formData.set("name", field === "name" ? rawValue : intervention.name);
  formData.set("categoryId", field === "categoryId" ? rawValue : intervention.category_id);
  formData.set("ecoUnit", field === "ecoUnit" ? rawValue : intervention.eco_unit);
  formData.set("socialUnit", field === "socialUnit" ? rawValue : intervention.social_unit);
  formData.set(
    "co2FactorKg",
    field === "co2FactorKg" ? rawValue : String(intervention.co2_factor_kg),
  );
  formData.set(
    "socialScoreFactor",
    field === "socialScoreFactor" ? rawValue : String(intervention.social_score_factor),
  );
  return formData;
}

function hasFieldChanged(
  field: EditableField,
  rawValue: string,
  intervention: SettingsIntervention,
): boolean {
  switch (field) {
    case "name":
      return rawValue !== intervention.name;
    case "categoryId":
      return rawValue !== intervention.category_id;
    case "ecoUnit":
      return rawValue !== intervention.eco_unit;
    case "socialUnit":
      return rawValue !== intervention.social_unit;
    case "co2FactorKg":
      return Number(rawValue) !== intervention.co2_factor_kg;
    case "socialScoreFactor":
      return Number(rawValue) !== intervention.social_score_factor;
    default:
      return false;
  }
}

function CategoryIconSquare({
  color,
  icon,
  size = "md",
}: {
  color: string;
  icon: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden
      className={cn(categoryIconClassName, categoryIconSizeClassName(size))}
      style={{ backgroundColor: color }}
    >
      <Icon name={icon} filled className={size === "sm" ? "text-sm" : "text-base"} />
    </span>
  );
}

function CategoryFilterButton({
  active,
  ariaLabel,
  color,
  icon,
  onClick,
  title,
}: {
  active: boolean;
  ariaLabel: string;
  color?: string;
  icon: string;
  onClick: () => void;
  title: string;
}) {
  const isColored = Boolean(color);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={cn(
        categoryIconClassName,
        categoryIconSizeClassName("sm"),
        "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isColored ? "border border-black/5" : "border border-border/50 bg-card text-primary",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low",
        !active && isColored && "hover:brightness-95",
        !active && !isColored && "hover:border-primary/30",
      )}
      style={isColored ? { backgroundColor: color } : undefined}
    >
      <Icon
        name={icon}
        filled
        className={cn("text-base", isColored ? "text-white" : "text-primary")}
      />
    </button>
  );
}

function CategoryLabel({ color, name }: { color: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

function EditableCategoryCell({
  categories,
  category,
  editing,
  isPending,
  onCancel,
  onSave,
  onStartEdit,
  value,
}: {
  categories: SettingsCategory[];
  category?: SettingsCategory;
  editing: boolean;
  isPending: boolean;
  onCancel: () => void;
  onSave: (value: string) => void;
  onStartEdit: () => void;
  value: string;
}) {
  return (
    <EditableSelectCell
      editing={editing}
      isPending={isPending}
      label="Categorie"
      onCancel={onCancel}
      onSave={onSave}
      onStartEdit={onStartEdit}
      options={categories.map((item) => ({ label: item.name, value: item.id }))}
      value={value}
    >
      {category ? (
        <CategoryLabel color={category.color} name={category.name} />
      ) : (
        <span className="inline-flex items-center rounded-sm bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          Onbekend
        </span>
      )}
    </EditableSelectCell>
  );
}

function CategoryCreateModal({
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
        await createCategory(orgSlug, formData);
        router.refresh();
        onClose();
      } catch (submitError) {
        setError(getErrorMessage(submitError));
      }
    });
  }

  return (
    <Modal
      description="Groeperen interventies en bepalen de kleur in grafieken."
      footer={
        <ModalActions>
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            Annuleren
          </Button>
          <Button
            form="create-category-form"
            type="submit"
            variant="brand"
            className="min-h-11 rounded-full px-6"
            disabled={isPending}
          >
            {isPending ? "Opslaan..." : "Categorie toevoegen"}
          </Button>
        </ModalActions>
      }
      onClose={onClose}
      open={open}
      title="Nieuwe categorie"
    >
      <form className="space-y-5" id="create-category-form" onSubmit={handleSubmit}>
        <Field label="Naam" name="name" placeholder="Bijv. Mobiliteit" required />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field className="sm:w-28" defaultValue="#6b7280" label="Kleur" name="color" required type="color" />
          <p className={cn(modalFieldHelperClassName, "sm:pb-2.5")}>
            Deze kleur gebruiken we in grafieken en op het dashboard.
          </p>
        </div>
        {error ? <FormError message={error} /> : null}
      </form>
    </Modal>
  );
}

function InterventionCreateModal({
  categories,
  onClose,
  open,
  orgSlug,
}: {
  categories: SettingsCategory[];
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
        await createIntervention(orgSlug, formData);
        router.refresh();
        onClose();
      } catch (submitError) {
        setError(getErrorMessage(submitError));
      }
    });
  }

  return (
    <Modal
      description="Concrete activiteit met eco- en sociale eenheden plus bijbehorende factoren."
      footer={
        categories.length === 0 ? undefined : (
          <ModalActions>
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
              Annuleren
            </Button>
            <Button
              form="create-intervention-form"
              type="submit"
              variant="brand"
              className="min-h-11 rounded-full px-6"
              disabled={isPending}
            >
              {isPending ? "Opslaan..." : "Interventie toevoegen"}
            </Button>
          </ModalActions>
        )
      }
      onClose={onClose}
      open={open}
      size="xl"
      title="Nieuwe interventie"
    >
      {categories.length === 0 ? (
        <EmptyState
          icon="palette"
          message="Maak eerst een categorie aan voordat je interventies toevoegt."
        />
      ) : (
        <form className="space-y-6" id="create-intervention-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Field label="Naam" name="name" placeholder="Bijv. Met de fiets" required />
            <SelectField
              emptyOption="Kies categorie..."
              label="Categorie"
              name="categoryId"
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>

          <FormSection title="Eco-impact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                helper="Label bij registratie voor de eco-hoeveelheid."
                label="Eco-eenheid"
                name="ecoUnit"
                placeholder="uur"
                required
              />
              <Field
                helper="Kg CO₂ bespaard per eco-eenheid."
                label="CO₂ per eco-eenheid (kg)"
                min="0"
                name="co2FactorKg"
                placeholder="0,150"
                required
                step="0.001"
                type="number"
              />
            </div>
          </FormSection>

          <FormSection title="Sociale impact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                helper="Label bij registratie voor de sociale hoeveelheid."
                label="Sociale eenheid"
                name="socialUnit"
                placeholder="personen"
                required
              />
              <Field
                helper="Relatieve score per sociale eenheid."
                label="Score per sociale eenheid"
                min="0"
                name="socialScoreFactor"
                placeholder="0"
                required
                step="0.001"
                type="number"
              />
            </div>
          </FormSection>

          {error ? <FormError message={error} /> : null}
        </form>
      )}
    </Modal>
  );
}

function UnitBadge({ label }: { label: string }) {
  return <span className="text-sm font-medium text-foreground">{label}</span>;
}
