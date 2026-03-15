import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/sendEmail";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { ApplicationFilters, useApplicationFilters, applyFilters } from "@/components/ApplicationFilters";
import Pagination from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, FileText, Download, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Tables, Database } from "@/integrations/supabase/types";
import { Constants } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Application = Tables<"applications">;
type AppStatus = Database["public"]["Enums"]["application_status"];

export default function ApplicationsList() {
  const { role, user } = useAuth();
  const { t } = useTranslation();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters, setFilters } = useApplicationFilters();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const isAdmin = role === "admin" || role === "scrutiny_team";

  const fetchApps = async () => {
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (data) setApps(data);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, []);

  const filtered = applyFilters(apps, filters);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [filters]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((a) => a.id)));
    }
  };

  const handleBulkStatusChange = async () => {
    if (!user || !bulkStatus) return;
    setBulkLoading(true);

    for (const id of selected) {
      const app = apps.find((a) => a.id === id);
      if (!app) continue;
      await supabase.from("applications").update({ status: bulkStatus as AppStatus }).eq("id", id);
      
      // Send Email
      sendEmail({
        userId: app.user_id,
        subject: `Application Status Update: ${bulkStatus.replace(/_/g, " ")}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a5632;">Application Status Update</h2>
              <p>The status of your application "<strong>${app.project_name}</strong>" has been updated.</p>
              <p><strong>New Status:</strong> ${bulkStatus.replace(/_/g, " ").toUpperCase()}</p>
              <p>Please log in to your dashboard for more details.</p>
            </div>
        `
      }).catch(console.error);

      await supabase.from("application_status_history").insert({
        application_id: id,
        from_status: app.status,
        to_status: bulkStatus as AppStatus,
        changed_by: user.id,
        remarks: "Bulk status change",
      });
    }

    toast.success(`Updated ${selected.size} applications`);
    setSelected(new Set());
    setBulkStatus("");
    setShowBulkDialog(false);
    setBulkLoading(false);
    fetchApps();
  };

  const exportSelectedCSV = () => {
    const items = apps.filter((a) => selected.has(a.id));
    const rows = [
      ["Project Name", "Category", "Status", "Fee Paid", "Date"],
      ...items.map((a) => [a.project_name, a.category || "", a.status, a.fee_paid ? "Yes" : "No", new Date(a.created_at).toLocaleDateString()]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications_export.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {role === "project_proponent" ? t("My Applications") : t("All Applications")}
        </h1>
        {role === "project_proponent" && (
          <Link to="/dashboard/applications/new">
            <Button className="rounded-xl gap-2 shadow-sm"><Plus className="h-4 w-4" />{t("New Application")}</Button>
          </Link>
        )}
      </div>

      <ApplicationFilters filters={filters} onChange={setFilters} />

      {/* Bulk Actions Toolbar */}
      {isAdmin && selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/15 rounded-xl">
          <span className="text-sm font-semibold text-primary">{selected.size} {t("selected")}</span>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-[180px] h-8 rounded-lg text-xs">
              <SelectValue placeholder={t("Change status to...")} />
            </SelectTrigger>
            <SelectContent>
              {Constants.public.Enums.application_status.map((s) => (
                <SelectItem key={s} value={s}>{t(s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()))}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" disabled={!bulkStatus} onClick={() => setShowBulkDialog(true)} className="rounded-lg">
            <RefreshCw className="mr-1 h-3 w-3" /> {t("Apply")}
          </Button>
          <Button size="sm" variant="outline" onClick={exportSelectedCSV} className="rounded-lg">
            <Download className="mr-1 h-3 w-3" /> {t("Export CSV")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="rounded-lg">{t("Clear")}</Button>
        </div>
      )}

      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    {isAdmin && (
                      <TableHead className="w-[40px] rounded-l-lg">
                        <Checkbox
                          checked={paginated.length > 0 && selected.size === paginated.length}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                    )}
                    <TableHead className={`text-xs font-semibold text-muted-foreground ${!isAdmin ? 'rounded-l-lg' : ''}`}>{t("Project Name")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Category")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Status")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Fee Paid")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Date")}</TableHead>
                    <TableHead className="w-[80px] text-xs font-semibold text-muted-foreground rounded-r-lg">{t("View")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((app) => (
                    <TableRow key={app.id} className={`${selected.has(app.id) ? "bg-primary/5" : ""} hover:bg-muted/20 transition-colors border-b border-border/30`}>
                      {isAdmin && (
                        <TableCell>
                          <Checkbox checked={selected.has(app.id)} onCheckedChange={() => toggleSelect(app.id)} />
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-sm">{app.project_name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground">
                          {app.category || "—"}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={app.status} /></TableCell>
                      <TableCell>{app.fee_paid ? <span className="flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle className="h-4 w-4" /> {t("Paid")}</span> : <span className="text-muted-foreground text-sm">{t("Pending")}</span>}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Link to={`/dashboard/applications/${app.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"><Eye className="h-4 w-4" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-16">
                        <FileText className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground font-medium">{t("No applications found")}</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">{t("Try adjusting your filters")}</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Confirmation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("Confirm Bulk Status Change")}</DialogTitle>
            <DialogDescription>
              {t("You are about to change the status of")} {selected.size} {t("application(s) to")} "{bulkStatus.replace(/_/g, " ")}". {t("This action cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)} className="rounded-xl">{t("Cancel")}</Button>
            <Button onClick={handleBulkStatusChange} disabled={bulkLoading} className="rounded-xl">
              {bulkLoading ? t("Updating...") : t("Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
