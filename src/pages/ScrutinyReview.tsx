import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { ApplicationFilters, useApplicationFilters, applyFilters } from "@/components/ApplicationFilters";
import Pagination from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, FileSearch } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Application = Tables<"applications">;

export default function ScrutinyReview() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters, setFilters } = useApplicationFilters();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    supabase.from("applications")
      .select("*")
      .in("status", ["submitted", "under_scrutiny", "essential_document_sought"])
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setApps(data); setLoading(false); });
  }, []);

  const filtered = applyFilters(apps, filters);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-primary" /> Review Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Applications pending scrutiny and verification</p>
      </div>

      <ApplicationFilters filters={filters} onChange={setFilters} />

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
                    <TableHead className="text-xs font-semibold text-muted-foreground rounded-l-lg">Project Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Submitted</TableHead>
                    <TableHead className="w-[80px] text-xs font-semibold text-muted-foreground rounded-r-lg">Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/20 transition-colors border-b border-border/30">
                      <TableCell className="font-medium text-sm">{app.project_name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground">
                          {app.category || "—"}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={app.status} /></TableCell>
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
                      <TableCell colSpan={5} className="text-center py-16">
                        <FileSearch className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground font-medium">No applications in queue</p>
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
    </div>
  );
}
