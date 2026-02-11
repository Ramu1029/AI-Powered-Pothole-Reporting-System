
-- Create enums for hazard reports
CREATE TYPE public.hazard_type AS ENUM (
  'pothole', 'crack', 'flooding', 'debris', 
  'damaged_signage', 'broken_barrier', 'uneven_surface', 'erosion'
);

CREATE TYPE public.severity_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE public.report_status AS ENUM (
  'pending', 'under_review', 'verified', 'rejected', 'in_progress', 'resolved'
);

-- Create hazard_reports table
CREATE TABLE public.hazard_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL,
  reporter_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  -- Location fields
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  location_address TEXT NOT NULL,
  location_region TEXT NOT NULL,
  -- AI Analysis fields
  ai_hazard_type hazard_type,
  ai_severity severity_level,
  ai_confidence DOUBLE PRECISION,
  ai_description TEXT,
  ai_suggested_priority INTEGER,
  -- Status and assignment
  status report_status NOT NULL DEFAULT 'pending',
  assigned_to UUID,
  assigned_staff_name TEXT,
  remarks TEXT[] DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;

-- Citizens can view their own reports
CREATE POLICY "Citizens can view own reports"
  ON public.hazard_reports FOR SELECT
  USING (reported_by = auth.uid());

-- Staff can view all reports (approved staff only)
CREATE POLICY "Staff can view all reports"
  ON public.hazard_reports FOR SELECT
  USING (
    public.has_role(auth.uid(), 'municipal_staff') 
    AND public.is_user_approved(auth.uid())
  );

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON public.hazard_reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Citizens can create reports
CREATE POLICY "Citizens can create reports"
  ON public.hazard_reports FOR INSERT
  WITH CHECK (reported_by = auth.uid());

-- Staff can update reports (for status changes, remarks, assignments)
CREATE POLICY "Staff can update reports"
  ON public.hazard_reports FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'municipal_staff') 
    AND public.is_user_approved(auth.uid())
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.hazard_reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON public.hazard_reports FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_hazard_reports_updated_at
  BEFORE UPDATE ON public.hazard_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  staff_count INTEGER DEFAULT 0,
  active_reports INTEGER DEFAULT 0
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view regions
CREATE POLICY "Authenticated users can view regions"
  ON public.regions FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage regions
CREATE POLICY "Admins can manage regions"
  ON public.regions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for hazard_reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.hazard_reports;

-- Seed regions
INSERT INTO public.regions (name, code, staff_count, active_reports) VALUES
  ('Downtown District', 'DTD', 3, 0),
  ('Westside', 'WST', 2, 0),
  ('Industrial Zone', 'INZ', 2, 0),
  ('Residential North', 'RSN', 2, 0),
  ('Harbor District', 'HBD', 1, 0);
