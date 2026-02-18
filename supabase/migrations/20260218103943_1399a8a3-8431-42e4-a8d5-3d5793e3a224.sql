-- Add unique constraint on owner_user_id for brand_profiles to enable upsert
ALTER TABLE public.brand_profiles ADD CONSTRAINT brand_profiles_owner_user_id_key UNIQUE (owner_user_id);