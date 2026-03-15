import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { sendEmail } from "@/utils/sendEmail";

export default function TestEmail() {
  const { user } = useAuth();
  const [to, setTo] = useState(user?.email || "");
  const [subject, setSubject] = useState("Test Email from Parivesh 3.0");
  const [html, setHtml] = useState("<p>This is a test email sent from the <strong>Parivesh 3.0</strong> dashboard.</p>");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    setLoading(true);
    setResult(null);
    try {
      console.log("Sending email to:", to);
      const response = await sendEmail({
        to,
        subject,
        html,
      });
      console.log("Email sent successfully:", response);
      setResult({ success: true, data: response });
      toast.success("Email sent successfully!");
    } catch (error: any) {
      console.error("Failed to send email:", error);
      setResult({ success: false, error: error.message || error });
      toast.error("Failed to send email: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Test Email Functionality</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>To (Email Address)</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
          </div>
          
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email Subject" />
          </div>
          
          <div className="space-y-2">
            <Label>HTML Content</Label>
            <Textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={5} placeholder="<p>Email content...</p>" />
          </div>
          
          <Button onClick={handleSend} disabled={loading || !to} className="w-full">
            {loading ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
            {!result.success && (
              <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md text-sm">
                <p className="font-bold">Troubleshooting:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Ensure the <code>send-email</code> function is deployed: <code>supabase functions deploy send-email --no-verify-jwt</code></li>
                  <li>Check if <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in your Supabase project secrets.</li>
                  <li>Verify the Resend API Key is valid and the domain <code>cecb@updates.aaradhyabs.in</code> is verified.</li>
                  <li>Check the browser console for more details.</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
