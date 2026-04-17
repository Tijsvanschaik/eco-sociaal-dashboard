// Generated types placeholder.
//
// Regenerate after every SQL run via:
//   Supabase dashboard -> API -> Generate Types -> TypeScript
// and paste the full output here (replacing the entire file).
//
// Until the first SQL run produces a real schema, we ship an empty `Database`
// shape so the type imports in `lib/supabase/*` compile without errors.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
