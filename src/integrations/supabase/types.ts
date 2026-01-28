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
      attestation_requests: {
        Row: {
          created_at: string | null
          details: string | null
          file_url: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          request_type: string
          response_notes: string | null
          status: string | null
          training_id: string | null
          volunteer_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          file_url?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          response_notes?: string | null
          status?: string | null
          training_id?: string | null
          volunteer_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          file_url?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          response_notes?: string | null
          status?: string | null
          training_id?: string | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attestation_requests_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestation_requests_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_type: string
          created_at: string | null
          description: string | null
          file_url: string | null
          id: string
          issued_by: string | null
          issued_date: string
          title: string
          training_id: string | null
          volunteer_id: string
        }
        Insert: {
          certificate_type: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          issued_by?: string | null
          issued_date: string
          title: string
          training_id?: string | null
          volunteer_id: string
        }
        Update: {
          certificate_type?: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string
          title?: string
          training_id?: string | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          parent_id: string | null
          recipient_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          recipient_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          affiliation_details: string | null
          availability_days: string[] | null
          availability_hours: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          education_level: string | null
          email: string
          full_name: string
          gender: string | null
          governorate: string | null
          hours_volunteered: number | null
          id: string
          interests: string[] | null
          is_affiliated: boolean | null
          is_community_member: boolean | null
          is_student: boolean | null
          iwatch_events: string | null
          iwatch_experience: boolean | null
          iwatch_role: string | null
          iwatch_years: string | null
          onboarding_questions: string | null
          organization: string | null
          other_org_details: string | null
          other_skills: string | null
          other_volunteering: boolean | null
          phone: string | null
          phone_secondary: string | null
          position: string | null
          postal_code: string | null
          preferred_contact: string | null
          profession: string | null
          referral_source: string | null
          rejection_reason: string | null
          skills: string[] | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          affiliation_details?: string | null
          availability_days?: string[] | null
          availability_hours?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?: string | null
          email: string
          full_name: string
          gender?: string | null
          governorate?: string | null
          hours_volunteered?: number | null
          id?: string
          interests?: string[] | null
          is_affiliated?: boolean | null
          is_community_member?: boolean | null
          is_student?: boolean | null
          iwatch_events?: string | null
          iwatch_experience?: boolean | null
          iwatch_role?: string | null
          iwatch_years?: string | null
          onboarding_questions?: string | null
          organization?: string | null
          other_org_details?: string | null
          other_skills?: string | null
          other_volunteering?: boolean | null
          phone?: string | null
          phone_secondary?: string | null
          position?: string | null
          postal_code?: string | null
          preferred_contact?: string | null
          profession?: string | null
          referral_source?: string | null
          rejection_reason?: string | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          affiliation_details?: string | null
          availability_days?: string[] | null
          availability_hours?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          governorate?: string | null
          hours_volunteered?: number | null
          id?: string
          interests?: string[] | null
          is_affiliated?: boolean | null
          is_community_member?: boolean | null
          is_student?: boolean | null
          iwatch_events?: string | null
          iwatch_experience?: boolean | null
          iwatch_role?: string | null
          iwatch_years?: string | null
          onboarding_questions?: string | null
          organization?: string | null
          other_org_details?: string | null
          other_skills?: string | null
          other_volunteering?: boolean | null
          phone?: string | null
          phone_secondary?: string | null
          position?: string | null
          postal_code?: string | null
          preferred_contact?: string | null
          profession?: string | null
          referral_source?: string | null
          rejection_reason?: string | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string
          completed_at: string | null
          hours_logged: number | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
          volunteer_id: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          hours_logged?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_id: string
          volunteer_id: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          hours_logged?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          duration_hours: number | null
          event_type: string | null
          id: string
          is_public: boolean | null
          location: string | null
          max_volunteers: number | null
          poster_url: string | null
          status: Database["public"]["Enums"]["task_status"]
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          duration_hours?: number | null
          event_type?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          max_volunteers?: number | null
          poster_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          duration_hours?: number | null
          event_type?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          max_volunteers?: number | null
          poster_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_participants: {
        Row: {
          attended: boolean | null
          completion_date: string | null
          created_at: string | null
          id: string
          status: string | null
          training_id: string
          volunteer_id: string
        }
        Insert: {
          attended?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          training_id: string
          volunteer_id: string
        }
        Update: {
          attended?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          training_id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_participants_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_participants_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          duration_hours: number | null
          id: string
          location: string | null
          max_participants: number | null
          status: string | null
          title: string
          trainer: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          location?: string | null
          max_participants?: number | null
          status?: string | null
          title: string
          trainer?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          location?: string | null
          max_participants?: number | null
          status?: string | null
          title?: string
          trainer?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_languages: {
        Row: {
          created_at: string | null
          id: string
          language: string
          level: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: string
          level: string
          volunteer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          level?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_languages_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "volunteer" | "admin"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
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
      app_role: ["volunteer", "admin"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
