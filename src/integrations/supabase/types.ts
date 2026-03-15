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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      affidavit_points: {
        Row: {
          category: string
          created_at: string
          id: string
          point_text: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          point_text: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          point_text?: string
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_at: string
          verified: boolean | null
        }
        Insert: {
          application_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string
          verified?: boolean | null
        }
        Update: {
          application_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_by: string
          created_at: string
          from_status: Database["public"]["Enums"]["application_status"] | null
          id: string
          remarks: string | null
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_id: string
          changed_by: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          remarks?: string | null
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_id?: string
          changed_by?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          remarks?: string | null
          to_status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          category: string | null
          created_at: string
          fee_amount: number | null
          fee_paid: boolean | null
          form_data: Json | null
          id: string
          project_description: string | null
          project_location: string | null
          project_name: string
          sector_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          fee_amount?: number | null
          fee_paid?: boolean | null
          form_data?: Json | null
          id?: string
          project_description?: string | null
          project_location?: string | null
          project_name: string
          sector_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          fee_amount?: number | null
          fee_paid?: boolean | null
          form_data?: Json | null
          id?: string
          project_description?: string | null
          project_location?: string | null
          project_name?: string
          sector_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      eds_deficiency_points: {
        Row: {
          created_at: string
          id: string
          point_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          point_text: string
        }
        Update: {
          created_at?: string
          id?: string
          point_text?: string
        }
        Relationships: []
      }
      meeting_gists: {
        Row: {
          application_id: string
          content: string
          created_at: string
          generated_from_template: string | null
          id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          content?: string
          created_at?: string
          generated_from_template?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          content?: string
          created_at?: string
          generated_from_template?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_gists_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_gists_generated_from_template_fkey"
            columns: ["generated_from_template"]
            isOneToOne: false
            referencedRelation: "meeting_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          name: string
          sector_id: string | null
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          sector_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          sector_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_templates_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      minutes_of_meeting: {
        Row: {
          application_id: string
          content: string
          created_at: string
          gist_id: string | null
          id: string
          is_locked: boolean | null
          locked_at: string | null
          locked_by: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          content?: string
          created_at?: string
          gist_id?: string | null
          id?: string
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          content?: string
          created_at?: string
          gist_id?: string | null
          id?: string
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "minutes_of_meeting_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minutes_of_meeting_gist_id_fkey"
            columns: ["gist_id"]
            isOneToOne: false
            referencedRelation: "meeting_gists"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          application_id: string
          created_at: string
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          organization: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id?: string
          organization?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          organization?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parameters: Json | null
          required_documents: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parameters?: Json | null
          required_documents?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parameters?: Json | null
          required_documents?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
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
    }
    Enums: {
      app_role: "admin" | "project_proponent" | "scrutiny_team" | "mom_team"
      application_status:
        | "draft"
        | "submitted"
        | "under_scrutiny"
        | "essential_document_sought"
        | "referred"
        | "mom_generated"
        | "finalized"
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
      app_role: ["admin", "project_proponent", "scrutiny_team", "mom_team"],
      application_status: [
        "draft",
        "submitted",
        "under_scrutiny",
        "essential_document_sought",
        "referred",
        "mom_generated",
        "finalized",
      ],
    },
  },
} as const
