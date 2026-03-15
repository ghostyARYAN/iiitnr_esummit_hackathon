import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  full_name: string;
  organization: string | null;
  role: AppRole;
  role_id: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, organization");
    const { data: roles } = await supabase.from("user_roles").select("id, user_id, role");

    if (profiles && roles) {
      const merged = profiles.map((p) => {
        const userRole = roles.find((r) => r.user_id === p.user_id);
        return {
          user_id: p.user_id,
          full_name: p.full_name,
          organization: p.organization,
          role: userRole?.role || ("project_proponent" as AppRole),
          role_id: userRole?.id || "",
        };
      });
      setUsers(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId: string, roleId: string, newRole: AppRole) => {
    if (roleId) {
      const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("id", roleId);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Role updated");
    fetchUsers();
  };

  const roleBadgeConfig: Record<AppRole, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-red-50 text-red-600 border-red-100" },
    project_proponent: { label: "Proponent", className: "bg-primary/10 text-primary border-primary/20" },
    scrutiny_team: { label: "Scrutiny", className: "bg-amber-50 text-amber-600 border-amber-100" },
    mom_team: { label: "MoM Team", className: "bg-blue-50 text-blue-600 border-blue-100" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Users & Role Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user roles and permissions</p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            All Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-semibold text-muted-foreground rounded-l-lg">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Organization</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Current Role</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground rounded-r-lg">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const badge = roleBadgeConfig[u.role];
                  return (
                    <TableRow key={u.user_id} className="hover:bg-muted/20 transition-colors border-b border-border/30">
                      <TableCell className="font-medium text-sm">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{u.organization || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${badge.className}`}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(val) => updateRole(u.user_id, u.role_id, val as AppRole)}
                        >
                          <SelectTrigger className="w-[180px] h-8 rounded-lg text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="project_proponent">Project Proponent</SelectItem>
                            <SelectItem value="scrutiny_team">Scrutiny Team</SelectItem>
                            <SelectItem value="mom_team">MoM Team</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
