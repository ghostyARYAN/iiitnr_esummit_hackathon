-- Allow users to update and delete their own storage objects (required for upsert and file management)
CREATE POLICY "Users update own docs" ON storage.objects FOR UPDATE USING (
  bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own docs" ON storage.objects FOR DELETE USING (
  bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update and delete their own gist submissions (if needed)
CREATE POLICY "Users can update their own gist submissions"
ON public.gist_submissions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gist submissions"
ON public.gist_submissions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
