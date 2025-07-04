export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          allergies: string | null
          created_at: string
          current_medications: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          medical_history: string | null
          patient_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_history?: string | null
          patient_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_history?: string | null
          patient_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          additional_findings: string | null
          confidence_score: number | null
          created_at: string
          doctor_notes: string | null
          id: string
          model_version: string
          prediction_result: string
          processing_time_ms: number | null
          reviewed_by_doctor: boolean | null
          scan_id: string
          tumor_location: string | null
          tumor_size_mm: number | null
        }
        Insert: {
          additional_findings?: string | null
          confidence_score?: number | null
          created_at?: string
          doctor_notes?: string | null
          id?: string
          model_version?: string
          prediction_result: string
          processing_time_ms?: number | null
          reviewed_by_doctor?: boolean | null
          scan_id: string
          tumor_location?: string | null
          tumor_size_mm?: number | null
        }
        Update: {
          additional_findings?: string | null
          confidence_score?: number | null
          created_at?: string
          doctor_notes?: string | null
          id?: string
          model_version?: string
          prediction_result?: string
          processing_time_ms?: number | null
          reviewed_by_doctor?: boolean | null
          scan_id?: string
          tumor_location?: string | null
          tumor_size_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          image_url: string | null
          original_filename: string | null
          patient_id: string
          referring_doctor: string | null
          scan_date: string
          scan_notes: string | null
          scan_type: string
          status: string | null
          technician_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          image_url?: string | null
          original_filename?: string | null
          patient_id: string
          referring_doctor?: string | null
          scan_date?: string
          scan_notes?: string | null
          scan_type?: string
          status?: string | null
          technician_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          image_url?: string | null
          original_filename?: string | null
          patient_id?: string
          referring_doctor?: string | null
          scan_date?: string
          scan_notes?: string | null
          scan_type?: string
          status?: string | null
          technician_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          login_method: string | null
          session_end: string | null
          session_start: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          login_method?: string | null
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          login_method?: string | null
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
