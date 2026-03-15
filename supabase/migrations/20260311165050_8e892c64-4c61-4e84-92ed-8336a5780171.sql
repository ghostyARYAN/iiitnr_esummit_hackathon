
-- ============================================================
-- 1. Fix all RLS policies: Drop RESTRICTIVE, recreate as PERMISSIVE
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- sectors
DROP POLICY IF EXISTS "Admins can delete sectors" ON public.sectors;
DROP POLICY IF EXISTS "Admins can insert sectors" ON public.sectors;
DROP POLICY IF EXISTS "Admins can update sectors" ON public.sectors;
DROP POLICY IF EXISTS "Anyone can view sectors" ON public.sectors;

CREATE POLICY "Admins can delete sectors" ON public.sectors FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert sectors" ON public.sectors FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sectors" ON public.sectors FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT TO authenticated USING (true);

-- applications
DROP POLICY IF EXISTS "Admin can view all applications" ON public.applications;
DROP POLICY IF EXISTS "MoM team can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Proponents create own applications" ON public.applications;
DROP POLICY IF EXISTS "Proponents see own applications" ON public.applications;
DROP POLICY IF EXISTS "Proponents update own draft applications" ON public.applications;
DROP POLICY IF EXISTS "Scrutiny can update applications" ON public.applications;
DROP POLICY IF EXISTS "Scrutiny can view all applications" ON public.applications;

CREATE POLICY "Admin can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "MoM team can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Proponents create own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Proponents see own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Proponents update own draft applications" ON public.applications FOR UPDATE USING ((auth.uid() = user_id) AND (status = 'draft'));
CREATE POLICY "Proponents update EDS applications" ON public.applications FOR UPDATE USING ((auth.uid() = user_id) AND (status = 'essential_document_sought'));
CREATE POLICY "Scrutiny can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "MoM team can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'mom_team'));

-- application_documents
DROP POLICY IF EXISTS "Admin can view docs" ON public.application_documents;
DROP POLICY IF EXISTS "Doc owner can manage" ON public.application_documents;
DROP POLICY IF EXISTS "MoM can view docs" ON public.application_documents;
DROP POLICY IF EXISTS "Scrutiny can view docs" ON public.application_documents;

CREATE POLICY "Admin can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doc owner can manage" ON public.application_documents FOR ALL USING (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_documents.application_id AND applications.user_id = auth.uid()));
CREATE POLICY "MoM can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Scrutiny can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny can update docs" ON public.application_documents FOR UPDATE USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- application_status_history
DROP POLICY IF EXISTS "Admin sees history" ON public.application_status_history;
DROP POLICY IF EXISTS "App owner sees history" ON public.application_status_history;
DROP POLICY IF EXISTS "MoM inserts history" ON public.application_status_history;
DROP POLICY IF EXISTS "MoM sees history" ON public.application_status_history;
DROP POLICY IF EXISTS "Scrutiny inserts history" ON public.application_status_history;
DROP POLICY IF EXISTS "Scrutiny sees history" ON public.application_status_history;

CREATE POLICY "Admin sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "App owner sees history" ON public.application_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_status_history.application_id AND applications.user_id = auth.uid()));
CREATE POLICY "MoM inserts history" ON public.application_status_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "MoM sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Scrutiny inserts history" ON public.application_status_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Proponent inserts history" ON public.application_status_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_status_history.application_id AND applications.user_id = auth.uid()));

-- meeting_templates
DROP POLICY IF EXISTS "Admin deletes templates" ON public.meeting_templates;
DROP POLICY IF EXISTS "Admin inserts templates" ON public.meeting_templates;
DROP POLICY IF EXISTS "Admin updates templates" ON public.meeting_templates;
DROP POLICY IF EXISTS "Anyone authenticated reads templates" ON public.meeting_templates;

CREATE POLICY "Admin deletes templates" ON public.meeting_templates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin inserts templates" ON public.meeting_templates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates templates" ON public.meeting_templates FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone authenticated reads templates" ON public.meeting_templates FOR SELECT TO authenticated USING (true);

-- meeting_gists
DROP POLICY IF EXISTS "Admin views gists" ON public.meeting_gists;
DROP POLICY IF EXISTS "MoM manages gists" ON public.meeting_gists;
DROP POLICY IF EXISTS "Scrutiny creates gists" ON public.meeting_gists;
DROP POLICY IF EXISTS "Scrutiny views gists" ON public.meeting_gists;

CREATE POLICY "Admin views gists" ON public.meeting_gists FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "MoM manages gists" ON public.meeting_gists FOR ALL USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Scrutiny creates gists" ON public.meeting_gists FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny views gists" ON public.meeting_gists FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- minutes_of_meeting
DROP POLICY IF EXISTS "Admin views MoM" ON public.minutes_of_meeting;
DROP POLICY IF EXISTS "MoM team manages MoM" ON public.minutes_of_meeting;
DROP POLICY IF EXISTS "Scrutiny views MoM" ON public.minutes_of_meeting;

CREATE POLICY "Admin views MoM" ON public.minutes_of_meeting FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "MoM team manages MoM" ON public.minutes_of_meeting FOR ALL USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Scrutiny views MoM" ON public.minutes_of_meeting FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- payments
DROP POLICY IF EXISTS "Admin sees all payments" ON public.payments;
DROP POLICY IF EXISTS "Users create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users see own payments" ON public.payments;

CREATE POLICY "Admin sees all payments" ON public.payments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 2. Add Razorpay columns to payments (replace Stripe)
-- ============================================================
ALTER TABLE public.payments DROP COLUMN IF EXISTS stripe_payment_id;
ALTER TABLE public.payments DROP COLUMN IF EXISTS stripe_session_id;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_signature text;

-- ============================================================
-- 3. Fix handle_new_user to save organization from metadata
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, organization, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'project_proponent');
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
