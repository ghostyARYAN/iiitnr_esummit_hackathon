import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminReports from "./pages/AdminReports";
import Notifications from "./pages/Notifications";
import DashboardHome from "./pages/DashboardHome";
import AdminUsers from "./pages/AdminUsers";
import AdminSectors from "./pages/AdminSectors";
import AdminTemplates from "./pages/AdminTemplates";
import ApplicationsList from "./pages/ApplicationsList";
import NewApplication from "./pages/NewApplication";
import ApplicationDetail from "./pages/ApplicationDetail";
import ScrutinyReview from "./pages/ScrutinyReview";
import MomGists from "./pages/MomGists";
import MomMinutes from "./pages/MomMinutes";
import Profile from "./pages/Profile";
import PublicVerify from "./pages/PublicVerify";
import GistSubmission from "./pages/GistSubmission";
import FAQ from "./pages/FAQ";
import TestEmail from "./pages/TestEmail";

const queryClient = new QueryClient();

const DashboardRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: any[] }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardRoute><DashboardHome /></DashboardRoute>} />
            <Route path="/dashboard/test-email" element={<DashboardRoute><TestEmail /></DashboardRoute>} />
            <Route path="/dashboard/profile" element={<DashboardRoute><Profile /></DashboardRoute>} />
            <Route path="/dashboard/users" element={<DashboardRoute allowedRoles={["admin"]}><AdminUsers /></DashboardRoute>} />
            <Route path="/dashboard/sectors" element={<DashboardRoute allowedRoles={["admin"]}><AdminSectors /></DashboardRoute>} />
            <Route path="/dashboard/templates" element={<DashboardRoute allowedRoles={["admin"]}><AdminTemplates /></DashboardRoute>} />
            <Route path="/dashboard/applications" element={<DashboardRoute><ApplicationsList /></DashboardRoute>} />
            <Route path="/dashboard/applications/new" element={<DashboardRoute allowedRoles={["project_proponent"]}><NewApplication /></DashboardRoute>} />
            <Route path="/dashboard/applications/:id" element={<DashboardRoute><ApplicationDetail /></DashboardRoute>} />
            <Route path="/dashboard/review" element={<DashboardRoute allowedRoles={["scrutiny_team"]}><ScrutinyReview /></DashboardRoute>} />
            <Route path="/dashboard/gists" element={<DashboardRoute allowedRoles={["mom_team"]}><MomGists /></DashboardRoute>} />
            <Route path="/dashboard/mom" element={<DashboardRoute allowedRoles={["mom_team"]}><MomMinutes /></DashboardRoute>} />
            <Route path="/dashboard/reports" element={<DashboardRoute allowedRoles={["admin"]}><AdminReports /></DashboardRoute>} />
            <Route path="/dashboard/notifications" element={<DashboardRoute><Notifications /></DashboardRoute>} />
            <Route path="/dashboard/submit-gist" element={<DashboardRoute allowedRoles={["project_proponent"]}><GistSubmission /></DashboardRoute>} />
            <Route path="/dashboard/faq" element={<DashboardRoute><FAQ /></DashboardRoute>} />
            <Route path="/verify/:id" element={<PublicVerify />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;