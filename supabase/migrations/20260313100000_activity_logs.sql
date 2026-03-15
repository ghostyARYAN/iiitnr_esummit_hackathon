
-- Table for activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _details);
END;
$$;

-- Trigger for application status changes (beyond just history)
CREATE OR REPLACE FUNCTION public.tr_log_app_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.log_activity(
      'status_change',
      'application',
      NEW.id,
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_app_status_change_log
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.tr_log_app_status_change();

-- Trigger for document uploads
CREATE OR REPLACE FUNCTION public.tr_log_doc_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_activity(
    'document_upload',
    'application_document',
    NEW.id,
    jsonb_build_object('application_id', NEW.application_id, 'file_name', NEW.file_name)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_doc_upload_log
  AFTER INSERT ON public.application_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.tr_log_doc_upload();
