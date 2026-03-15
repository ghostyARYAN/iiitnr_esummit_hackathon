import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Download, FileText, BarChart3, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format, subDays, startOfYear, isAfter, parseISO } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Tables<"applications">[]>([]);
  const [sectors, setSectors] = useState<Pick<Tables<"sectors">, "id" | "name">[]>([]);
  const [dateFilter, setDateFilter] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0
  });

  const [sectorData, setSectorData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; value: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [appsRes, sectorsRes] = await Promise.all([
      supabase.from("applications").select("*"),
      supabase.from("sectors").select("id, name"),
    ]);

    if (appsRes.data) setApplications(appsRes.data);
    if (sectorsRes.data) setSectors(sectorsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processData = useCallback(() => {
    let filteredApps = applications;

    // Apply date filter
    const now = new Date();
    if (dateFilter === "30_days") {
      const thirtyDaysAgo = subDays(now, 30);
      filteredApps = applications.filter(app => isAfter(parseISO(app.created_at), thirtyDaysAgo));
    } else if (dateFilter === "this_year") {
      const startOfCurrentYear = startOfYear(now);
      filteredApps = applications.filter(app => isAfter(parseISO(app.created_at), startOfCurrentYear));
    }

    // Create Sector Map
    const sectorMap = new Map(sectors.map(s => [s.id, s.name]));

    // Calculate Summary Stats
    const newStats = {
      total: filteredApps.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0
    };

    const statusCounts: Record<string, number> = {};
    const sectorCounts: Record<string, number> = {};
    const monthCounts: Record<string, number> = {};

    filteredApps.forEach(app => {
      // Summary Stats
      if (app.status === 'finalized') newStats.approved++;
      else if (app.status === 'draft') newStats.draft++;
      else newStats.pending++; // Assuming others are pending

      // Status Distribution
      const statusLabel = app.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
      statusCounts[statusLabel] = (statusCounts[statusLabel] || 0) + 1;

      // Sector Distribution
      const sectorName = sectorMap.get(app.sector_id) || "Unknown";
      sectorCounts[sectorName] = (sectorCounts[sectorName] || 0) + 1;

      // Monthly Trend
      const month = format(parseISO(app.created_at), "MMM yyyy");
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    setStats(newStats);

    // Format for Recharts
    setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
    setSectorData(Object.entries(sectorCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)); // Sort by count desc
    
    // Monthly data needs to be sorted chronologically
    setMonthlyData(Object.entries(monthCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    );
  }, [applications, dateFilter, sectors]);

  useEffect(() => {
    if (applications.length > 0) {
      processData();
    }
  }, [processData, applications.length]);

  const exportCSV = () => {
    // Create Sector Map
    const sectorMap = new Map(sectors.map(s => [s.id, s.name]));

    // Implement CSV export logic based on filteredApps
    const headers = ["ID", "Project Name", "Sector", "Status", "Created At"];
    const rows = applications.map(app => [
      app.id,
      `"${app.project_name}"`, // Quote to handle commas
      sectorMap.get(app.sector_id) || "Unknown",
      app.status,
      new Date(app.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "applications_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" /> Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive overview of application processing and statistics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="30_days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : stats.total}</div>
            <p className="text-xs text-muted-foreground">Across all sectors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved / Finalized</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : stats.approved}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : stats.draft}</div>
            <p className="text-xs text-muted-foreground">Not yet submitted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
            <CardDescription>Monthly submission volume</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current state of applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Breakdown</CardTitle>
          <CardDescription>Applications count by sector</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sector Name</TableHead>
                  <TableHead className="text-right">Application Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectorData.map((sector) => (
                  <TableRow key={sector.name}>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell className="text-right">{sector.value}</TableCell>
                    <TableCell className="text-right">
                      {((sector.value / stats.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
                {sectorData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      No data available for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
