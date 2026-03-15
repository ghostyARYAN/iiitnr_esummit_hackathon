-- ============================================================
-- FULL MIGRATION BACKUP
-- Combined from all migration files in supabase/migrations/
-- ============================================================

-- ============================================================
-- Migration 1: 20260311163721 - Initial Schema
-- ============================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'project_proponent', 'scrutiny_team', 'mom_team');

-- Create application status enum
CREATE TYPE public.application_status AS ENUM (
  'draft', 'submitted', 'under_scrutiny', 'essential_document_sought', 'referred', 'mom_generated', 'finalized'
);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  organization TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Sectors table
CREATE TABLE public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  required_documents JSONB DEFAULT '[]'::jsonb,
  parameters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sector_id UUID REFERENCES public.sectors(id) NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  project_name TEXT NOT NULL,
  project_description TEXT DEFAULT '',
  project_location TEXT DEFAULT '',
  category TEXT DEFAULT '',
  form_data JSONB DEFAULT '{}'::jsonb,
  fee_amount NUMERIC(10,2) DEFAULT 0,
  fee_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Application documents
CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT DEFAULT '',
  file_size BIGINT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Application status history
CREATE TABLE public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  from_status application_status,
  to_status application_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) NOT NULL,
  remarks TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- Meeting templates
CREATE TABLE public.meeting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  sector_id UUID REFERENCES public.sectors(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meeting_templates ENABLE ROW LEVEL SECURITY;

-- Meeting gists
CREATE TABLE public.meeting_gists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  generated_from_template UUID REFERENCES public.meeting_templates(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meeting_gists ENABLE ROW LEVEL SECURITY;

-- Minutes of Meeting
CREATE TABLE public.minutes_of_meeting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  gist_id UUID REFERENCES public.meeting_gists(id),
  content TEXT NOT NULL DEFAULT '',
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.minutes_of_meeting ENABLE ROW LEVEL SECURITY;

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
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

-- Storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false);

CREATE POLICY "Users upload own docs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users view own docs" ON storage.objects FOR SELECT USING (
  bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Scrutiny views all docs" ON storage.objects FOR SELECT USING (
  bucket_id = 'application-documents' AND public.has_role(auth.uid(), 'scrutiny_team')
);
CREATE POLICY "Admin views all storage docs" ON storage.objects FOR SELECT USING (
  bucket_id = 'application-documents' AND public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "MoM views all storage docs" ON storage.objects FOR SELECT USING (
  bucket_id = 'application-documents' AND public.has_role(auth.uid(), 'mom_team')
);

-- ============================================================
-- Migration 2: 20260311165050 - Fix RLS + Razorpay columns
-- ============================================================

-- Profiles RLS
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- User roles RLS
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Sectors RLS
CREATE POLICY "Admins can delete sectors" ON public.sectors FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert sectors" ON public.sectors FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sectors" ON public.sectors FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT TO authenticated USING (true);

-- Applications RLS
CREATE POLICY "Admin can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "MoM team can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "MoM team can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Proponents create own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Proponents see own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Proponents update own draft applications" ON public.applications FOR UPDATE
  USING ((auth.uid() = user_id) AND (status = 'draft'))
  WITH CHECK ((auth.uid() = user_id) AND (status = ANY (ARRAY['draft'::application_status, 'submitted'::application_status])));
CREATE POLICY "Proponents update EDS applications" ON public.applications FOR UPDATE
  USING ((auth.uid() = user_id) AND (status = 'essential_document_sought'))
  WITH CHECK ((auth.uid() = user_id) AND (status = ANY (ARRAY['essential_document_sought'::application_status, 'submitted'::application_status])));
CREATE POLICY "Scrutiny can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- Application documents RLS
CREATE POLICY "Admin can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doc owner can manage" ON public.application_documents FOR ALL USING (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_documents.application_id AND applications.user_id = auth.uid()));
CREATE POLICY "MoM can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Scrutiny can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny can update docs" ON public.application_documents FOR UPDATE USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- Application status history RLS
CREATE POLICY "Admin sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "App owner sees history" ON public.application_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_status_history.application_id AND applications.user_id = auth.uid()));
CREATE POLICY "MoM inserts history" ON public.application_status_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "MoM sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Scrutiny inserts history" ON public.application_status_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Proponent inserts history" ON public.application_status_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM applications WHERE applications.id = application_status_history.application_id AND applications.user_id = auth.uid()));

-- Meeting templates RLS
CREATE POLICY "Anyone authenticated reads templates" ON public.meeting_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin inserts templates" ON public.meeting_templates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates templates" ON public.meeting_templates FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes templates" ON public.meeting_templates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Meeting gists RLS
CREATE POLICY "Scrutiny creates gists" ON public.meeting_gists FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "MoM manages gists" ON public.meeting_gists FOR ALL USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Admin views gists" ON public.meeting_gists FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Scrutiny views gists" ON public.meeting_gists FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- Minutes of Meeting RLS
CREATE POLICY "MoM team manages MoM" ON public.minutes_of_meeting FOR ALL USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Admin views MoM" ON public.minutes_of_meeting FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Scrutiny views MoM" ON public.minutes_of_meeting FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- Payments RLS
CREATE POLICY "Users see own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin sees all payments" ON public.payments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Migration 3: 20260311175050 - Notifications + Status Change Trigger
-- ============================================================

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'status_change',
  read BOOLEAN NOT NULL DEFAULT false,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Notify on status change function
CREATE OR REPLACE FUNCTION public.notify_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_record RECORD;
  status_label TEXT;
BEGIN
  SELECT project_name, user_id INTO app_record FROM public.applications WHERE id = NEW.application_id;
  
  status_label := REPLACE(NEW.to_status::TEXT, '_', ' ');
  
  INSERT INTO public.notifications (user_id, title, message, application_id)
  VALUES (
    app_record.user_id,
    'Status Updated: ' || app_record.project_name,
    'Your application status changed to ' || status_label,
    NEW.application_id
  );
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- Migration 4: 20260313100000 - Activity Logs (Advanced Auditing)
-- ============================================================

-- Activity Logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Helper function to log activity
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- Migration 5: 20260314095131 - Sectors Seed + Affidavits + EDS Points
-- ============================================================

-- Unique constraint on sector name
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sectors_name_key') THEN
    ALTER TABLE public.sectors ADD CONSTRAINT sectors_name_key UNIQUE (name);
  END IF;
END $$;

-- Seed sectors
INSERT INTO public.sectors (name, description, required_documents, parameters) VALUES
('Sand', 'Sand mining and extraction projects', 
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","District Survey Report (DSR) / Sand Replenishment Study","Land Documents (B-1 P-2)","LOI","NOC from Gram Panchayat / Local Body","200 Meter Certificate","500 Meter Certificate","Marked & Delimited Copy","Mining Plan Approval Letter","Approved Mining Plan","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","KML File","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","GIST Submission"]'::jsonb,
  '{"fee_amount": 5000, "category": "Mining"}'::jsonb
),
('Limestone', 'Limestone mining and quarrying projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","District Survey Report (DSR) / Sand Replenishment Study","Land Documents (B-1 P-2)","Consent of Landowner(s)","LOI","Lease Deed","Previously issued EC","Actions taken to comply with EC","Past Production Data (certified by Mining Dept.)","NOC from Gram Panchayat / Local Body","200 Meter Certificate","500 Meter Certificate","Mining Plan Approval Letter","Approved Mining Plan","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","Complete Tree Plantation as per previously issued EC","Water NOC (CGWA)","CTE / CTO from CECB","Geo-tagged Photographs","7.5m Boundary Strip excavation status / Restoration Plan","Drone Video","KML File","CCR (Certified Compliance Report)","C.E.M.P.","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","EIA Report and Public Hearing (If Applicable)","GIST Submission"]'::jsonb,
  '{"fee_amount": 10000, "category": "Mining"}'::jsonb
),
('Bricks', 'Brick kiln and earth clay projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","District Survey Report (DSR)","Land Documents (B-1 P-2)","Consent of Landowner(s)","LOI","Lease Deed","Previously issued EC","Actions taken to comply with EC","Past Production Data (certified by Mining Dept.)","NOC from Gram Panchayat / Local Body","Panchnama","200 Meter Certificate","500 Meter Certificate","Mining Plan Approval Letter","Approved Mining Plan","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","Complete Tree Plantation as per previously issued EC","Water NOC (CGWA)","CTE / CTO from CECB","Geo-tagged Photographs","1.0m Boundary Strip excavation status / Restoration Plan","Drone Video","KML File","CCR (Certified Compliance Report)","C.E.M.P.","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","EIA Report and Public Hearing (If Applicable)","GIST Submission"]'::jsonb,
  '{"fee_amount": 5000, "category": "Mining"}'::jsonb
),
('Infrastructure', 'Construction, real estate, and infrastructure projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","Land Documents (B-1 P-2)","Previously issued EC","Actions taken to comply with EC","Partnership Deed / Consent of Owner(s)","Conceptual Plan","Approved Layout from Town & Country Planning","Land Use / Zoning Map","Built-up Area Statement","Building Permission","Water Permission (NRANVP/CGWA)","STP Design & Reuse Plan / Disinfection Proposal","Solid Waste Management Plan","Solar Energy Plan","Green Belt Area Statement","EMP Cost Estimates","NBWL Clearance (if <1km)","Fire NOC","Aviation NOC (If applicable)","Wildlife Management Plan (If applicable)","CTE / CTO from CECB","Geo-tagged Photographs","KML File","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","EIA Report and Public Hearing (If Applicable)","GIST Submission"]'::jsonb,
  '{"fee_amount": 15000, "category": "Construction"}'::jsonb
),
('Industry', 'Industrial and manufacturing projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","Land Documents (B-1 P-2)","Consent of Landowner(s)","Lease Deed","Previously issued EC","Actions taken to comply with EC","Past Production Data (certified by Mining Dept.)","NOC from Gram Panchayat / Local Body","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","Complete Tree Plantation as per previously issued EC","Land Use Breakup Details","ETP","Fire NOC","Water Permission (NRANVP/CGWA)","Water NOC (CGWA)","STP Design & Reuse Plan / Disinfection Proposal","EMP Cost Estimates","CTE / CTO from CECB","ToR Granted","EIA Report and Public Hearing (If Applicable)","Wildlife Management Plan (If applicable)","Affidavit on Pending Litigation","All Compliance Affidavits","Drone Video","CCR (Certified Compliance Report)","C.E.M.P.","CER Details with consent of Gram Sabha / Concerned Dept.","GIST Submission"]'::jsonb,
  '{"fee_amount": 10000, "category": "Industrial"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  required_documents = EXCLUDED.required_documents,
  parameters = EXCLUDED.parameters,
  updated_at = now();

-- Create affidavit_points table
CREATE TABLE IF NOT EXISTS public.affidavit_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  point_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affidavit_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read affidavit points"
  ON public.affidavit_points FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage affidavit points"
  ON public.affidavit_points FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Affidavit points for Stones
INSERT INTO public.affidavit_points (category, point_text) VALUES
('Stones', 'That top soil will be preserved & stored.'),
('Stones', 'That control blasting will be done by a DGMS authorized license holder.'),
('Stones', 'That completion certificate of 7.5 meter wide safety zone plantation and proposed work under CER activities will be submitted along with Geotag photographs in six monthly compliance reports.'),
('Stones', 'That survival rate of Plantation will be 90%.'),
('Stones', 'That demarcation will be done by boundary pillars as Mineral Concession Rules.'),
('Stones', 'That water sprinkling arrangements will be done for fugitive dust emission.'),
('Stones', 'That any type of polluted water will not be released into any natural water source.'),
('Stones', 'That employment will be given to the local people as per the rules of the State Government.'),
('Stones', 'That no court case is pending relating to this project before any Court of Law in India.'),
('Stones', 'That no violation of Notification S.O. 804(E) dated 14/03/2017 issued by MoEFCC, GoI.'),
('Stones', 'That the conditions given in the environmental clearance will be followed.'),
('Stones', 'That no excavation will be done in 7.5 meter safety zone in future.'),
('Stones', 'That mining operation does not cause any disturbance to flora & fauna.'),
('Stones', 'That proposed CER work will be done as per the proposal presented before the honourable committee.'),
('Stones', 'That proposed plantation will be done within a 7.5 meter lease boundary.');

-- Affidavit points for Bricks
INSERT INTO public.affidavit_points (category, point_text) VALUES
('Bricks', 'That survival rate of Plantation will be 90%.'),
('Bricks', 'That water sprinkling arrangements will be done for fugitive dust emission.'),
('Bricks', 'That Contaminated water will not be discharged into natural water sources.'),
('Bricks', 'That demarcation will be done by boundary pillars as Mineral Concession Rules.'),
('Bricks', 'That employment will be given to the local people as per the rules of the State Government.'),
('Bricks', 'That no other lease/brick kiln is operated within a radius of 1 kilometer of this applied area.'),
('Bricks', 'That presently bricks are manufactured using clay and fly ash at 50%-50% mixture.'),
('Bricks', 'That the height of the fixed chimney is set at least 35m.'),
('Bricks', 'For firing bricks, zig-zag technology or vertical shaft technology will be used within 2 years.'),
('Bricks', 'That vehicles are kept covered during transportation of raw material/bricks.'),
('Bricks', 'That approved fuel will be used. No hazardous waste like tyres/plastics will be used.'),
('Bricks', 'That no court case is pending relating to this project before any Court of Law in India.'),
('Bricks', 'Convert the lease area into Zig Zag method as per notification dated 22/02/2022 issued by MoEFCC.'),
('Bricks', 'The conditions given in the environmental clearance will be followed and six monthly compliance reports will be submitted.');

-- Affidavit points for Sand
INSERT INTO public.affidavit_points (category, point_text) VALUES
('Sand', 'Water sprinkling arrangements for fugitive dust emission.'),
('Sand', '90% survival rate of Plantation.'),
('Sand', 'Employment given to the local people as per the rules of the State Government.'),
('Sand', 'Any type of polluted water will not be released into any natural water source.'),
('Sand', 'No court case pending relating to this project before any Court of Law in India.'),
('Sand', 'Mining shall be done in 60 percent of the total lease area.'),
('Sand', 'The direction given by Sustainable Mining Guideline 2016 & Enforcement and Monitoring guideline for Sand 2020 will be followed.'),
('Sand', 'Trees will be planted on both sides of the approached roads.'),
('Sand', 'Minerals will be transported by covering with tarpaulin sheet.'),
('Sand', 'Vehicles will not be transported through populated areas.'),
('Sand', 'Sand excavation work will not be done during the rainy season.'),
('Sand', 'Sand excavation and filling will be done manually; heavy vehicles will not enter the river.'),
('Sand', 'Demarcation will be done by boundary pillars as per Mineral Concession Rules.'),
('Sand', 'No Excavation work in the area prohibited for excavation.'),
('Sand', 'Mining will not be done outside the lease area.');

-- General affidavit points
INSERT INTO public.affidavit_points (category, point_text) VALUES
('General', 'The direction given in EC by the Supreme Court, High Court, NGT and any other court will be followed.'),
('General', 'Inform MoEFCC/SEIAA for any change in ownership of the mining lease.'),
('General', 'No excavation will be done outside the applied lease area.'),
('General', 'No Schedule 1 species have been found in the vicinity of the mine.'),
('General', 'Topsoil extracted will be stored within the lease area within the safety zone.'),
('General', 'Topsoil will not be misused, sold, or used for any other purpose.');

-- Create eds_deficiency_points table
CREATE TABLE IF NOT EXISTS public.eds_deficiency_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  point_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.eds_deficiency_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read EDS points"
  ON public.eds_deficiency_points FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage EDS points"
  ON public.eds_deficiency_points FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed EDS deficiency points
INSERT INTO public.eds_deficiency_points (point_text) VALUES
('PP shall submit processing fee details.'),
('PP shall submit Pre-feasibility report.'),
('PP shall submit Certified compliance Report of Air and Water Consent issued by CECB.'),
('PP shall submit LOI.'),
('PP shall submit LOI Extension copy.'),
('PP shall submit Mining plan approval letter.'),
('PP shall submit approved Mining plan.'),
('PP shall submit the details of forest land & Stage 1 & Stage 2 clearance.'),
('PP shall submit Land Documents.'),
('PP shall submit Land Documents & Consent of Land Owners (If applicable).'),
('PP shall submit 200 m, 500 m Certificate.'),
('PP shall submit Gram Panchayat NoC.'),
('PP shall submit DSR (Latest) with Sand Replenishment Study.'),
('PP shall submit Marked & Delimited Copy.'),
('PP shall submit revised Forest NOC from DFO.'),
('PP shall submit C.E.M.P details for cluster.'),
('PP shall submit updated EIA Report along with updated ToR compliance.'),
('PP shall submit Wildlife Conservation plan (Schedule 1 Species).'),
('PP shall submit Water NOC for Ground water abstraction.'),
('PP shall submit Consent of Land Owners.'),
('PP shall submit notarized affidavit that no schedule 1 species found.'),
('PP shall submit latest past production certificate certified from Mining Department.'),
('PP shall submit Plantation details as per previously issued EC.'),
('PP shall submit Geotagged photographs of applied lease area.'),
('PP shall submit Self compliance Report of previously issued EC.'),
('PP shall submit Restoration Plan (if excavated).'),
('PP shall submit Panchnama.'),
('PP shall submit Previously issued EC.'),
('PP shall submit PFR.'),
('PP shall submit Approved Layout from town and country planning.'),
('PP shall submit Land Use / Zoning Map.'),
('PP shall submit Built-up Area Statement.'),
('PP shall submit Building permission copy.'),
('PP shall submit STP Design & Reuse Plan / Disinfection Proposal.'),
('PP shall submit Solid Waste Management Plan.'),
('PP shall submit Solar Energy Plan.'),
('PP shall submit Green Belt Area statement.'),
('PP shall submit EMP Cost Estimates.'),
('PP shall submit NBWL Clearance (if <1km).'),
('PP shall submit Fire NOC.'),
('PP shall submit Aviation NOC (If applicable).'),
('PP shall submit Wildlife Management Plan.'),
('PP shall submit lease deed.'),
('PP shall submit KML file of applied area with properly demarcated boundary.'),
('PP shall submit drone video of the applied mining lease area.'),
('PP shall submit CER Details with consent from local authority.'),
('PP shall submit all notarized affidavits points related to project.');

-- ============================================================
-- Migration 6: 20260314163246 - All Triggers
-- ============================================================

-- Trigger: auto-create profile + role on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update updated_at on applications
CREATE OR REPLACE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update updated_at on meeting_templates
CREATE OR REPLACE TRIGGER trg_meeting_templates_updated_at
  BEFORE UPDATE ON public.meeting_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update updated_at on meeting_gists
CREATE OR REPLACE TRIGGER trg_meeting_gists_updated_at
  BEFORE UPDATE ON public.meeting_gists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update updated_at on minutes_of_meeting
CREATE OR REPLACE TRIGGER trg_mom_updated_at
  BEFORE UPDATE ON public.minutes_of_meeting
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update updated_at on profiles
CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update updated_at on sectors
CREATE OR REPLACE TRIGGER trg_sectors_updated_at
  BEFORE UPDATE ON public.sectors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: notify on status change
CREATE OR REPLACE TRIGGER trg_notify_status_change
  AFTER INSERT ON public.application_status_history
  FOR EACH ROW EXECUTE FUNCTION public.notify_status_change();

-- Trigger: activity log on applications
CREATE OR REPLACE TRIGGER trg_log_applications
  AFTER INSERT OR UPDATE OR DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Trigger: activity log on application_documents
CREATE OR REPLACE TRIGGER trg_log_application_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.application_documents
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();
