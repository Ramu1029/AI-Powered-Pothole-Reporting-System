
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- hazard_reports
DROP POLICY IF EXISTS "Citizens can view own reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Staff can view all reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Citizens can create reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Staff can update reports" ON public.hazard_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.hazard_reports;

CREATE POLICY "Citizens can view own reports" ON public.hazard_reports FOR SELECT USING (reported_by = auth.uid());
CREATE POLICY "Admins can view all reports" ON public.hazard_reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view all reports" ON public.hazard_reports FOR SELECT USING (public.has_role(auth.uid(), 'municipal_staff') AND public.is_user_approved(auth.uid()));
CREATE POLICY "Citizens can create reports" ON public.hazard_reports FOR INSERT WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Admins can update reports" ON public.hazard_reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can update reports" ON public.hazard_reports FOR UPDATE USING (public.has_role(auth.uid(), 'municipal_staff') AND public.is_user_approved(auth.uid()));
CREATE POLICY "Admins can delete reports" ON public.hazard_reports FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- regions
DROP POLICY IF EXISTS "Authenticated users can view regions" ON public.regions;
DROP POLICY IF EXISTS "Admins can manage regions" ON public.regions;

CREATE POLICY "Authenticated users can view regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Admins can manage regions" ON public.regions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Recreate the signup trigger (it's missing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
