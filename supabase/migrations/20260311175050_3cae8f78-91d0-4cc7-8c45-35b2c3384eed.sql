
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

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update (mark read) own notifications
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- System (trigger) inserts notifications via security definer function
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
  
  -- Notify the application owner
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

-- Create trigger on status history inserts
CREATE TRIGGER on_status_change_notify
  AFTER INSERT ON public.application_status_history
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_status_change();
