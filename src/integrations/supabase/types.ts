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
      balances: {
        Row: {
          amount: number
          currency: string
          user_id: string
        }
        Insert: {
          amount?: number
          currency: string
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          user_id?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          amount: number
          token_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          token_id: string
          user_id: string
        }
        Update: {
          amount?: number
          token_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "token_market"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          address: string
          created_at: string
          creator_id: string
          creator_tax_bps: number
          description: string
          emoji: string
          fees_accrued: number
          fees_claimed: number
          graduated: boolean
          id: string
          name: string
          pair: string
          reserve: number
          telegram: string | null
          ticker: string
          tokens_sold: number
          twitter: string | null
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          creator_id: string
          creator_tax_bps?: number
          description?: string
          emoji?: string
          fees_accrued?: number
          fees_claimed?: number
          graduated?: boolean
          id?: string
          name: string
          pair: string
          reserve?: number
          telegram?: string | null
          ticker: string
          tokens_sold?: number
          twitter?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          creator_id?: string
          creator_tax_bps?: number
          description?: string
          emoji?: string
          fees_accrued?: number
          fees_claimed?: number
          graduated?: boolean
          id?: string
          name?: string
          pair?: string
          reserve?: number
          telegram?: string | null
          ticker?: string
          tokens_sold?: number
          twitter?: string | null
          website?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          currency_amount: number
          id: string
          price: number
          side: string
          token_amount: number
          token_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_amount: number
          id?: string
          price: number
          side: string
          token_amount: number
          token_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_amount?: number
          id?: string
          price?: number
          side?: string
          token_amount?: number
          token_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "token_market"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_challenges: {
        Row: {
          address: string
          created_at: string
          nonce: string
        }
        Insert: {
          address: string
          created_at?: string
          nonce: string
        }
        Update: {
          address?: string
          created_at?: string
          nonce?: string
        }
        Relationships: []
      }
    }
    Views: {
      token_market: {
        Row: {
          address: string | null
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          creator_tax_bps: number | null
          description: string | null
          emoji: string | null
          fees_accrued: number | null
          fees_claimed: number | null
          graduated: boolean | null
          holders: number | null
          id: string | null
          name: string | null
          pair: string | null
          price: number | null
          price_24h_ago: number | null
          progress: number | null
          reserve: number | null
          telegram: string | null
          ticker: string | null
          tokens_sold: number | null
          twitter: string | null
          volume_24h: number | null
          website: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_creator_fees: { Args: { p_token_id: string }; Returns: number }
      curve_cost: { Args: { s0: number; s1: number }; Returns: number }
      curve_price: { Args: { s: number }; Returns: number }
      curve_supply: { Args: never; Returns: number }
      curve_target: { Args: never; Returns: number }
      execute_trade: {
        Args: { p_amount: number; p_side: string; p_token_id: string }
        Returns: Json
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
