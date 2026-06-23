export const sectionShellClassName =
  "rounded-[2rem] bg-surface-container-low p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8";

export const sectionTitleClassName = "text-lg font-bold tracking-tight text-foreground";
export const sectionDescriptionClassName = "text-sm leading-relaxed text-muted-foreground";
export const sectionLabelClassName = "text-sm font-medium text-muted-foreground";
export const cellTextClassName = "text-sm font-medium text-foreground";

export const tableHeadClassName =
  "whitespace-nowrap px-3 py-3.5 align-middle text-left text-sm font-semibold leading-none text-muted-foreground first:pl-6 sm:first:pl-8";
export const tableHeadRightClassName =
  "whitespace-nowrap px-3 py-3.5 align-middle text-right text-sm font-semibold leading-none text-muted-foreground";
export const tableHeadActionsClassName = "whitespace-nowrap px-6 py-3.5 align-middle sm:px-8";

/** Label + info-hint in table headers — keeps icon and text on one baseline. */
export const tableHeadHintClassName =
  "inline-flex min-h-5 items-center gap-1 whitespace-nowrap leading-none";
export const tableRowBorderClassName = "border-b border-border/65";
export const tableSectionBorderClassName = "border-l border-border/50";

export const mobileRowCardClassName =
  "rounded-[1.25rem] border border-border/60 bg-card p-4 shadow-sm";
export const mobileRowCardFieldClassName = "space-y-1.5";
export const mobileRowCardLabelClassName = "text-xs font-medium text-muted-foreground";
export const mobileDataListClassName = "mt-6 space-y-3 lg:hidden";
export const desktopTableWrapClassName = "mt-6 -mx-6 hidden overflow-x-auto sm:-mx-8 lg:block";

/** Wide data tables (e.g. registraties) that may still need horizontal scroll on smaller desktops. */
export const desktopTableScrollClassName = "mt-6 hidden overflow-x-auto md:block -mx-6 sm:-mx-8";

export const tableBodyCellClassName = "max-w-0 overflow-hidden px-3 py-3.5";
export const tableBodyCellRightClassName = `${tableBodyCellClassName} text-right tabular-nums`;
export const tableBodyCellActionsClassName = "w-0 whitespace-nowrap px-6 py-3.5 sm:px-8";

export const inlineInputClassName =
  "h-9 w-full min-w-0 rounded-sm border border-primary/50 bg-card px-2.5 text-sm font-medium text-foreground shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

export const inlineSelectClassName =
  "h-9 w-full min-w-0 appearance-none rounded-sm border border-primary/50 bg-card px-2.5 pr-7 text-sm font-medium text-foreground shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

export const editableCellShellClassName = "flex h-9 w-full min-w-0 items-center";

export const editableTriggerClassName =
  "inline-flex h-9 w-full min-w-0 items-center rounded-sm border border-dashed border-border/70 bg-card/70 px-2.5 text-left transition hover:border-primary/45 hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60";

export const modalFieldLabelClassName = "text-sm font-medium text-foreground";
export const modalFieldInputClassName =
  "h-10 w-full rounded-sm border border-border/60 bg-background px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25";
export const modalFieldSelectClassName =
  "h-10 w-full appearance-none rounded-sm border border-border/60 bg-background px-3 pr-9 text-sm text-foreground shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25";
export const modalFieldHelperClassName = "text-xs leading-relaxed text-muted-foreground";
