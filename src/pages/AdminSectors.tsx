import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Sector = Tables<"sectors">;

export default function AdminSectors() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sector | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
  const [newDoc, setNewDoc] = useState("");

  const fetchSectors = async () => {
    const { data } = await supabase.from("sectors").select("*").order("name");
    if (data) setSectors(data);
  };

  useEffect(() => { fetchSectors(); }, []);

  const handleSave = async () => {
    const docs = requiredDocs.filter(Boolean).map((d) => d.trim());
    if (editing) {
      const { error } = await supabase.from("sectors")
        .update({ name, description, required_documents: docs })
        .eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Sector updated");
    } else {
      const { error } = await supabase.from("sectors")
        .insert({ name, description, required_documents: docs });
      if (error) { toast.error(error.message); return; }
      toast.success("Sector created");
    }
    setOpen(false);
    resetForm();
    fetchSectors();
  };

  const handleEdit = (s: Sector) => {
    setEditing(s);
    setName(s.name);
    setDescription(s.description || "");
    setRequiredDocs(Array.isArray(s.required_documents) ? (s.required_documents as string[]) : []);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sectors").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Sector deleted");
    fetchSectors();
  };

  const resetForm = () => { setEditing(null); setName(""); setDescription(""); setRequiredDocs([]); setNewDoc(""); };

  const addDoc = () => {
    if (!newDoc.trim()) return;
    setRequiredDocs([...requiredDocs, newDoc.trim()]);
    setNewDoc("");
  };

  const removeDoc = (index: number) => {
    setRequiredDocs(requiredDocs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> Sector Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure industry sectors and their requirements</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-sm"><Plus className="h-4 w-4" />Add Sector</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">{editing ? "Edit" : "New"} Sector</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sector Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mining" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" className="rounded-xl" />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Required Documents</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newDoc} 
                    onChange={(e) => setNewDoc(e.target.value)} 
                    placeholder="Add a document requirement" 
                    className="rounded-xl" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDoc();
                      }
                    }}
                  />
                  <Button onClick={addDoc} type="button" variant="outline" className="rounded-xl">Add</Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {requiredDocs.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border/50 text-sm">
                      <span>{doc}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeDoc(i)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {requiredDocs.length === 0 && (
                    <div className="text-center p-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No documents added yet
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full rounded-xl">{editing ? "Update" : "Create"} Sector</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold text-muted-foreground rounded-l-lg">Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Description</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Required Docs</TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-muted-foreground rounded-r-lg">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectors.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20 transition-colors border-b border-border/30">
                  <TableCell className="font-medium text-sm">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.description || "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground">
                      {Array.isArray(s.required_documents) ? (s.required_documents as string[]).length : 0} docs
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(s)} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sectors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                    <Settings className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                    No sectors configured yet
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
