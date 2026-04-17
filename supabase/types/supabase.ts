export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string
          id: string
          is_archived: boolean
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_category_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_dashboard_totals"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["org_id"]
          },
        ]
      }
      interventions: {
        Row: {
          category_id: string
          co2_factor_kg: number
          created_at: string
          id: string
          is_archived: boolean
          name: string
          org_id: string
          unit: Database["public"]["Enums"]["intervention_unit"]
          updated_at: string
        }
        Insert: {
          category_id: string
          co2_factor_kg: number
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          org_id: string
          unit: Database["public"]["Enums"]["intervention_unit"]
          updated_at?: string
        }
        Update: {
          category_id?: string
          co2_factor_kg?: number
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          org_id?: string
          unit?: Database["public"]["Enums"]["intervention_unit"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_org_id_category_id_fkey"
            columns: ["org_id", "category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["org_id", "id"]
          },
          {
            foreignKeyName: "interventions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_category_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "interventions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_dashboard_totals"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "interventions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["org_id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          is_internal: boolean
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_internal?: boolean
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_internal?: boolean
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_category_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "locations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_dashboard_totals"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "locations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["org_id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_category_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_dashboard_totals"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["org_id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          eod_baseline_date: string | null
          eod_baseline_kg: number | null
          id: string
          name: string
          public_share_enabled: boolean
          public_share_slug: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          eod_baseline_date?: string | null
          eod_baseline_kg?: number | null
          id?: string
          name: string
          public_share_enabled?: boolean
          public_share_slug?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          eod_baseline_date?: string | null
          eod_baseline_kg?: number | null
          id?: string
          name?: string
          public_share_enabled?: boolean
          public_share_slug?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          co2_kg_cached: number
          created_at: string
          happened_on: string
          id: string
          intervention_id: string
          note: string | null
          org_id: string
          photo_path: string | null
          quantity: number
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          co2_kg_cached: number
          created_at?: string
          happened_on?: string
          id?: string
          intervention_id: string
          note?: string | null
          org_id: string
          photo_path?: string | null
          quantity: number
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          co2_kg_cached?: number
          created_at?: string
          happened_on?: string
          id?: string
          intervention_id?: string
          note?: string | null
          org_id?: string
          photo_path?: string | null
          quantity?: number
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_category_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "registrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_dashboard_totals"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "registrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "registrations_org_id_intervention_id_fkey"
            columns: ["org_id", "intervention_id"]
            isOneToOne: false
            referencedRelation: "interventions"
            referencedColumns: ["org_id", "id"]
          },
          {
            foreignKeyName: "registrations_org_id_team_id_fkey"
            columns: ["org_id", "team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["org_id", "id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_category_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "team_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_dashboard_totals"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "team_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          location_id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          location_id: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          location_id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_category_breakdown"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_dashboard_totals"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "public_team_breakdown"
            referencedColumns: ["org_id"]
          },
        ]
      }
    }
    Views: {
      public_category_breakdown: {
        Row: {
          category_color: string | null
          category_id: string | null
          category_name: string | null
          co2_saved_kg: number | null
          org_id: string | null
          registration_count: number | null
          share_slug: string | null
        }
        Relationships: []
      }
      public_dashboard_totals: {
        Row: {
          active_user_count: number | null
          co2_saved_kg: number | null
          eod_baseline_date: string | null
          eod_baseline_kg: number | null
          eod_days_gained: number | null
          org_id: string | null
          org_name: string | null
          registration_count: number | null
          share_slug: string | null
        }
        Relationships: []
      }
      public_team_breakdown: {
        Row: {
          co2_saved_kg: number | null
          location_name: string | null
          org_id: string | null
          registration_count: number | null
          share_slug: string | null
          team_id: string | null
          team_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      app_is_admin: { Args: { p_org: string }; Returns: boolean }
      app_is_in_team: { Args: { p_team: string }; Returns: boolean }
      app_is_member: { Args: { p_org: string }; Returns: boolean }
    }
    Enums: {
      intervention_unit:
        | "kg"
        | "km"
        | "maaltijd"
        | "kwh"
        | "stuk"
        | "uur"
        | "liter"
        | "dag"
      user_role: "admin" | "worker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      intervention_unit: [
        "kg",
        "km",
        "maaltijd",
        "kwh",
        "stuk",
        "uur",
        "liter",
        "dag",
      ],
      user_role: ["admin", "worker"],
    },
  },
} as const
