
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ProponentDashboard from "@/components/dashboard/ProponentDashboard";
import ScrutinyDashboard from "@/components/dashboard/ScrutinyDashboard";
import MomDashboard from "@/components/dashboard/MomDashboard";

export default function DashboardHome() {
  const { role } = useAuth();

  if (role === "admin") {
    return <AdminDashboard />;
  }
  
  if (role === "project_proponent") {
    return <ProponentDashboard />;
  }

  if (role === "scrutiny_team") {
    return <ScrutinyDashboard />;
  }

  if (role === "mom_team") {
    return <MomDashboard />;
  }

  if (!role) {
    return (
      <div className="p-8 space-y-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Fallback for unknown roles or loading state
  return <AdminDashboard />;
}
