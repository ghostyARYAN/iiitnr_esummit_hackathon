
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, Clock, RotateCcw, DollarSign, Plus, ArrowRight, TrendingUp, TrendingDown, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";

export default function ProponentDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, draft: 0, submitted: 0, under_scrutiny: 0,
    essential_document_sought: 0, referred: 0, mom_generated: 0, finalized: 0,
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyApps = async () => {
      if (!user) return;
      
      setLoading(true);
      // RLS should handle filtering, but we can also filter by user_id explicitly if needed
      const { data: apps } = await supabase
        .from("applications")
        .select("id, project_name, status, sector_id, created_at, category")
        .order("created_at", { ascending: false });

      if (apps) {
        setRecentApps(apps.slice(0, 5));

        const counts = apps.reduce((acc, app) => {
          acc.total++;
          acc[app.status as keyof typeof acc] = (acc[app.status as keyof typeof acc] || 0) + 1;
          return acc;
        }, { total: 0, draft: 0, submitted: 0, under_scrutiny: 0, essential_document_sought: 0, referred: 0, mom_generated: 0, finalized: 0 });
        setStats(counts);
      }
      setLoading(false);
    };
    fetchMyApps();
  }, [user]);

  const cards = [
    {
      title: "My Applications",
      value: stats.total,
      icon: FileText,
      trend: "Total",
      trendUp: true,
      subText: "All time",
    },
    {
      title: "Submitted",
      value: stats.submitted,
      icon: Clock,
      trend: "Pending",
      trendUp: true,
      subText: "Awaiting review",
    },
    {
      title: "Action Required",
      value: stats.essential_document_sought,
      icon: RotateCcw,
      trend: "Urgent",
      trendUp: false,
      subText: "Documents needed",
    },
    {
      title: "Approved",
      value: stats.finalized, // Assuming finalized means approved/completed
      icon: DollarSign,
      trend: "Completed",
      trendUp: true,
      subText: "Process finished",
    },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("Application Overview")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("Manage and track your project applications")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/applications/new">
            <Button className="gap-2 rounded-xl shadow-sm bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" /> {t("New Application")}
            </Button>
          </Link>
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
                  <span className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${card.trend === "Urgent"
                      ? "bg-red-50 text-red-500"
                      : "bg-emerald-50 text-emerald-600"
                    }`}>
                    {card.trend === "Urgent" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {card.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{card.subText}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Applications Table */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">{t("My Recent Applications")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : recentApps.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold text-muted-foreground rounded-l-lg">{t("Project Name")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Category")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">{t("Status")}</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right rounded-r-lg">{t("Date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApps.map((app) => (
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
                  <Link to="/dashboard/applications">
                    {t("View All")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="font-medium">{t("No applications found.")}</p>
              <Link to="/dashboard/applications/new">
                <Button className="mt-4" variant="outline">{t("Start your first application")}</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
