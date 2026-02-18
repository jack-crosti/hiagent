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
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          owner_user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          owner_user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          owner_user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          owner_user_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string | null
          account_number: string | null
          account_type: string | null
          balance: number | null
          bank_name: string
          created_at: string
          currency: string | null
          id: string
          is_demo: boolean | null
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_name: string
          created_at?: string
          currency?: string | null
          id?: string
          is_demo?: boolean | null
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_name?: string
          created_at?: string
          currency?: string | null
          id?: string
          is_demo?: boolean | null
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_asset_candidates: {
        Row: {
          asset_type: string
          confidence: number | null
          created_at: string
          id: string
          metadata: Json | null
          owner_user_id: string
          selected: boolean | null
          url: string | null
        }
        Insert: {
          asset_type: string
          confidence?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          owner_user_id: string
          selected?: boolean | null
          url?: string | null
        }
        Update: {
          asset_type?: string
          confidence?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          owner_user_id?: string
          selected?: boolean | null
          url?: string | null
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          accent_color: string | null
          apply_to_exports: boolean | null
          apply_to_ui: boolean | null
          created_at: string
          font_body: string | null
          font_heading: string | null
          id: string
          logo_url: string | null
          owner_user_id: string
          primary_color: string | null
          secondary_color: string | null
          style_mode: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          apply_to_exports?: boolean | null
          apply_to_ui?: boolean | null
          created_at?: string
          font_body?: string | null
          font_heading?: string | null
          id?: string
          logo_url?: string | null
          owner_user_id: string
          primary_color?: string | null
          secondary_color?: string | null
          style_mode?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          apply_to_exports?: boolean | null
          apply_to_ui?: boolean | null
          created_at?: string
          font_body?: string | null
          font_heading?: string | null
          id?: string
          logo_url?: string | null
          owner_user_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          style_mode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          gst_applicable: boolean | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          owner_user_id: string
          parent_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          gst_applicable?: boolean | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          owner_user_id: string
          parent_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          gst_applicable?: boolean | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          owner_user_id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categorization_rules: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          match_field: string
          match_type: string
          match_value: string
          name: string
          owner_user_id: string
          priority: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          match_field?: string
          match_type?: string
          match_value: string
          name: string
          owner_user_id: string
          priority?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          match_field?: string
          match_type?: string
          match_value?: string
          name?: string
          owner_user_id?: string
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categorization_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          company_share_percent: number | null
          created_at: string
          deal_type: string
          id: string
          is_default: boolean | null
          minimum_commission: number | null
          name: string
          on_top_fee_from_gross: boolean | null
          owner_user_id: string
          rule_type: string
          tiers: Json | null
          updated_at: string
          user_share_percent: number | null
        }
        Insert: {
          company_share_percent?: number | null
          created_at?: string
          deal_type: string
          id?: string
          is_default?: boolean | null
          minimum_commission?: number | null
          name: string
          on_top_fee_from_gross?: boolean | null
          owner_user_id: string
          rule_type?: string
          tiers?: Json | null
          updated_at?: string
          user_share_percent?: number | null
        }
        Update: {
          company_share_percent?: number | null
          created_at?: string
          deal_type?: string
          id?: string
          is_default?: boolean | null
          minimum_commission?: number | null
          name?: string
          on_top_fee_from_gross?: boolean | null
          owner_user_id?: string
          rule_type?: string
          tiers?: Json | null
          updated_at?: string
          user_share_percent?: number | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          metadata: Json | null
          owner_user_id: string
          revoked_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          metadata?: Json | null
          owner_user_id: string
          revoked_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          metadata?: Json | null
          owner_user_id?: string
          revoked_at?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          annual_rent_excl_gst: number | null
          closed_at: string | null
          commission_after_fee: number | null
          commission_rule_id: string | null
          company_share_excl_gst: number | null
          created_at: string
          deal_type: string
          estimated_tax: number | null
          expected_close_date: string | null
          gross_commission_excl_gst: number | null
          gst_on_commission: number | null
          id: string
          is_demo: boolean | null
          listing_name: string | null
          net_to_user_after_tax: number | null
          on_top_fee: number | null
          override_type: string | null
          override_value: number | null
          owner_user_id: string
          probability: number | null
          sale_price: number | null
          status: string | null
          updated_at: string
          user_share_excl_gst: number | null
        }
        Insert: {
          annual_rent_excl_gst?: number | null
          closed_at?: string | null
          commission_after_fee?: number | null
          commission_rule_id?: string | null
          company_share_excl_gst?: number | null
          created_at?: string
          deal_type?: string
          estimated_tax?: number | null
          expected_close_date?: string | null
          gross_commission_excl_gst?: number | null
          gst_on_commission?: number | null
          id?: string
          is_demo?: boolean | null
          listing_name?: string | null
          net_to_user_after_tax?: number | null
          on_top_fee?: number | null
          override_type?: string | null
          override_value?: number | null
          owner_user_id: string
          probability?: number | null
          sale_price?: number | null
          status?: string | null
          updated_at?: string
          user_share_excl_gst?: number | null
        }
        Update: {
          annual_rent_excl_gst?: number | null
          closed_at?: string | null
          commission_after_fee?: number | null
          commission_rule_id?: string | null
          company_share_excl_gst?: number | null
          created_at?: string
          deal_type?: string
          estimated_tax?: number | null
          expected_close_date?: string | null
          gross_commission_excl_gst?: number | null
          gst_on_commission?: number | null
          id?: string
          is_demo?: boolean | null
          listing_name?: string | null
          net_to_user_after_tax?: number | null
          on_top_fee?: number | null
          override_type?: string | null
          override_value?: number | null
          owner_user_id?: string
          probability?: number | null
          sale_price?: number | null
          status?: string | null
          updated_at?: string
          user_share_excl_gst?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_commission_rule_id_fkey"
            columns: ["commission_rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      email_schedules: {
        Row: {
          consent_record_id: string | null
          created_at: string
          frequency: string | null
          id: string
          is_active: boolean | null
          next_send_at: string | null
          owner_user_id: string
          recipients: Json | null
          report_type: string
          updated_at: string
        }
        Insert: {
          consent_record_id?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          next_send_at?: string | null
          owner_user_id: string
          recipients?: Json | null
          report_type: string
          updated_at?: string
        }
        Update: {
          consent_record_id?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          next_send_at?: string | null
          owner_user_id?: string
          recipients?: Json | null
          report_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_schedules_consent_record_id_fkey"
            columns: ["consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_plans: {
        Row: {
          created_at: string
          effective_tax_rate: number | null
          id: string
          is_active: boolean | null
          is_demo: boolean | null
          name: string
          owner_user_id: string
          period_end: string
          period_start: string
          probability_threshold: number | null
          target_net_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_tax_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_demo?: boolean | null
          name?: string
          owner_user_id: string
          period_end: string
          period_start: string
          probability_threshold?: number | null
          target_net_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_tax_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_demo?: boolean | null
          name?: string
          owner_user_id?: string
          period_end?: string
          period_start?: string
          probability_threshold?: number | null
          target_net_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      gst_periods: {
        Row: {
          created_at: string
          due_date: string | null
          filing_status: string | null
          gst_collected: number | null
          gst_paid: number | null
          id: string
          is_demo: boolean | null
          net_gst: number | null
          owner_user_id: string
          period_end: string
          period_start: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          filing_status?: string | null
          gst_collected?: number | null
          gst_paid?: number | null
          id?: string
          is_demo?: boolean | null
          net_gst?: number | null
          owner_user_id: string
          period_end: string
          period_start: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          filing_status?: string | null
          gst_collected?: number | null
          gst_paid?: number | null
          id?: string
          is_demo?: boolean | null
          net_gst?: number | null
          owner_user_id?: string
          period_end?: string
          period_start?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          connected_at: string | null
          created_at: string
          id: string
          integration_type: string
          owner_user_id: string
          provider: string
          status: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string
          id?: string
          integration_type: string
          owner_user_id: string
          provider: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string
          id?: string
          integration_type?: string
          owner_user_id?: string
          provider?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ledger_accounts: {
        Row: {
          account_type: string
          code: string
          created_at: string
          id: string
          is_demo: boolean | null
          is_system: boolean | null
          name: string
          owner_user_id: string
          parent_id: string | null
        }
        Insert: {
          account_type: string
          code: string
          created_at?: string
          id?: string
          is_demo?: boolean | null
          is_system?: boolean | null
          name: string
          owner_user_id: string
          parent_id?: string | null
        }
        Update: {
          account_type?: string
          code?: string
          created_at?: string
          id?: string
          is_demo?: boolean | null
          is_system?: boolean | null
          name?: string
          owner_user_id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          created_at: string
          credit: number | null
          date: string
          debit: number | null
          description: string | null
          id: string
          is_adjustment: boolean | null
          is_demo: boolean | null
          ledger_account_id: string
          owner_user_id: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          credit?: number | null
          date: string
          debit?: number | null
          description?: string | null
          id?: string
          is_adjustment?: boolean | null
          is_demo?: boolean | null
          ledger_account_id: string
          owner_user_id: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          credit?: number | null
          date?: string
          debit?: number | null
          description?: string | null
          id?: string
          is_adjustment?: boolean | null
          is_demo?: boolean | null
          ledger_account_id?: string
          owner_user_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_plans: {
        Row: {
          content_calendar: Json | null
          created_at: string
          email_campaigns: Json | null
          goal_plan_id: string | null
          id: string
          owner_user_id: string
          platform: string
          tone_settings: Json | null
          updated_at: string
          weekly_actions: Json | null
        }
        Insert: {
          content_calendar?: Json | null
          created_at?: string
          email_campaigns?: Json | null
          goal_plan_id?: string | null
          id?: string
          owner_user_id: string
          platform: string
          tone_settings?: Json | null
          updated_at?: string
          weekly_actions?: Json | null
        }
        Update: {
          content_calendar?: Json | null
          created_at?: string
          email_campaigns?: Json | null
          goal_plan_id?: string | null
          id?: string
          owner_user_id?: string
          platform?: string
          tone_settings?: Json | null
          updated_at?: string
          weekly_actions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_plans_goal_plan_id_fkey"
            columns: ["goal_plan_id"]
            isOneToOne: false
            referencedRelation: "goal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_plans: {
        Row: {
          assumptions: Json | null
          created_at: string
          goal_plan_id: string | null
          id: string
          marketing_actions: Json | null
          month: string
          owner_user_id: string
          target_actions: Json | null
          target_deals: number | null
          target_gross: number | null
          updated_at: string
        }
        Insert: {
          assumptions?: Json | null
          created_at?: string
          goal_plan_id?: string | null
          id?: string
          marketing_actions?: Json | null
          month: string
          owner_user_id: string
          target_actions?: Json | null
          target_deals?: number | null
          target_gross?: number | null
          updated_at?: string
        }
        Update: {
          assumptions?: Json | null
          created_at?: string
          goal_plan_id?: string | null
          id?: string
          marketing_actions?: Json | null
          month?: string
          owner_user_id?: string
          target_actions?: Json | null
          target_deals?: number | null
          target_gross?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_plans_goal_plan_id_fkey"
            columns: ["goal_plan_id"]
            isOneToOne: false
            referencedRelation: "goal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_instructions: {
        Row: {
          amount: number
          bank_account_from: string | null
          created_at: string
          gst_period_id: string | null
          id: string
          ird_number: string | null
          is_demo: boolean | null
          marked_paid_at: string | null
          owner_user_id: string
          payment_date: string | null
          payment_reference: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_from?: string | null
          created_at?: string
          gst_period_id?: string | null
          id?: string
          ird_number?: string | null
          is_demo?: boolean | null
          marked_paid_at?: string | null
          owner_user_id: string
          payment_date?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_from?: string | null
          created_at?: string
          gst_period_id?: string | null
          id?: string
          ird_number?: string | null
          is_demo?: boolean | null
          marked_paid_at?: string | null
          owner_user_id?: string
          payment_date?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_instructions_gst_period_id_fkey"
            columns: ["gst_period_id"]
            isOneToOne: false
            referencedRelation: "gst_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          effective_tax_rate: number | null
          email: string | null
          first_name: string | null
          id: string
          ird_number: string | null
          last_name: string | null
          mfa_enabled: boolean | null
          mfa_method: string | null
          owner_user_id: string
          phone: string | null
          probability_threshold: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          effective_tax_rate?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          ird_number?: string | null
          last_name?: string | null
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          owner_user_id: string
          phone?: string | null
          probability_threshold?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          effective_tax_rate?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          ird_number?: string | null
          last_name?: string | null
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          owner_user_id?: string
          phone?: string | null
          probability_threshold?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_exports: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          metadata: Json | null
          owner_user_id: string
          report_type: string
          status: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          owner_user_id: string
          report_type: string
          status?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          owner_user_id?: string
          report_type?: string
          status?: string | null
        }
        Relationships: []
      }
      scenario_plans: {
        Row: {
          assumptions: Json | null
          created_at: string
          deals_breakdown: Json | null
          goal_plan_id: string | null
          id: string
          owner_user_id: string
          scenario_type: string
          total_fees: number | null
          total_gross: number | null
          total_net: number | null
          total_tax: number | null
          total_user_share: number | null
        }
        Insert: {
          assumptions?: Json | null
          created_at?: string
          deals_breakdown?: Json | null
          goal_plan_id?: string | null
          id?: string
          owner_user_id: string
          scenario_type?: string
          total_fees?: number | null
          total_gross?: number | null
          total_net?: number | null
          total_tax?: number | null
          total_user_share?: number | null
        }
        Update: {
          assumptions?: Json | null
          created_at?: string
          deals_breakdown?: Json | null
          goal_plan_id?: string | null
          id?: string
          owner_user_id?: string
          scenario_type?: string
          total_fees?: number | null
          total_gross?: number | null
          total_net?: number | null
          total_tax?: number | null
          total_user_share?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_plans_goal_plan_id_fkey"
            columns: ["goal_plan_id"]
            isOneToOne: false
            referencedRelation: "goal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_state: {
        Row: {
          brand_applied: boolean | null
          created_at: string
          current_step: number | null
          id: string
          is_complete: boolean | null
          owner_user_id: string
          selected_broker: string | null
          skipped: boolean | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          brand_applied?: boolean | null
          created_at?: string
          current_step?: number | null
          id?: string
          is_complete?: boolean | null
          owner_user_id: string
          selected_broker?: string | null
          skipped?: boolean | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          brand_applied?: boolean | null
          created_at?: string
          current_step?: number | null
          id?: string
          is_complete?: boolean | null
          owner_user_id?: string
          selected_broker?: string | null
          skipped?: boolean | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      tax_obligations: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          gst_period_id: string | null
          id: string
          is_demo: boolean | null
          notes: string | null
          obligation_type: string
          owner_user_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          gst_period_id?: string | null
          id?: string
          is_demo?: boolean | null
          notes?: string | null
          obligation_type: string
          owner_user_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          gst_period_id?: string | null
          id?: string
          is_demo?: boolean | null
          notes?: string | null
          obligation_type?: string
          owner_user_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_obligations_gst_period_id_fkey"
            columns: ["gst_period_id"]
            isOneToOne: false
            referencedRelation: "gst_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          colors: Json | null
          created_at: string
          fonts: Json | null
          id: string
          is_active: boolean | null
          name: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          colors?: Json | null
          created_at?: string
          fonts?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          colors?: Json | null
          created_at?: string
          fonts?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          categorization_reason: string | null
          category_id: string | null
          confidence_score: number | null
          created_at: string
          date: string
          description: string | null
          gst_amount: number | null
          id: string
          is_demo: boolean | null
          is_reconciled: boolean | null
          is_split: boolean | null
          owner_user_id: string
          parent_transaction_id: string | null
          reference: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          categorization_reason?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string
          date: string
          description?: string | null
          gst_amount?: number | null
          id?: string
          is_demo?: boolean | null
          is_reconciled?: boolean | null
          is_split?: boolean | null
          owner_user_id: string
          parent_transaction_id?: string | null
          reference?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          categorization_reason?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string
          date?: string
          description?: string | null
          gst_amount?: number | null
          id?: string
          is_demo?: boolean | null
          is_reconciled?: boolean | null
          is_split?: boolean | null
          owner_user_id?: string
          parent_transaction_id?: string | null
          reference?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
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
