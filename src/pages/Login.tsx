import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Leaf, Mail } from "lucide-react";
import { TestUserLogin } from "@/components/TestUserLogin";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      navigate("/dashboard");
    }
  };

  const handleTestLogin = async (email: string, pass: string) => {
    setEmail(email);
    setPassword(pass);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      navigate("/dashboard");
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
          <span className="text-white font-bold text-lg tracking-tight">Pravesh 3.0</span>
        </div>

        {/* Testimonial */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <blockquote className="text-white/90 text-sm leading-relaxed italic">
            "Pravesh 3.0 is more than a clearance portal—it's a commitment to sustainable development.
            We bridge the gap between environmental compliance and the modern world, ensuring every
            project tells its story."
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
            <span className="text-foreground font-bold text-lg">Pravesh 3.0</span>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Enter your email and password to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Password"
                className="h-11 rounded-xl border-border bg-background text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(!!checked)}
                  className="rounded"
                />
                <Label htmlFor="remember" className="text-sm font-medium cursor-pointer">Remember me</Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold shadow-md" disabled={loading}>
              <Mail className="mr-2 h-4 w-4" />
              {loading ? "Signing in..." : "Sign in with Email"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground uppercase tracking-wider font-medium">Or continue with</span>
            </div>
          </div>

          {/* Contact Admin */}
          <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-medium border-border" asChild>
            <Link to="/register">Create an Account</Link>
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
      <TestUserLogin onLogin={handleTestLogin} />
    </div>
  );
};

export default Login;
