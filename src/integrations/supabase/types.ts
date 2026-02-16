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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      hazard_reports: {
        Row: {
          ai_confidence: number | null
          ai_description: string | null
          ai_hazard_type: Database["public"]["Enums"]["hazard_type"] | null
          ai_severity: Database["public"]["Enums"]["severity_level"] | null
          ai_suggested_priority: number | null
          assigned_staff_name: string | null
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          location_address: string
          location_lat: number
          location_lng: number
          location_region: string
          proof_image_url: string | null
          remarks: string[] | null
          reported_by: string
          reporter_name: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_description?: string | null
          ai_hazard_type?: Database["public"]["Enums"]["hazard_type"] | null
          ai_severity?: Database["public"]["Enums"]["severity_level"] | null
          ai_suggested_priority?: number | null
          assigned_staff_name?: string | null
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          location_address: string
          location_lat: number
          location_lng: number
          location_region: string
          proof_image_url?: string | null
          remarks?: string[] | null
          reported_by: string
          reporter_name: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_description?: string | null
          ai_hazard_type?: Database["public"]["Enums"]["hazard_type"] | null
          ai_severity?: Database["public"]["Enums"]["severity_level"] | null
          ai_suggested_priority?: number | null
          assigned_staff_name?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          location_address?: string
          location_lat?: number
          location_lng?: number
          location_region?: string
          proof_image_url?: string | null
          remarks?: string[] | null
          reported_by?: string
          reporter_name?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string
          id: string
          is_verified: boolean
          name: string
          phone: string | null
          region: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          id?: string
          is_verified?: boolean
          name: string
          phone?: string | null
          region?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          is_verified?: boolean
          name?: string
          phone?: string | null
          region?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          active_reports: number | null
          code: string
          id: string
          name: string
          staff_count: number | null
        }
        Insert: {
          active_reports?: number | null
          code: string
          id?: string
          name: string
          staff_count?: number | null
        }
        Update: {
          active_reports?: number | null
          code?: string
          id?: string
          name?: string
          staff_count?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          is_approved: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          is_approved?: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          is_approved?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "citizen" | "municipal_staff" | "admin"
      hazard_type:
        | "pothole"
        | "crack"
        | "flooding"
        | "debris"
        | "damaged_signage"
        | "broken_barrier"
        | "uneven_surface"
        | "erosion"
      report_status:
        | "pending"
        | "under_review"
        | "verified"
        | "rejected"
        | "in_progress"
        | "resolved"
      severity_level: "low" | "medium" | "high" | "critical"
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
      app_role: ["citizen", "municipal_staff", "admin"],
      hazard_type: [
        "pothole",
        "crack",
        "flooding",
        "debris",
        "damaged_signage",
        "broken_barrier",
        "uneven_surface",
        "erosion",
      ],
      report_status: [
        "pending",
        "under_review",
        "verified",
        "rejected",
        "in_progress",
        "resolved",
      ],
      severity_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
