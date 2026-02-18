
-- ===== LedgerPilot Full Schema =====

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  title TEXT,
  avatar_url TEXT,
  ird_number TEXT,
  effective_tax_rate NUMERIC DEFAULT 0.33,
  probability_threshold NUMERIC DEFAULT 0.60,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_user_id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_owner" ON public.profiles FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- SETUP STATE
CREATE TABLE public.setup_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_complete BOOLEAN DEFAULT FALSE,
  current_step INT DEFAULT 0,
  website_url TEXT,
  selected_broker TEXT,
  brand_applied BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.setup_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "setup_state_owner" ON public.setup_state FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- BRAND PROFILES
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  font_heading TEXT,
  font_body TEXT,
  apply_to_ui BOOLEAN DEFAULT TRUE,
  apply_to_exports BOOLEAN DEFAULT TRUE,
  style_mode TEXT DEFAULT 'subtle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_profiles_owner" ON public.brand_profiles FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- BRAND ASSET CANDIDATES
CREATE TABLE public.brand_asset_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  url TEXT,
  confidence NUMERIC,
  selected BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_asset_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_asset_candidates_owner" ON public.brand_asset_candidates FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- CONSENT RECORDS
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT FALSE,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consent_records_owner" ON public.consent_records FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_owner" ON public.audit_logs FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- INTEGRATIONS
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected',
  config JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrations_owner" ON public.integrations FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- BANK ACCOUNTS
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT,
  account_number TEXT,
  account_type TEXT,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'NZD',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bank_accounts_owner" ON public.bank_accounts FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id),
  color TEXT,
  icon TEXT,
  gst_applicable BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_owner" ON public.categories FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  category_id UUID REFERENCES public.categories(id),
  date DATE NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'debit',
  status TEXT DEFAULT 'cleared',
  reference TEXT,
  gst_amount NUMERIC DEFAULT 0,
  is_split BOOLEAN DEFAULT FALSE,
  parent_transaction_id UUID REFERENCES public.transactions(id),
  is_demo BOOLEAN DEFAULT FALSE,
  is_reconciled BOOLEAN DEFAULT FALSE,
  confidence_score NUMERIC,
  categorization_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_owner" ON public.transactions FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- CATEGORIZATION RULES
CREATE TABLE public.categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  match_field TEXT NOT NULL DEFAULT 'description',
  match_type TEXT NOT NULL DEFAULT 'contains',
  match_value TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categorization_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorization_rules_owner" ON public.categorization_rules FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- ATTACHMENTS
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachments_owner" ON public.attachments FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- LEDGER ACCOUNTS
CREATE TABLE public.ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  parent_id UUID REFERENCES public.ledger_accounts(id),
  is_system BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ledger_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_accounts_owner" ON public.ledger_accounts FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- LEDGER ENTRIES
CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ledger_account_id UUID NOT NULL REFERENCES public.ledger_accounts(id),
  transaction_id UUID REFERENCES public.transactions(id),
  date DATE NOT NULL,
  description TEXT,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  is_adjustment BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_entries_owner" ON public.ledger_entries FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- GST PERIODS
CREATE TABLE public.gst_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'open',
  gst_collected NUMERIC DEFAULT 0,
  gst_paid NUMERIC DEFAULT 0,
  net_gst NUMERIC DEFAULT 0,
  filing_status TEXT DEFAULT 'not_filed',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gst_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gst_periods_owner" ON public.gst_periods FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- TAX OBLIGATIONS
CREATE TABLE public.tax_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  obligation_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  gst_period_id UUID REFERENCES public.gst_periods(id),
  notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tax_obligations_owner" ON public.tax_obligations FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- PAYMENT INSTRUCTIONS
CREATE TABLE public.payment_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gst_period_id UUID REFERENCES public.gst_periods(id),
  amount NUMERIC NOT NULL,
  payment_date DATE,
  ird_number TEXT,
  bank_account_from TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'draft',
  marked_paid_at TIMESTAMPTZ,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_instructions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_instructions_owner" ON public.payment_instructions FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- COMMISSION RULES
CREATE TABLE public.commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  deal_type TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'tiered',
  minimum_commission NUMERIC,
  tiers JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  on_top_fee_from_gross BOOLEAN DEFAULT TRUE,
  user_share_percent NUMERIC DEFAULT 0.75,
  company_share_percent NUMERIC DEFAULT 0.25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commission_rules_owner" ON public.commission_rules FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- DEALS
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_type TEXT NOT NULL DEFAULT 'business_sale',
  listing_name TEXT,
  expected_close_date DATE,
  probability NUMERIC DEFAULT 0.5,
  sale_price NUMERIC,
  annual_rent_excl_gst NUMERIC,
  commission_rule_id UUID REFERENCES public.commission_rules(id),
  override_type TEXT,
  override_value NUMERIC,
  gross_commission_excl_gst NUMERIC DEFAULT 0,
  gst_on_commission NUMERIC DEFAULT 0,
  on_top_fee NUMERIC DEFAULT 0,
  commission_after_fee NUMERIC DEFAULT 0,
  user_share_excl_gst NUMERIC DEFAULT 0,
  company_share_excl_gst NUMERIC DEFAULT 0,
  estimated_tax NUMERIC DEFAULT 0,
  net_to_user_after_tax NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pipeline',
  closed_at TIMESTAMPTZ,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals_owner" ON public.deals FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- GOAL PLANS
CREATE TABLE public.goal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Annual Goal',
  target_net_amount NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  effective_tax_rate NUMERIC DEFAULT 0.33,
  probability_threshold NUMERIC DEFAULT 0.60,
  is_active BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.goal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goal_plans_owner" ON public.goal_plans FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- SCENARIO PLANS
CREATE TABLE public.scenario_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_plan_id UUID REFERENCES public.goal_plans(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL DEFAULT 'realistic',
  deals_breakdown JSONB DEFAULT '[]',
  total_gross NUMERIC DEFAULT 0,
  total_fees NUMERIC DEFAULT 0,
  total_user_share NUMERIC DEFAULT 0,
  total_tax NUMERIC DEFAULT 0,
  total_net NUMERIC DEFAULT 0,
  assumptions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scenario_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scenario_plans_owner" ON public.scenario_plans FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- MONTHLY PLANS
CREATE TABLE public.monthly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_plan_id UUID REFERENCES public.goal_plans(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  target_deals INT DEFAULT 0,
  target_gross NUMERIC DEFAULT 0,
  target_actions JSONB DEFAULT '{}',
  marketing_actions JSONB DEFAULT '[]',
  assumptions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.monthly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monthly_plans_owner" ON public.monthly_plans FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- MARKETING PLANS
CREATE TABLE public.marketing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_plan_id UUID REFERENCES public.goal_plans(id),
  platform TEXT NOT NULL,
  content_calendar JSONB DEFAULT '[]',
  email_campaigns JSONB DEFAULT '[]',
  weekly_actions JSONB DEFAULT '[]',
  tone_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.marketing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marketing_plans_owner" ON public.marketing_plans FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- REPORT EXPORTS
CREATE TABLE public.report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'generating',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_exports_owner" ON public.report_exports FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- EMAIL SCHEDULES
CREATE TABLE public.email_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  recipients JSONB DEFAULT '[]',
  next_send_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  consent_record_id UUID REFERENCES public.consent_records(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_schedules_owner" ON public.email_schedules FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- THEMES
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'custom',
  colors JSONB DEFAULT '{}',
  fonts JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "themes_owner" ON public.themes FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- AUTO-CREATE PROFILE AND SETUP STATE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (owner_user_id, email)
  VALUES (NEW.id, NEW.email);
  INSERT INTO public.setup_state (owner_user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- UPDATED_AT TRIGGERS
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_setup_state_updated_at BEFORE UPDATE ON public.setup_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gst_periods_updated_at BEFORE UPDATE ON public.gst_periods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tax_obligations_updated_at BEFORE UPDATE ON public.tax_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_instructions_updated_at BEFORE UPDATE ON public.payment_instructions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commission_rules_updated_at BEFORE UPDATE ON public.commission_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goal_plans_updated_at BEFORE UPDATE ON public.goal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_plans_updated_at BEFORE UPDATE ON public.monthly_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_plans_updated_at BEFORE UPDATE ON public.marketing_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_schedules_updated_at BEFORE UPDATE ON public.email_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON public.themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
