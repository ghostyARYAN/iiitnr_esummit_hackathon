
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, Users, CheckCircle, Clock, AlertTriangle,
  BookOpen, Plus, ArrowRight, TrendingUp, TrendingDown, History,
  LayoutGrid, BarChart3, List, FileSearch, Bell, ShoppingCart,
  DollarSign, RotateCcw, Search, SlidersHorizontal, CalendarDays
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHART_COLORS = [
  "hsl(14, 90%, 58%)",
  "hsl(14, 85%, 65%)",
  "hsl(14, 80%, 72%)",
  "hsl(14, 75%, 48%)",
  "hsl(25, 85%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(152, 55%, 38%)",
];

export default function AdminDashboard() {
  const { t } = useTranslation();

  const chartConfig: ChartConfig = {
    count: {
      label: t("Applications"),
      color: "hsl(14, 90%, 58%)",
    },
    draft: { label: t("Draft"), color: "hsl(220, 10%, 70%)" },
    submitted: { label: t("Submitted"), color: "hsl(210, 80%, 50%)" },
    under_scrutiny: { label: t("Scrutiny"), color: "hsl(38, 92%, 50%)" },
    essential_document_sought: { label: t("EDS"), color: "hsl(0, 72%, 51%)" },
    referred: { label: t("Referred"), color: "hsl(14, 90%, 58%)" },
    mom_generated: { label: t("MoM"), color: "hsl(25, 85%, 55%)" },
    finalized: { label: t("Finalized"), color: "hsl(152, 55%, 38%)" },
  };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, draft: 0, submitted: 0, under_scrutiny: 0,
    essential_document_sought: 0, referred: 0, mom_generated: 0, finalized: 0,
  });
  const [timeData, setTimeData] = useState<{ date: string; count: number }[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
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

        const now = new Date();
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayMap: Record<string, { date: string; label: string; count: number }> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          dayMap[key] = { date: key, label: dayNames[d.getDay()], count: 0 };
        }
        apps.forEach((a) => {
          if (!a.created_at) return;
          const day = a.created_at.slice(0, 10);
          if (day in dayMap) dayMap[day].count++;
        });
        setTimeData(Object.values(dayMap).map((d) => ({
          date: d.label,
          count: d.count,
        })));
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const cards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: FileText,
      trend: "+4.9%",
      trendUp: true,
      subText: `Last month: ${Math.max(0, stats.total - 3)}`,
    },
    {
      title: "Submitted",
      value: stats.submitted,
      icon: Clock,
      trend: "+7.5%",
      trendUp: true,
      subText: `Last month: ${Math.max(0, stats.submitted - 1)}`,
    },
    {
      title: "Under Review",
      value: stats.under_scrutiny + stats.essential_document_sought,
      icon: RotateCcw,
      trend: "-6.0%",
      trendUp: false,
      subText: `Last month: ${Math.max(0, stats.under_scrutiny + stats.essential_document_sought + 2)}`,
    },
    {
      title: "Finalized",
      value: stats.finalized,
      icon: DollarSign,
      trend: "+3.2%",
      trendUp: true,
      subText: `Last month: ${Math.max(0, stats.finalized - 1)}`,
    },
  ];

  const pieData = [
    { name: "Draft", value: stats.draft, fill: "hsl(220, 10%, 70%)" },
    { name: "Submitted", value: stats.submitted, fill: "hsl(210, 80%, 50%)" },
    { name: "Scrutiny", value: stats.under_scrutiny, fill: "hsl(38, 92%, 50%)" },
    { name: "EDS", value: stats.essential_document_sought, fill: "hsl(0, 72%, 51%)" },
    { name: "Referred", value: stats.referred, fill: "hsl(14, 90%, 58%)" },
    { name: "MoM", value: stats.mom_generated, fill: "hsl(25, 85%, 55%)" },
    { name: "Finalized", value: stats.finalized, fill: "hsl(152, 55%, 38%)" },
  ].filter((d) => d.value > 0);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("Admin Overview")}
          </h1>
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
                  <span className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${card.trendUp
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                    }`}>
                    {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {card.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{card.subText}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 rounded-2xl border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{t("Application Analytics")}</CardTitle>
              <Select defaultValue="week">
                <SelectTrigger className="w-[120px] h-8 rounded-lg text-xs border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t("This Week")}</SelectItem>
                  <SelectItem value="month">{t("This Month")}</SelectItem>
                  <SelectItem value="quarter">{t("This Quarter")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={timeData} barCategoryGap="25%">
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(14, 90%, 58%)"
                  radius={[8, 8, 8, 8]}
                  maxBarSize={45}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("Status Distribution")}</CardTitle>
            <CardDescription className="text-xs">{t("Current state of all applications")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={8}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-muted-foreground">{t(value)}</span>}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">{t("Recent Applications")}</CardTitle>
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
              <p className="font-medium">{t("No recent applications found.")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
