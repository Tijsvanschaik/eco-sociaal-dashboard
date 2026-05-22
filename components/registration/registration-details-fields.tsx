import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { inputSurfaceClassName } from "@/components/registration/quantity-fields";
import { SectionLabel } from "@/components/registration/registration-section";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TeamOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

type RegistrationDetailsFieldsProps = {
  happenedOn: string;
  note: string | undefined;
  onDateBlur: () => void;
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNoteBlur: () => void;
  onNoteChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTeamSelect: (teamId: string) => void;
  photoField: React.ReactNode;
  selectedTeamId: string;
  teams: TeamOption[];
};

export function RegistrationDetailsFields({
  happenedOn,
  note,
  onDateBlur,
  onDateChange,
  onNoteBlur,
  onNoteChange,
  onTeamSelect,
  photoField,
  selectedTeamId,
  teams,
}: RegistrationDetailsFieldsProps) {
  return (
    <DashboardPanel
      contentClassName="space-y-6"
      description="Datum, team, notitie en optionele foto."
      icon="edit_note"
      iconTone="neutral"
      title="Overige gegevens"
    >
      <div className="max-w-md space-y-2">
        <SectionLabel>Wanneer?</SectionLabel>
        <Input
          className={cn("h-12 w-full text-base font-medium", inputSurfaceClassName)}
          name="happenedOn"
          onBlur={onDateBlur}
          onChange={onDateChange}
          type="date"
          value={happenedOn}
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Op welke datum is de activiteit uitgevoerd.
        </p>
      </div>

      {teams.length > 1 ? (
        <div className="space-y-2">
          <SectionLabel>Voor welk team?</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => {
              const selected = selectedTeamId === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onTeamSelect(team.id)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                    selected
                      ? "border-primary bg-primary-container text-on-primary-container shadow-sm"
                      : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <Icon
                    name={selected ? "check_circle" : "groups"}
                    className="text-base"
                    filled={selected}
                  />
                  {team.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <SectionLabel>
          Notitie <span className="font-normal text-muted-foreground">(optioneel)</span>
        </SectionLabel>
        <Textarea
          className={cn("min-h-24 w-full text-base md:text-base", inputSurfaceClassName)}
          name="note"
          onBlur={onNoteBlur}
          onChange={onNoteChange}
          placeholder="Bijvoorbeeld: 4 km met de fiets in plaats van de auto."
          value={note ?? ""}
        />
      </div>

      {photoField}
    </DashboardPanel>
  );
}
