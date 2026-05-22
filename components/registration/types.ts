import type { InterventionOption, TeamOption } from "@/lib/tenant-dashboard-data";

export type { InterventionOption, TeamOption };

export type PhotoState =
  | { status: "idle" }
  | { status: "uploading"; previewUrl: string }
  | { status: "ready"; path: string; previewUrl: string }
  | { status: "error"; message: string };

export type FormUiState =
  | { status: "idle" }
  | { message: string; status: "error" }
  | { message: string; status: "success" };
