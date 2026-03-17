
-- 1. Attach the handle_new_user trigger to auth.users (if not already attached)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Add INSERT policy on user_roles so the trigger (SECURITY DEFINER) and signup flow work
-- Note: The trigger runs as SECURITY DEFINER so it bypasses RLS,
-- but we also need a policy for admin inserts
CREATE POLICY "Allow insert for authenticated users own role"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Re-insert missing profile and role for existing user brahmi7711@gmail.com
INSERT INTO public.profiles (user_id, email, name, is_verified)
VALUES ('32e1d57a-7423-4764-812d-07e86940cd16', 'brahmi7711@gmail.com', 'Ram Reddy', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role, is_approved)
VALUES ('32e1d57a-7423-4764-812d-07e86940cd16', 'admin', true)
ON CONFLICT DO NOTHING;
