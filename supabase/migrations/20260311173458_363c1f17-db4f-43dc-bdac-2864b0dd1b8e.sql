
-- Fix all RLS policies to be PERMISSIVE instead of RESTRICTIVE
-- This is needed because PostgreSQL requires at least one PERMISSIVE policy to grant access

-- ============ APPLICATIONS ============
DROP POLICY IF EXISTS "Admin can view all applications" ON public.applications;
DROP POLICY IF EXISTS "MoM team can update applications" ON public.applications;
DROP POLICY IF EXISTS "MoM team can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Proponents create own applications" ON public.applications;
DROP POLICY IF EXISTS "Proponents see own applications" ON public.applications;
DROP POLICY IF EXISTS "Proponents update EDS applications" ON public.applications;
DROP POLICY IF EXISTS "Proponents update own draft applications" ON public.applications;
DROP POLICY IF EXISTS "Scrutiny can update applications" ON public.applications;
DROP POLICY IF EXISTS "Scrutiny can view all applications" ON public.applications;

CREATE POLICY "Admin can view all applications" ON public.applications FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "MoM team can update applications" ON public.applications FOR UPDATE USING (has_role(auth.uid(), 'mom_team'::app_role));
CREATE POLICY "MoM team can view all applications" ON public.applications FOR SELECT USING (has_role(auth.uid(), 'mom_team'::app_role));
CREATE POLICY "Proponents create own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Proponents see own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Proponents update own draft applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id AND status = 'draft'::application_status);
CREATE POLICY "Proponents update EDS applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id AND status = 'essential_document_sought'::application_status);
CREATE POLICY "Scrutiny can update applications" ON public.applications FOR UPDATE USING (has_role(auth.uid(), 'scrutiny_team'::app_role));
CREATE POLICY "Scrutiny can view all applications" ON public.applications FOR SELECT USING (has_role(auth.uid(), 'scrutiny_team'::app_role));

-- ============ APPLICATION_DOCUMENTS ============
DROP POLICY IF EXISTS "Admin can view docs" ON public.application_documents;
DROP POLICY IF EXISTS "Doc owner can manage" ON public.application_documents;
DROP POLICY IF EXISTS "MoM can view docs" ON public.application_documents;
DROP POLICY IF EXISTS "Scrutiny can update docs" ON public.application_documents;
DROP POLICY IF EXISTS "Scrutiny can view docs" ON public.application_documents;

CREATE POLICY "Admin can view docs" ON public.application_documents FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Doc owner can manage" ON public.application_documents FOR ALL USING (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_documents.application_id AND applications.user_id = auth.uid()));
CREATE POLICY "MoM can view docs" ON public.application_documents FOR SELECT USING (has_role(auth.uid(), 'mom_team'::app_role));
CREATE POLICY "Scrutiny can update docs" ON public.application_documents FOR UPDATE USING (has_role(auth.uid(), 'scrutiny_team'::app_role));
CREATE POLICY "Scrutiny can view docs" ON public.application_documents FOR SELECT USING (has_role(auth.uid(), 'scrutiny_team'::app_role));

-- ============ APPLICATION_STATUS_HISTORY ============
DROP POLICY IF EXISTS "Admin sees history" ON public.application_status_history;
DROP POLICY IF EXISTS "App owner sees history" ON public.application_status_history;
DROP POLICY IF EXISTS "MoM inserts history" ON public.application_status_history;
DROP POLICY IF EXISTS "MoM sees history" ON public.application_status_history;
DROP POLICY IF EXISTS "Proponent inserts history" ON public.application_status_history;
DROP POLICY IF EXISTS "Scrutiny inserts history" ON public.application_status_history;
DROP POLICY IF EXISTS "Scrutiny sees history" ON public.application_status_history;

CREATE POLICY "Admin sees history" ON public.application_status_history FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "App owner sees history" ON public.application_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_status_history.application_id AND applications.user_id = auth.uid()));
CREATE POLICY "MoM inserts history" ON public.application_status_history FOR INSERT WITH CHECK (has_role(auth.uid(), 'mom_team'::app_role));
CREATE POLICY "MoM sees history" ON public.application_status_history FOR SELECT USING (has_role(auth.uid(), 'mom_team'::app_role));
CREATE POLICY "Proponent inserts history" ON public.application_status_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_status_history.application_id AND applications.user_id = auth.uid()));
CREATE POLICY "Scrutiny inserts history" ON public.application_status_history FOR INSERT WITH CHECK (has_role(auth.uid(), 'scrutiny_team'::app_role));
CREATE POLICY "Scrutiny sees history" ON public.application_status_history FOR SELECT USING (has_role(auth.uid(), 'scrutiny_team'::app_role));

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- ============ USER_ROLES ============
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- ============ SECTORS ============
DROP POLICY IF EXISTS "Admins can delete sectors" ON public.sectors;
DROP POLICY IF EXISTS "Admins can insert sectors" ON public.sectors;
DROP POLICY IF EXISTS "Admins can update sectors" ON public.sectors;
DROP POLICY IF EXISTS "Anyone can view sectors" ON public.sectors;

CREATE POLICY "Admins can delete sectors" ON public.sectors FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert sectors" ON public.sectors FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update sectors" ON public.sectors FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT TO authenticated USING (true);

-- ============ PAYMENTS ============
DROP POLICY IF EXISTS "Admin sees all payments" ON public.payments;
DROP POLICY IF EXISTS "Users create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users see own payments" ON public.payments;
DROP POLICY IF EXISTS "Users update own payments" ON public.payments;

CREATE POLICY "Admin sees all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users create own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);

-- ============ MEETING_GISTS ============
DROP POLICY IF EXISTS "Admin views gists" ON public.meeting_gists;
DROP POLICY IF EXISTS "MoM manages gists" ON public.meeting_gists;
DROP POLICY IF EXISTS "Scrutiny creates gists" ON public.meeting_gists;
DROP POLICY IF EXISTS "Scrutiny views gists" ON public.meeting_gists;

CREATE POLICY "Admin views gists" ON public.meeting_gists FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "MoM manages gists" ON public.meeting_gists FOR ALL USING (has_role(auth.uid(), 'mom_team'::app_role));
CREATE POLICY "Scrutiny creates gists" ON public.meeting_gists FOR INSERT WITH CHECK (has_role(auth.uid(), 'scrutiny_team'::app_role));
CREATE POLICY "Scrutiny views gists" ON public.meeting_gists FOR SELECT USING (has_role(auth.uid(), 'scrutiny_team'::app_role));

-- ============ MEETING_TEMPLATES ============
DROP POLICY IF EXISTS "Admin deletes templates" ON public.meeting_templates;
DROP POLICY IF EXISTS "Admin inserts templates" ON public.meeting_templates;
DROP POLICY IF EXISTS "Admin updates templates" ON public.meeting_templates;
DROP POLICY IF EXISTS "Anyone authenticated reads templates" ON public.meeting_templates;

CREATE POLICY "Admin deletes templates" ON public.meeting_templates FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin inserts templates" ON public.meeting_templates FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin updates templates" ON public.meeting_templates FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone authenticated reads templates" ON public.meeting_templates FOR SELECT TO authenticated USING (true);

-- ============ MINUTES_OF_MEETING ============
DROP POLICY IF EXISTS "Admin views MoM" ON public.minutes_of_meeting;
DROP POLICY IF EXISTS "MoM team manages MoM" ON public.minutes_of_meeting;
DROP POLICY IF EXISTS "Scrutiny views MoM" ON public.minutes_of_meeting;

CREATE POLICY "Admin views MoM" ON public.minutes_of_meeting FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "MoM team manages MoM" ON public.minutes_of_meeting FOR ALL USING (has_role(auth.uid(), 'mom_team'::app_role));
CREATE POLICY "Scrutiny views MoM" ON public.minutes_of_meeting FOR SELECT USING (has_role(auth.uid(), 'scrutiny_team'::app_role));
