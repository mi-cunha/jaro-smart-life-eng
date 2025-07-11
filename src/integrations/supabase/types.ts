export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      habitos: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          meta_diaria: number | null
          nome: string
          updated_at: string
          user_email: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          meta_diaria?: number | null
          nome: string
          updated_at?: string
          user_email: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          meta_diaria?: number | null
          nome?: string
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_habitos_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      historico_habitos: {
        Row: {
          concluido: boolean | null
          created_at: string
          data: string
          habito_id: string
          id: string
          observacoes: string | null
          quantidade: number | null
          updated_at: string
          user_email: string
        }
        Insert: {
          concluido?: boolean | null
          created_at?: string
          data?: string
          habito_id: string
          id?: string
          observacoes?: string | null
          quantidade?: number | null
          updated_at?: string
          user_email: string
        }
        Update: {
          concluido?: boolean | null
          created_at?: string
          data?: string
          habito_id?: string
          id?: string
          observacoes?: string | null
          quantidade?: number | null
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_historico_habitos_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "historico_habitos_habito_id_fkey"
            columns: ["habito_id"]
            isOneToOne: false
            referencedRelation: "habitos"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_peso: {
        Row: {
          created_at: string
          data: string
          id: string
          observacoes: string | null
          peso: number
          user_email: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          observacoes?: string | null
          peso: number
          user_email: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          observacoes?: string | null
          peso?: number
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_historico_peso_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      ingredientes: {
        Row: {
          calorias_por_100g: number | null
          categoria: string | null
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_email: string
        }
        Insert: {
          calorias_por_100g?: number | null
          categoria?: string | null
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_email: string
        }
        Update: {
          calorias_por_100g?: number | null
          categoria?: string | null
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ingredientes_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      lista_compras: {
        Row: {
          comprado: boolean | null
          created_at: string
          id: string
          item: string
          quantidade: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          comprado?: boolean | null
          created_at?: string
          id?: string
          item: string
          quantidade?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          comprado?: boolean | null
          created_at?: string
          id?: string
          item?: string
          quantidade?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lista_compras_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      perfil_usuario: {
        Row: {
          agua_diaria_ml: number | null
          alergias: string | null
          apple_health: boolean | null
          avatar_url: string | null
          calorias_diarias: number | null
          copos_diarios: number | null
          created_at: string
          dados_uso: boolean | null
          daily_routine: string | null
          doses_cha: number | null
          email: string | null
          fitbit: boolean | null
          google_fit: boolean | null
          habitos_diarios: number | null
          id: string
          low_carb: boolean | null
          meta_peso: number | null
          nome: string | null
          notif_atingir_meta: boolean | null
          notif_comprar_itens: boolean | null
          notif_gerar_receitas: boolean | null
          notif_marcar_habito: boolean | null
          notif_tomar_cha: boolean | null
          notificacoes_push: boolean | null
          peso_atual: number | null
          peso_objetivo: number | null
          sem_gluten: boolean | null
          updated_at: string
          user_email: string
          vegano: boolean | null
          vegetariano: boolean | null
        }
        Insert: {
          agua_diaria_ml?: number | null
          alergias?: string | null
          apple_health?: boolean | null
          avatar_url?: string | null
          calorias_diarias?: number | null
          copos_diarios?: number | null
          created_at?: string
          dados_uso?: boolean | null
          daily_routine?: string | null
          doses_cha?: number | null
          email?: string | null
          fitbit?: boolean | null
          google_fit?: boolean | null
          habitos_diarios?: number | null
          id?: string
          low_carb?: boolean | null
          meta_peso?: number | null
          nome?: string | null
          notif_atingir_meta?: boolean | null
          notif_comprar_itens?: boolean | null
          notif_gerar_receitas?: boolean | null
          notif_marcar_habito?: boolean | null
          notif_tomar_cha?: boolean | null
          notificacoes_push?: boolean | null
          peso_atual?: number | null
          peso_objetivo?: number | null
          sem_gluten?: boolean | null
          updated_at?: string
          user_email: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Update: {
          agua_diaria_ml?: number | null
          alergias?: string | null
          apple_health?: boolean | null
          avatar_url?: string | null
          calorias_diarias?: number | null
          copos_diarios?: number | null
          created_at?: string
          dados_uso?: boolean | null
          daily_routine?: string | null
          doses_cha?: number | null
          email?: string | null
          fitbit?: boolean | null
          google_fit?: boolean | null
          habitos_diarios?: number | null
          id?: string
          low_carb?: boolean | null
          meta_peso?: number | null
          nome?: string | null
          notif_atingir_meta?: boolean | null
          notif_comprar_itens?: boolean | null
          notif_gerar_receitas?: boolean | null
          notif_marcar_habito?: boolean | null
          notif_tomar_cha?: boolean | null
          notificacoes_push?: boolean | null
          peso_atual?: number | null
          peso_objetivo?: number | null
          sem_gluten?: boolean | null
          updated_at?: string
          user_email?: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_perfil_usuario_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      preferencias_usuario: {
        Row: {
          created_at: string
          id: string
          objetivo: string | null
          preferencias_alimentares: Json | null
          restricoes_alimentares: string[] | null
          updated_at: string
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          objetivo?: string | null
          preferencias_alimentares?: Json | null
          restricoes_alimentares?: string[] | null
          updated_at?: string
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          objetivo?: string | null
          preferencias_alimentares?: Json | null
          restricoes_alimentares?: string[] | null
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_preferencias_usuario_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      receitas: {
        Row: {
          calorias: number | null
          carboidratos: number | null
          created_at: string
          favorita: boolean | null
          gorduras: number | null
          id: string
          ingredientes: Json | null
          instrucoes: string | null
          nome: string
          proteinas: number | null
          refeicao: string | null
          tempo_preparo: number | null
          updated_at: string
          user_email: string
        }
        Insert: {
          calorias?: number | null
          carboidratos?: number | null
          created_at?: string
          favorita?: boolean | null
          gorduras?: number | null
          id?: string
          ingredientes?: Json | null
          instrucoes?: string | null
          nome: string
          proteinas?: number | null
          refeicao?: string | null
          tempo_preparo?: number | null
          updated_at?: string
          user_email: string
        }
        Update: {
          calorias?: number | null
          carboidratos?: number | null
          created_at?: string
          favorita?: boolean | null
          gorduras?: number | null
          id?: string
          ingredientes?: Json | null
          instrucoes?: string | null
          nome?: string
          proteinas?: number | null
          refeicao?: string | null
          tempo_preparo?: number | null
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_receitas_email"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          id: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subscribers_email"
            columns: ["user_email"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["email"]
          },
        ]
      }
      user_analysis: {
        Row: {
          ai_text: string
          bmr: number
          carbs_g: number
          created_at: string
          fat_g: number
          id: string
          protein_g: number
          updated_at: string
          user_email: string | null
          water_liters: number
        }
        Insert: {
          ai_text: string
          bmr: number
          carbs_g: number
          created_at?: string
          fat_g: number
          id?: string
          protein_g: number
          updated_at?: string
          user_email?: string | null
          water_liters: number
        }
        Update: {
          ai_text?: string
          bmr?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          id?: string
          protein_g?: number
          updated_at?: string
          user_email?: string | null
          water_liters?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string
          email: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
