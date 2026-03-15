import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ShieldCheck, Leaf, MapPin, Calendar, Building2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicVerify() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) {
         setLoading(false);
         setError(true);
         return;
      }

      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*, sectors(name), profiles(full_name, organization)")
          .eq("id", id)
          .maybeSingle(); // Use maybeSingle to avoid error on 0 rows

        if (error) throw error;
        
        if (!data) {
          console.error("Application not found");
          setError(true);
        } else {
          setApp(data);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-none shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
             <Skeleton className="h-20 w-20 rounded-full mx-auto" />
             <Skeleton className="h-8 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-8 bg-card rounded-xl border p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-display font-bold">Invalid Certificate</h2>
            <p className="text-muted-foreground">The application ID provided could not be verified in the CECB database.</p>
            <Link to="/"><Badge variant="outline" className="cursor-pointer">Return Home</Badge></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFinalized = app.status === "finalized";
  const isRejected = app.status === "rejected";
  const isPending = !isFinalized && !isRejected;

  const getBorderColor = () => {
    if (isFinalized) return 'border-emerald-500/50';
    if (isRejected) return 'border-destructive/50';
    return 'border-amber-500/50';
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 py-12">
      <div className="flex items-center gap-2 mb-8">
        <Leaf className="h-8 w-8 text-primary" />
        <span className="font-display font-bold text-2xl text-primary">Parivesh 3.0</span>
      </div>

      <Card className={`w-full max-w-2xl border-2 ${getBorderColor()} shadow-lg`}>
        <CardHeader className="text-center border-b bg-card rounded-t-xl">
          <div className="flex justify-center mb-4">
            {isFinalized && <ShieldCheck className="h-20 w-20 text-emerald-500" />}
            {isRejected && <XCircle className="h-20 w-20 text-destructive" />}
            {isPending && <CheckCircle2 className="h-20 w-20 text-amber-500" />}
          </div>
          <CardTitle className="text-2xl font-display font-bold">
            {isFinalized ? "Clearance Certificate" : "Application Status"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {isFinalized ? "Official Environmental Clearance Verified" : "Verification of Application Processing Status"}
          </p>
        </CardHeader>

        <CardContent className="pt-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Project Name</Label>
              <div className="text-lg font-bold">{app.project_name}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Current Status</Label>
              <div><StatusBadge status={app.status} /></div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Sector</Label>
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {app.sectors?.name}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Location</Label>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {app.project_location}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Organization</Label>
              <div className="font-medium">{app.profiles?.organization || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Last Updated</Label>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {new Date(app.updated_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="bg-muted p-6 rounded-xl border-2 border-dashed border-muted-foreground/20 text-center">
            <div className="text-sm font-medium mb-2">Unique Certificate Hash</div>
            <div className="font-mono text-xs break-all bg-background p-2 rounded border">{app.id}</div>
          </div>

          <div className="text-center pt-4">
            <p className="text-[10px] text-muted-foreground italic">
              This is a computer-generated certificate. It is a valid proof of application status within the CECB PARIVESH 3.0 portal.
              For official records, please refer to the signed MoM documents.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Chhattisgarh Environment Conservation Board (CECB)
      </div>
    </div>
  );
}


