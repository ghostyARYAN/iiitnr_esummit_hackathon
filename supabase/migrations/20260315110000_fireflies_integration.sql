
-- Migration: Add Fireflies integration support
-- Date: 2026-03-15 11:00:00

-- 1. Add columns to meeting_gists table
ALTER TABLE "public"."meeting_gists" 
ADD COLUMN IF NOT EXISTS "fireflies_transcript_id" TEXT,
ADD COLUMN IF NOT EXISTS "fireflies_status" TEXT DEFAULT 'pending', -- pending, uploading, processing, completed, failed
ADD COLUMN IF NOT EXISTS "audio_url" TEXT;

-- 2. Create storage bucket for meeting audio
INSERT INTO "storage"."buckets" ("id", "name", "public")
VALUES ('meeting-audio', 'meeting-audio', true)
ON CONFLICT ("id") DO NOTHING;

-- 3. Set up storage policies for meeting-audio bucket

-- Allow authenticated users to upload audio
CREATE POLICY "Allow authenticated users to upload meeting audio"
ON "storage"."objects"
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'meeting-audio');

-- Allow authenticated users to read audio files (for processing)
CREATE POLICY "Allow authenticated users to read meeting audio"
ON "storage"."objects"
FOR SELECT
TO authenticated
USING (bucket_id = 'meeting-audio');

-- Allow authenticated users to update/delete their own audio (optional, but good for cleanup)
CREATE POLICY "Allow authenticated users to delete meeting audio"
ON "storage"."objects"
FOR DELETE
TO authenticated
USING (bucket_id = 'meeting-audio');

-- Ensure public access is allowed for the Edge Function to read the file via public URL if needed
-- (Though we made the bucket public: true, so objects are public by default for reading if the policy allows or if we rely on public URL)
-- The 'public' flag on bucket means files can be accessed via public URL without a signed token if RLS allows or if it's completely open.
-- Let's add a public select policy just in case RLS is enabled on objects.
CREATE POLICY "Allow public read access to meeting audio"
ON "storage"."objects"
FOR SELECT
TO public
USING (bucket_id = 'meeting-audio');
