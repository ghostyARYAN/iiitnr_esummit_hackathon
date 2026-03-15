# Plan: Fireflies.ai Integration for Automated MoM

## Overview
Enable the MoM team to automate "Minutes of Meeting" generation by integrating Fireflies.ai. This will allow:
1.  **Scheduling Online Meetings**: Inviting Fireflies.ai bot to meetings.
2.  **Uploading Audio**: Uploading offline meeting recordings for transcription.
3.  **Auto-generated Summaries**: Populating the "Meeting Gist" with AI-generated summaries.

## Prerequisites
- **Fireflies.ai API Key**: Required to authenticate requests. (User needs to provide this).

## 1. Database Schema Changes
Update the `meeting_gists` table to track Fireflies.ai tasks.
- Add column `fireflies_transcript_id` (TEXT, nullable): To store the ID returned by Fireflies.
- Add column `fireflies_status` (TEXT, default 'pending'): To track status (uploading, processing, completed, failed).
- Add column `audio_url` (TEXT, nullable): To store the URL of the uploaded audio (if applicable).

## 2. Backend: Supabase Edge Function (`fireflies-integration`)
Create a new Edge Function to handle secure communication with Fireflies.ai API.
- **Path**: `supabase/functions/fireflies-integration/index.ts`
- **Actions**:
    - `upload_audio`: Accepts an audio file URL, calls Fireflies `uploadAudio` mutation.
    - `check_status`: Accepts a transcript ID, calls Fireflies `transcript` query to check status and get summary.
    - `schedule_meeting`: Accepts meeting details, calls Fireflies to schedule/invite bot.

## 3. Frontend: MoM Gists Page (`src/pages/MomGists.tsx`)
Enhance the UI to support the new workflow.
- **Upload Audio Button**:
    - Allow user to select an audio file.
    - Upload file to Supabase Storage (bucket: `meeting-audio`).
    - Call Edge Function `upload_audio` with the public URL.
    - Update UI to show "Processing...".
- **Schedule Meeting Button** (Optional/Phase 2):
    - specific form to input meeting details and invite Fireflies.
- **Poll/Refresh Mechanism**:
    - Periodically check the status of processing gists.
    - When status is `completed`, fetch the summary and update the `content` of the Gist.

## 4. Implementation Steps
1.  **Schema Update**: Create a migration to add columns to `meeting_gists`.
2.  **Storage**: Create a Supabase Storage bucket `meeting-audio`.
3.  **Edge Function**: Implement the `fireflies-integration` function.
4.  **Frontend**: Update `MomGists.tsx` with upload and status logic.
5.  **Testing**: Verify the flow with sample audio.
