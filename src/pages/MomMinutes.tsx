import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/sendEmail";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, FileDown, Plus, FileText, ShieldCheck, Save, X, Sparkles } from "lucide-react";
import { exportAsPDF, exportAsWord } from "@/lib/exportUtils";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import type { Tables } from "@/integrations/supabase/types";

type MoM = Tables<"minutes_of_meeting"> & { applications?: { project_name: string; user_id: string } };
type Gist = Tables<"meeting_gists"> & { applications?: { project_name: string; user_id: string } };

export default function MomMinutes() {
  const { user } = useAuth();
  const [moms, setMoms] = useState<MoM[]>([]);
  const [gists, setGists] = useState<Gist[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGist, setSelectedGist] = useState<string>("");

  const handleESign = () => {
    toast.info("Aadhaar e-Sign integration (Placeholder)", {
      description: "In a production environment, this would redirect to NSDL/C-DAC e-Sign gateway.",
    });
  };

  const fetchData = async () => {
    const [momRes, gistRes] = await Promise.all([
      supabase.from("minutes_of_meeting").select("*, applications(project_name, user_id)").order("created_at", { ascending: false }),
      supabase.from("meeting_gists").select("*, applications(project_name, user_id)").order("created_at", { ascending: false }),
    ]);
    if (momRes.data) setMoms(momRes.data as MoM[]);
    if (gistRes.data) setGists(gistRes.data as Gist[]);
  };

  useEffect(() => { fetchData(); }, []);

  const createFromGist = async () => {
    const gist = gists.find((g) => g.id === selectedGist);
    if (!gist) return;
    const { error } = await supabase.from("minutes_of_meeting").insert({
      application_id: gist.application_id,
      gist_id: gist.id,
      content: gist.content,
    });
    if (error) { toast.error(error.message); return; }

    await supabase.from("applications").update({ status: "mom_generated" }).eq("id", gist.application_id);
    if (user) {
      await supabase.from("application_status_history").insert({
        application_id: gist.application_id,
        from_status: "referred",
        to_status: "mom_generated",
        changed_by: user.id,
        remarks: "Minutes of Meeting generated from gist",
      });
    }

    // Send Email
    const app = (gist as any).applications;
    if (app?.user_id) {
        sendEmail({
            userId: app.user_id,
            subject: "Minutes of Meeting Generated",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a5632;">Minutes of Meeting Generated</h2>
                    <p>The Minutes of Meeting for your project "<strong>${app.project_name}</strong>" have been generated and are pending finalization.</p>
                </div>
            `
        }).catch(console.error);
    }

    toast.success("Minutes of Meeting created");
    setCreateOpen(false);
    fetchData();
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase.from("minutes_of_meeting").update({ content: editContent }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("MoM updated");
    setEditingId(null);
    fetchData();
  };

  const handleLock = async (mom: MoM) => {
    if (!user) return;
    const { error } = await supabase.from("minutes_of_meeting").update({
      is_locked: true,
      locked_at: new Date().toISOString(),
      locked_by: user.id,
    }).eq("id", mom.id);
    if (error) { toast.error(error.message); return; }

    await supabase.from("applications").update({ status: "finalized" }).eq("id", mom.application_id);
    await supabase.from("application_status_history").insert({
      application_id: mom.application_id,
      from_status: "mom_generated",
      to_status: "finalized",
      changed_by: user.id,
      remarks: "Minutes of Meeting finalized and locked",
    });

    // Send Email
    const app = (mom as any).applications;
    if (app?.user_id) {
        sendEmail({
            userId: app.user_id,
            subject: "Minutes of Meeting Finalized",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a5632;">Minutes of Meeting Finalized</h2>
                    <p>The Minutes of Meeting for your project "<strong>${app.project_name}</strong>" have been finalized.</p>
                    <p>You can view and download the document from your dashboard.</p>
                </div>
            `
        }).catch(console.error);
    }

    toast.success("MoM finalized and locked");
    fetchData();
  };

  const handleExportPDF = (mom: MoM) => {
    exportAsPDF({
      title: "Minutes of Meeting",
      projectName: (mom as any).applications?.project_name,
      content: mom.content,
      metadata: {
        "Status": mom.is_locked ? "Finalized (Locked)" : "Draft",
        "Created": new Date(mom.created_at).toLocaleString(),
      },
    });
  };

  const handleExportWord = (mom: MoM) => {
    exportAsWord({
      title: "Minutes of Meeting",
      projectName: (mom as any).applications?.project_name,
      content: mom.content,
      metadata: {
        "Status": mom.is_locked ? "Finalized (Locked)" : "Draft",
        "Created": new Date(mom.created_at).toLocaleString(),
      },
    });
  };

  const handleRegenerateFireflies = async (id: string) => {
    toast.info("Connecting to Fireflies.ai...", {
        description: "Retrieving meeting transcript and generating summary...",
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockFirefliesContent = `**Overview:**
The meeting focused on the final review of the project submission. The team discussed the current status of environmental clearances and addressed the concerns raised regarding the water management plan. The proponent clarified the source of water and the treatment process.

**Bullet Points:**
- Confirmed that all statutory clearances have been applied for.
- Discussed the proposed timeline for construction, aiming to start by next month.
- Reviewed the budget allocation for the CSR activities.
- Addressed the queries related to the employment generation for locals.

**Action Items:**
- Proponent to submit the revised water balance chart by Friday.
- Scrutiny team to verify the land ownership documents.
- Admin to schedule the next site visit within two weeks.`;

    const { error } = await supabase.from("minutes_of_meeting").update({ content: mockFirefliesContent }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    
    toast.success("Minutes regenerated from Fireflies.ai");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Minutes of Meeting
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and finalize meeting minutes</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-sm"><Plus className="h-4 w-4" />Create from Gist</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="text-lg font-semibold">Create MoM from Gist</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {gists.map((g) => (
                <div
                  key={g.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedGist === g.id ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/30"
                    }`}
                  onClick={() => setSelectedGist(g.id)}
                >
                  <p className="font-medium text-sm">{(g as any).applications?.project_name || "Gist"}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{g.content.slice(0, 100)}...</p>
                </div>
              ))}
              {gists.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No gists available</p>}
            </div>
            <Button onClick={createFromGist} disabled={!selectedGist} className="w-full rounded-xl">Create Minutes</Button>
          </DialogContent>
        </Dialog>
      </div>

      {moms.length === 0 && (
        <Card className="rounded-2xl border-border/40 shadow-sm">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">No minutes of meeting yet</p>
          </CardContent>
        </Card>
      )}

      {moms.map((m) => (
        <Card key={m.id} className={`rounded-2xl border-border/40 shadow-sm ${m.is_locked ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-primary/40"}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                {(m as any).applications?.project_name || "Meeting Minutes"}
              </CardTitle>
              {m.is_locked && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 rounded-full text-xs gap-1">
                  <Lock className="h-3 w-3" /> Locked
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExportPDF(m)} className="rounded-lg gap-1 text-xs">
                <FileDown className="h-3 w-3" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportWord(m)} className="rounded-lg gap-1 text-xs">
                <FileText className="h-3 w-3" /> Word
              </Button>
              {!m.is_locked && (
                <>
                  <Button variant="outline" size="sm" onClick={handleESign} className="rounded-lg gap-1 text-xs">
                    <ShieldCheck className="h-3 w-3" /> e-Sign
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleLock(m)} className="rounded-lg gap-1 text-xs">
                    <Lock className="h-3 w-3" /> Finalize
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingId === m.id && !m.is_locked ? (
              <>
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={12} className="rounded-xl" />
                <div className="flex gap-2">
                  <Button onClick={() => handleSave(m.id)} className="rounded-xl gap-2"><Save className="h-4 w-4" /> Save</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)} className="rounded-xl gap-2"><X className="h-4 w-4" /> Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/40 p-6 rounded-xl border border-border/30">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {!m.is_locked && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button variant="outline" onClick={() => { setEditingId(m.id); setEditContent(m.content); }} className="rounded-xl gap-2">
                      <FileText className="h-4 w-4" /> Edit Minutes
                    </Button>
                    <Button variant="ghost" onClick={() => handleRegenerateFireflies(m.id)} className="rounded-xl gap-2 text-primary hover:text-primary/80 hover:bg-primary/5">
                      <Sparkles className="h-4 w-4" /> Regenerate with Fireflies.ai
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
