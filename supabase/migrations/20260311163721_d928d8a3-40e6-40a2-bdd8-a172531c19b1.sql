
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
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'project_proponent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meeting_templates_updated_at BEFORE UPDATE ON public.meeting_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meeting_gists_updated_at BEFORE UPDATE ON public.meeting_gists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_minutes_of_meeting_updated_at BEFORE UPDATE ON public.minutes_of_meeting FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS POLICIES

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Sectors
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert sectors" ON public.sectors FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sectors" ON public.sectors FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sectors" ON public.sectors FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Applications
CREATE POLICY "Proponents see own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Proponents create own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Proponents update own draft applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');
CREATE POLICY "Scrutiny can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Admin can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "MoM team can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));

-- Application documents
CREATE POLICY "Doc owner can manage" ON public.application_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND user_id = auth.uid())
);
CREATE POLICY "Scrutiny can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Admin can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "MoM can view docs" ON public.application_documents FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));

-- Status history
CREATE POLICY "App owner sees history" ON public.application_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND user_id = auth.uid())
);
CREATE POLICY "Scrutiny sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Scrutiny inserts history" ON public.application_status_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "Admin sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "MoM sees history" ON public.application_status_history FOR SELECT USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "MoM inserts history" ON public.application_status_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'mom_team'));

-- Meeting templates
CREATE POLICY "Anyone authenticated reads templates" ON public.meeting_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin inserts templates" ON public.meeting_templates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates templates" ON public.meeting_templates FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes templates" ON public.meeting_templates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Meeting gists
CREATE POLICY "Scrutiny creates gists" ON public.meeting_gists FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'scrutiny_team'));
CREATE POLICY "MoM manages gists" ON public.meeting_gists FOR ALL USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Admin views gists" ON public.meeting_gists FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Scrutiny views gists" ON public.meeting_gists FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- Minutes of Meeting
CREATE POLICY "MoM team manages MoM" ON public.minutes_of_meeting FOR ALL USING (public.has_role(auth.uid(), 'mom_team'));
CREATE POLICY "Admin views MoM" ON public.minutes_of_meeting FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Scrutiny views MoM" ON public.minutes_of_meeting FOR SELECT USING (public.has_role(auth.uid(), 'scrutiny_team'));

-- Payments
CREATE POLICY "Users see own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin sees all payments" ON public.payments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

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
