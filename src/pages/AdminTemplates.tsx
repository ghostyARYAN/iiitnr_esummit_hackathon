import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, BookOpen, Pencil } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Template = Tables<"meeting_templates">;
type Sector = Tables<"sectors">;

export default function AdminTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [sectorId, setSectorId] = useState<string>("");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const fetchData = async () => {
    const [t, s] = await Promise.all([
      supabase.from("meeting_templates").select("*").order("name"),
      supabase.from("sectors").select("*").order("name"),
    ]);
    if (t.data) setTemplates(t.data);
    if (s.data) setSectors(s.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!user) return;
    
    if (editingTemplate) {
      const { error } = await supabase.from("meeting_templates").update({
        name,
        content,
        sector_id: sectorId && sectorId !== "all" ? sectorId : null,
      }).eq('id', editingTemplate.id);
      
      if (error) { toast.error(error.message); return; }
      toast.success("Template updated");
    } else {
      const { error } = await supabase.from("meeting_templates").insert({
        name,
        content,
        sector_id: sectorId && sectorId !== "all" ? sectorId : null,
        created_by: user.id,
      });
      
      if (error) { toast.error(error.message); return; }
      toast.success("Template created");
    }
    
    setOpen(false);
    setEditingTemplate(null);
    setName(""); setContent(""); setSectorId("");
    fetchData();
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setName(template.name);
    setContent(template.content);
    setSectorId(template.sector_id || "all");
    setOpen(true);
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setName("");
    setContent("");
    setSectorId("");
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Meeting Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage templates for meeting gists</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="rounded-xl gap-2 shadow-sm"><Plus className="h-4 w-4" />New Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {editingTemplate ? "Edit Meeting Gist Template" : "Create Meeting Gist Template"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Template Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard EIA Meeting Gist" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sector (optional)</Label>
                <Select value={sectorId} onValueChange={setSectorId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="All sectors" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Template Content</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder={"Use placeholders like {{project_name}}, {{sector}}, {{description}}..."} className="rounded-xl" />
              </div>
              <Button onClick={handleSave} className="w-full rounded-xl">
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold text-muted-foreground rounded-l-lg">Template Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Sector</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Created</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground rounded-r-lg w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/20 transition-colors border-b border-border/30">
                  <TableCell className="font-medium text-sm">{t.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground">
                      {sectors.find((s) => s.id === t.sector_id)?.name || "All"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                    <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                    No templates yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
