import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/sendEmail";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Upload, Send, CreditCard, CheckCircle2, FileText, MapPin, ScrollText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Sector = Tables<"sectors">;

interface AffidavitPoint {
  id: string;
  category: string;
  point_text: string;
}

function LocationMarker({ position, setPosition, setLocation }: { position: [number, number] | null, setPosition: any, setLocation: any }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      setLocation(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

// Map sector names to affidavit categories
const sectorToAffidavitCategory: Record<string, string> = {
  "Sand": "Sand",
  "Limestone": "Stones",
  "Bricks": "Bricks",
  "Infrastructure": "General",
  "Industry": "General",
};

export default function NewApplication() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [step, setStep] = useState(1);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorId, setSectorId] = useState("");
  const [category, setCategory] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Affidavit state
  const [affidavitPoints, setAffidavitPoints] = useState<AffidavitPoint[]>([]);
  const [acceptedAffidavits, setAcceptedAffidavits] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("sectors").select("*").order("name").then(({ data }) => {
      if (data) setSectors(data);
    });
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Fetch affidavit points when sector changes
  useEffect(() => {
    if (!sectorId) return;
    const sectorName = sectors.find(s => s.id === sectorId)?.name || "";
    const affidavitCat = sectorToAffidavitCategory[sectorName] || "General";

    supabase.from("affidavit_points")
      .select("*")
      .in("category", [affidavitCat, "General"])
      .order("category")
      .then(({ data }) => {
        if (data) setAffidavitPoints(data as AffidavitPoint[]);
      });
    setAcceptedAffidavits(new Set());
  }, [sectorId, sectors]);

  const selectedSector = sectors.find((s) => s.id === sectorId);
  const requiredDocs = Array.isArray(selectedSector?.required_documents)
    ? (selectedSector.required_documents as string[])
    : [];
  const feeAmount = (selectedSector?.parameters as any)?.fee_amount || 5000;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const toggleAffidavit = (id: string) => {
    setAcceptedAffidavits(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allAffidavitsAccepted = affidavitPoints.length === 0 || acceptedAffidavits.size === affidavitPoints.length;

  const handleSaveDraft = async () => {
    if (!user || !sectorId || !projectName) {
      toast.error("Please fill required fields");
      return;
    }
    if (!allAffidavitsAccepted) {
      toast.error("Please accept all affidavit points before proceeding");
      return;
    }
    setSaving(true);
    const { data: app, error } = await supabase.from("applications").insert({
      user_id: user.id,
      sector_id: sectorId,
      category,
      project_name: projectName,
      project_description: projectDescription,
      project_location: projectLocation,
      status: "draft",
      fee_amount: feeAmount,
      fee_paid: false,
      form_data: {
        accepted_affidavits: Array.from(acceptedAffidavits),
      },
    }).select().single();

    if (error || !app) {
      toast.error(error?.message || "Failed to save");
      setSaving(false);
      return;
    }

    // Upload files
    for (const file of files) {
      const filePath = `${user.id}/${app.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from("application-documents").upload(filePath, file);
      if (!uploadError) {
        await supabase.from("application_documents").insert({
          application_id: app.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        });
      }
    }

    setApplicationId(app.id);
    setSaving(false);
    toast.success("Draft saved");
    setStep(5);
  };

  const handlePayment = useCallback(async () => {
    if (!applicationId || !session?.access_token) return;
    setPaymentLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { application_id: applicationId, amount: feeAmount },
      });

      if (error || !data?.order_id) {
        toast.error("Failed to create payment order");
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: "INR",
        name: "Parivesh 3.0",
        description: `Fee for ${projectName}`,
        order_id: data.order_id,
        handler: async (response: any) => {
          const { error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });

          if (verifyError) {
            toast.error("Payment verification failed");
          } else {
            setPaymentDone(true);
            toast.success("Payment successful!");
          }
          setPaymentLoading(false);
        },
        prefill: {
          email: user?.email || "",
        },
        theme: { color: "#1a5632" },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
      setPaymentLoading(false);
    }
  }, [applicationId, session, feeAmount, projectName, user]);

  const handleFinalSubmit = async () => {
    if (!applicationId || !user) return;
    setSaving(true);
    const { error: updateError } = await supabase.from("applications").update({
      status: "submitted",
      fee_paid: true
    }).eq("id", applicationId);
    if (updateError) {
      toast.error("Failed to submit: " + updateError.message);
      setSaving(false);
      return;
    }
    await supabase.from("application_status_history").insert({
      application_id: applicationId,
      to_status: "submitted",
      changed_by: user.id,
      remarks: "Application submitted with fee payment",
    });

    // Send confirmation email
    sendEmail({
      to: user.email,
      subject: "Application Submitted Successfully",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5632;">Application Submitted</h1>
          <p>Dear ${user.user_metadata?.full_name || "User"},</p>
          <p>Your application "<strong>${projectName}</strong>" has been submitted successfully.</p>
          <p><strong>Reference ID:</strong> ${applicationId}</p>
          <p>Our team will review your application and notify you of the next steps.</p>
          <p>Thank you.</p>
        </div>
      `,
    }).catch(console.error);

    setSaving(false);
    toast.success("Application submitted successfully!");
    navigate("/dashboard/applications");
  };

  const stepLabels = ["Category & Sector", "Project Details", "Documents", "Affidavits", "Payment"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-display font-bold">New Application</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{s}</div>
            {s < 5 && <div className={`w-10 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{stepLabels[step - 1]}</span>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="font-display">Select Category & Sector</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Application Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Project</SelectItem>
                  <SelectItem value="expansion">Expansion</SelectItem>
                  <SelectItem value="modernization">Modernization</SelectItem>
                  <SelectItem value="change_in_product">Change in Product Mix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Industry Sector</Label>
              <Select value={sectorId} onValueChange={setSectorId}>
                <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {requiredDocs.length > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Required Documents for this sector ({requiredDocs.length}):</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-inside">
                  {requiredDocs.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-xs bg-primary/10 text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedSector && (
              <div className="p-3 bg-accent/50 rounded-md">
                <p className="text-sm"><strong>Application Fee:</strong> ₹{feeAmount.toLocaleString()}</p>
              </div>
            )}
            <Button onClick={() => setStep(2)} disabled={!sectorId || !category} className="w-full">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="font-display">Project Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Name of the project" />
            </div>
            <div className="space-y-2">
              <Label>Project Description</Label>
              <Textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} rows={4} placeholder="Describe the project..." />
            </div>
            <div className="space-y-2">
              <Label>Project Location (Tap on map or type address)</Label>
              <div className="h-[250px] w-full rounded-md overflow-hidden border border-border mb-2">
                <MapContainer center={[21.2514, 81.6296]} zoom={11} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} setLocation={setProjectLocation} />
                </MapContainer>
              </div>
              <Input value={projectLocation} onChange={(e) => setProjectLocation(e.target.value)} placeholder="District, State or GPS coordinates" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!projectName} className="flex-1">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="font-display">Upload Documents</CardTitle></CardHeader>
          <CardContent className="space-y-4">
                        {/* Required documents checklist */}
            {requiredDocs.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Required Documents Checklist
                </p>
                <div className="space-y-2">
                  {requiredDocs.map((d, i) => {
                    const uploadedFile = files.find(f => f.name.toLowerCase().includes(d.toLowerCase().split(" ")[0].toLowerCase()));
                    const isUploaded = !!uploadedFile;
                    
                    return (
                      <div key={i} className={cn("flex items-center justify-between p-3 rounded-lg border transition-colors", isUploaded ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border")}>
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                          {isUploaded ? 
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> : 
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          }
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{d}</span>
                            {isUploaded && (
                               <span className="text-xs text-muted-foreground truncate" title={uploadedFile?.name}>
                                 {uploadedFile?.name} ({(uploadedFile?.size / 1024).toFixed(0)} KB)
                               </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.kml"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const originalFile = e.target.files[0];
                                  // Create a new file with a name that includes the document requirement prefix
                                  // This ensures the file is correctly associated with the requirement in the UI
                                  const prefix = d.split(" ")[0];
                                  const newName = `${prefix}_${originalFile.name}`;
                                  const newFile = new File([originalFile], newName, { type: originalFile.type });
                                  
                                  const otherFiles = files.filter(f => !f.name.toLowerCase().includes(d.toLowerCase().split(" ")[0].toLowerCase()));
                                  setFiles([...otherFiles, newFile]);
                                }
                              }}
                            />
                            <Button variant={isUploaded ? "outline" : "secondary"} size="sm" className="pointer-events-none h-8 text-xs">
                              {isUploaded ? "Change" : "Upload"}
                            </Button>
                          </div>
                          
                          {isUploaded && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setFiles(files.filter(f => f !== uploadedFile));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mt-6">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Drag and drop additional files here</p>
              <p className="text-xs text-muted-foreground mb-4">Support for PDF, DOC, Images & KML</p>
              <div className="relative inline-block">
                <Input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.kml" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Button variant="outline">Select Files</Button>
              </div>
            </div>
            {files.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">{files.length} file(s) selected:</p>
                {files.map((f, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span><FileText className="inline h-4 w-4 mr-1" />{f.name}</span>
                    <span className="text-xs">({(f.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Next: Affidavits <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ScrollText className="h-5 w-5" /> Notarized Affidavit Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review and accept all the following affidavit points applicable to your project.
              These will be included in your notarized affidavit submission.
            </p>

            {affidavitPoints.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No specific affidavit points for this sector.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {affidavitPoints.map((point, i) => (
                  <div
                    key={point.id}
                    className={`flex items-start gap-3 p-3 rounded-md border transition-colors cursor-pointer ${acceptedAffidavits.has(point.id)
                        ? "border-primary/30 bg-primary/5"
                        : "border-border hover:border-primary/20"
                      }`}
                    onClick={() => toggleAffidavit(point.id)}
                  >
                    <Checkbox
                      checked={acceptedAffidavits.has(point.id)}
                      onCheckedChange={() => toggleAffidavit(point.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm">{point.point_text}</p>
                      {point.category !== "General" && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 inline-block">
                          {point.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${allAffidavitsAccepted ? "text-primary" : "text-muted-foreground"}`}>
                {acceptedAffidavits.size} / {affidavitPoints.length} accepted
              </span>
              {affidavitPoints.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (allAffidavitsAccepted) {
                      setAcceptedAffidavits(new Set());
                    } else {
                      setAcceptedAffidavits(new Set(affidavitPoints.map(p => p.id)));
                    }
                  }}
                >
                  {allAffidavitsAccepted ? "Uncheck All" : "Accept All"}
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSaveDraft} disabled={saving || !allAffidavitsAccepted} className="flex-1">
                {saving ? "Saving..." : "Save & Proceed to Payment"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader><CardTitle className="font-display">Fee Payment</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-primary">₹{feeAmount.toLocaleString()}</div>
              <p className="text-muted-foreground">Application processing fee</p>
            </div>

            {paymentDone ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
                <p className="text-lg font-medium text-green-700">Payment Successful!</p>
                <Button onClick={handleFinalSubmit} disabled={saving} className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Submit Application
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button onClick={handlePayment} disabled={paymentLoading} className="w-full" size="lg">
                  <CreditCard className="mr-2 h-5 w-5" />
                  {paymentLoading ? "Processing..." : "Pay with Razorpay (UPI / Card / NetBanking)"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Supports UPI, QR Code, Credit/Debit Cards, Net Banking
                </p>
                <Button variant="outline" onClick={() => { navigate("/dashboard/applications"); }} className="w-full">
                  Pay Later (Save as Draft)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

