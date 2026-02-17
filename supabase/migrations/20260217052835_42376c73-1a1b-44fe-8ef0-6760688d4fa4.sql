
-- Add new location columns to hazard_reports
ALTER TABLE public.hazard_reports ADD COLUMN location_state text NOT NULL DEFAULT '';
ALTER TABLE public.hazard_reports ADD COLUMN location_district text NOT NULL DEFAULT '';
ALTER TABLE public.hazard_reports ADD COLUMN location_mandal text NOT NULL DEFAULT '';

-- Migrate existing region data to state column
UPDATE public.hazard_reports SET location_state = location_region WHERE location_state = '';

-- Add district and mandal to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mandal text;
