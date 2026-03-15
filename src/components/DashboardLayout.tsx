import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { LogOut, User, Bell, Search, HelpCircle, Command } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ChatBot } from "@/components/ChatBot";

const roleBadgeMap: Record<string, string> = {
  admin: "Admin",
  project_proponent: "Proponent",
  scrutiny_team: "Scrutiny",
  mom_team: "MoM Team",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, profile, user, signOut } = useAuth();
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPageTitle = () => {
    const last = pathSegments[pathSegments.length - 1];
    if (!last || last === "dashboard") return "Dashboard";
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="h-16 flex items-center border-b border-border bg-card px-6 gap-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />

          {/* Search Bar — center */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 pr-16 h-10 bg-muted/50 border-border/50 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground/70">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 text-[10px]">K</kbd>
                <Command className="h-2.5 w-2.5" />
              </div>
            </div>
          </div>

          <div className="flex-1 md:flex-none" />

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Link to="/dashboard/faq">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60">
                <HelpCircle className="h-[18px] w-[18px]" />
              </Button>
            </Link>

            <Link to="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-card" />
              </Button>
            </Link>

            <div className="h-6 w-px bg-border mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2.5 h-10 rounded-xl px-2 hover:bg-muted/60">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src="" alt={profile?.full_name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {profile?.full_name ? getInitials(profile.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-semibold text-foreground leading-tight">{profile?.full_name || "User"}</span>
                    <span className="text-[11px] text-muted-foreground leading-tight">{roleBadgeMap[role || ""] || "User"}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{profile?.full_name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="cursor-pointer rounded-lg">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer rounded-lg" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-background">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <ChatBot />
      </SidebarInset>
    </SidebarProvider>
  );
}
