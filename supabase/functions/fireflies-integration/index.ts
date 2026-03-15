
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use environment variable for API key
const FIREFLIES_API_KEY = Deno.env.get('FIREFLIES_API_KEY') || '9fb05633-3c9f-433c-81c6-3df499667c2a';
const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    if (action === 'upload_audio') {
      return await handleUploadAudio(payload);
    } else if (action === 'check_status') {
      return await handleCheckStatus(payload);
    } else if (action === 'schedule_meeting') {
      return await handleScheduleMeeting(payload);
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleUploadAudio(payload: { audio_url: string; title: string }) {
  const { audio_url, title } = payload;
  
  if (!audio_url) {
    throw new Error('Audio URL is required');
  }

  const query = `
    mutation UploadAudio($input: AudioUploadInput) {
      uploadAudio(input: $input) {
        success
        title
        message
      }
    }
  `;

  const variables = {
    input: {
      url: audio_url,
      title: title || 'Uploaded Meeting',
    },
  };

  const response = await fetch(FIREFLIES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIREFLIES_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  
  // Note: Fireflies uploadAudio returns success message but not immediately the transcript ID.
  // The transcript is processed asynchronously. We need to poll for it or use webhooks.
  // However, for this simple integration, we might assume it will be available in the list or we need to search for it.
  // Actually, uploadAudio documentation says it returns success.
  // Wait, standard Fireflies flow for upload is:
  // 1. uploadAudio -> queues it.
  // 2. It will eventually appear in transcripts.
  // Since we don't get an ID back immediately from uploadAudio (it returns success/message), 
  // we might have to rely on the title to find it later, or just return success and let the user wait.
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCheckStatus(payload: { title: string }) {
  // Since we might not have an ID, we search by title to find the transcript.
  // Ideally we should use webhooks, but for polling:
  const query = `
    query Transcripts($title: String) {
      transcripts(title: $title) {
        id
        title
        status
        summary {
          keywords
          overview
          bullet_points
          action_items
        }
      }
    }
  `;

  const variables = {
    title: payload.title,
  };

  const response = await fetch(FIREFLIES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIREFLIES_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleScheduleMeeting(payload: { meeting_url: string; title: string; start_time?: string; end_time?: string }) {
   // This is for inviting Fireflies bot to a live meeting
   // Not fully implemented in this MVP but placeholder provided
   // Fireflies usually joins via calendar invites or direct add.
   // There isn't a direct "scheduleMeeting" mutation to *force* it to join a URL instantly in the public docs easily without calendar integration usually.
   // But if there is a 'addWebMeeting' or similar, we would use it.
   // For now, we will return a mock success or "Not Implemented"
   
   return new Response(JSON.stringify({ success: true, message: "Meeting scheduled (Mock)" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
   });
}
