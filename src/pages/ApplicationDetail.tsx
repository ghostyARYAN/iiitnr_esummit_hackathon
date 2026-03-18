import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/sendEmail";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Download, CheckCircle2, AlertTriangle, FileDown, Upload, Send, CreditCard, FileText } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import StatusTimeline from "@/components/StatusTimeline";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { exportAsPDF, exportAsWord } from "@/lib/exportUtils";
import { useTranslation } from "react-i18next";

type AppStatus = "draft" | "submitted" | "under_scrutiny" | "essential_document_sought" | "referred" | "mom_generated" | "finalized";

interface AppDoc {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  verified: boolean;
}

interface AppHistory {
  id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  remarks: string;
  created_at: string;
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const [app, setApp] = useState<any>(null);
  const [documents, setDocuments] = useState<AppDoc[]>([]);
  const [history, setHistory] = useState<AppHistory[]>([]);
  const [remarks, setRemarks] = useState("");
  const [edsFiles, setEdsFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [sectorName, setSectorName] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showEdsPanel, setShowEdsPanel] = useState(false);
  const [edsPoints, setEdsPoints] = useState<any[]>([]);
  const [selectedEdsPoints, setSelectedEdsPoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch EDS points
    supabase.from("eds_deficiency_points").select("*").order("point_text").then(({ data }) => {
      if (data) setEdsPoints(data);
    });
  }, []);

  const handlePayNow = async () => {
    if (!app || !user) return;
    setPaymentLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { 
          application_id: app.id,
          amount: app.fee_amount || 5000, 
          currency: "INR" 
        },
      });
      if (orderError) throw orderError;

      const options = {
        key: "rzp_test_YOUR_KEY_HERE", // Replace with actual key in production env var
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Parivesh 3.0",
        description: `Application Fee for ${app.project_name}`,
        order_id: orderData.id,
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
            await supabase.from("applications").update({ status: "submitted", fee_paid: true }).eq("id", app.id);
            await supabase.from("application_status_history").insert({
              application_id: app.id,
              from_status: app.status,
              to_status: "submitted",
              changed_by: user.id,
              remarks: "Payment completed and application submitted",
            });
            toast.success("Payment successful! Application submitted.");
            fetchAll();
          }
          setPaymentLoading(false);
        },
        prefill: { email: user.email || "" },
        theme: { color: "#1a5632" },
        modal: { ondismiss: () => setPaymentLoading(false) },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
      setPaymentLoading(false);
    }
  };

  const fetchAll = async () => {
    if (!id) return;
    const [appRes, histRes, docRes] = await Promise.all([
      supabase.from("applications").select("*").eq("id", id).single(),
      supabase.from("application_status_history").select("*").eq("application_id", id).order("created_at", { ascending: false }),
      supabase.from("application_documents").select("*").eq("application_id", id).order("uploaded_at", { ascending: false }),
    ]);
    if (appRes.data) {
      setApp(appRes.data);
      const { data: sector } = await supabase.from("sectors").select("name").eq("id", appRes.data.sector_id).single();
      if (sector) setSectorName(sector.name);
    }
    if (histRes.data) {
      setHistory(histRes.data);
      const userIds = [...new Set(histRes.data.map((h) => h.changed_by))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
        if (profiles) {
          const map: Record<string, string> = {};
          profiles.forEach((p) => { map[p.user_id] = p.full_name; });
          setProfileMap(map);
        }
      }
    }
    if (docRes.data) setDocuments(docRes.data);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const transitionStatus = async (newStatus: AppStatus, customRemarks?: string) => {
    if (!app || !user) return;

    if (newStatus === "referred" && !app.fee_paid) {
      toast.error("Cannot refer: Application fee not paid");
      return;
    }

    const finalRemarks = customRemarks || remarks;

    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", app.id);
    if (error) { toast.error(error.message); return; }

    // Send email notification
    sendEmail({
      userId: app.user_id,
      subject: `Application Status Update: ${newStatus.replace(/_/g, " ")}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a5632;">Application Status Update</h2>
          <p>The status of your application "<strong>${app.project_name}</strong>" has been updated.</p>
          <p><strong>New Status:</strong> ${newStatus.replace(/_/g, " ").toUpperCase()}</p>
          ${finalRemarks ? `<p><strong>Remarks:</strong> ${finalRemarks}</p>` : ""}
          <p>Please log in to your dashboard for more details.</p>
        </div>
      `,
    }).catch(console.error);

    await supabase.from("application_status_history").insert({
      application_id: app.id,
      from_status: app.status,
      to_status: newStatus,
      changed_by: user.id,
      remarks: finalRemarks,
    });

    // Auto-generate gist on refer
    if (newStatus === "referred") {
      const { data: template } = await supabase.from("meeting_templates")
        .select("id, content")
        .or(`sector_id.eq.${app.sector_id},sector_id.is.null`)
        .limit(1)
        .single();

      let gistContent = template?.content || "Meeting Gist\n\nProject: {{project_name}}\nDescription: {{description}}\nLocation: {{location}}";
      gistContent = gistContent
        .replace(/\{\{project_name\}\}/g, app.project_name)
        .replace(/\{\{description\}\}/g, app.project_description || "")
        .replace(/\{\{location\}\}/g, app.project_location || "");

      await supabase.from("meeting_gists").insert({
        application_id: app.id,
        content: gistContent,
        generated_from_template: template?.id || null,
      });
    }

    toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
    setRemarks("");
    setSelectedEdsPoints(new Set());
    setShowEdsPanel(false);
    fetchAll();
  };

  const handleEdsFlag = () => {
    if (selectedEdsPoints.size === 0) {
      toast.error("Please select at least one EDS point");
      return;
    }

    // Build EDS remarks from selected points
    const selectedPointTexts = edsPoints
      .filter(p => selectedEdsPoints.has(p.id))
      .map(p => p.point_text);

    const edsRemarks = [
      "EDS Deficiency Points:",
      ...selectedPointTexts.map((t, i) => `${i + 1}. ${t}`),
      remarks.trim() ? `\nAdditional Remarks: ${remarks.trim()}` : "",
    ].filter(Boolean).join("\n");

    transitionStatus("essential_document_sought", edsRemarks);
  };

  const toggleDocVerified = async (doc: AppDoc) => {
    const { error } = await supabase.from("application_documents")
      .update({ verified: !doc.verified })
      .eq("id", doc.id);
    if (error) toast.error(error.message);
    else fetchAll();
  };

  const downloadDoc = async (doc: AppDoc) => {
    const { data } = await supabase.storage.from("application-documents").createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleEdsResubmit = async () => {
    if (!app || !user) return;
    if (edsFiles.length === 0) {
      toast.error("Please upload at least one file before resubmitting");
      return;
    }
    setUploading(true);
    let uploadedCount = 0;

    for (const file of edsFiles) {
      const filePath = `${user.id}/${app.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from("application-documents").upload(filePath, file, { upsert: true });
      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      const { error: insertError } = await supabase.from("application_documents").insert({
        application_id: app.id,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
      });
      if (insertError) {
        toast.error(`Failed to register ${file.name}`);
        continue;
      }
      uploadedCount += 1;
    }

    if (uploadedCount === 0) {
      setUploading(false);
      toast.error("No files were uploaded successfully");
      return;
    }

    await supabase.from("applications").update({ status: "submitted" }).eq("id", app.id);
    await supabase.from("application_status_history").insert({
      application_id: app.id,
      from_status: "essential_document_sought",
      to_status: "submitted",
      changed_by: user.id,
      remarks: `Resubmitted with additional documents (${uploadedCount} file(s))`,
    });

    setUploading(false);
    setEdsFiles([]);
    toast.success("Application resubmitted");
    fetchAll();
  };

  const handleExportPDF = () => {
    if (!app) return;
    exportAsPDF({
      title: "Application Summary",
      projectName: app.project_name,
      content: `Category: ${app.category}\nLocation: ${app.project_location}\nDescription: ${app.project_description}\n\nStatus: ${app.status}\nFee: ${app.fee_amount || 0} (${app.fee_paid ? "Paid" : "Pending"})`,
      metadata: { Sector: sectorName, "Created": new Date(app.created_at).toLocaleString() },
      applicationId: app.id,
    });
  };

  const handleExportWord = () => {
    if (!app) return;
    exportAsWord({
      title: "Application Summary",
      projectName: app.project_name,
      content: `Category: ${app.category}\nLocation: ${app.project_location}\nDescription: ${app.project_description}\n\nStatus: ${app.status}\nFee: ${app.fee_amount || 0} (${app.fee_paid ? "Paid" : "Pending"})`,
      metadata: { Sector: sectorName, "Created": new Date(app.created_at).toLocaleString() },
      applicationId: app.id,
    });
  };

  const handleDownloadAll = async () => {
    if (documents.length === 0) return;
    const zip = new JSZip();
    toast.info("Preparing ZIP file...");

    for (const doc of documents) {
      const { data } = await supabase.storage.from("application-documents").download(doc.file_path);
      if (data) {
        zip.file(doc.file_name, data);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Documents_${app?.project_name.replace(/\s+/g, "_")}.zip`);
    toast.success("Download started");
  };

  const handleESign = () => {
    toast.info("Aadhaar e-Sign integration (Placeholder)", {
      description: "In a production environment, this would redirect to NSDL/C-DAC e-Sign gateway.",
    });
  };

  if (!app) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const edsRemarks = history.find(h => h.to_status === "essential_document_sought")?.remarks;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{app.project_name}</h1>
          <p className="text-muted-foreground">{app.category} • {sectorName || "—"} • {app.project_location}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={app.status} />
          {role === "project_proponent" && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/submit-gist?applicationId=${app.id}`)}>
              <FileText className="mr-1 h-3 w-3" /> Submit Gist
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileDown className="mr-1 h-3 w-3" /> {t("PDF")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWord}>
            <FileDown className="mr-1 h-3 w-3" /> {t("Word")}
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader><CardTitle className="font-display text-lg">{t("Project Information")}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
          <div><strong>{t("Application ID")}:</strong> {app.id}</div>
          <div><strong>{t("Sector")}:</strong> {sectorName || "—"}</div>
          <div><strong>{t("Category")}:</strong> {app.category || "—"}</div>
          <div><strong>{t("Status")}:</strong> {app.status.replace(/_/g, " ")}</div>
          <div><strong>{t("Location")}:</strong> {app.project_location || "—"}</div>
          <div><strong>{t("Fee")}:</strong> ₹{app.fee_amount || 0}</div>
          <div>
            <strong>{t("Payment")}:</strong>{" "}
            {app.fee_paid ? (
              <span className="text-green-700 font-medium"><CheckCircle2 className="inline h-4 w-4 mr-1" />{t("Paid")}</span>
            ) : (
              <span className="text-destructive font-medium"><AlertTriangle className="inline h-4 w-4 mr-1" />{t("Pending")}</span>
            )}
          </div>
          <div><strong>{t("Created")}:</strong> {new Date(app.created_at).toLocaleString()}</div>
          <div><strong>{t("Updated")}:</strong> {new Date(app.updated_at).toLocaleString()}</div>
          <div className="md:col-span-2 xl:col-span-3">
            <strong>{t("Description")}:</strong> {app.project_description || "—"}
          </div>
        </CardContent>
      </Card>

      {/* Pay Later - for proponent with unpaid draft */}
      {role === "project_proponent" && app.status === "draft" && !app.fee_paid && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader><CardTitle className="font-display text-lg">{t("Complete Payment & Submit")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">₹{(app.fee_amount || 5000).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">{t("Application processing fee")}</p>
            </div>
            <Button onClick={handlePayNow} disabled={paymentLoading} className="w-full" size="lg">
              <CreditCard className="mr-2 h-5 w-5" />
              {paymentLoading ? "Processing..." : t("Pay Now & Submit Application")}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {t("Supports UPI, QR Code, Credit/Debit Cards, Net Banking")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">{t("Documents")} ({documents.length})</CardTitle>
          {documents.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
              {t("Download All (.zip)")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("No documents uploaded")}</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium flex items-center gap-1"><FileDown className="h-4 w-4" />{doc.file_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : ""}
                    </span>
                    {doc.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t("Verified")}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {role === "scrutiny_team" && (
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={doc.verified || false}
                          onCheckedChange={() => toggleDocVerified(doc)}
                        />
                        <Label className="text-xs">{t("Verified")}</Label>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => downloadDoc(doc)}>{t("Download")}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDS Resubmission (Proponent) */}
      {role === "project_proponent" && app.status === "essential_document_sought" && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="font-display text-lg text-destructive">{t("Essential Documents Sought")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {edsRemarks && (
              <div className="p-3 bg-background rounded-md border">
                <p className="text-sm font-medium mb-1">{t("Deficiencies flagged by Scrutiny Team")}:</p>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{edsRemarks}</div>
              </div>
            )}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">{t("Upload additional documents")}</p>
              <Input
                type="file"
                multiple
                onChange={(e) => e.target.files && setEdsFiles([...edsFiles, ...Array.from(e.target.files)])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.kml"
                className="max-w-xs mx-auto"
              />
            </div>
            {edsFiles.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {edsFiles.length} new file(s) selected
              </div>
            )}
            <Button onClick={handleEdsResubmit} disabled={uploading}>
              <Send className="mr-2 h-4 w-4" /> {uploading ? "Uploading..." : t("Resubmit Application")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scrutiny Actions */}
      {role === "scrutiny_team" && ["submitted", "under_scrutiny", "essential_document_sought"].includes(app.status) && (
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">{t("Scrutiny Actions")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>{t("Remarks")}</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={t("Add remarks...")} />
            </div>

            {/* EDS Points Panel */}
            {showEdsPanel && (
              <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 space-y-3">
                <p className="text-sm font-medium text-destructive">{t("Select Deficiency Points (EDS)")}:</p>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {edsPoints.map((point) => (
                    <div
                      key={point.id}
                      className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer transition-colors ${selectedEdsPoints.has(point.id)
                          ? "border-destructive/30 bg-destructive/10"
                          : "border-border hover:border-destructive/20"
                        }`}
                      onClick={() => {
                        setSelectedEdsPoints(prev => {
                          const next = new Set(prev);
                          next.has(point.id) ? next.delete(point.id) : next.add(point.id);
                          return next;
                        });
                      }}
                    >
                      <Checkbox
                        checked={selectedEdsPoints.has(point.id)}
                        onCheckedChange={() => {
                          setSelectedEdsPoints(prev => {
                            const next = new Set(prev);
                            next.has(point.id) ? next.delete(point.id) : next.add(point.id);
                            return next;
                          });
                        }}
                        className="mt-0.5"
                      />
                      <span className="text-sm">{point.point_text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{selectedEdsPoints.size} point(s) selected</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowEdsPanel(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" onClick={handleEdsFlag}>
                      {t("Flag EDS")} ({selectedEdsPoints.size})
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {app.status === "submitted" && (
                <Button onClick={() => transitionStatus("under_scrutiny")}>{t("Begin Scrutiny")}</Button>
              )}
              {app.status === "under_scrutiny" && (
                <>
                  {!showEdsPanel && (
                    <Button variant="destructive" onClick={() => setShowEdsPanel(true)}>
                      {t("Flag EDS")}
                    </Button>
                  )}
                  <Button onClick={() => transitionStatus("referred")} disabled={!app.fee_paid}>
                    {t("Refer for Meeting")} {!app.fee_paid && "(Fee not paid)"}
                  </Button>
                </>
              )}
              {app.status === "essential_document_sought" && (
                <Button onClick={() => transitionStatus("under_scrutiny")}>{t("Resume Scrutiny")}</Button>
              )}
            </div>
            {!app.fee_paid && app.status === "under_scrutiny" && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Fee must be paid before referring for meeting
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Timeline */}
      <Card>
        <CardHeader><CardTitle className="font-display text-lg">{t("Status Timeline")}</CardTitle></CardHeader>
        <CardContent>
          <StatusTimeline history={history} profiles={profileMap} />
        </CardContent>
      </Card>
    </div>
  );
}
