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
      brand_pocs: {
        Row: {
          brand_id: string
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_pocs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      campaign_influencers: {
        Row: {
          campaign_id: string | null
          content_approval_status: string | null
          content_url: string | null
          created_at: string | null
          id: string
          influencer_id: string | null
          payment_amount: number | null
          payment_status: string | null
          performance_metrics: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          content_approval_status?: string | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          performance_metrics?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          content_approval_status?: string | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          performance_metrics?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_influencers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_influencers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_videos: {
        Row: {
          additional_links: Json | null
          brand_id: string | null
          brand_poc: string | null
          brand_price: number | null
          campaign: string | null
          created_at: string | null
          created_by: string | null
          creator_price: number | null
          deliverables: string | null
          edit_history: Json | null
          id: string
          is_deleted: boolean | null
          live_date: string | null
          profile_id: string
          status: string
          updated_at: string | null
          updated_by: string | null
          video_url: string
        }
        Insert: {
          additional_links?: Json | null
          brand_id?: string | null
          brand_poc?: string | null
          brand_price?: number | null
          campaign?: string | null
          created_at?: string | null
          created_by?: string | null
          creator_price?: number | null
          deliverables?: string | null
          edit_history?: Json | null
          id?: string
          is_deleted?: boolean | null
          live_date?: string | null
          profile_id: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          video_url: string
        }
        Update: {
          additional_links?: Json | null
          brand_id?: string | null
          brand_poc?: string | null
          brand_price?: number | null
          campaign?: string | null
          created_at?: string | null
          created_by?: string | null
          creator_price?: number | null
          deliverables?: string | null
          edit_history?: Json | null
          id?: string
          is_deleted?: boolean | null
          live_date?: string | null
          profile_id?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_videos_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_videos_brand_poc_fkey"
            columns: ["brand_poc"]
            isOneToOne: false
            referencedRelation: "brand_pocs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_videos_campaign_fkey"
            columns: ["campaign"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_videos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string | null
          budget: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_bank_accounts: {
        Row: {
          account_name: string | null
          account_number: string
          bank_name: string
          branch_name: string | null
          created_at: string | null
          gst_number: string | null
          id: string
          ifsc_code: string
          influencer_id: string
          is_gst_verified: boolean | null
          is_pan_verified: boolean | null
          is_primary: boolean | null
          is_verified: boolean | null
          pan_number: string | null
          updated_at: string | null
        }
        Insert: {
          account_name?: string | null
          account_number: string
          bank_name: string
          branch_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          ifsc_code: string
          influencer_id: string
          is_gst_verified?: boolean | null
          is_pan_verified?: boolean | null
          is_primary?: boolean | null
          is_verified?: boolean | null
          pan_number?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string
          bank_name?: string
          branch_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          ifsc_code?: string
          influencer_id?: string
          is_gst_verified?: boolean | null
          is_pan_verified?: boolean | null
          is_primary?: boolean | null
          is_verified?: boolean | null
          pan_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_bank_accounts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_shared_accounts: {
        Row: {
          bank_account_id: string
          created_at: string | null
          id: string
          influencer_id: string
        }
        Insert: {
          bank_account_id: string
          created_at?: string | null
          id?: string
          influencer_id: string
        }
        Update: {
          bank_account_id?: string
          created_at?: string | null
          id?: string
          influencer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_shared_accounts_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "influencer_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_shared_accounts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          content_category: string | null
          created_at: string | null
          email: string | null
          engagement_rate: number | null
          follower_count: number | null
          genre: string | null
          gst_number: string | null
          id: string
          is_bank_verified: boolean | null
          is_exclusive: boolean | null
          is_gst_verified: boolean | null
          is_pan_verified: boolean | null
          languages: string | null
          linked_profiles: string | null
          location: string | null
          name: string
          pan_number: string | null
          phone: string | null
          profile_picture: string | null
          social_handle: string | null
          social_platform: string | null
          updated_at: string | null
        }
        Insert: {
          content_category?: string | null
          created_at?: string | null
          email?: string | null
          engagement_rate?: number | null
          follower_count?: number | null
          genre?: string | null
          gst_number?: string | null
          id?: string
          is_bank_verified?: boolean | null
          is_exclusive?: boolean | null
          is_gst_verified?: boolean | null
          is_pan_verified?: boolean | null
          languages?: string | null
          linked_profiles?: string | null
          location?: string | null
          name: string
          pan_number?: string | null
          phone?: string | null
          profile_picture?: string | null
          social_handle?: string | null
          social_platform?: string | null
          updated_at?: string | null
        }
        Update: {
          content_category?: string | null
          created_at?: string | null
          email?: string | null
          engagement_rate?: number | null
          follower_count?: number | null
          genre?: string | null
          gst_number?: string | null
          id?: string
          is_bank_verified?: boolean | null
          is_exclusive?: boolean | null
          is_gst_verified?: boolean | null
          is_pan_verified?: boolean | null
          languages?: string | null
          linked_profiles?: string | null
          location?: string | null
          name?: string
          pan_number?: string | null
          phone?: string | null
          profile_picture?: string | null
          social_handle?: string | null
          social_platform?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          role: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invite_codes_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_codes_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_number: string | null
          agency_fees_amount: number | null
          agency_fees_rate: number | null
          amount: number
          bank_account_id: string | null
          bank_name: string | null
          created_at: string | null
          created_by: string | null
          id: string
          influencer_id: string | null
          notes: string | null
          payment_method: string | null
          reference: string | null
          status: string
          tds_amount: number | null
          tds_rate: number | null
          total_amount: number | null
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          account_number?: string | null
          agency_fees_amount?: number | null
          agency_fees_rate?: number | null
          amount: number
          bank_account_id?: string | null
          bank_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          influencer_id?: string | null
          notes?: string | null
          payment_method?: string | null
          reference?: string | null
          status: string
          tds_amount?: number | null
          tds_rate?: number | null
          total_amount?: number | null
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          account_number?: string | null
          agency_fees_amount?: number | null
          agency_fees_rate?: number | null
          amount?: number
          bank_account_id?: string | null
          bank_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          influencer_id?: string | null
          notes?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          tds_amount?: number | null
          tds_rate?: number | null
          total_amount?: number | null
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "influencer_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "campaign_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          permissions?: Json | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      users_management: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string | null
          permissions: Json | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          name?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_management_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_management_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      auth_users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          last_sign_in_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_sign_in_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_sign_in_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
        }
        Relationships: []
      }
      user_roles_view: {
        Row: {
          permissions: Json | null
          role: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: {
          role: string
          permissions: Json
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
