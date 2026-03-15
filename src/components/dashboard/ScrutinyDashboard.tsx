
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, CheckCircle, AlertTriangle, RotateCcw, ArrowRight, TrendingUp, CalendarDays, Search, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";

export default function ScrutinyDashboard() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    submitted: 0, under_scrutiny: 0, essential_document_sought: 0, completed: 0
  });
  const [pendingApps, setPendingApps] = useState<any[]>([]);

  useEffect(() => {
    const fetchScrutinyData = async () => {
      setLoading(true);
      // Fetch stats
      const { data: allApps } = await supabase
        .from("applications")
        .select("status");

      if (allApps) {
        const counts = allApps.reduce((acc, app) => {
          if (app.status === 'submitted') acc.submitted++;
          else if (app.status === 'under_scrutiny') acc.under_scrutiny++;
          else if (app.status === 'essential_document_sought') acc.essential_document_sought++;
          else if (['referred', 'mom_generated', 'finalized'].includes(app.status)) acc.completed++;
          return acc;
        }, { submitted: 0, under_scrutiny: 0, essential_document_sought: 0, completed: 0 });
        setStats(counts);
      }

      // Fetch pending applications (submitted or under_scrutiny)
      const { data: apps } = await supabase
        .from("applications")
        .select("id, project_name, status, sector_id, created_at, category")
        .in('status', ['submitted', 'under_scrutiny'])
        .order("created_at", { ascending: true }) // Oldest first for review queue
        .limit(10);

      if (apps) {
        setPendingApps(apps);
      }
      setLoading(false);
    };
    fetchScrutinyData();
  }, []);

  const cards = [
    {
      title: "Pending Review",
      value: stats.submitted,
      icon: FileText,
      trend: "New",
      trendUp: true,
      subText: "New submissions",
    },
    {
      title: "Under Scrutiny",
      value: stats.under_scrutiny,
      icon: RotateCcw,
      trend: "In Progress",
      trendUp: true,
      subText: "Currently being reviewed",
    },
    {
      title: "Docs Requested",
      value: stats.essential_document_sought,
      icon: AlertTriangle,
      trend: "Waiting",
      trendUp: false,
      subText: "Waiting for applicant",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      trend: "Processed",
      trendUp: true,
      subText: "Moved to next stage",
    },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("Scrutiny Overview")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("Review and process submitted applications")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl border-border/60">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{dateStr}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-border/40 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-10 w-20 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))
        ) : (
          cards.map((card) => (
            <Card key={card.title} className="rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{t(card.title)}</p>
                  <div className="p-2.5 rounded-xl bg-muted/60 group-hover:bg-primary/10 transition-colors">
                    <card.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold tracking-tight">{card.value.toLocaleString()}</span>
                  <span className="text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    {card.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{card.subText}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pending Reviews Table */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">{t("Applications Awaiting Review")}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("Search")}
                  className="pl-8 h-8 w-[160px] text-xs rounded-lg border-border/50"
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs border-border/50">
                <SlidersHorizontal className="h-3 w-3" /> {t("Sort by")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : pendingApps.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold text-muted-foreground rounded-l-lg">{t("Project Name")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Category")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Status")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right rounded-r-lg">{t("Submission Date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApps.map((app) => (
                    <TableRow
                      key={app.id}
                      className="group cursor-pointer hover:bg-muted/20 transition-colors duration-200 border-b border-border/30"
                      onClick={() => window.location.href = `/dashboard/applications/${app.id}`}
                    >
                      <TableCell className="font-medium text-sm group-hover:text-primary transition-colors py-4">{app.project_name || t("Unnamed Project")}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground">
                          {app.category || "—"}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={app.status} /></TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(app.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg" asChild>
                  <Link to="/dashboard/scrutiny">
                    {t("View All Queue")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500/30 mb-3" />
              <p className="font-medium">{t("All caught up! No pending reviews.")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
