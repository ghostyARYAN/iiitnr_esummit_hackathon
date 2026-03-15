import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BookOpen, Mic, RefreshCw, Calendar } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Gist = Tables<"meeting_gists"> & { 
  applications?: { project_name: string };
  fireflies_status?: string;
  fireflies_transcript_id?: string;
  audio_url?: string;
};

export default function MomGists() {
  const [gists, setGists] = useState<Gist[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchGists = async () => {
    const { data } = await supabase.from("meeting_gists")
      .select("*, applications(project_name)")
      .order("created_at", { ascending: false });
    if (data) setGists(data as Gist[]);
  };

  useEffect(() => { fetchGists(); }, []);

  const handleSave = async (id: string) => {
    // Disabled
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, gistId: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    setUploadingId(gistId);
    toast.info("Uploading audio...");

    try {
      // 1. Upload to Storage
      const fileName = `${gistId}-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meeting-audio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('meeting-audio')
        .getPublicUrl(fileName);

      // 2. Call Edge Function to trigger Fireflies
      const { data: fnData, error: fnError } = await supabase.functions.invoke('fireflies-integration', {
        body: { 
          action: 'upload_audio', 
          payload: { 
            audio_url: publicUrl, 
            title: `Gist Meeting - ${gistId}` 
          } 
        }
      });

      if (fnError) throw fnError;

      // 3. Update DB
      const { error: dbError } = await supabase.from("meeting_gists")
        .update({ 
          audio_url: publicUrl, 
          fireflies_status: 'processing' // Optimistic update
        })
        .eq("id", gistId);
        
      if (dbError) throw dbError;

      toast.success("Audio uploaded. Fireflies.ai is processing it.");
      fetchGists();

    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  const handleCheckStatus = async (gist: Gist) => {
     toast.info("Checking status...");
     try {
       const { data, error } = await supabase.functions.invoke('fireflies-integration', {
         body: {
           action: 'check_status',
           payload: { title: `Gist Meeting - ${gist.id}` }
         }
       });

       if (error) throw error;
       
       console.log("Fireflies Status:", data);

       // Check if we found a transcript
       const transcripts = data?.data?.transcripts;
       if (transcripts && transcripts.length > 0) {
          const transcript = transcripts[0];
          
          if (transcript.status === 'processed' && transcript.summary) {
             const summaryText = `
**Overview:** ${transcript.summary.overview}

**Bullet Points:**
${(transcript.summary.bullet_points || []).map((bp: string) => `- ${bp}`).join('\n')}

**Action Items:**
${(transcript.summary.action_items || []).map((ai: string) => `- ${ai}`).join('\n')}
             `.trim();

             // 1. Insert into minutes_of_meeting table (Create Draft MoM)
             const { error: momError } = await supabase.from("minutes_of_meeting").insert({
                application_id: gist.application_id,
                gist_id: gist.id,
                content: summaryText,
                is_locked: false
             });

             if (momError) throw momError;

             // 2. Update Gist status
             await supabase.from("meeting_gists")
                .update({ 
                  fireflies_status: 'completed',
                  fireflies_transcript_id: transcript.id
                })
                .eq("id", gist.id);
                
             toast.success("MoM Draft successfully generated! Check 'Minutes of Meeting' section.");
             fetchGists();
          } else {
             toast.info(`Status: ${transcript.status || 'unknown'}`);
             // If status is changed but not completed, update it
             if (transcript.status && transcript.status !== gist.fireflies_status) {
                 await supabase.from("meeting_gists")
                   .update({ fireflies_status: transcript.status })
                   .eq("id", gist.id);
                 fetchGists();
             }
          }
       } else {
         toast.info("No transcript found yet. It might still be processing.");
       }

     } catch (error: any) {
       toast.error(`Failed to check status: ${error.message}`);
     }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Meeting Gists
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review and refine auto-generated meeting gists</p>
      </div>

      {gists.length === 0 && (
        <Card className="rounded-2xl border-border/40 shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">No meeting gists generated yet</p>
          </CardContent>
        </Card>
      )}

      {gists.map((g) => (
        <Card key={g.id} className="rounded-2xl border-border/40 shadow-sm border-l-4 border-l-primary/30">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <CardTitle className="text-base font-semibold">
                {(g as any).applications?.project_name || "Application Gist"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                 Offline Meeting? Upload Audio for MoM
              </p>
            </div>
            <div className="flex gap-2">
               {g.fireflies_status ? (
                 <div className="flex items-center gap-2">
                   <span className="text-xs bg-muted px-2 py-1 rounded-full uppercase font-bold text-muted-foreground">
                     AI: {g.fireflies_status}
                   </span>
                   {g.fireflies_status !== 'completed' && (
                      <Button variant="ghost" size="sm" onClick={() => handleCheckStatus(g)} title="Check Status">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                 </div>
               ) : (
                 <div className="relative">
                   <input
                     type="file"
                     accept="audio/*"
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     onChange={(e) => handleAudioUpload(e, g.id)}
                     disabled={!!uploadingId}
                   />
                   <Button variant="outline" size="sm" className="gap-2" disabled={!!uploadingId}>
                     <Mic className="h-4 w-4" /> 
                     {uploadingId === g.id ? "Uploading..." : "Upload Audio"}
                   </Button>
                 </div>
               )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
              <>
                <div className="whitespace-pre-wrap text-sm bg-muted/40 p-4 rounded-xl border border-border/30 h-64 overflow-y-auto">
                  {g.content}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {/* Schedule Online Meeting */}
                  <Button variant="outline" className="gap-2 flex-1" onClick={() => window.open('https://calendar.google.com', '_blank')}>
                    <Calendar className="h-4 w-4" />
                    Schedule Online (Invite Fireflies)
                  </Button>
                  
                  {/* Upload Audio (Offline) is handled in the header area now, but we can add a more prominent button here too if needed. 
                      Currently the upload button is in the card header. Let's keep it there for now or move it here?
                      The header one is clean. Let's keep it.
                  */}
                </div>
              </>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
