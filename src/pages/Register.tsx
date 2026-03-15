import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, UserPlus } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration successful! Check your email to confirm.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Logo overlay */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Parivesh 3.0</span>
        </div>

        {/* Testimonial */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <blockquote className="text-white/90 text-sm leading-relaxed italic">
            "Environmental clearance is a promise to the future. Parivesh 3.0 makes this process
            transparent, efficient, and accessible for every project proponent across Chhattisgarh."
          </blockquote>
          <div className="mt-3">
            <p className="text-white font-semibold text-sm">CECB Chhattisgarh</p>
            <p className="text-white/60 text-xs">Environmental Clearance Board</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-card">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-foreground font-bold text-lg">Parivesh 3.0</span>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground">Register as a Project Proponent</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Full name"
                className="h-11 rounded-xl border-border bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Organization (optional)"
                className="h-11 rounded-xl border-border bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="h-11 rounded-xl border-border bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password (min. 6 characters)"
                className="h-11 rounded-xl border-border bg-background text-sm"
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold shadow-md" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground uppercase tracking-wider font-medium">Or</span>
            </div>
          </div>

          {/* Already have account */}
          <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-medium border-border" asChild>
            <Link to="/login">Sign in to existing account</Link>
          </Button>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
