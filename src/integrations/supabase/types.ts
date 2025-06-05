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
      ingredientes: {
        Row: {
          categoria: string | null
          data_atualizacao: string
          data_criacao: string
          id: string
          nome: string
          refeicao: string
          selecionado: boolean | null
          usuario_id: string | null
        }
        Insert: {
          categoria?: string | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          nome: string
          refeicao: string
          selecionado?: boolean | null
          usuario_id?: string | null
        }
        Update: {
          categoria?: string | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          nome?: string
          refeicao?: string
          selecionado?: boolean | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      lista_compras: {
        Row: {
          categoria: string | null
          comprado: boolean | null
          data_atualizacao: string
          data_criacao: string
          id: string
          nome: string
          preco: number
          quantidade: string
          refeicao: string
          usuario_id: string | null
        }
        Insert: {
          categoria?: string | null
          comprado?: boolean | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          nome: string
          preco?: number
          quantidade: string
          refeicao: string
          usuario_id?: string | null
        }
        Update: {
          categoria?: string | null
          comprado?: boolean | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          nome?: string
          preco?: number
          quantidade?: string
          refeicao?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      perfil_usuario: {
        Row: {
          alergias: string | null
          apple_health: boolean | null
          avatar_url: string | null
          calorias_diarias: number | null
          dados_uso: boolean | null
          data_atualizacao: string
          data_criacao: string
          doses_cha: number | null
          email: string | null
          fitbit: boolean | null
          google_fit: boolean | null
          habitos_diarios: number | null
          id: string
          low_carb: boolean | null
          nome: string
          notif_atingir_meta: boolean | null
          notif_comprar_itens: boolean | null
          notif_gerar_receitas: boolean | null
          notif_marcar_habito: boolean | null
          notif_tomar_cha: boolean | null
          notificacoes_push: boolean | null
          peso_objetivo: number | null
          sem_gluten: boolean | null
          usuario_id: string
          vegano: boolean | null
          vegetariano: boolean | null
        }
        Insert: {
          alergias?: string | null
          apple_health?: boolean | null
          avatar_url?: string | null
          calorias_diarias?: number | null
          dados_uso?: boolean | null
          data_atualizacao?: string
          data_criacao?: string
          doses_cha?: number | null
          email?: string | null
          fitbit?: boolean | null
          google_fit?: boolean | null
          habitos_diarios?: number | null
          id?: string
          low_carb?: boolean | null
          nome?: string
          notif_atingir_meta?: boolean | null
          notif_comprar_itens?: boolean | null
          notif_gerar_receitas?: boolean | null
          notif_marcar_habito?: boolean | null
          notif_tomar_cha?: boolean | null
          notificacoes_push?: boolean | null
          peso_objetivo?: number | null
          sem_gluten?: boolean | null
          usuario_id?: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Update: {
          alergias?: string | null
          apple_health?: boolean | null
          avatar_url?: string | null
          calorias_diarias?: number | null
          dados_uso?: boolean | null
          data_atualizacao?: string
          data_criacao?: string
          doses_cha?: number | null
          email?: string | null
          fitbit?: boolean | null
          google_fit?: boolean | null
          habitos_diarios?: number | null
          id?: string
          low_carb?: boolean | null
          nome?: string
          notif_atingir_meta?: boolean | null
          notif_comprar_itens?: boolean | null
          notif_gerar_receitas?: boolean | null
          notif_marcar_habito?: boolean | null
          notif_tomar_cha?: boolean | null
          notificacoes_push?: boolean | null
          peso_objetivo?: number | null
          sem_gluten?: boolean | null
          usuario_id?: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Relationships: []
      }
      preferencias_usuario: {
        Row: {
          calorias_max: number | null
          data_atualizacao: string
          data_criacao: string
          id: string
          objetivo: string | null
          preferencias_alimentares: string | null
          restricoes_alimentares: string[] | null
          usuario_id: string | null
        }
        Insert: {
          calorias_max?: number | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          objetivo?: string | null
          preferencias_alimentares?: string | null
          restricoes_alimentares?: string[] | null
          usuario_id?: string | null
        }
        Update: {
          calorias_max?: number | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          objetivo?: string | null
          preferencias_alimentares?: string | null
          restricoes_alimentares?: string[] | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      receitas: {
        Row: {
          calorias: number
          carboidratos: number
          data_atualizacao: string
          data_criacao: string
          favorita: boolean | null
          gorduras: number
          id: string
          ingredientes: string[]
          nome: string
          preparo: string[]
          proteinas: number
          refeicao: string
          tempo: number
          usuario_id: string | null
        }
        Insert: {
          calorias: number
          carboidratos?: number
          data_atualizacao?: string
          data_criacao?: string
          favorita?: boolean | null
          gorduras?: number
          id?: string
          ingredientes?: string[]
          nome: string
          preparo?: string[]
          proteinas?: number
          refeicao: string
          tempo: number
          usuario_id?: string | null
        }
        Update: {
          calorias?: number
          carboidratos?: number
          data_atualizacao?: string
          data_criacao?: string
          favorita?: boolean | null
          gorduras?: number
          id?: string
          ingredientes?: string[]
          nome?: string
          preparo?: string[]
          proteinas?: number
          refeicao?: string
          tempo?: number
          usuario_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          data_atualizacao: string
          data_criacao: string
          email: string | null
          id: string
          nome: string | null
        }
        Insert: {
          data_atualizacao?: string
          data_criacao?: string
          email?: string | null
          id: string
          nome?: string | null
        }
        Update: {
          data_atualizacao?: string
          data_criacao?: string
          email?: string | null
          id?: string
          nome?: string | null
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
