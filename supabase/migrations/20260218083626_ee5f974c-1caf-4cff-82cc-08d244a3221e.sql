
-- Add user_type to profiles for Business Broker vs Real Estate Agent
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type text DEFAULT NULL;

-- Add animations_enabled to profiles for animation toggle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS animations_enabled boolean DEFAULT true;

-- Add active_theme to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_theme text DEFAULT 'teal-warm';

-- Create storage bucket for user attachments (transaction receipts, docs)
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for attachments
CREATE POLICY "Users can view their own attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for logos
CREATE POLICY "Users can view their own logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add transaction_id reference to attachments if not already there
-- (attachments table already exists with entity_id/entity_type pattern, which works)

-- Create a function to delete a user's account and all their data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  -- Delete all user data from all tables
  DELETE FROM public.attachments WHERE owner_user_id = uid;
  DELETE FROM public.audit_logs WHERE owner_user_id = uid;
  DELETE FROM public.bank_accounts WHERE owner_user_id = uid;
  DELETE FROM public.brand_asset_candidates WHERE owner_user_id = uid;
  DELETE FROM public.brand_profiles WHERE owner_user_id = uid;
  DELETE FROM public.categorization_rules WHERE owner_user_id = uid;
  DELETE FROM public.categories WHERE owner_user_id = uid;
  DELETE FROM public.commission_rules WHERE owner_user_id = uid;
  DELETE FROM public.consent_records WHERE owner_user_id = uid;
  DELETE FROM public.deals WHERE owner_user_id = uid;
  DELETE FROM public.email_schedules WHERE owner_user_id = uid;
  DELETE FROM public.goal_plans WHERE owner_user_id = uid;
  DELETE FROM public.gst_periods WHERE owner_user_id = uid;
  DELETE FROM public.integrations WHERE owner_user_id = uid;
  DELETE FROM public.ledger_entries WHERE owner_user_id = uid;
  DELETE FROM public.ledger_accounts WHERE owner_user_id = uid;
  DELETE FROM public.marketing_plans WHERE owner_user_id = uid;
  DELETE FROM public.monthly_plans WHERE owner_user_id = uid;
  DELETE FROM public.payment_instructions WHERE owner_user_id = uid;
  DELETE FROM public.profiles WHERE owner_user_id = uid;
  DELETE FROM public.report_exports WHERE owner_user_id = uid;
  DELETE FROM public.scenario_plans WHERE owner_user_id = uid;
  DELETE FROM public.setup_state WHERE owner_user_id = uid;
  DELETE FROM public.tax_obligations WHERE owner_user_id = uid;
  DELETE FROM public.themes WHERE owner_user_id = uid;
  
  -- Delete user from auth
  DELETE FROM auth.users WHERE id = uid;
END;
$$;
