
-- Fix profiles policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Fix user_roles policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix hazard_reports policies
DROP POLICY IF EXISTS "Citizens can view own reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Staff can view all reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Citizens can create reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Staff can update reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.hazard_reports;

CREATE POLICY "Citizens can view own reports" ON public.hazard_reports FOR SELECT USING (reported_by = auth.uid());
CREATE POLICY "Admins can view all reports" ON public.hazard_reports FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Staff can view all reports" ON public.hazard_reports FOR SELECT USING (has_role(auth.uid(), 'municipal_staff'::app_role) AND is_user_approved(auth.uid()));
CREATE POLICY "Citizens can create reports" ON public.hazard_reports FOR INSERT WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Admins can update reports" ON public.hazard_reports FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Staff can update reports" ON public.hazard_reports FOR UPDATE USING (has_role(auth.uid(), 'municipal_staff'::app_role) AND is_user_approved(auth.uid()));
CREATE POLICY "Admins can delete reports" ON public.hazard_reports FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix regions policies
DROP POLICY IF EXISTS "Authenticated users can view regions" ON public.regions;
DROP POLICY IF EXISTS "Admins can manage regions" ON public.regions;

CREATE POLICY "Authenticated users can view regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Admins can manage regions" ON public.regions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for hazard images
INSERT INTO storage.buckets (id, name, public) VALUES ('hazard-images', 'hazard-images', true);

-- Storage policies: anyone can view, authenticated users can upload
CREATE POLICY "Public can view hazard images" ON storage.objects FOR SELECT USING (bucket_id = 'hazard-images');
CREATE POLICY "Authenticated users can upload hazard images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hazard-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own hazard images" ON storage.objects FOR UPDATE USING (bucket_id = 'hazard-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own hazard images" ON storage.objects FOR DELETE USING (bucket_id = 'hazard-images' AND auth.uid()::text = (storage.foldername(name))[1]);
