
-- Add identity verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Add proof_image_url column to hazard_reports for staff proof uploads
ALTER TABLE public.hazard_reports
ADD COLUMN IF NOT EXISTS proof_image_url text;
