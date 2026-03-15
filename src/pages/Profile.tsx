import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Save, Mail, Building2, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setOrganization(profile.organization || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, organization, phone })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully");
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <User className="h-6 w-6 text-primary" /> My Profile
      </h1>

      {/* Profile Header Card */}
      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
        <CardContent className="relative pt-0 pb-6">
          <div className="-mt-12 flex items-end gap-4 mb-6">
            <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
              <AvatarImage src="" alt={profile?.full_name || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {profile?.full_name ? getInitials(profile.full_name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h2 className="text-lg font-bold">{profile?.full_name || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
              </Label>
              <Input value={user?.email || ""} disabled className="bg-muted/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
              </Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Organization
              </Label>
              <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company or organization" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="rounded-xl" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl gap-2 shadow-sm">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
