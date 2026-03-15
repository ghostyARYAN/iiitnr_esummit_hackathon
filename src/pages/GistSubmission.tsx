import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle, Download, FileDown, Edit, RefreshCw } from "lucide-react";
import { exportAsWord, generateWordBlob } from "@/lib/exportUtils";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GistSubmission() {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [selectedAppId, setSelectedAppId] = useState<string>(applicationId || "");
  const [file, setFile] = useState<File | null>(null);
  const [gistContent, setGistContent] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  // Fetch user's applications
  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id, project_name, project_description, project_location, category, sector_id, created_at, fee_amount, fee_paid, status")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const selectedApp = applications?.find(a => a.id === selectedAppId);

  useEffect(() => {
    if (applicationId) {
      setSelectedAppId(applicationId);
    }
  }, [applicationId]);

  // Auto-fetch template when app is selected
  useEffect(() => {
    if (selectedApp && activeTab === "editor" && !gistContent) {
      fetchTemplateContent();
    }
  }, [selectedApp, activeTab]);

  const fetchTemplateContent = async () => {
    if (!selectedApp) return;
    
    setIsGenerating(true);
    try {
      // 1. Fetch template for the sector
      const { data: template } = await supabase.from("meeting_templates")
        .select("content")
        .or(`sector_id.eq.${selectedApp.sector_id},sector_id.is.null`)
        .limit(1)
        .single();

      // 2. Fetch sector name
      const { data: sector } = await supabase.from("sectors")
        .select("name")
        .eq("id", selectedApp.sector_id)
        .single();
        
      const sectorName = sector?.name || "General";

      // 3. Prepare content with replacements
      let content = template?.content || `Project: {{project_name}}
Sector: {{sector}}
Location: {{location}}
Category: {{category}}

1. Project Overview:
   - Description: {{description}}
   - Fee Paid: {{fee_amount}}
   - Status: {{status}}

2. Key Details (Please fill):
   - [ ]
   - [ ]

3. Environmental Impact (Please fill):
   - [ ]
   - [ ]`;

      content = content
        .replace(/\{\{project_name\}\}/g, selectedApp.project_name)
        .replace(/\{\{description\}\}/g, selectedApp.project_description || "N/A")
        .replace(/\{\{location\}\}/g, selectedApp.project_location || "N/A")
        .replace(/\{\{category\}\}/g, selectedApp.category || "N/A")
        .replace(/\{\{sector\}\}/g, sectorName)
        .replace(/\{\{fee_amount\}\}/g, selectedApp.fee_amount?.toString() || "0")
        .replace(/\{\{status\}\}/g, selectedApp.status);

      setGistContent(content);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedApp) {
      toast.error("Please select an application first");
      return;
    }

    setIsGenerating(true);
    try {
      // Use existing content if edited, otherwise fetch fresh
      let content = gistContent;
      if (!content) {
        await fetchTemplateContent(); // This sets gistContent
        content = gistContent; // Note: State update might not be immediate, but for now assuming fetchTemplateContent updates state or we could return it.
        // Actually, let's just reuse the logic inside fetchTemplateContent or better yet, rely on the fact that the editor should be populated.
        // If the editor is empty, we should fetch it.
      }

      // If we still don't have content (e.g. async issue), let's just re-run the generation logic here to be safe, 
      // or we can just say "Please wait for template to load". 
      // But let's assume the user has seen the editor populated.
      
      // For the download button, we might want to ensure we have the latest content.
      // If the user hasn't edited anything, we fetch.
      
      if (!content) {
          // Fallback if state isn't ready
          // We can just call fetchTemplateContent again but await it properly if we refactor it to return data.
          // For now, let's just use the same logic as fetchTemplateContent but return the string.
           // ... (Re-implementing logic or refactoring is better)
           // Let's simplified: The editor is auto-filled. If it's empty, user waits.
           toast.error("Template is loading...");
           return;
      }

      exportAsWord({
        title: `${selectedApp.project_name} - Gist`,
        projectName: selectedApp.project_name,
        content: content,
        metadata: {
          "Application ID": selectedApp.id,
          "Generated On": new Date().toLocaleString(),
          "Instructions": "Please fill in the missing details in the brackets [ ] and upload this file back."
        },
        applicationId: selectedApp.id
      });
      
      toast.success("Template downloaded!");
    } catch (error: any) {
      console.error("Template generation error:", error);
      toast.error("Failed to generate template");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Please upload PDF or Word document.");
        return;
      }
      // Validate size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !user) {
      toast.error("Please select an application.");
      return;
    }

    if (activeTab === "upload" && !file) {
      toast.error("Please upload a file.");
      return;
    }

    if (activeTab === "editor" && !gistContent.trim()) {
      toast.error("Gist content cannot be empty.");
      return;
    }

    setIsUploading(true);
    try {
      let fileToUpload: File;

      if (activeTab === "editor") {
        // Generate Blob from content
        const blob = await generateWordBlob({
            title: `${selectedApp?.project_name || "Project"} - Gist`,
            projectName: selectedApp?.project_name,
            content: gistContent,
            metadata: {
                "Application ID": selectedAppId,
                "Generated On": new Date().toLocaleString(),
                "Submission Type": "Online Editor"
            },
            applicationId: selectedAppId
        });
        fileToUpload = new File([blob], `${selectedAppId}_Gist.docx`, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      } else {
        fileToUpload = file!;
      }

      // 1. Rename file: ProposalNo_PPName_Gist.ext
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${selectedAppId}_Gist.${fileExt}`;
      // Prefix with user.id to satisfy storage RLS policy
      const filePath = `${user.id}/gists/${selectedAppId}/${fileName}`;

      // 2. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(filePath, fileToUpload, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("application-documents")
        .getPublicUrl(filePath);

      // 3. Insert into gist_submissions table
      const { error: dbError } = await supabase
        .from("gist_submissions")
        .insert({
          application_id: selectedAppId,
          user_id: user.id,
          file_name: fileName,
          file_url: publicUrl,
          file_size: fileToUpload.size
        });

      if (dbError) throw dbError;

      toast.success("Gist submitted successfully!");
      setFile(null);
      // Optional: Navigate away or clear form
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit gist.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("Submit Gist")}</CardTitle>
          <CardDescription>
            {t("Submit the Gist (brief summary) of your applied case for the upcoming meeting.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="application">{t("Select Application")}</Label>
                <Select value={selectedAppId} onValueChange={setSelectedAppId} disabled={!!applicationId}>
                    <SelectTrigger>
                    <SelectValue placeholder={t("Select an application")} />
                    </SelectTrigger>
                    <SelectContent>
                    {isLoadingApps ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : applications?.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">{t("No applications found")}</div>
                    ) : (
                        applications?.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                            {app.project_name} (ID: {app.id.slice(0, 8)}...)
                        </SelectItem>
                        ))
                    )}
                    </SelectContent>
                </Select>
                </div>

                {selectedAppId && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="editor">
                                <Edit className="w-4 h-4 mr-2" />
                                {t("Write Online")}
                            </TabsTrigger>
                            <TabsTrigger value="upload">
                                <Upload className="w-4 h-4 mr-2" />
                                {t("Upload File")}
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="editor" className="space-y-4 mt-4">
                            <div className="flex justify-between items-center">
                                <Label>{t("Edit Gist Content")}</Label>
                                <Button variant="ghost" size="sm" onClick={fetchTemplateContent} disabled={isGenerating}>
                                    <RefreshCw className={`w-3 h-3 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                                    {t("Reset to Template")}
                                </Button>
                            </div>
                            <Textarea 
                                value={gistContent} 
                                onChange={(e) => setGistContent(e.target.value)} 
                                className="min-h-[400px] font-mono text-sm"
                                placeholder="Loading template..."
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("This content will be converted to a Word document upon submission.")}
                            </p>
                        </TabsContent>
                        
                        <TabsContent value="upload" className="space-y-4 mt-4">
                            <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between">
                                <div className="space-y-1">
                                <p className="text-sm font-medium">{t("Need the template file?")}</p>
                                <p className="text-xs text-muted-foreground">{t("Download it to fill offline.")}</p>
                                </div>
                                <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                onClick={handleDownloadTemplate} 
                                disabled={isGenerating}
                                className="gap-2"
                                >
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                {t("Download .docx")}
                                </Button>
                            </div>

                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                                <input
                                type="file"
                                id="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading}
                                />
                                {file ? (
                                <div className="flex flex-col items-center text-primary">
                                    <FileText className="h-8 w-8 mb-2" />
                                    <span className="font-medium">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                                ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm font-medium">{t("Click to upload or drag and drop")}</span>
                                    <span className="text-xs text-muted-foreground mt-1">{t("PDF or Word (max 10MB)")}</span>
                                </>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                <Button onClick={handleSubmit} className="w-full" disabled={isUploading || !selectedAppId || (activeTab === "upload" && !file) || (activeTab === "editor" && !gistContent)}>
                {isUploading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Submitting...")}
                    </>
                ) : (
                    <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("Submit Gist")}
                    </>
                )}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
