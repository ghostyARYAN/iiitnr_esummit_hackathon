import {
  LayoutDashboard, FileText, Users, Settings, ClipboardList,
  FileSearch, BookOpen, Leaf, LogOut, User, Bell, BarChart3,
  Languages,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Menu items organized into groups
const adminMenuGroup = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "All Applications", url: "/dashboard/applications", icon: FileText },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

const adminManageGroup = [
  { title: "Users & Roles", url: "/dashboard/users", icon: Users },
  { title: "Sectors", url: "/dashboard/sectors", icon: Settings },
  { title: "Templates", url: "/dashboard/templates", icon: BookOpen },
];

const proponentMenuGroup = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Applications", url: "/dashboard/applications", icon: FileText },
  { title: "New Application", url: "/dashboard/applications/new", icon: ClipboardList },
  { title: "Submit Gist", url: "/dashboard/submit-gist", icon: BookOpen },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "My Profile", url: "/dashboard/profile", icon: User },
];

const scrutinyMenuGroup = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Review Queue", url: "/dashboard/review", icon: FileSearch },
  { title: "All Applications", url: "/dashboard/applications", icon: FileText },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

const momMenuGroup = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meeting Gists", url: "/dashboard/gists", icon: BookOpen },
  { title: "Minutes of Meeting", url: "/dashboard/mom", icon: FileText },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

const roleLabelMap: Record<string, string> = {
  admin: "Admin Panel",
  project_proponent: "Proponent Portal",
  scrutiny_team: "Scrutiny Team",
  mom_team: "MoM Team",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, signOut, profile, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
  };

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }: any) => {
        if (count !== null) setUnreadCount(count);
      });
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get menu groups based on role
  const getMenuGroups = () => {
    if (role === "admin") {
      return [
        { label: "Menu", items: adminMenuGroup },
        { label: "Management", items: adminManageGroup },
      ];
    }
    if (role === "project_proponent") {
      return [{ label: "Menu", items: proponentMenuGroup }];
    }
    if (role === "scrutiny_team") {
      return [{ label: "Menu", items: scrutinyMenuGroup }];
    }
    if (role === "mom_team") {
      return [{ label: "Menu", items: momMenuGroup }];
    }
    return [{ label: "Menu", items: proponentMenuGroup }];
  };

  const menuGroups = getMenuGroups();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo */}
        <SidebarGroup>
          <div className="flex items-center gap-3 px-3 py-5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-foreground text-lg tracking-tight">Parivesh 3.0</span>
            )}
          </div>
        </SidebarGroup>

        {/* Menu Groups */}
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground/70 px-3 mb-1">
              {!collapsed ? t(group.label) : ""}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className="group/nav flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="!bg-primary !text-primary-foreground shadow-sm font-semibold"
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && (
                          <span className="flex items-center gap-2 flex-1">
                            {t(item.title)}
                            {item.title === "Notifications" && unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 group-[.\\!bg-primary]/nav:bg-white group-[.\\!bg-primary]/nav:text-primary">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* General Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground/70 px-3 mb-1">
            {!collapsed ? "General" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={toggleLanguage}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Languages className="h-[18px] w-[18px]" />
                  {!collapsed && <span>{i18n.language === "en" ? "हिन्दी" : "English"}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* User section */}
        {!collapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src="" alt={profile.full_name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {profile.full_name ? getInitials(profile.full_name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || "User"}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {roleLabelMap[role || ""] || "User"}
              </p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive/70 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-[18px] w-[18px]" />
              {!collapsed && <span>Log out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}